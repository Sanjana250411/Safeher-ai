import React, { useState, useEffect } from "react";
import { 
  CloudSun, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Plus, 
  Trash2, 
  Play, 
  UserPlus, 
  Eye, 
  Compass, 
  Clock, 
  Bell,
  Navigation,
  Sparkles,
  Search
} from "lucide-react";
import { User, EmergencyContact, EmergencyRecord, ActivityLog } from "../types";

interface DashboardProps {
  currentUser: User | null;
  onUpdateProfile: (updated: User) => Promise<void>;
  onTriggerSOS: (source: string) => void;
  onTriggerFakeCall: () => void;
  emergencies: EmergencyRecord[];
  activityLogs: ActivityLog[];
  latitude: number;
  longitude: number;
  setCoords: (lat: number, lng: number) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  currentUser,
  onUpdateProfile,
  onTriggerSOS,
  onTriggerFakeCall,
  emergencies,
  activityLogs,
  latitude,
  longitude,
  setCoords,
  setActiveTab
}: DashboardProps) {
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [weatherTemp, setWeatherTemp] = useState("24°C");
  const [weatherDesc, setWeatherDesc] = useState("Sunny & Warm");
  const [showAddContact, setShowAddContact] = useState(false);

  // New contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactError, setContactError] = useState("");

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Weather simulation
  useEffect(() => {
    const temps = ["21°C", "23°C", "24°C", "26°C", "22°C"];
    const descs = ["Sunny & Clear", "Partly Cloudy", "Mild breeze", "Pleasant Weather", "Overcast skies"];
    const randomIdx = Math.floor(Math.random() * temps.length);
    setWeatherTemp(temps[randomIdx]);
    setWeatherDesc(descs[randomIdx]);
  }, []);

  if (!currentUser) return null;

  const activeSOSCount = emergencies.filter(e => e.status === "active").length;
  const isCurrentlyInDanger = activeSOSCount > 0;

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");

    if (!contactName || !contactPhone || !contactRelationship) {
      setContactError("Please fill out Name, Phone, and Relationship.");
      return;
    }

    const newContact: EmergencyContact = {
      name: contactName,
      phone: contactPhone,
      email: contactEmail || "not-provided@family.com",
      relationship: contactRelationship
    };

    const updatedContacts = [...(currentUser.emergencyContacts || []), newContact];
    const updatedUser: User = {
      ...currentUser,
      emergencyContacts: updatedContacts
    };

    try {
      await onUpdateProfile(updatedUser);
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactRelationship("");
      setShowAddContact(false);
    } catch (err: any) {
      setContactError(err.message || "Failed to add emergency contact.");
    }
  };

  const handleDeleteContact = async (idx: number) => {
    const updatedContacts = [...(currentUser.emergencyContacts || [])];
    updatedContacts.splice(idx, 1);

    const updatedUser: User = {
      ...currentUser,
      emergencyContacts: updatedContacts
    };

    await onUpdateProfile(updatedUser);
  };

  // Map Click simulator
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinate maps around San Francisco baseline (37.7749, -122.4194)
    const mockLat = 37.7749 + (200 - y) * 0.0001;
    const mockLng = -122.4194 + (x - 250) * 0.00012;
    setCoords(mockLat, mockLng);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Time / Weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date & Time Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center justify-between col-span-1 md:col-span-2 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase">System Shield Terminal</h2>
            <p className="text-2xl font-bold text-slate-800 dark:text-white font-display tracking-tight">{dateString}</p>
            <div className="flex items-center gap-2 text-rose-500 dark:text-red-400 text-sm font-mono mt-1">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>{timeString}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] bg-rose-500/10 dark:bg-red-500/20 text-rose-600 dark:text-red-300 border border-rose-200 dark:border-red-500/30 px-2.5 py-1 rounded-full font-mono font-semibold">
              GPS CON: ONLINE
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-2">Active Tracker</span>
          </div>
        </div>

        {/* Weather Block */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-indigo-950/40 dark:to-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <CloudSun className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Weather Overlay</h3>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{weatherTemp}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">{weatherDesc}</p>
          </div>
        </div>
      </div>

      {/* Primary Alert Monitor Status */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm ${
        isCurrentlyInDanger 
          ? "bg-rose-50 dark:bg-red-950/20 border-rose-200 dark:border-red-500/30 text-rose-950 dark:text-red-200 shadow-lg shadow-rose-950/5" 
          : "bg-emerald-50/70 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl flex items-center justify-center ${
              isCurrentlyInDanger ? "bg-red-500 text-white animate-bounce" : "bg-emerald-500 text-white"
            }`}>
              {isCurrentlyInDanger ? <Bell className="w-6 h-6 animate-swing" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                {isCurrentlyInDanger ? "RED ALERT ACTIVE" : "Personal Shield Secured"}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                {isCurrentlyInDanger 
                  ? `${activeSOSCount} active emergency dispatcher cases reported. Real-time logging is live.` 
                  : "All safety monitors active: Voice SOS command, Shake triggers, and AI camera pose analysis are running."
                }
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-400 font-mono mt-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-red-400" />
                <span>Live Coordinates: {latitude.toFixed(5)} N , {longitude.toFixed(5)} W</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isCurrentlyInDanger ? (
              <button 
                onClick={() => setActiveTab("history")}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> View active distress logs
              </button>
            ) : (
              <button 
                onClick={() => onTriggerSOS("Manual Button")}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 sos-pulse"
              >
                <Play className="w-4 h-4" /> Trigger Simulated SOS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Left utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG/Canvas GPS Map */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex flex-col h-[400px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                <Compass className="w-4 h-4 text-rose-500 dark:text-red-500 animate-spin-slow" /> Interactive Micro GPS Map Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Click anywhere on the map to mock-travel your GPS coordinates in real time.</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-gray-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">
              SF Area Center
            </span>
          </div>

          <div className="flex-1 relative bg-slate-50 dark:bg-slate-950/80 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 cursor-crosshair">
            {/* Custom SVG Drawing acting as map */}
            <svg 
              className="w-full h-full text-slate-300 dark:text-slate-800" 
              onClick={handleMapClick}
              viewBox="0 0 500 300"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(156,163,175,0.15)" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(156,163,175,0.15)" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(156,163,175,0.15)" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(156,163,175,0.15)" />
              <line x1="450" y1="0" x2="450" y2="300" stroke="rgba(156,163,175,0.15)" />
              
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(156,163,175,0.15)" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(156,163,175,0.15)" />
              <line x1="0" y1="250" x2="500" y2="250" stroke="rgba(156,163,175,0.15)" />

              {/* Major Roads */}
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(156,163,175,0.3)" strokeWidth="6" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(156,163,175,0.3)" strokeWidth="6" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(156,163,175,0.3)" strokeWidth="6" />
              <line x1="380" y1="0" x2="380" y2="300" stroke="rgba(156,163,175,0.3)" strokeWidth="6" />

              {/* Hotspots (Red Halos) */}
              <circle cx="300" cy="120" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
              <text x="310" y="110" fill="rgba(239, 68, 68, 0.7)" fontSize="8" fontFamily="monospace">HIGH RISK ZONE</text>

              <circle cx="100" cy="220" r="22" fill="rgba(245, 158, 11, 0.1)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
              <text x="110" y="240" fill="rgba(245, 158, 11, 0.7)" fontSize="8" fontFamily="monospace">MEDIUM RISK</text>

              {/* Safety Landmarks */}
              {/* Police Icon placeholder as badge */}
              <circle cx="200" cy="80" r="6" fill="#3b82f6" />
              <text x="210" y="84" fill="#60a5fa" fontSize="9" fontWeight="bold">POLICE HUB</text>

              <circle cx="380" cy="240" r="6" fill="#ec4899" />
              <text x="390" y="244" fill="#f472b6" fontSize="9" fontWeight="bold">WOMEN HAVEN</text>

              {/* Active Route Draw representation */}
              <polyline 
                points={`50,150 150,150 200,80 380,80 380,240`}
                fill="none"
                stroke="rgba(16, 185, 129, 0.4)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5,5"
              />

              {/* User Current Live Pin (Dynamic calculation based on coordinates state) */}
              {(() => {
                // Map latitude 37.7749 and longitude -122.4194 to approximate pixel bounds
                const pixelX = Math.max(10, Math.min(490, 250 + (longitude - (-122.4194)) * 8000));
                const pixelY = Math.max(10, Math.min(290, 150 - (latitude - 37.7749) * 8000));

                return (
                  <g>
                    {/* Ripple */}
                    <circle cx={pixelX} cy={pixelY} r="15" fill="rgba(239, 68, 68, 0.15)">
                      <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pixelX} cy={pixelY} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <text x={pixelX + 10} y={pixelY - 10} fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      YOU (Live Location)
                    </text>
                  </g>
                );
              })()}
            </svg>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-mono">
              ★ Active Compass Heading
            </div>
            <button 
              onClick={() => { setCoords(37.7749, -122.4194); }}
              className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-800 text-[10px] font-medium"
            >
              Reset GPS Center
            </button>
          </div>
        </div>

        {/* Quick Actions & Utility panel */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" /> Security Quick Launch
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">Trigger simulated safety features immediately to secure your surrounding presence.</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onTriggerSOS("Dashboard Widget")}
                className="p-3 bg-rose-50 dark:bg-red-600/20 hover:bg-rose-100 dark:hover:bg-red-600/30 text-rose-700 dark:text-red-300 border border-rose-200 dark:border-red-500/30 rounded-xl text-center font-medium text-xs transition-all flex flex-col items-center justify-center gap-2 group h-24 shadow-sm dark:shadow-none"
              >
                <span className="p-2 rounded-lg bg-rose-600 text-white font-bold group-hover:scale-105 transition-transform">SOS</span>
                <span>Send SOS Alert</span>
              </button>

              <button
                onClick={onTriggerFakeCall}
                className="p-3 bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-center font-medium text-xs transition-all flex flex-col items-center justify-center gap-2 group h-24 shadow-sm dark:shadow-none"
              >
                <Phone className="w-6 h-6 text-indigo-500 dark:text-indigo-400 group-hover:animate-ring transition-transform" />
                <span>Simulate Fake Call</span>
              </button>

              <button
                onClick={() => setActiveTab("sos")}
                className="p-3 bg-amber-50 dark:bg-amber-600/20 hover:bg-amber-100 dark:hover:bg-amber-600/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-xl text-center font-medium text-xs transition-all flex flex-col items-center justify-center gap-2 group h-24 shadow-sm dark:shadow-none"
              >
                <Compass className="w-6 h-6 text-amber-500 dark:text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>AI Emotion Analyzer</span>
              </button>

              <button
                onClick={() => setActiveTab("chatbot")}
                className="p-3 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center font-medium text-xs transition-all flex flex-col items-center justify-center gap-2 group h-24 shadow-sm dark:shadow-none"
              >
                <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                <span>Safety AI Chatbot</span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
            <h4 className="text-xs font-mono text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-2">Live Shield Logs</h4>
            <div className="max-h-24 overflow-y-auto space-y-1.5 text-[10px] font-mono">
              {activityLogs.length === 0 ? (
                <p className="text-slate-400 italic">No recent background actions logged.</p>
              ) : (
                activityLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-slate-500 dark:text-gray-400 flex items-start gap-1 justify-between">
                    <span className="truncate max-w-[140px]">➔ {log.action}: {log.details}</span>
                    <span className="text-slate-400 dark:text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Emergency Guardian Circle</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">These individuals are immediately notified with your live GPS location during a distress event.</p>
          </div>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-red-600/20 hover:bg-rose-100 dark:hover:bg-red-600/30 text-rose-600 dark:text-red-300 border border-rose-200 dark:border-red-500/30 rounded-xl text-xs font-medium transition-all"
          >
            {showAddContact ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> Add Guardian</>}
          </button>
        </div>

        {/* Add Contact Form Drawer */}
        {showAddContact && (
          <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Register New Guardian</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                placeholder="Phone Number *"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <select
                value={contactRelationship}
                onChange={e => setContactRelationship(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">Select Relationship *</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse">Spouse</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {contactError && <p className="text-rose-600 dark:text-red-400 text-[11px] font-mono">{contactError}</p>}

            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-all"
            >
              Add Secure Contact
            </button>
          </form>
        )}

        {currentUser.emergencyContacts.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
            <UserPlus className="w-8 h-8 text-slate-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-gray-400">Your guardian circle is empty.</p>
            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Add contacts to ensure they receive emergency alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentUser.emergencyContacts.map((contact, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between group">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{contact.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-gray-400">{contact.phone}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="text-[9px] bg-rose-100 dark:bg-red-500/20 text-rose-700 dark:text-red-300 border border-rose-200 dark:border-red-500/20 px-1.5 rounded-full font-medium">
                      {contact.relationship}
                    </span>
                    <span className="text-[9px] bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-gray-400 px-1.5 rounded-full truncate max-w-[130px]">
                      {contact.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteContact(idx)}
                  className="p-1.5 rounded-lg bg-rose-100 dark:bg-red-500/10 hover:bg-rose-200 dark:hover:bg-red-500/20 text-rose-600 dark:text-red-400 opacity-80 hover:opacity-100 transition-opacity"
                  title="Remove Guardian"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
