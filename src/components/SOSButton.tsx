import React, { useState, useEffect, useRef } from "react";
import { 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Smartphone, 
  VolumeX, 
  Volume2, 
  Send,
  Sparkles,
  Play,
  CheckCircle,
  Clock
} from "lucide-react";
import { User, EmergencyRecord } from "../types";

interface SOSButtonProps {
  currentUser: User | null;
  onTriggerSOS: (source: string, audioBase64?: string, videoBase64?: string) => Promise<void>;
  emergencies: EmergencyRecord[];
  latitude: number;
  longitude: number;
  soundEnabled: boolean;
}

export default function SOSButton({
  currentUser,
  onTriggerSOS,
  emergencies,
  latitude,
  longitude,
  soundEnabled
}: SOSButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [shakeSimulated, setShakeSimulated] = useState(false);
  const [voiceKeywordLog, setVoiceKeywordLog] = useState<string[]>([]);
  const [simulatedVoiceInput, setSimulatedVoiceInput] = useState("");
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Speech Recognition API setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
          .toLowerCase();

        const triggerWords = ["help", "emergency", "danger", "save me", "please help", "i am in danger", "scream", "stalker"];
        const foundWord = triggerWords.find(word => transcript.includes(word));

        if (foundWord) {
          setVoiceKeywordLog(prev => [`Captured Voice Keyword: "${foundWord}" at ${new Date().toLocaleTimeString()}`, ...prev]);
          triggerSOSImmediately(`Voice command: "${foundWord}"`);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      rec.onend = () => {
        if (isListening) {
          try {
            rec.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = rec;
    }
  }, [isListening]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser. Please use the Simulated Speech input below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Simulated Speech Input Submit
  const handleSimulatedVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedVoiceInput.trim()) return;

    const text = simulatedVoiceInput.toLowerCase();
    const triggerWords = ["help", "emergency", "danger", "save me", "please help", "i am in danger", "scream", "stalker"];
    const foundWord = triggerWords.find(word => text.includes(word));

    setVoiceKeywordLog(prev => [`Mock Voice: "${simulatedVoiceInput}" submitted`, ...prev]);

    if (foundWord) {
      setVoiceKeywordLog(prev => [`➔ Matches keyword: "${foundWord}" - TRIGGERING SOS`, ...prev]);
      triggerSOSImmediately(`Voice trigger: "${foundWord}"`);
    } else {
      setVoiceKeywordLog(prev => [`➔ No match for danger keywords.`, ...prev]);
    }
    setSimulatedVoiceInput("");
  };

  // Simulated Shake Trigger
  const triggerShakeSimulation = () => {
    setShakeSimulated(true);
    setTimeout(() => setShakeSimulated(false), 2000);
    triggerSOSImmediately("Mobile Shake Detection");
  };

  // Play audio alarm siren
  const playSiren = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      // alternating police frequencies
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      setIsSirenPlaying(true);

      // alternating pitch sweep loop
      let high = true;
      const pitchInterval = setInterval(() => {
        if (!oscillatorRef.current) {
          clearInterval(pitchInterval);
          return;
        }
        oscillatorRef.current.frequency.exponentialRampToValueAtTime(high ? 880 : 440, ctx.currentTime + 0.4);
        high = !high;
      }, 500);

    } catch (e) {
      console.warn("Audio alarm failed to play:", e);
    }
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setIsSirenPlaying(false);
  };

  const handleSOSClick = () => {
    if (countdown !== null) {
      // Cancel SOS countdown
      if (timerRef.current) clearInterval(timerRef.current);
      setCountdown(null);
      stopSiren();
      return;
    }

    // Play immediate low tone warning
    playSiren();
    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          triggerSOSImmediately("Manual Red SOS Button");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerSOSImmediately = async (source: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    playSiren();

    // Mock recorded video and audio files uploading
    const simulatedAudioToken = "data:audio/mp3;base64,simulated_sos_audio_feed_token";
    const simulatedVideoToken = "data:video/mp4;base64,simulated_sos_video_feed_token";

    await onTriggerSOS(source, simulatedAudioToken, simulatedVideoToken);

    // Stop siren after 6 seconds to prevent annoyance during development
    setTimeout(() => {
      stopSiren();
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-white/10">
        <h2 className="text-lg font-bold font-display text-white">Interactive SOS Control Station</h2>
        <p className="text-xs text-gray-400 mt-1">
          Activate instant distress protocol. Once triggered, guardians and dispatch operators are notified with dynamic Google Maps locations.
        </p>
      </div>

      {/* Centerpiece SOS Button Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Massive Button Panel */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col items-center justify-center text-center py-12 relative overflow-hidden">
          
          {countdown !== null && (
            <div className="absolute inset-0 bg-red-600/10 backdrop-blur-md z-10 flex flex-col items-center justify-center">
              <span className="text-7xl font-display font-black text-white animate-ping">{countdown}</span>
              <p className="text-sm font-semibold text-white mt-4 uppercase tracking-widest">SENDING SOS IN...</p>
              <button
                onClick={handleSOSClick}
                className="mt-6 px-5 py-2.5 bg-white text-red-600 font-bold rounded-xl shadow-lg border border-red-500/10 hover:scale-105 active:scale-95 transition-transform text-xs uppercase"
              >
                Abrupt / Cancel SOS
              </button>
            </div>
          )}

          <div className="relative mb-8 flex items-center justify-center">
            {/* Pulsing ring halos */}
            <div className="absolute w-52 h-52 bg-red-500/10 rounded-full animate-ping" />
            <div className="absolute w-44 h-44 bg-red-600/15 rounded-full animate-pulse" />
            
            <button
              onClick={handleSOSClick}
              className="relative z-0 w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold text-2xl shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-4 border-white/10 hover:from-red-500 hover:to-rose-400 active:scale-95 transition-transform"
            >
              <AlertTriangle className="w-8 h-8 mb-1 animate-bounce" />
              <span className="font-display tracking-wider font-extrabold text-xl">SOS</span>
              <span className="text-[10px] font-mono tracking-wider opacity-80 uppercase mt-0.5">Press & Hold</span>
            </button>
          </div>

          <div className="max-w-xs">
            <h3 className="text-white font-semibold text-sm">Emergency Countdown System</h3>
            <p className="text-xs text-gray-400 mt-1">
              Pressing the button triggers a 3-second cancellation window before sending GPS dispatch logs to avoid false reports.
            </p>
          </div>

          {isSirenPlaying && (
            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-mono">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Warning Siren Audio Active
              <button onClick={stopSiren} className="ml-2 underline text-white">Mute</button>
            </div>
          )}
        </div>

        {/* Trigger Methods Grid */}
        <div className="space-y-6">
          
          {/* Hands-free Voice SOS */}
          <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-400" /> Active Voice SOS Listening
              </h3>
              <button
                onClick={toggleVoiceListening}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isListening ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-gray-800 text-gray-400"
                }`}
              >
                {isListening ? <><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Listening</> : "Off"}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Keywords: <strong className="text-red-300">"help"</strong>, <strong className="text-red-300">"emergency"</strong>, <strong className="text-red-300">"danger"</strong>, <strong className="text-red-300">"save me"</strong>, <strong className="text-red-300">"please help"</strong>. Say them to activate hands-free trigger.
            </p>

            {/* Simulated Voice Command for sandboxed context */}
            <form onSubmit={handleSimulatedVoiceSubmit} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Simulate saying: 'Help! I am in danger!'"
                value={simulatedVoiceInput}
                onChange={e => setSimulatedVoiceInput(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/20 rounded-xl"
                title="Send Simulated Speech"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Keyword logs */}
            <div className="mt-3 bg-black/40 rounded-lg p-2.5 border border-white/5 max-h-24 overflow-y-auto text-[10px] font-mono text-gray-400 space-y-1">
              {voiceKeywordLog.length === 0 ? (
                <span className="italic text-gray-600">No recent voice commands logged.</span>
              ) : (
                voiceKeywordLog.map((log, i) => (
                  <div key={i} className="truncate">➔ {log}</div>
                ))
              )}
            </div>
          </div>

          {/* Shake Trigger */}
          <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Mobile Shake Detection
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                Sensitivity: High (7/10)
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Violent, high-frequency wrist motions trigger immediate safety logs with back-end emergency dispatches.
            </p>
            
            <button
              onClick={triggerShakeSimulation}
              className={`w-full mt-4 py-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                shakeSimulated 
                  ? "bg-red-600 text-white border-red-500" 
                  : "bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {shakeSimulated ? (
                <>💥 Shake Registered! Launching SOS!</>
              ) : (
                <><Smartphone className="w-4 h-4 animate-bounce" /> Simulate Strong Wrist Shake</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
