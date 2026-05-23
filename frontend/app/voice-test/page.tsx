"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Square,
  Settings,
  AlertCircle,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Cpu,
  Info,
  Server,
  MessageSquare,
  HelpCircle,
  Radio,
} from "lucide-react";
import { Button, Card } from "@/components/ui/BaseComponents";

// Interface for played audio segment tracking
interface AudioSegment {
  id: string;
  text: string;
  duration: number;
  timestamp: string;
}

export default function VoiceTestPage() {
  // Config & State
  const [backendUrl, setBackendUrl] = useState("http://localhost:5017");
  const [lipsyncUrl, setLipsyncUrl] = useState("http://localhost:5018");
  const [connType, setConnType] = useState<"http" | "ws">("ws"); // default to WebSocket
  const [mode, setMode] = useState<"direct" | "ollama">("direct");
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "streaming" | "playing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);

  // Stats / Log
  const [transcriptChunks, setTranscriptChunks] = useState<{ id: string; text: string; isError?: boolean }[]>([]);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);

  // Web Audio & Stream Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const activeReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const activeWsRef = useRef<WebSocket | null>(null);
  const activeLipsyncWsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastReceivedTextRef = useRef<string>("");

  // Preset prompts for quick testing
  const presets = {
    direct: [
      "Hello! This is a real-time streaming test. The voice cloning system works piece by piece.",
      "The quick brown fox jumps over the lazy dog, showcasing fast, low-latency audio generation.",
      "Science is about explaining the highest number of phenomena with the lowest number of principles.",
    ],
    ollama: [
      "Explain quantum computing in two simple sentences.",
      "Tell me a short, witty science joke.",
      "Summarize why the sky is blue in under fifteen words.",
    ],
  };

  // Check connection to the backend
  const checkBackendStatus = useCallback(async (url: string) => {
    setCheckingBackend(true);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${url}/`, { method: "GET", signal: controller.signal });
      clearTimeout(id);
      setIsBackendOnline(res.status === 200 || res.ok);
    } catch (err) {
      setIsBackendOnline(false);
    } finally {
      setCheckingBackend(false);
    }
  }, []);

  useEffect(() => {
    checkBackendStatus(backendUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Audio Context and Analyser
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      startVisualizer();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Stop all active playing audio nodes and reset scheduling
  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      nextPlayTimeRef.current = audioCtxRef.current.currentTime;
    }
  }, []);

  // Cancel the active stream reader or WebSocket
  const cancelActiveStream = useCallback(async () => {
    if (activeReaderRef.current) {
      try {
        await activeReaderRef.current.cancel();
      } catch (e) {
        console.error("Error cancelling stream reader:", e);
      }
      activeReaderRef.current = null;
    }
    if (activeWsRef.current) {
      try {
        activeWsRef.current.close();
      } catch (e) {
        console.error("Error closing WebSocket:", e);
      }
      activeWsRef.current = null;
    }
    if (activeLipsyncWsRef.current) {
      try {
        activeLipsyncWsRef.current.close();
      } catch (e) {
        console.error("Error closing Lipsync WebSocket:", e);
      }
      activeLipsyncWsRef.current = null;
    }
    setIsStreaming(false);
    setStatus("idle");
  }, []);

  const handleStop = useCallback(async () => {
    await cancelActiveStream();
    stopAllAudio();
  }, [cancelActiveStream, stopAllAudio]);

  // Convert base64 string to ArrayBuffer in browser
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Queue and schedule playing of individual audio chunks
  const queueAudioChunk = useCallback(async (audioData: string | ArrayBuffer, chunkText: string) => {
    if (!audioCtxRef.current || !analyserRef.current) return;

    try {
      const arrayBuffer = typeof audioData === "string" ? base64ToArrayBuffer(audioData) : audioData;
      const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;

      // Connect source to analyser and output
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);

      activeSourcesRef.current.push(source);

      const currentTime = audioCtxRef.current.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      // Schedule exact start time
      source.start(nextPlayTimeRef.current);

      // Track chunk details
      const duration = audioBuffer.duration;
      nextPlayTimeRef.current += duration;

      // Add to played segments
      setAudioSegments((prev) => [
        {
          id: Math.random().toString(),
          text: chunkText,
          duration: parseFloat(duration.toFixed(2)),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev,
      ]);

      // Remove from active list when finished playing
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0 && !activeReaderRef.current && !activeWsRef.current) {
          setStatus("idle");
        }
      };

      setStatus("playing");
    } catch (err) {
      console.error("Error decoding or scheduling audio chunk:", err);
    }
  }, []);

  // Handle triggering stream from backend
  const handleStartStream = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setErrorMsg("");
    setTranscriptChunks([]);
    initAudio();
    stopAllAudio();
    setIsStreaming(true);
    setStatus("connecting");

    if (connType === "ws") {
      // --- WebSocket Flow ---
      try {
        const wsUrl = backendUrl.replace(/^http/, "ws") + "/ws";
        const ws = new WebSocket(wsUrl);
        activeWsRef.current = ws;

        const lsWsUrl = lipsyncUrl.replace(/^http/, "ws") + "/ws_lipsync";
        const lsWs = new WebSocket(lsWsUrl);
        activeLipsyncWsRef.current = lsWs;

        lsWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.frame_data) {
              setCurrentFrame(data.frame_data);
            }
          } catch (e) {
            console.error("Lipsync WS Parse Error", e);
          }
        };

        ws.onopen = () => {
          setStatus("streaming");
          ws.send(JSON.stringify({ text: prompt.trim(), mode }));
        };

        ws.onmessage = async (event) => {
          try {
            if (event.data instanceof Blob) {
              const arrayBuffer = await event.data.arrayBuffer();
              if (activeLipsyncWsRef.current && activeLipsyncWsRef.current.readyState === WebSocket.OPEN) {
                activeLipsyncWsRef.current.send(event.data);
              }
              await queueAudioChunk(arrayBuffer, lastReceivedTextRef.current);
              return;
            }

            const data = JSON.parse(event.data);

            if (data.error) {
              setTranscriptChunks((prev) => [
                ...prev,
                { id: Math.random().toString(), text: data.error, isError: true },
              ]);
              setErrorMsg(data.error);
              setStatus("error");
              ws.close();
              return;
            }

            if (data.text) {
              lastReceivedTextRef.current = data.text;
              setTranscriptChunks((prev) => [
                ...prev,
                { id: data.chunk_id?.toString() || Math.random().toString(), text: data.text },
              ]);
            }

            // Fallback for HTTP endpoints or Base64 messages
            if (data.audio) {
              const arrayBuffer = base64ToArrayBuffer(data.audio);
              if (activeLipsyncWsRef.current && activeLipsyncWsRef.current.readyState === WebSocket.OPEN) {
                activeLipsyncWsRef.current.send(arrayBuffer);
              }
              await queueAudioChunk(data.audio, data.text || "");
            }

            if (data.done) {
              ws.close();
            }
          } catch (jsonErr) {
            console.error("WebSocket message parse error:", jsonErr);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
          setErrorMsg("WebSocket connection failed.");
          setStatus("error");
          setTranscriptChunks((prev) => [
            ...prev,
            { id: Math.random().toString(), text: "[Error: WebSocket Connection Failed]", isError: true },
          ]);
          setIsStreaming(false);
        };

        ws.onclose = () => {
          activeWsRef.current = null;
          setIsStreaming(false);
          if (activeSourcesRef.current.length === 0) {
            setStatus("idle");
          }
        };
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to initialize WebSocket");
        setStatus("error");
        setIsStreaming(false);
      }
    } else {
      // --- HTTP NDJSON Stream Flow ---
      const endpoint = `${backendUrl}/stream?text=${encodeURIComponent(prompt.trim())}&mode=${mode}`;

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is empty, streaming not supported.");
        }

        const lsWsUrl = lipsyncUrl.replace(/^http/, "ws") + "/ws_lipsync";
        if (!activeLipsyncWsRef.current || activeLipsyncWsRef.current.readyState !== WebSocket.OPEN) {
          const lsWs = new WebSocket(lsWsUrl);
          activeLipsyncWsRef.current = lsWs;
          lsWs.onmessage = (event) => {
            try {
              const d = JSON.parse(event.data);
              if (d.frame_data) setCurrentFrame(d.frame_data);
            } catch (e) {}
          };
        }

        const reader = response.body.getReader();
        activeReaderRef.current = reader;
        setStatus("streaming");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);

              if (data.error) {
                setTranscriptChunks((prev) => [
                  ...prev,
                  { id: Math.random().toString(), text: data.error, isError: true },
                ]);
                setErrorMsg(data.error);
                setStatus("error");
                break;
              }

              if (data.text) {
                setTranscriptChunks((prev) => [
                  ...prev,
                  { id: data.chunk_id?.toString() || Math.random().toString(), text: data.text },
                ]);
              }

              if (data.audio) {
                const arrayBuffer = base64ToArrayBuffer(data.audio);
                if (activeLipsyncWsRef.current && activeLipsyncWsRef.current.readyState === WebSocket.OPEN) {
                  activeLipsyncWsRef.current.send(arrayBuffer);
                }
                await queueAudioChunk(data.audio, data.text || "");
              }
            } catch (jsonErr) {
              console.error("JSON parse error on line:", line, jsonErr);
            }
          }
        }
      } catch (err: any) {
        console.error("Streaming error:", err);
        setErrorMsg(err.message || "Failed to fetch voice stream");
        setStatus("error");
        setTranscriptChunks((prev) => [
          ...prev,
          { id: Math.random().toString(), text: `[Error: ${err.message || "Stream Connection Failed"}]`, isError: true },
        ]);
      } finally {
        activeReaderRef.current = null;
        setIsStreaming(false);
        if (activeSourcesRef.current.length === 0) {
          setStatus("idle");
        }
      }
    }
  };

  // Drawing loop for canvas audio visualizer
  const startVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Adjust canvas resolution dynamically
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "rgba(10, 11, 20, 0.05)";
      ctx.fillRect(0, 0, width, height);

      const isSilent = dataArray.every((val) => val === 0);

      if (isSilent || status === "idle" || status === "error") {
        // Draw a quiet gentle sine wave
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(99, 102, 241, 0.4)"; // Soft Indigo

        const sliceWidth = width / 100;
        let x = 0;
        const time = Date.now() * 0.004;

        for (let i = 0; i <= 100; i++) {
          const y = height / 2 + Math.sin(i * 0.15 + time) * 3;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Draw glowing frequency bars
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          const percent = i / bufferLength;
          let r = 99;
          let g = 102;
          let b = 241;

          if (percent > 0.5) {
            const p = (percent - 0.5) * 2;
            r = Math.floor(168 * (1 - p) + 236 * p);
            g = Math.floor(85 * (1 - p) + 72 * p);
            b = Math.floor(247 * (1 - p) + 153 * p);
          } else {
            const p = percent * 2;
            r = Math.floor(99 * (1 - p) + 168 * p);
            g = Math.floor(102 * (1 - p) + 85 * p);
            b = Math.floor(241 * (1 - p) + 247 * p);
          }

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

          const y = height - barHeight;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth - 2, barHeight, [4, 4, 0, 0]);
          } else {
            ctx.rect(x, y, barWidth - 2, barHeight);
          }
          ctx.fill();

          x += barWidth;
        }
      }
    };

    draw();
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      activeSourcesRef.current.forEach((src) => {
        try {
          src.stop();
        } catch (_) {}
      });
    };
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Volume2 className="text-blue-600 dark:text-blue-400" size={32} />
            Voice Clone Streaming Lab
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Benchmark real-time voice-cloned syntheses with parallel CPU LLM generation and GPU Audio synthesis.
          </p>
        </div>

        {/* Backend status badge & config panel */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isBackendOnline === true
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : isBackendOnline === false
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBackendOnline === true
                  ? "bg-emerald-500 animate-pulse"
                  : isBackendOnline === false
                  ? "bg-rose-500"
                  : "bg-slate-400"
              }`}
            />
            {isBackendOnline === true
              ? "Backend Connected"
              : isBackendOnline === false
              ? "Backend Offline"
              : "Checking Connection..."}
          </div>

          <Button
            variant="secondary"
            onClick={() => checkBackendStatus(backendUrl)}
            disabled={checkingBackend}
            className="p-2 h-9 w-9 flex items-center justify-center shrink-0"
            icon={RefreshCw}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parameters and Controls (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Controls Card */}
          <Card title="Stream Control Hub" description="Configure generation settings and trigger live streaming.">
            <div className="space-y-5 mt-4">
              {/* Backend URL Input & Connection Mode Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Streaming Backend Host URL
                  </label>
                  <div className="relative group transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Server size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none transition-all text-gray-700 dark:text-gray-200 font-medium placeholder-gray-400 animate-transition"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="e.g. http://localhost:5017"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Streaming Protocol
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-[46px]">
                    <button
                      type="button"
                      onClick={() => setConnType("ws")}
                      className={`rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all text-sm ${
                        connType === "ws"
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                          : "border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-450 hover:bg-gray-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Radio size={16} />
                      WebSocket (Fastest)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnType("http")}
                      className={`rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all text-sm ${
                        connType === "http"
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                          : "border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-450 hover:bg-gray-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Server size={16} />
                      HTTP Stream
                    </button>
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Synthesizer Flow Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("direct");
                      setPrompt("");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      mode === "direct"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-bold"
                        : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Volume2 size={20} />
                    <span className="text-sm">Direct TTS Synthesis</span>
                    <span className="text-2xs text-gray-400 dark:text-slate-500 font-normal">
                      Input text, hear direct clone
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("ollama");
                      setPrompt("");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      mode === "ollama"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-bold"
                        : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <MessageSquare size={20} />
                    <span className="text-sm">AI Agent Chat (Ollama)</span>
                    <span className="text-2xs text-gray-400 dark:text-slate-500 font-normal">
                      Query CPU LLM, voice reads stream
                    </span>
                  </button>
                </div>
              </div>

              {/* Text Input area */}
              <form onSubmit={handleStartStream} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    {mode === "direct" ? "Text to Synthesize" : "Chat Agent Prompt"}
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none transition-all text-gray-700 dark:text-gray-200 font-medium placeholder-gray-400 resize-none shadow-inner animate-transition"
                    placeholder={
                      mode === "direct"
                        ? "Type a paragraph here. Audio generation starts playing almost immediately chunk-by-chunk..."
                        : "Ask Ollama anything (e.g. Explain black holes in 15 words). Response streams back as voice..."
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim() && !isStreaming) {
                          handleStartStream();
                        }
                      }
                    }}
                  />
                  <p className="text-2xs text-gray-400 dark:text-slate-500 mt-1 ml-1">
                    Press <span className="font-bold">Enter</span> to execute, <span className="font-bold">Shift+Enter</span> for a new line.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-2xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presets[mode].map((presetText, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPrompt(presetText)}
                        className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/60 hover:bg-gray-200 dark:hover:bg-slate-755 transition-colors text-left truncate max-w-[280px]"
                      >
                        {presetText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isStreaming || !prompt.trim() || isBackendOnline === false}
                    className="flex-1 h-12"
                    icon={Play}
                  >
                    {status === "connecting"
                      ? "Connecting..."
                      : status === "streaming"
                      ? "Streaming Audio..."
                      : "Start Streaming"}
                  </Button>

                  {(isStreaming || status === "playing") && (
                    <Button variant="danger" onClick={handleStop} className="px-6 h-12" icon={Square}>
                      Stop / Mute
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </Card>

          {/* Real-time Output Log/Transcript */}
          <Card title="Live Streaming Output Stream">
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Terminal size={14} /> Text Transcript
                </span>
                <span
                  className={`text-2xs px-2.5 py-0.5 rounded-full font-bold border capitalize ${
                    status === "idle"
                      ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      : status === "connecting"
                      ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                      : status === "streaming"
                      ? "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400"
                      : status === "playing"
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  Status: {status}
                </span>
              </div>

              <div className="min-h-[160px] max-h-[220px] overflow-y-auto bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-sm leading-relaxed scrollbar-thin">
                {transcriptChunks.length === 0 ? (
                  <p className="text-slate-500 italic">No audio output stream generated yet.</p>
                ) : (
                  <p>
                    {transcriptChunks.map((chunk) => (
                      <span
                        key={chunk.id}
                        className={`inline-block animate-in fade-in duration-300 mr-1.5 ${
                          chunk.isError ? "text-red-400 font-bold" : ""
                        }`}
                      >
                        {chunk.text}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Audio Visualizer & Model Details (Span 1) */}
        <div className="space-y-6">
          {/* Avatar Video Card */}
          <Card title="Live Lipsync Avatar">
            <div className="flex flex-col items-center mt-3 gap-4">
              <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl flex items-center justify-center min-h-[200px]">
                {currentFrame ? (
                  <img src={`data:image/jpeg;base64,${currentFrame}`} className="w-full h-auto object-cover" alt="Live Avatar" />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <VolumeX size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">Waiting for video frames...</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Visualizer Card */}
          <Card title="Oscilloscope Visualizer">
            <div className="flex flex-col items-center mt-3 gap-4">
              <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
                <canvas ref={canvasRef} className="w-full h-36" />
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-3xs text-gray-400 border border-white/5 font-semibold">
                  <Volume2 size={10} />
                  <span>24kHz Output</span>
                </div>
              </div>

              <div className="w-full text-center">
                <p className="text-2xs text-gray-500 dark:text-slate-400 flex items-center justify-center gap-1 font-medium">
                  <Info size={12} strokeWidth={2.5} />
                  Visualizing direct sound buffer stream
                </p>
              </div>
            </div>
          </Card>

          {/* Model Stats / Specs */}
          <Card title="Engine Configurations">
            <div className="space-y-4 mt-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">Ollama LLM Engine</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Cpu size={12} className="text-indigo-500" /> CPU Only
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">LLM Chat Model</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-3xs">llama3.2</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">Voice Model</span>
                  <span className="font-bold text-gray-850 dark:text-gray-200 font-mono text-3xs">hm_omega (RVC)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">TTS Engine</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Kokoro v0.19</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">Pitch Method</span>
                  <span className="font-bold text-gray-850 dark:text-gray-200 font-mono text-3xs">pm (Real-time)</span>
                </div>
              </div>

              <div className="text-2xs text-gray-400 dark:text-slate-505">
                <p>
                  * LLM generation runs on your host CPU (configured via Ollama) and pipes word buffers to Kokoro. Kokoro
                  synthesizes phonemes, which are then pitch-corrected by RVC on GPU.
                </p>
              </div>
            </div>
          </Card>

          {/* Segment History */}
          <Card title="Streamed Segments">
            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {audioSegments.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">No playback history.</p>
              ) : (
                audioSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-lg space-y-1 hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between text-3xs font-semibold text-gray-450 dark:text-slate-450">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 size={10} /> Played Segment
                      </span>
                      <span>{segment.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{segment.text}</p>
                    <div className="text-3xs text-gray-400 dark:text-slate-500 flex justify-end">
                      <span>Duration: {segment.duration}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
