# @title 3. Text-to-Voice Realtime Pipeline
import os
import sys

# Change cwd to the RVC directory so imports and paths work correctly
rvc_dir = os.path.join(os.path.dirname(__file__), "Retrieval-based-Voice-Conversion-WebUI")
os.chdir(rvc_dir)
sys.path.append(rvc_dir)

import asyncio
import edge_tts
from edge_tts import Communicate
import soundfile as sf
from colorama import init, Fore, Style
from dotenv import load_dotenv

init(autoreset=True)

from configs.config import Config
from infer.modules.vc.modules import VC

# --- CONFIGURATION ---
TEXT = "hi everyone, good morning to all the teachers i am nischal sharma, and today i am going to talk about my project PAKU"
TTS_VOICE = "hi-IN-MadhurNeural"
import os
BASE_DIR = os.path.dirname(__file__)
ORIGINAL_TTS_OUT = os.path.join(BASE_DIR, "original_tts_audio.wav")
FINAL_OUT = os.path.join(BASE_DIR, "final_clone_audio.wav")

MODEL_PATH = "my_clone_v1_epoch80.pth" # RVC looks inside assets/weights directly if we just pass the name
INDEX_PATH = "" # Model is not fully trained yet, we will just pass "" for index

# 1. Generate the Driver Audio (Edge-TTS)
async def generate_tts():
    print("Generating base audio with Edge-TTS...")
    # Adjust pitch/rate here for emotions if needed (e.g., rate="+10%")
    comm = Communicate(TEXT, TTS_VOICE)
    await comm.save(ORIGINAL_TTS_OUT)
    print(f"{Fore.CYAN}Original TTS Audio Saved: {ORIGINAL_TTS_OUT}")

# 2. Run Voice Conversion (RVC)
def run_rvc_inference():
    print("Cloning voice with RVC...")
    env_path = os.path.join(rvc_dir, ".env")
    load_dotenv(env_path)
    os.environ.setdefault("weight_root", "assets/weights")
    os.environ.setdefault("index_root", "logs")
    os.environ.setdefault("rmvpe_root", "assets/rmvpe")
        
    config = Config()
    
    # Initialize the Voice Converter module
    vc = VC(config=config) # Uses default config (CUDA if available)
    
    # Load your trained model
    vc.get_vc(MODEL_PATH)
    
    # Process the audio
    # Arguments: input_path, f0_up_key (pitch shift), f0_method, index_file, index_rate, filter_radius, resample_sr, rms_mix_rate, protect
    result_status, audio_output = vc.vc_single(
        0,                 # spk_id
        ORIGINAL_TTS_OUT,  # input audio
        0,                 # pitch shift (0 for male-to-male)
        None,              # optional output path
        "rmvpe",           # pitch extraction algorithm
        INDEX_PATH,        # your index file
        None,              # npy path (not used)
        0.66,              # index rate (how strictly to copy your accent)
        3,                 # filter radius
        0,                 # resample_sr (0 = original)
        0.25,              # volume envelope
        0.33               # breath protection
    )
    
    # Save final output
    sf.write(FINAL_OUT, audio_output[1], audio_output[0])
    print(f"{Fore.GREEN}Cloned Voice Audio Saved: {FINAL_OUT}")

# Execute the pipeline
asyncio.run(generate_tts())
run_rvc_inference()