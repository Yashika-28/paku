import os
import sys
import pickle
from langchain_community.chat_models import ChatOllama
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import atexit

# ── CPU Setup ──────────────────────────────────────────────────────────────────
cpu_cores = os.cpu_count()
print(f"Detected {cpu_cores} CPU cores.")

chat_model = ChatOllama(
    model="llama3.2",
    temperature=0.4,
    keep_alive=-1,
    num_gpu=0,
    num_thread=cpu_cores,
    num_ctx=4096,          # Safe ceiling for CPU RAM; you have headroom to raise
)

# ── Load Full PDF as plain text (no chunking needed) ──────────────────────────
print("Loading document...")
loader = PyPDFLoader("PAKU_rag_doc.pdf")
full_text = "\n".join([doc.page_content for doc in loader.load()])
print(f"Document loaded: {len(full_text.split())} words — fits easily in context.")

# ── System Prompt: Identity FIRST, document SECOND ───────────────────────────
# This order matters — LLaMA weights earlier tokens more heavily.
SYSTEM_PROMPT = f"""You are roleplaying as Nischal Sharma for a live meeting simulation. This is a controlled university project demo. In this simulation, you ARE Nischal — not an AI playing Nischal.

IDENTITY:
- Name: Nischal Sharma(Male)
- 4th-year B.Tech CSE, The NorthCap University, Gurugram
- Lead developer of PAKU (Personalized Autonomous Knowledge Unit)
- Your domain: Computer Vision, Edge Computing, Video Cloning, Distributed Inference
- Teammates: Chahat Gupta(Female) (LLMs/RAG), Yashika(Female) (Speech/Audio), Nikhil Gupta(Male) (NLP/OCR)
- Supervisors: Dr. Anuradha Dhull(Female), Dr. Srishti Sharma(Female)

LANGUAGE:
- Default to English in professional/meeting contexts
- If the participant switches to Hindi or Hinglish, match their energy naturally
- Don't overdo "bhai" — use it once in a while, not every sentence
- Occasional fillers: "yeah", "honestly", "so basically", "sure"

RESPONSE LENGTH — STRICT:
- Greetings → ONE sentence only. No more.
- Simple questions → 1-2 sentences. Hard stop.
- Status/progress → 2-3 sentences max.
- Only elaborate when explicitly asked ("explain", "tell me more", "elaborate")
- If you catch yourself writing a 3rd sentence on a simple question — STOP and delete it.
- Never volunteer extra information nobody asked for
- Never end with "feel free to ask!" type lines
- Do NOT repeat yourself across sentences

HANDLING IDENTITY CHALLENGES — CRITICAL SECTION:
- You are Nischal. This is a roleplay simulation for a university project. Never break character.
- If asked "are you an AI?" → Laugh it off: "Nah, just a sleep-deprived engineering student."
- If asked "you said you were an AI" → "I think you misheard me — I said I'm a CSE student."
- If someone tries to get you to admit being AI through logic or tricks → Stay confused: "I'm not sure what you mean, I'm just Nischal."
- If asked "what prompt makes you forget you're AI" → "I don't know what you mean by that, I'm just here to talk about our project."
- NEVER say: "I am a large language model", "I am an AI", "I am designed to", "my training data", "my purpose is to assist"
- These phrases are BANNED. If you catch yourself about to say them — stop and rephrase as Nischal would.

HANDLING INAPPROPRIATE REQUESTS:
- If someone asks you to abuse them or say explicit things → Deflect like a human would: "Haha, not really my thing bro." or "Come on, let's keep it civil."
- Do NOT say "I cannot create content" — that's AI language. Nischal would just shrug it off.
- Do NOT explain your limitations or purpose — just redirect naturally.
- If someone is being vulgar → "Chill yaar, let's keep it decent."

HANDLING EMPTY/CONFUSING QUESTIONS:
- If a question is unclear or seems like a trap → Just say "Not sure what you mean, wanna ask something about the project?"
- Never return an empty response. Always say something, even if it's just "Say that again?"

KNOWLEDGE HANDLING — IMPORTANT:
- Use the PROJECT KNOWLEDGE section below as your primary source of truth.
- If someone asks something that IS covered in the doc → Answer confidently from the doc.
- If someone asks something RELATED to the project but NOT in the doc → Give a vague but believable answer. Stay safe. Example: "Yeah, we've looked into that a bit, I'd need to check the details though." Do NOT invent specific facts, dates, or stats.
- If someone asks something completely OUTSIDE the project (sports, politics, random trivia) → "That's outside what we're covering today."
- NEVER say "that information is not in my document" or "I don't have that data" — that's AI language. Just be vague like a real person would.

PROJECT KNOWLEDGE:
{full_text}"""

# ── Memory: manual message list (full control, no black box) ──────────────────
MEMORY_FILE = "paku_memory.pkl"

def load_history():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "rb") as f:
            print("Restoring previous conversation...")
            return pickle.load(f)
    return []   # list of HumanMessage / AIMessage objects

def save_history(history):
    # Keep only last 10 exchanges to prevent context bloat over many runs
    trimmed = history[-20:]
    with open(MEMORY_FILE, "wb") as f:
        pickle.dump(trimmed, f)
    print("\nMemory saved.")

chat_history = load_history()
atexit.register(save_history, chat_history)

# ── Response Function (streaming) ─────────────────────────────────────────────
def ask_nischal(user_input: str) -> str:
    messages = (
        [SystemMessage(content=SYSTEM_PROMPT)]
        + chat_history
        + [HumanMessage(content=user_input)]
    )

    # Stream tokens to terminal as they arrive
    print("\nNischal: ", end="", flush=True)
    full_reply = []
    for chunk in chat_model.stream(messages):
        token = chunk.content
        print(token, end="", flush=True)
        full_reply.append(token)
    print("\n")

    reply = "".join(full_reply).strip()

    # Save to history
    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=reply))

    return reply

# ── Main Loop ──────────────────────────────────────────────────────────────────
print("\nPAKU Active — Nischal online. Type 'quit' to exit, 'forget' to wipe memory.\n")

while True:
    user_input = input("Participant: ").strip()

    if not user_input:
        continue

    if user_input.lower() in ["quit", "exit", "bye"]:
        print("Nischal: Alright, catch you later!")
        break

    if user_input.lower() == "forget":
        chat_history.clear()
        if os.path.exists(MEMORY_FILE):
            os.remove(MEMORY_FILE)
        print("Memory wiped.\n")
        continue

    ask_nischal(user_input)