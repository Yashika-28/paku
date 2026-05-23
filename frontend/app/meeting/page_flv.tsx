"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Send, Construction, AlertTriangle, Terminal, Cpu, Mic, Video, Zap } from 'lucide-react';

// ─── Pipeline stage type ─────────────────────────────────────────────────────
type PipelineStage = 'idle' | 'llm' | 'audio' | 'sending' | 'receiving_audio' | 'inferring' | 'rendering';

const STAGE_META: Record<string, { label: string; color: string; glow: string }> = {
  idle:             { label: 'Idle',              color: 'text-neutral-500',  glow: '' },
  llm:              { label: 'LLM Thinking...',   color: 'text-green-400',    glow: 'shadow-[0_0_12px_rgba(74,222,128,0.6)]' },
  audio:            { label: 'Audio Synthesis',   color: 'text-blue-400',     glow: 'shadow-[0_0_12px_rgba(96,165,250,0.6)]' },
  sending:          { label: 'Sending to GPU',    color: 'text-purple-400',   glow: 'shadow-[0_0_12px_rgba(192,132,252,0.6)]' },
  receiving_audio:  { label: 'GPU Receiving',     color: 'text-yellow-400',   glow: 'shadow-[0_0_12px_rgba(250,204,21,0.6)]' },
  inferring:        { label: 'Wav2Lip Running',   color: 'text-orange-400',   glow: 'shadow-[0_0_12px_rgba(251,146,60,0.6)]' },
  rendering:        { label: 'Rendering Frames',  color: 'text-red-400',      glow: 'shadow-[0_0_12px_rgba(248,113,113,0.6)]' },
};

