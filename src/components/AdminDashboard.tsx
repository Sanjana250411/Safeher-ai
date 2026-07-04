import React, { useState } from "react";
import { 
  Users, 
  AlertOctagon, 
  CheckCircle2, 
  MapPin, 
  Search, 
  Download, 
  TrendingUp, 
  Bell, 
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  BarChart2
} from "lucide-react";
import { User, EmergencyRecord, NotificationItem, ActivityLog } from "../types";

interface AdminDashboardProps {
  currentUser: User | null;
  users: User[];
  emergencies: EmergencyRecord[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  onResolveEmergency: (id: string, notes: string) => Promise<void>;
  onMarkNotificationRead: (id: string) => void;
}

export default function AdminDashboard({
  currentUser,
  users,
  emergencies,
  notifications,
  activityLogs,
  onResolveEmergency,
  onMarkNotificationRead
}: AdminDashboardProps) {
  const [userQuery, setUserQuery] = useState("");
  const [activeSOSFilter, setActiveSOSFilter] = useState<"all" | "active" | "resolved">("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="text-center py-16 glass-panel rounded-2xl bg-red-950/20 border-red-900/30">
        <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-3 animate-bounce" />
        <h3 className="text-lg font-bold text-white">Access Denied</h3>
        <p className="text-xs text-gray-400 mt-1">This console requires elevated admin privileges.</p>
      </div>
    );
  }

