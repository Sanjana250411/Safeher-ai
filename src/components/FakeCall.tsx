import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  PhoneOff, 
  User, 
  Clock, 
  Volume2, 
  VolumeX, 
  Video, 
  MessageSquare,
  Lock,
  ChevronRight
} from "lucide-react";

interface FakeCallProps {
  onClose: () => void;
  soundEnabled: boolean;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export default function FakeCall({ onClose, soundEnabled, isActive, setIsActive }: FakeCallProps) {
  // Config state
  const [callerName, setCallerName] = useState("Dad (Guardian)");
  const [timerDelay, setTimerDelay] = useState<number>(5); // in seconds
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  
  // Call state machine
  const [callState, setCallState] = useState<"idle" | "countdown" | "ringing" | "active">("idle");
  const [activeCallDuration, setActiveCallDuration] = useState(0);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneOscRef = useRef<OscillatorNode | null>(null);

  // Play standard retro ringtone
  const startRingtone = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      ringtoneOscRef.current = osc;

      // Pulse ringtone sweep
      let high = true;
      const ringInterval = setInterval(() => {
        if (!ringtoneOscRef.current) {
          clearInterval(ringInterval);
          return;
        }
        // classic double rings: ring (0.4s) - pause (0.2s) - ring (0.4s) - pause (2s)
        gain.gain.setValueAtTime(high ? 0.3 : 0, ctx.currentTime);
        high = !high;
      }, 800);

    } catch (e) {
      console.warn("Could not play simulated ringtone oscillator:", e);
    }
  };

  const stopRingtone = () => {
    if (ringtoneOscRef.current) {
      try {
        ringtoneOscRef.current.stop();
        ringtoneOscRef.current.disconnect();
      } catch (e) {}
      ringtoneOscRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const triggerCallTimer = () => {
    if (timerDelay === 0) {
      launchRinging();
      return;
    }

    setCountdownRemaining(timerDelay);
    setCallState("countdown");

    countdownIntervalRef.current = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          launchRinging();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const launchRinging = () => {
    setCallState("ringing");
    setIsActive(true);
    startRingtone();
  };

  const handleAccept = () => {
    stopRingtone();
    setCallState("active");
    setActiveCallDuration(0);

    callDurationIntervalRef.current = setInterval(() => {
      setActiveCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleReject = () => {
    stopRingtone();
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (callDurationIntervalRef.current) clearInterval(callDurationIntervalRef.current);
    setCallState("idle");
    setCountdownRemaining(null);
    setIsActive(false);
  };

  // Format call duration MM:SS
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      stopRingtone();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (callDurationIntervalRef.current) clearInterval(callDurationIntervalRef.current);
    };
  }, []);

  return (
    <>
      {/* If Call is active or ringing, overlay on top of EVERYTHING */}
      {isActive && (callState === "ringing" || callState === "active") ? (
        <div className="fixed inset-0 z-100 bg-slate-950 flex flex-col justify-between py-16 px-8 text-white font-sans animate-fade-in">
          
          {/* Top Info section */}
          <div className="text-center space-y-3 mt-12">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-3xl font-extrabold mx-auto shadow-xl text-indigo-400">
              {callerName.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{callerName}</h1>
              <p className="text-xs font-mono tracking-widest text-indigo-400 animate-pulse uppercase">
                {callState === "ringing" ? "Incoming cellular call..." : "Call in progress"}
              </p>
              {callState === "active" && (
                <p className="text-lg font-mono text-emerald-400 font-bold">{formatDuration(activeCallDuration)}</p>
              )}
            </div>
          </div>

          {/* Active Call waveform simulation */}
          {callState === "active" && (
            <div className="flex justify-center items-center gap-1 h-12 w-44 mx-auto my-6">
              {[8, 20, 15, 30, 25, 40, 10, 35, 12, 5].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-indigo-400 rounded-full" 
                  style={{ 
                    height: `${h}px`,
                    animation: `pulse-ring ${1 + i * 0.1}s infinite alternate` 
                  }} 
                />
              ))}
            </div>
          )}

          {/* Accept / Reject actions */}
          <div className="flex justify-around items-center mb-16">
            {callState === "ringing" ? (
              <>
                {/* Reject Button */}
                <button
                  onClick={handleReject}
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl hover:bg-red-700 active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

                {/* Accept Button */}
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl hover:bg-emerald-600 active:scale-95 transition-transform sos-pulse"
                >
                  <Phone className="w-7 h-7" />
                </button>
              </>
            ) : (
              // End Active Call button
              <button
                onClick={handleReject}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl mx-auto hover:bg-red-700 active:scale-95 transition-transform"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Slide to lock mock footer */}
          <div className="text-center text-xs text-gray-500 font-mono tracking-wider flex items-center justify-center gap-1.5 uppercase">
            <Lock className="w-3.5 h-3.5" /> Simulated Encrypted Connection
          </div>
        </div>
      ) : (
        /* Setup / Config Dashboard Card */
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-indigo-400 animate-ring" /> Simulated Fake Call Generator
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
              Pursuer Deterrent
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Triggers a realistic full-screen incoming phone call. Show this screen to strangers or pretend you are on an active call with guardians.
          </p>

          <div className="space-y-3.5 mt-2">
            {/* Customizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Caller Identity Label</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={e => setCallerName(e.target.value)}
                  placeholder="e.g. Dad, Police HQ"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Trigger Countdown Timer</label>
                <select
                  value={timerDelay}
                  onChange={e => setTimerDelay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>Immediate Launch</option>
                  <option value={5}>In 5 Seconds</option>
                  <option value={10}>In 10 Seconds</option>
                  <option value={30}>In 30 Seconds</option>
                  <option value={60}>In 1 Minute</option>
                </select>
              </div>
            </div>

            {callState === "countdown" && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>Ringing in {countdownRemaining}s...</span>
                </div>
                <button
                  onClick={handleReject}
                  className="text-xs font-mono underline text-red-400 hover:text-red-300"
                >
                  Cancel Timer
                </button>
              </div>
            )}

            {/* Launch Button */}
            <button
              onClick={triggerCallTimer}
              disabled={callState === "countdown"}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Phone className="w-4 h-4 animate-ring" /> Schedule Simulated Incoming Call
            </button>
          </div>
        </div>
      )}
    </>
  );
}
