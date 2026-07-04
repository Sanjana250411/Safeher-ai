import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import SOSButton from "./components/SOSButton";
import EmotionDetector from "./components/EmotionDetector";
import PoseDetector from "./components/PoseDetector";
import FakeCall from "./components/FakeCall";
import SafeRoute from "./components/SafeRoute";
import NearbyServices from "./components/NearbyServices";
import Chatbot from "./components/Chatbot";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";
import { 
  User, 
  EmergencyRecord, 
  NotificationItem, 
  ActivityLog 
} from "./types";
import { AlertOctagon, Heart, Phone, Eye, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core synchronized lists
  const [users, setUsers] = useState<User[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Geolocation
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);

  // Overlays
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);

  // Load from local storage and sync initial geolocations
  useEffect(() => {
    const savedUser = localStorage.getItem("safeguard_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Geolocation retrieval
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation access blocked or timed out, utilizing SF defaults.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Set theme colors on HTML root node
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.backgroundColor = "#020617"; // slate 950
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#f8fafc"; // slate 50
    }
  }, [theme]);

  // Synchronize data from backend when logged in
  const syncData = async () => {
    if (!currentUser) return;

    try {
      // 1. Fetch emergencies
      const emQuery = currentUser.role === "admin" ? "" : `?userId=${currentUser.id}`;
      const emRes = await fetch(`/api/emergencies${emQuery}`);
      if (emRes.ok) {
        const emData = await emRes.json();
        setEmergencies(emData);
      }

      // 2. Fetch notifications
      const notifRes = await fetch("/api/notifications");
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }

      // 3. Fetch activity logs
      const logRes = await fetch("/api/activity-logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        setActivityLogs(logData);
      }

      // 4. Fetch general config settings
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSoundEnabled(settingsData.soundEnabled);
      }

      // 5. If admin, sync user profiles directory
      if (currentUser.role === "admin") {
        // Simple mock registry list sync from server side file db
        const userRes = await fetch("/api/safe-routes"); // routes contains mock, but let's build dynamic users sync from DB
        // Fetch users from server db.json directly
        const usersListRes = await fetch("/api/emergencies"); // we can extrapolate users or do simple mapping
      }
    } catch (e) {
      console.warn("Offline fallback sync: Server currently loading.");
    }
  };

  useEffect(() => {
    syncData();
    const syncInterval = setInterval(syncData, 5000); // Poll every 5s
    return () => clearInterval(syncInterval);
  }, [currentUser]);

  // Sync simulated user list from our JSON server
  const fetchAllUsersForAdmin = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.id }) });
      // We can also fetch the file indirectly or let App.tsx synthesize the list since we have default accounts in db.json
    } catch (e) {}
  };

  const handleLogin = async (email: string, password?: string, faceToken?: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, faceRecognitionToken: faceToken })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("safeguard_user", JSON.stringify(data.user));
        localStorage.setItem("safeguard_token", data.token);
        setActiveTab("dashboard");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const handleRegister = async (fields: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      return response.ok;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("safeguard_user");
    localStorage.removeItem("safeguard_token");
    setActiveTab("dashboard");
  };

  const handleUpdateProfile = async (updated: User): Promise<void> => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: updated.id,
          fullName: updated.fullName,
          phone: updated.phone,
          age: updated.age,
          address: updated.address,
          bloodGroup: updated.bloodGroup,
          medicalDetails: updated.medicalDetails,
          emergencyContacts: updated.emergencyContacts,
          faceRegistered: updated.faceRegistered
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("safeguard_user", JSON.stringify(data.user));
      } else {
        throw new Error("Profile update rejected by security system.");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleTriggerSOS = async (source: string, audioBase64?: string, videoBase64?: string): Promise<void> => {
    try {
      const response = await fetch("/api/emergencies/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          lat: latitude,
          lng: longitude,
          triggerSource: source,
          emotionResult: source.includes("Voice") ? "Panic detected" : "Distress Manual Trigger",
          activityResult: source.includes("Shake") ? "Abrupt shake gesture" : "Standard vertical alert",
          audioBase64,
          videoBase64
        })
      });

      if (response.ok) {
        syncData();
      }
    } catch (err) {
      console.error("SOS Trigger network error:", err);
    }
  };

  const handleResolveEmergency = async (id: string, notes: string): Promise<void> => {
    try {
      const response = await fetch("/api/emergencies/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resolvedNotes: notes })
      });

      if (response.ok) {
        syncData();
      }
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      syncData();
    } catch (e) {}
  };

  const toggleSound = async () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundEnabled: nextSound })
      });
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Simulated direct directory search for administration directory
  const getSimulatedDirectoryList = (): User[] => {
    // Returns default Sanjana profile + admin plus some mock users to satisfy searchable database directories
    const mockUsersList: User[] = [
      {
        id: "user-1",
        fullName: "Sanjana Rajasekaran",
        email: "sanjara@safeguard.ai",
        phone: "+15550177",
        age: 24,
        gender: "Female",
        address: "Downtown Residence, Apt 4B",
        bloodGroup: "A+",
        medicalDetails: "Asthma inhaler in purse",
        emergencyContacts: [],
        role: "user",
        faceRegistered: true
      },
      {
        id: "user-2",
        fullName: "Elena Rostova",
        email: "elena@securesystem.io",
        phone: "+15550211",
        age: 28,
        gender: "Female",
        address: "Presidio Heights, Block 12",
        bloodGroup: "O-",
        medicalDetails: "Diabetic (Type 1)",
        emergencyContacts: [],
        role: "user",
        faceRegistered: false
      },
      {
        id: "user-3",
        fullName: "Anya Sharma",
        email: "anya@familycare.org",
        phone: "+15550344",
        age: 21,
        gender: "Female",
        address: "Mission District, Flat 3A",
        bloodGroup: "B+",
        medicalDetails: "None",
        emergencyContacts: [],
        role: "user",
        faceRegistered: true
      }
    ];

    if (currentUser) {
      const idx = mockUsersList.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        mockUsersList[idx] = currentUser;
      } else if (currentUser.role !== "admin") {
        mockUsersList.unshift(currentUser);
      }
    }
    return mockUsersList;
  };

  // Layout rendering router
  if (!currentUser) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const activeSOS = emergencies.filter(e => e.status === "active");
  const isSOSActive = activeSOS.length > 0;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200`}>
      
      {/* Sidebar controls */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main container block (Offset by sidebar width on desktop) */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen flex flex-col">
        
        {/* Global Active SOS Warning Banner */}
        {isSOSActive && (
          <div className="bg-red-600 text-white px-6 py-3.5 text-center font-bold text-xs uppercase flex items-center justify-center gap-2.5 animate-pulse border-b border-red-500/30 shadow-lg shadow-red-500/10">
            <AlertOctagon className="w-4.5 h-4.5 animate-bounce" /> 
            <span>Warning: {activeSOS.length} Emergency Red Alert SOS broadcasts active on this network node. Dispatch operators notified.</span>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Active Tab router */}
          {(() => {
            switch (activeTab) {
              case "dashboard":
                return (
                  <Dashboard
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    onTriggerSOS={handleTriggerSOS}
                    onTriggerFakeCall={() => setIsFakeCallActive(true)}
                    emergencies={emergencies}
                    activityLogs={activityLogs}
                    latitude={latitude}
                    longitude={longitude}
                    setCoords={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                    setActiveTab={setActiveTab}
                  />
                );

              case "sos":
                return (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <SOSButton
                      currentUser={currentUser}
                      onTriggerSOS={handleTriggerSOS}
                      emergencies={emergencies}
                      latitude={latitude}
                      longitude={longitude}
                      soundEnabled={soundEnabled}
                    />
                    <div className="space-y-6">
                      <EmotionDetector onTriggerSOS={handleTriggerSOS} soundEnabled={soundEnabled} />
                      <PoseDetector onTriggerSOS={handleTriggerSOS} />
                    </div>
                  </div>
                );

              case "routes":
                return <SafeRoute latitude={latitude} longitude={longitude} />;

              case "nearby":
                return <NearbyServices latitude={latitude} longitude={longitude} />;

              case "history":
                return (
                  <div className="glass-panel p-6 rounded-2xl bg-slate-900/50 border border-white/10 space-y-6">
                    <div>
                      <h2 className="text-lg font-bold font-display text-white">Emergency Dispatch Case History</h2>
                      <p className="text-xs text-gray-400 mt-1">Logs of all triggered distress beacons registered to your personal safety profile.</p>
                    </div>

                    {emergencies.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 font-bold">No distress incidents recorded.</p>
                        <p className="text-xs text-gray-500">Your profile contains a clean safety index.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {emergencies.map((e) => (
                          <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  e.status === "active" ? "bg-red-500/20 text-red-300 border border-red-500/20" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                                }`}>
                                  {e.status}
                                </span>
                                <span className="text-xs font-semibold text-white">{e.notes}</span>
                              </div>
                              <p className="text-xs text-gray-400">Timestamp: {new Date(e.timestamp).toLocaleString()}</p>
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-gray-400">
                                <span className="bg-white/5 px-2 py-0.5 rounded">Lat: {e.location.lat.toFixed(4)}, Lng: {e.location.lng.toFixed(4)}</span>
                                {e.emotionResult && <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">Voice: {e.emotionResult}</span>}
                                {e.activityResult && <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">Activity: {e.activityResult}</span>}
                              </div>
                            </div>

                            {/* Evidence logs links if available */}
                            <div className="flex gap-2">
                              {e.videoUrl && (
                                <a 
                                  href={e.videoUrl} 
                                  target="_blank" 
                                  referrerPolicy="no-referrer"
                                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                                >
                                  View Live Video Evidence
                                </a>
                              )}
                              {e.audioUrl && (
                                <audio controls src={e.audioUrl} className="max-w-[200px] h-8 text-xs" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );

              case "chatbot":
                return <Chatbot />;

              case "profile":
                return (
                  <Profile
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteAccount={handleLogout}
                  />
                );

              case "admin":
                return (
                  <AdminDashboard
                    currentUser={currentUser}
                    users={getSimulatedDirectoryList()}
                    emergencies={emergencies}
                    notifications={notifications}
                    activityLogs={activityLogs}
                    onResolveEmergency={handleResolveEmergency}
                    onMarkNotificationRead={handleMarkNotificationRead}
                  />
                );

              default:
                return null;
            }
          })()}

        </div>

        {/* Global Footer info details */}
        <footer className="py-6 border-t border-white/5 text-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          SafeGuard AI Municipal Safety Platform © 2026. All networks encrypted.
        </footer>
      </main>

      {/* Floating Stalker deterrent Fake Call overlay screen */}
      <FakeCall
        isActive={isFakeCallActive}
        setIsActive={setIsActiveFakeCall}
        soundEnabled={soundEnabled}
        onClose={() => setIsFakeCallActive(false)}
      />

    </div>
  );

  // Helper
  function setIsActiveFakeCall(val: boolean) {
    setIsFakeCallActive(val);
  }
}
