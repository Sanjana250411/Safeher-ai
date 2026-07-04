import React from "react";
import { 
  Shield, 
  LayoutDashboard, 
  AlertOctagon, 
  MapPin, 
  HeartHandshake, 
  History, 
  User, 
  MessageSquare, 
  ShieldAlert,
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  Volume2
} from "lucide-react";
import { User as UserType } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sos", label: "SOS Station", icon: AlertOctagon, highlight: true },
    { id: "routes", label: "Safe Routing", icon: MapPin },
    { id: "nearby", label: "Nearby Services", icon: HeartHandshake },
    { id: "history", label: "Emergency Logs", icon: History },
    { id: "chatbot", label: "Safety AI Chatbot", icon: MessageSquare },
    { id: "profile", label: "My Profile", icon: User },
  ];

  if (isAdmin) {
    menuItems.push({ id: "admin", label: "Admin Console", icon: ShieldAlert });
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      {/* Upper Brand Section */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20 flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1">
              SafeGuard <span className="text-red-500">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Active Shield Online</p>
          </div>
        </div>

        {/* User Card */}
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
            <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
            <span className={`inline-block mt-1 px-1.5 py-0.2 text-[9px] font-mono rounded ${
              isAdmin ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}>
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? item.highlight
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-rose-600/10 text-rose-500 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <IconComponent className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? item.highlight 
                      ? "text-white" 
                      : "text-rose-500" 
                    : item.highlight 
                      ? "text-red-400" 
                      : "text-slate-400"
                }`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Logout */}
      <div className="space-y-4">
        {/* Quick Utilities */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Sound Alerts</span>
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg transition-colors ${
                soundEnabled ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
              }`}
              title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Visual Mode</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout Security Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-40 bg-slate-900 border-r border-white/5 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header Banner */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-slate-900 border-b border-white/5 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white">
            SafeGuard <span className="text-red-500">AI</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Slide-out */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-white/5 shadow-2xl h-full animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
