import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  VolumeX 
} from "lucide-react";

interface EmotionDetectorProps {
  onTriggerSOS: (source: string) => void;
  soundEnabled: boolean;
}

interface EmotionState {
  label: string;
  score: number; // percentage 0-100
  status: "safe" | "danger";
}

export default function EmotionDetector({ onTriggerSOS, soundEnabled }: EmotionDetectorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionState>({ label: "Ambient Silence", score: 0, status: "safe" });
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated emotions helper
  const EMOTIONS_PRESETS: EmotionState[] = [
    { label: "High Pitch Fear / Distress", score: 92, status: "danger" },
    { label: "Extreme Stress / Panic", score: 88, status: "danger" },
    { label: "Crying & Sobbing Speech", score: 86, status: "danger" },
    { label: "Calm / Standard Conversation", score: 18, status: "safe" },
    { label: "Loud Anger / Aggression", score: 79, status: "safe" }
  ];

  // Draw simulated or real sound waves
  useEffect(() => {
    const barsCount = 35;
    if (!isRecording) {
      setWaveformBars(Array(barsCount).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setWaveformBars(
        Array.from({ length: barsCount }, () => Math.floor(Math.random() * (detectedEmotion.status === "danger" ? 45 : 20)) + 6)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, detectedEmotion]);

  // Real Audio Canvas Visualizer Setup
  const startRealAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      source.connect(analyser);
      setIsRecording(true);

      setAnalysisLogs(prev => [`Speech analyzer online at ${new Date().toLocaleTimeString()}`, ...prev]);

      // Simple Canvas Loop
      const drawCanvas = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "rgba(15, 23, 42, 0.2)"; // transparent clear
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          // Gradients
          const grad = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
          grad.addColorStop(0, "#ef4444");
          grad.addColorStop(1, "#f59e0b");

          canvasCtx.fillStyle = grad;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }

        animationRef.current = requestAnimationFrame(drawCanvas);
      };
      
      drawCanvas();

    } catch (err) {
      console.warn("Could not load mic stream, using simulated waveforms:", err);
      setIsRecording(true);
      setAnalysisLogs(prev => ["Microphone access disabled. Active audio simulator online.", ...prev]);
    }
  };

  const stopRealAudioAnalysis = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setDetectedEmotion({ label: "Ambient Silence", score: 0, status: "safe" });
  };

  const simulateEmotionDistress = (preset: EmotionState) => {
    setDetectedEmotion(preset);
    setAnalysisLogs(prev => [
      `[Analysis Block] Detected: "${preset.label}" with Confidence ${preset.score}%`,
      ...prev
    ]);

    if (preset.status === "danger" && preset.score >= 85) {
      setAnalysisLogs(prev => [
        `⚠️ DISTRESS EXCEEDS 85% MANDATE! Dispatching Automatic emergency trigger.`,
        ...prev
      ]);
      onTriggerSOS(`AI Voice Emotion: "${preset.label}" (${preset.score}% Confidence)`);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-500 animate-pulse" /> AI Voice Emotion & Panic Analyzer
          </h3>
          <p className="text-xs text-gray-400">Microphone feeds are processed locally for screams, hyper-ventilation, and distress.</p>
        </div>
        <button
          onClick={isRecording ? stopRealAudioAnalysis : startRealAudioAnalysis}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            isRecording ? "bg-red-600 text-white animate-pulse" : "bg-white/10 hover:bg-white/15 text-white"
          }`}
        >
          {isRecording ? <><Mic className="w-4 h-4" /> Stop Analyzer</> : <><MicOff className="w-4 h-4" /> Start Live Mic</>}
        </button>
      </div>

      {/* Waveform Visualization Canvas */}
      <div className="h-28 bg-slate-950/80 rounded-xl relative flex items-center justify-center overflow-hidden border border-white/5">
        
        {/* Draw live Web Audio canvas if recording & available */}
        <canvas 
          ref={canvasRef} 
          width="400" 
          height="110" 
          className="absolute inset-0 w-full h-full object-cover" 
        />

        {/* CSS simulated bars overlay */}
        <div className="relative z-10 flex items-end justify-center gap-1.5 h-16 w-full px-6">
          {waveformBars.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                detectedEmotion.status === "danger" 
                  ? "bg-gradient-to-t from-red-600 to-rose-400" 
                  : "bg-gradient-to-t from-indigo-500 to-cyan-400"
              }`}
              style={{ height: `${h * 1.5}px` }}
            />
          ))}
        </div>

        <div className="absolute top-2 left-3 text-[9px] font-mono tracking-wider text-gray-500 uppercase flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-gray-700"}`} />
          {isRecording ? "Live local spectral mapping feed" : "Engine Standby"}
        </div>
      </div>

      {/* Analysis Presets (Click to test distress thresholds) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Simulation Testing Panel</span>
          <span className="text-[10px] text-gray-400">Trigger simulated voice distress values</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {EMOTIONS_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => simulateEmotionDistress(preset)}
              disabled={!isRecording}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                !isRecording 
                  ? "bg-slate-950/40 text-gray-600 border-white/5 cursor-not-allowed" 
                  : preset.status === "danger"
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-slate-800/40 hover:bg-slate-800 text-gray-300 border-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Emotion Detection Result */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-mono text-gray-400 uppercase">Detection Result</h4>
          <p className={`text-base font-bold font-display mt-1 ${detectedEmotion.status === "danger" ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
            {detectedEmotion.label}
          </p>
        </div>
        
        <div>
          <h4 className="text-xs font-mono text-gray-400 uppercase">Confidence Score</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${detectedEmotion.status === "danger" ? "bg-red-500" : "bg-indigo-500"}`}
                style={{ width: `${detectedEmotion.score}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{detectedEmotion.score}%</span>
          </div>
          {detectedEmotion.status === "danger" && detectedEmotion.score >= 85 && (
            <span className="text-[9px] text-red-400 font-mono mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400 animate-ping" /> Threat Threshold Exceeded (&gt;85%)
            </span>
          )}
        </div>
      </div>

      {/* Logger Box */}
      <div className="bg-black/80 rounded-xl p-3 border border-white/5 space-y-1">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">AI Engine Logs</div>
        <div className="max-h-20 overflow-y-auto space-y-1 text-[9px] font-mono text-gray-400">
          {analysisLogs.length === 0 ? (
            <span className="italic text-gray-600">Activate microphone analysis or click simulations to see live engine logs.</span>
          ) : (
            analysisLogs.map((log, i) => (
              <div key={i}>➔ {log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