  // Filter users based on query
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.phone.includes(userQuery)
  );

  // Filter emergencies
  const filteredEmergencies = emergencies.filter(e => {
    if (activeSOSFilter === "all") return true;
    return e.status === activeSOSFilter;
  });

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId || !resolutionNotes.trim()) return;

    await onResolveEmergency(resolvingId, resolutionNotes);
    setResolvingId(null);
    setResolutionNotes("");
  };

  // Simulate exporting real CSV file
  const handleExportCSV = () => {
    const headers = ["Emergency ID", "User Name", "Phone", "Timestamp", "Coordinates", "Trigger Source", "Status", "Resolution Notes"];
    const rows = emergencies.map(e => [
      e.id,
      e.userName,
      e.userPhone,
      e.timestamp,
      `"${e.location.lat}, ${e.location.lng}"`,
      `"${e.notes}"`,
      e.status,
      `"${e.resolvedNotes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safeguard_emergencies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculations
  const totalUsers = users.length;
  const totalSOS = emergencies.length;
  const activeSOS = emergencies.filter(e => e.status === "active").length;
  const resolvedSOS = emergencies.filter(e => e.status === "resolved").length;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" /> Admin Command Center Control Panel
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time municipal emergency response monitor, threat maps, user databases, and system configuration tools.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 self-start md:self-auto shadow-lg shadow-purple-500/20"
        >
          <Download className="w-3.5 h-3.5" /> Export Dispatch Logs CSV
        </button>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Total Shield Users</span>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Total SOS Events</span>
            <p className="text-2xl font-bold text-white">{totalSOS}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Active Alerts</span>
            <p className="text-2xl font-bold text-red-400 animate-pulse">{activeSOS}</p>
          </div>
          <div className="p-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Cases Resolved</span>
            <p className="text-2xl font-bold text-emerald-400">{resolvedSOS}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Analytics Chart & Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Premium Vector Graph */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-400" /> Hourly Alert Threat Trends
              </h3>
              <p className="text-xs text-gray-400">Peak panic and voice analysis trigger velocities charted over local hours.</p>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
              Live Feed
            </span>
          </div>

          <div className="flex-1 bg-slate-950/80 rounded-xl border border-white/5 relative p-4 flex items-end">
            {/* Custom SVG Line and Bar Chart */}
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.02)" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.02)" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.02)" />

              {/* Area Under Curve */}
              <path
                d="M 20 130 Q 80 80 140 100 T 260 50 T 380 90 L 380 130 L 20 130 Z"
                fill="url(#purpleGrad)"
                opacity="0.15"
              />

              {/* Line graph curve */}
              <path
                d="M 20 130 Q 80 80 140 100 T 260 50 T 380 90"
                fill="none"
                stroke="#a855f7"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dynamic Interactive Scatter Nodes */}
              <circle cx="80" cy="95" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="200" cy="75" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="260" cy="50" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5">
                <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" />
              </circle>
              <text x="250" y="36" fill="#f87171" fontSize="8" fontFamily="monospace" fontWeight="bold">PEAK DISTRESS</text>

              {/* X Axis labels */}
              <text x="20" y="145" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">00:00</text>
              <text x="140" y="145" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">08:00</text>
              <text x="260" y="145" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">16:00</text>
              <text x="360" y="145" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">23:00</text>

              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#090514" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* System Notifications clearance box */}
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-[300px]">
          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5 mb-3">
            <Bell className="w-4 h-4 text-yellow-400" /> Security Dispatch Alerts
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-3 rounded-xl border flex items-start gap-3 justify-between ${
                  n.read 
                    ? "bg-slate-950/40 border-white/5 text-gray-400" 
                    : n.type === "sos"
                      ? "bg-red-500/10 border-red-500/35 text-red-200"
                      : "bg-purple-500/5 border-purple-500/20 text-purple-200"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${n.read ? "bg-gray-700" : "bg-red-500"}`} />
                    <span className="font-bold truncate">{n.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300 break-words">{n.body}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => onMarkNotificationRead(n.id)}
                    className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white shrink-0 self-start"
                    title="Acknowledge alert"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live SOS Dispatch Desk Queue */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-500" /> Active Emergency Dispatch Queue
          </h3>
          <div className="flex gap-1.5">
            {["all", "active", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveSOSFilter(f as any)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase border transition-all ${
                  activeSOSFilter === f
                    ? "bg-white text-slate-950 font-bold border-white"
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Resolve Case Form modal drawer */}
        {resolvingId && (
          <form onSubmit={handleResolveSubmit} className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3 animate-slide-in">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acknowledge & Resolve Case #{resolvingId}</h4>
            <textarea
              placeholder="Enter official resolution notes (e.g. Police reached coordinates. Escorted subject safely home.)"
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              rows={2}
              required
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Submit Resolution Code
              </button>
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {filteredEmergencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic text-xs">
            No emergency events match this filter queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-2">User Case</th>
                  <th className="py-3 px-2">Trigger Origin</th>
                  <th className="py-3 px-2">Timestamp</th>
                  <th className="py-3 px-2">Live Coordinates</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmergencies.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-white">{e.userName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{e.userPhone}</div>
                    </td>
                    <td className="py-3.5 px-2 text-gray-300">
                      <div>{e.notes}</div>
                      {e.emotionResult && <span className="inline-block mt-1 text-[9px] font-mono text-purple-300 bg-purple-500/10 px-1.5 rounded">{e.emotionResult}</span>}
                    </td>
                    <td className="py-3.5 px-2 text-gray-400 font-mono">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2">
                      <a
                        href={`https://maps.google.com/?q=${e.location.lat},${e.location.lng}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
                      >
                        <MapPin className="w-3.5 h-3.5" /> {e.location.lat.toFixed(4)}, {e.location.lng.toFixed(4)} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        e.status === "active"
                          ? "bg-red-500/15 text-red-300 border-red-500/30 animate-pulse"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {e.status === "active" ? (
                        <button
                          onClick={() => setResolvingId(e.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-[11px]"
                        >
                          Resolve Case
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic block font-mono max-w-[150px] truncate" title={e.resolvedNotes}>
                          Resolved: {e.resolvedNotes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered User Directory */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> System Registered User Registry
          </h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search directory..."
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.map((u) => (
            <div key={u.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {u.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{u.fullName}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{u.phone}</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap pt-2 border-t border-white/5 text-[9px] font-mono">
                <span className="bg-white/5 text-gray-300 px-1.5 rounded-md">Age: {u.age}</span>
                <span className="bg-red-500/10 text-red-300 px-1.5 rounded-md">Blood: {u.bloodGroup}</span>
                {u.faceRegistered && <span className="bg-emerald-500/10 text-emerald-300 px-1.5 rounded-md">Face ID Linked</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
