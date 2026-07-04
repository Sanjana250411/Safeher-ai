import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  Milestone, 
  RefreshCw, 
  Sparkles,
  Map 
} from "lucide-react";
import { SafeRouteItem, CrimeHotspot } from "../types";

interface SafeRouteProps {
  latitude: number;
  longitude: number;
}

export default function SafeRoute({ latitude, longitude }: SafeRouteProps) {
  const [routes, setRoutes] = useState<SafeRouteItem[]>([]);
  const [hotspots, setHotspots] = useState<CrimeHotspot[]>([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/safe-routes?lat=${latitude}&lng=${longitude}`);
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes);
        setHotspots(data.hotspots);
      }
    } catch (err) {
      console.error("Failed to load safety routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [latitude, longitude]);

  const activeRoute = routes[selectedRouteIdx];

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-red-500" /> AI-Powered Crime Hotspot Avoidance & Safe Routing
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Re-calculates walking routes using community reports and police incidents to steer you clear of high-crime or poorly-lit zones.
          </p>
        </div>
        <button
          onClick={fetchRoutes}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Route Maps
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 glass-panel rounded-2xl">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Querying municipal crime database and drafting safe corridors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SVG Map Layout */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col h-[380px] relative overflow-hidden">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Vector Corridors Map (Live Simulation)
            </h3>

            <div className="flex-1 bg-slate-950/80 rounded-xl relative border border-white/5 overflow-hidden">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 500 300"
                preserveAspectRatio="none"
              >
                {/* Simulated Grid overlay */}
                <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.02)" />
                <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.02)" />
                <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,0.02)" />
                <line x1="400" y1="0" x2="400" y2="300" stroke="rgba(255,255,255,0.02)" />
                
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.02)" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.02)" />
                <line x1="0" y1="225" x2="500" y2="225" stroke="rgba(255,255,255,0.02)" />

                {/* Major streets */}
                <line x1="0" y1="110" x2="500" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <line x1="0" y1="210" x2="500" y2="210" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeDasharray="6,4" />
                <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />

                {/* Draw Crime Hotspots (Red blinking circles) */}
                {hotspots.map((h) => {
                  // Map coordinates around SF center to standard pixel locations
                  const pixelX = 250 + (h.lng - (-122.4194)) * 9000;
                  const pixelY = 150 - (h.lat - 37.7749) * 9000;
                  
                  return (
                    <g key={h.id}>
                      <circle cx={pixelX} cy={pixelY} r="25" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" />
                      <circle cx={pixelX} cy={pixelY} r="6" fill="#ef4444">
                        <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}

                {/* Draw all proposed routes with varied colors */}
                {routes.map((route, idx) => {
                  const pointsStr = route.points.map(([lat, lng]) => {
                    const x = 250 + (lng - (-122.4194)) * 9000;
                    const y = 150 - (lat - 37.7749) * 9000;
                    return `${x},${y}`;
                  }).join(" ");

                  const isSelected = selectedRouteIdx === idx;
                  const strokeColor = route.safetyScore > 90 
                    ? "#10b981" // emerald
                    : route.safetyScore > 70 
                      ? "#f59e0b" // amber
                      : "#ef4444"; // red

                  return (
                    <polyline
                      key={idx}
                      points={pointsStr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "5" : "1.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isSelected ? "1" : "0.35"}
                      style={{ transition: "stroke-width 0.2s" }}
                    />
                  );
                })}

                {/* Draw User Source coordinates Node */}
                {(() => {
                  const userX = 250 + (longitude - (-122.4194)) * 9000;
                  const userY = 150 - (latitude - 37.7749) * 9000;
                  return (
                    <g>
                      <circle cx={userX} cy={userY} r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                      <text x={userX - 25} y={userY - 14} fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">START</text>
                    </g>
                  );
                })()}

                {/* Target Node indicator */}
                {activeRoute && activeRoute.points.length > 0 && (() => {
                  const targetPoint = activeRoute.points[activeRoute.points.length - 1];
                  const targetX = 250 + (targetPoint[1] - (-122.4194)) * 9000;
                  const targetY = 150 - (targetPoint[0] - 37.7749) * 9000;
                  return (
                    <g>
                      <circle cx={targetX} cy={targetY} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={targetX - 20} y={targetY - 14} fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">DESTINATION</text>
                    </g>
                  );
                })()}
              </svg>

              {/* Map floating indicators */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-emerald-500 rounded" />
                  <span className="text-[9px] font-mono text-gray-300">High Safety Corridor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-amber-500 rounded" />
                  <span className="text-[9px] font-mono text-gray-300">Medium Risk St.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-red-500 rounded" />
                  <span className="text-[9px] font-mono text-gray-300">Danger Zone Path</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Options Side Drawer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Suggested Routes</h3>
            <div className="space-y-3">
              {routes.map((route, idx) => {
                const isSelected = selectedRouteIdx === idx;
                const scoreColorClass = route.safetyScore > 90 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                  : route.safetyScore > 70 
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                    : "text-red-400 bg-red-500/10 border-red-500/20";

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRouteIdx(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-white/10 border-white/20 shadow-md" 
                        : "bg-white/5 border-white/5 hover:bg-white/8 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                        {route.name}
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${scoreColorClass}`}>
                        Safety: {route.safetyScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2 truncate">
                      {route.description}
                    </p>

                    <div className="flex gap-3 mt-3 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><Milestone className="w-3.5 h-3.5 text-indigo-400" /> {route.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {route.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Selected Route Analysis */}
            {activeRoute && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Corridor Safety Audit</h4>
                <div className="text-xs text-gray-300 leading-relaxed">
                  {activeRoute.safetyScore > 90 ? (
                    <p className="flex items-start gap-1.5 text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> 
                      Highly Monitored Zone. Police patrol schedules active, street lighting index 100%, high density of camera beacons.
                    </p>
                  ) : activeRoute.safetyScore > 70 ? (
                    <p className="flex items-start gap-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> 
                      Standard Urban Zone. Avoid empty commercial warehouses, stick to the main boulevard.
                    </p>
                  ) : (
                    <p className="flex items-start gap-1.5 text-red-300 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> 
                      Extreme Incident Zone. Poor street lighting, low pedestrian density, and 3 incident reports in last 48 hours. DO NOT WALK ALONE.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
