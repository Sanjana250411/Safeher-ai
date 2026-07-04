import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  MapPin, 
  Scale, 
  Compass, 
  Activity,
  RefreshCw,
  Sparkles,
  User,
  HeartHandshake
} from "lucide-react";
import { ChatMessage } from "../types";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-init",
      sender: "bot",
      text: "Hello! I am your personal **SafeGuard AI Advisor**.\n\nI am configured with real-time safety tips, first-aid instructions, travel guidelines, and legal protections. How can I help you stay safe today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const PRESETS = [
    { label: "🚨 Active Threat Action Plan", prompt: "What should I do right now if I feel in immediate danger?" },
    { label: "⚖️ Women Rights & Laws", prompt: "Explain the critical legal protective laws and safety rights for women." },
    { label: "🚕 Safe Travel Guidelines", prompt: "What safety procedures should I follow when traveling in a cab at night?" },
    { label: "🩹 First Aid Procedures", prompt: "Provide basic medical emergency and first-aid instructions." }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: data.text,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error();
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "bot-err-" + Date.now(),
        sender: "bot",
        text: "My server neural link is currently offline. Please review the offline SOS station and trigger actions immediately to notify dispatch responders.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Sidebar Chat presets & Tip board */}
      <div className="space-y-4 lg:col-span-1 flex flex-col justify-between h-full">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Fast-Response Presets
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">Click any preset button below to immediately obtain critical safety guidelines from Gemini AI.</p>
          
          <div className="flex flex-col gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 text-xs font-semibold transition-all flex justify-between items-center group cursor-pointer"
              >
                <span>{p.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Legal helpline brief banner */}
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-gradient-to-tr dark:from-rose-950/20 dark:to-slate-900/50 border border-rose-100 dark:border-white/5 shadow-sm">
          <h4 className="text-xs font-bold font-mono text-rose-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 dark:text-red-500" /> Active Emergency Tip
          </h4>
          <p className="text-xs text-rose-950 dark:text-gray-300 mt-2 leading-relaxed">
            If you are actively chased or stalked, do not write text. Use our <strong>SOS Countdown</strong> button or dial <strong>911</strong> immediately. 
          </p>
        </div>
      </div>

      {/* Main chat window balloons */}
      <div className="lg:col-span-2 p-0 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex flex-col h-full overflow-hidden shadow-sm">
        
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-pink-400 rounded-xl flex items-center justify-center animate-pulse">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Safety Companion Advisor</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-400 font-mono">Gemini-2.5-Flash Guardian Neural Net</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold">
            Active
          </span>
        </div>

        {/* Chat Messages flow */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === "bot";
            return (
              <div key={m.id} className={`flex gap-3.5 ${isBot ? "justify-start" : "justify-end"}`}>
                
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 self-start">
                    AI
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border ${
                  isBot 
                    ? "bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-gray-200" 
                    : "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10"
                }`}>
                  {/* Clean Markdown rendering simulator since we have bullet points often */}
                  <div className="whitespace-pre-wrap">
                    {m.text}
                  </div>
                  
                  <div className={`text-[9px] font-mono mt-1.5 text-right opacity-60 ${isBot ? "text-slate-500 dark:text-gray-400" : "text-white"}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs shrink-0 self-start">
                    Me
                  </div>
                )}

              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                AI
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 text-xs text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500 dark:text-pink-400" /> Safety advisor is processing security advice...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g. 'How to escape a chokehold' or 'travel tips')"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-rose-500 dark:focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-colors flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}

// Chevron helper
function ChevronRight(props: any) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