// ─── Pipeline node definition ─────────────────────────────────────────────────
const PIPELINE_NODES = [
  { id: 'llm',    label: 'LLM',    icon: Cpu,   stages: ['llm'] },
  { id: 'audio',  label: 'Audio',  icon: Mic,   stages: ['audio', 'sending', 'receiving_audio'] },
  { id: 'video',  label: 'Video',  icon: Video, stages: ['inferring', 'rendering'] },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MeetingPage() {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const playerRef    = useRef<any>(null);
  const logsEndRef   = useRef<HTMLDivElement>(null);

  const [prompt,       setPrompt]       = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWarmingUp,  setIsWarmingUp]  = useState(true);
  const [isMuted,      setIsMuted]      = useState(true);

  const [terminalLogs, setTerminalLogs] = useState<{ timestamp: number; type: string; message: string }[]>([]);

  const [statusLLM,   setStatusLLM]   = useState('offline');
  const [statusVideo, setStatusVideo] = useState('offline');
  const [statusTTS,   setStatusTTS]   = useState('offline');

  // Pipeline stages from both backends
  const [stagePaku,     setStagePaku]     = useState<PipelineStage>('idle');
  const [stageLipsync,  setStageLipsync]  = useState<PipelineStage>('idle');

  // Derived active stages across both backends
  const activeStage: PipelineStage =
    stageLipsync !== 'idle' ? stageLipsync :
    stagePaku    !== 'idle' ? stagePaku    : 'idle';

  const isActive = activeStage !== 'idle';

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // ─── FLV Player Setup ───────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initPlayer = async () => {
      if (playerRef.current) return;
      try {
        const flvjs = (await import('flv.js')).default;
        if (flvjs.isSupported() && videoRef.current) {
          const flvPlayer = flvjs.createPlayer(
            { type: 'flv', url: 'http://localhost:5016/stream.flv', isLive: true, hasAudio: true },
            { enableStashBuffer: false }
          );
          flvPlayer.attachMediaElement(videoRef.current);
          flvPlayer.load();
          flvPlayer.on(flvjs.Events.ERROR, (et: any, ed: any, ei: any) => {
            if (et === flvjs.ErrorTypes.NETWORK_ERROR) console.log('FLV network error — will retry');
          });
          if (videoRef.current) videoRef.current.muted = true;
          try { flvPlayer.play(); } catch (_) {}
          if (mounted) playerRef.current = flvPlayer;
        }
      } catch (err) {
        console.error('Failed to load flv.js', err);
      }
    };

    const tid = setTimeout(() => { if (mounted) initPlayer(); }, 2500);
    return () => {
      mounted = false;
      clearTimeout(tid);
      if (playerRef.current) {
        try { playerRef.current.pause(); }          catch (_) {}
        try { playerRef.current.unload(); }         catch (_) {}
        try { playerRef.current.detachMediaElement(); } catch (_) {}
        try { playerRef.current.destroy(); }        catch (_) {}
        playerRef.current = null;
      }
    };
  }, []);

  // ─── Auto Greeting ──────────────────────────────────────────────────────────
  useEffect(() => {
    let handled = false;
    const tid = setTimeout(async () => {
      if (!handled) {
        handled = true;
        try {
          await fetch('http://localhost:5017/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Greet the user in exactly one short sentence, max 10 words.',
              is_greeting: true
            })
          });
        } catch (e) { console.error(e); }
      }
    }, 2000);
    return () => clearTimeout(tid);
  }, []);

  // ─── Status + Log Polling ───────────────────────────────────────────────────
  useEffect(() => {
    const checkStatus = async () => {
      // Paku backend
      try {
        const res = await fetch('http://localhost:5017/status');
        if (res.ok) {
          const d = await res.json();
          setStatusLLM('online (5017)');
          setStatusTTS('online (5017)');
          if (d.warming_up === false) setIsWarmingUp(false);
          if (d.pipeline_stage) setStagePaku(d.pipeline_stage as PipelineStage);
        } else {
          setStatusLLM('error'); setStatusTTS('error');
        }
      } catch { setStatusLLM('offline'); setStatusTTS('offline'); }

      // LipSync backend
      try {
        const res = await fetch('http://localhost:5016/status');
        if (res.ok) {
          const d = await res.json();
          setStatusVideo('online (5016)');
          if (d.pipeline_stage) setStageLipsync(d.pipeline_stage as PipelineStage);
        } else { setStatusVideo('error'); }
      } catch { setStatusVideo('offline'); }

      // Logs from 5017
      try {
        const r = await fetch('http://localhost:5017/logs');
        if (r.ok) {
          const logs = await r.json();
          if (logs?.length > 0)
            setTerminalLogs(prev => [...prev, ...logs].sort((a, b) => a.timestamp - b.timestamp).slice(-120));
        }
      } catch {}

      // Logs from 5016
      try {
        const r = await fetch('http://localhost:5016/logs');
        if (r.ok) {
          const logs = await r.json();
          if (logs?.length > 0)
            setTerminalLogs(prev => [...prev, ...logs].sort((a, b) => a.timestamp - b.timestamp).slice(-120));
        }
      } catch {}
    };

    checkStatus();
    const iv = setInterval(checkStatus, 1000);
    return () => clearInterval(iv);
  }, []);

  // ─── Send Prompt ────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    const text = prompt.trim();
    setIsGenerating(true);
    setPrompt('');
    try {
      await fetch('http://localhost:5017/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
    } catch (err) {
      console.error('Connection failed:', err);
      alert('Failed to connect to Python backend (Is WSL running? Is realtime_stream_app.py active?)');
    } finally {
      // Keep button disabled until pipeline goes idle again
      const waitIdle = setInterval(() => {
        setIsGenerating(false);
        clearInterval(waitIdle);
      }, 800);
    }
  }, [prompt, isGenerating]);

  // ─── Helper: derive per-node state ──────────────────────────────────────────
  const getNodeState = (node: typeof PIPELINE_NODES[0]) => {
    // active = any of this node's stages is the current active stage
    const active = node.stages.includes(activeStage);
    const waiting = isActive && !active;
    return { active, waiting };
  };

  const stageMeta = STAGE_META[activeStage] ?? STAGE_META['idle'];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-900 text-yellow-500 font-mono relative overflow-hidden">

      {/* Background hazard stripes */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#000 0,#000 20px,#eab308 20px,#eab308 40px)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto pt-10 px-4 flex flex-col lg:flex-row gap-8">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-center space-x-4 border-b-2 border-yellow-500 pb-4">
            <Construction size={40} />
            <h1 className="text-4xl font-black uppercase tracking-widest">
              Prototype <span className="text-white">Zone</span>
            </h1>
            <Construction size={40} />
          </div>

          {/* ── Video Container ── */}
          <div className="relative bg-black border-4 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.3)] aspect-video group">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls={false}
              autoPlay
              muted={isMuted}
            />

            {/* Warming Up Overlay */}
            {isWarmingUp && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 z-10">
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-yellow-400 font-mono text-sm tracking-widest uppercase">Warming up engine...</p>
                <p className="text-neutral-600 font-mono text-xs">Loading LipSync model and reference frames</p>
              </div>
            )}

            {/* Unmute button */}
            {isMuted && !isWarmingUp && (
              <div className="absolute inset-0 flex items-end justify-center pb-6 z-20">
                <button
                  onClick={() => { setIsMuted(false); if (videoRef.current) videoRef.current.muted = false; }}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-mono text-sm px-6 py-3 rounded-full shadow-lg transition-all animate-pulse hover:animate-none"
                >
                  🔊 Click to Unmute
                </button>
              </div>
            )}

            {/* Live badge */}
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-xs text-green-400 border border-green-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE FEED: PORT 5016
            </div>

            {/* Processing overlay — appears during active pipeline */}
            {isActive && !isWarmingUp && (
              <div className="absolute top-2 right-2 bg-black/90 border border-yellow-700/60 px-3 py-2 rounded flex items-center gap-2 z-10">
                <Zap size={12} className={`${stageMeta.color} animate-pulse`} />
                <span className={`text-xs font-bold tracking-wider ${stageMeta.color}`}>
                  {stageMeta.label.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* ── Pipeline Status Bar ── */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <div className="text-xs text-neutral-500 tracking-widest mb-3 font-bold flex items-center gap-2">
              <Zap size={12} />
              PIPELINE STATUS
            </div>

            {/* Node strip */}
            <div className="flex items-center gap-0">
              {PIPELINE_NODES.map((node, idx) => {
                const { active, waiting } = getNodeState(node);
                const Icon = node.icon;
                return (
                  <React.Fragment key={node.id}>
                    {/* Node */}
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={`
                          w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
                          ${active
                            ? 'border-yellow-400 bg-yellow-400/20 ' + stageMeta.glow
                            : waiting
                              ? 'border-neutral-600 bg-neutral-800'
                              : 'border-neutral-700 bg-neutral-900'
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          className={
                            active   ? stageMeta.color + ' animate-pulse' :
                            waiting  ? 'text-neutral-600' :
                                       'text-neutral-700'
                          }
                        />
                      </div>
                      <span className={`text-xs font-bold ${active ? stageMeta.color : 'text-neutral-600'}`}>
                        {node.label}
                      </span>
                      {active && (
                        <span className="text-xs text-neutral-500 text-center leading-tight px-1">
                          {stageMeta.label}
                        </span>
                      )}
                    </div>

                    {/* Connector arrow */}
                    {idx < PIPELINE_NODES.length - 1 && (
                      <div className={`flex-shrink-0 mx-1 text-xl leading-none transition-all duration-300 ${isActive ? 'text-yellow-600' : 'text-neutral-700'}`}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Stage description text */}
            <div className={`mt-3 text-xs text-center transition-all duration-300 ${isActive ? stageMeta.color : 'text-neutral-700'}`}>
              {isActive
                ? `⚡ Active: ${stageMeta.label}`
                : '● All stages idle — ready for input'
              }
            </div>
          </div>

          {/* ── Input Panel ── */}
          <div className="bg-neutral-800 p-6 border-2 border-dashed border-neutral-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-sm text-neutral-400">
              <Terminal size={16} />
              <span>COMMAND INPUT</span>
              {isGenerating && (
                <span className="ml-auto text-xs text-yellow-400 animate-pulse">● processing...</span>
              )}
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Nischal anything..."
                className="flex-1 bg-black border border-yellow-700 text-white p-4 focus:outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`px-8 py-4 font-bold uppercase tracking-wider transition-all
                  ${isGenerating || !prompt.trim()
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-500 text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.6)]'
                  }`}
              >
                {isGenerating ? (
                  <span className="flex gap-1 items-center">
                    {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.12}s` }} />)}
                  </span>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <AlertTriangle size={14} className="text-yellow-600" />
              <p>WARNING: Model initialization may cause latency. Backend must be active in WSL.</p>
            </div>
          </div>

          {/* ── Live Diagnostics Terminal ── */}
          <div className="bg-black p-4 border-2 border-neutral-700 rounded-lg shadow-inner h-64 overflow-y-auto font-mono flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2 border-b border-neutral-800 pb-2 text-neutral-500 text-xs tracking-widest font-bold sticky top-0 bg-black">
              <Terminal size={14} />
              <span>LIVE DIAGNOSTICS STREAM</span>
              <span className="ml-auto text-neutral-700">{terminalLogs.length} events</span>
            </div>

            {terminalLogs.length === 0 ? (
              <div className="text-neutral-600 text-sm italic">No output yet — waiting for interaction...</div>
            ) : (
              terminalLogs.map((log, idx) => {
                let colorClass = 'text-neutral-400';
                let icon = '⚙️';
                if (log.type === 'llm')   { colorClass = 'text-green-400'; icon = '🤖'; }
                if (log.type === 'audio') { colorClass = 'text-blue-400';  icon = '🎵'; }
                if (log.type === 'video') { colorClass = 'text-yellow-400'; icon = '🎥'; }

                return (
                  <div key={idx} className={`${colorClass} flex gap-3 text-xs leading-snug`}>
                    <span className="opacity-40 whitespace-nowrap">
                      [{new Date(log.timestamp * 1000).toISOString().split('T')[1].slice(0, 11)}]
                    </span>
                    <span>{icon}</span>
                    <span className="break-words flex-1">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* ── Right Column — Status Panel ───────────────────────────────── */}
        <div className="w-full lg:w-72 flex flex-col gap-4 mt-14">

          {/* System Consoles */}
          <div className="bg-neutral-800 p-4 border border-neutral-600 rounded-lg shadow-lg">
            <h3 className="text-xs text-neutral-400 mb-3 font-bold border-b border-neutral-600 pb-2 tracking-widest">
              SYSTEM CONSOLES
            </h3>

            {[
              { label: 'OLLAMA (LLM)',       status: statusLLM },
              { label: 'TTS + RVC ENGINE',   status: statusTTS },
              { label: 'LIPSYNC VIDEO',      status: statusVideo },
            ].map(({ label, status }) => (
              <div key={label} className="bg-black p-3 rounded border border-neutral-700 mb-2 last:mb-0">
                <div className="text-xs text-neutral-500 mb-1 flex justify-between">
                  <span>{label}</span>
                  <span className={status.includes('online') ? 'text-green-500 animate-pulse' : 'text-red-500'}>●</span>
                </div>
                <div className={`text-xs ${status.includes('online') ? 'text-green-400' : 'text-neutral-600'}`}>
                  {status}
                </div>
              </div>
            ))}
          </div>

          {/* Stage Detail Cards */}
          <div className="bg-neutral-800 p-4 border border-neutral-600 rounded-lg shadow-lg">
            <h3 className="text-xs text-neutral-400 mb-3 font-bold border-b border-neutral-600 pb-2 tracking-widest">
              STAGE DETAIL
            </h3>

            {[
              { port: 5010, label: 'Paku Backend',    stage: stagePaku },
              { port: 5016, label: 'LipSync Server',  stage: stageLipsync },
            ].map(({ port, label, stage }) => {
              const meta = STAGE_META[stage] ?? STAGE_META['idle'];
              return (
                <div key={port} className="bg-black p-3 rounded border border-neutral-700 mb-2 last:mb-0">
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>{label}</span>
                    <span className="text-neutral-700">:{port}</span>
                  </div>
                  <div className={`text-xs font-bold ${meta.color}`}>
                    {stage === 'idle' ? '● idle' : `⚡ ${meta.label}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tips */}
          <div className="bg-neutral-800/50 p-4 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-600 leading-relaxed">
            <div className="text-neutral-500 font-bold mb-2 tracking-widest">HOW IT WORKS</div>
            <p>1. <span className="text-green-600">LLM</span> streams text chunk-by-chunk</p>
            <p>2. <span className="text-blue-600">Piper TTS + RVC</span> clones voice per sentence</p>
            <p>3. <span className="text-yellow-600">Wav2Lip</span> renders lip-sync frames on GPU</p>
            <p>4. <span className="text-neutral-500">FFmpeg</span> muxes → FLV → browser</p>
          </div>

        </div>
      </div>
    </div>
  );
}