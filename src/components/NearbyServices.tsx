import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Phone, 
  MapPin, 
  Heart, 
  Shield, 
  Home, 
  Navigation, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { NearbyService } from "../types";

interface NearbyServicesProps {
  latitude: number;
  longitude: number;
}

export default function NearbyServices({ latitude, longitude }: NearbyServicesProps) {
  const [services, setServices] = useState<NearbyService[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeCallSim, setActiveCallSim] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/nearby?lat=${latitude}&lng=${longitude}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Failed to load nearby services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [latitude, longitude]);

  const filteredServices = services.filter((srv) => {
    if (selectedType === "all") return true;
    return srv.type === selectedType;
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "police":
        return <Shield className="w-5 h-5 text-blue-400" />;
      case "hospital":
        return <Heart className="w-5 h-5 text-red-400" />;
      case "women_center":
        return <HeartHandshake className="w-5 h-5 text-pink-400" />;
      case "shelter":
        return <Home className="w-5 h-5 text-purple-400" />;
      default:
        return <HeartHandshake className="w-5 h-5 text-gray-400" />;
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "police": return "POLICE DEPARTMENT";
      case "hospital": return "EMERGENCY MEDICAL CARE";
      case "women_center": return "WOMEN SUPPORT FORUM";
      case "shelter": return "EMERGENCY SHELTER HOUSING";
      default: return "HEALTHCARE SOLUTIONS";
    }
  };

  const triggerCallSimulation = (name: string, phone: string) => {
    setActiveCallSim(`Simulated direct cellular secure link dialed to ${name} (${phone}). Responders are dispatching.`);
    setTimeout(() => setActiveCallSim(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-500" /> Nearby Municipal Protection Services
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Detects the nearest verified safe havens, hospital centers, and police control booths based on your active physical coordinates.
          </p>
        </div>
        <button
          onClick={fetchServices}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Coordinates
        </button>
      </div>

      {/* Call Simulator Overlay Notification */}
      {activeCallSim && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs border border-emerald-500 shadow-xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2"><Phone className="w-4 h-4 animate-ring" /> {activeCallSim}</span>
          <button onClick={() => setActiveCallSim(null)} className="underline ml-4 font-mono">Dismiss</button>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {["all", "police", "hospital", "women_center", "shelter"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedType === type
                ? "bg-white text-slate-950 border-white font-bold"
                : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            {type === "all" ? "All Safeties" : type.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 glass-panel rounded-2xl">
          <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Pinging safety beacons and calculating walking distances...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3.5">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getServiceIcon(service.type)}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-wider font-bold text-gray-400">
                      {getServiceTypeLabel(service.type)}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{service.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" /> {service.address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                    {service.distance} km away
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-emerald-400" /> Open 24/7
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  onClick={() => triggerCallSimulation(service.name, service.phone)}
                  className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-300 border border-red-500/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Guard Station
                </button>

                <a
                  href={`https://maps.google.com/?q=${service.lat},${service.lng}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" /> Walk Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
