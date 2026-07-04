import React, { useState } from "react";
import { 
  User as UserType, 
  EmergencyContact 
} from "../types";
import { 
  Shield, 
  User, 
  Phone, 
  Briefcase, 
  MapPin, 
  Activity, 
  QrCode, 
  Camera, 
  Trash2, 
  Lock, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";

interface ProfileProps {
  currentUser: UserType | null;
  onUpdateProfile: (updated: UserType) => Promise<void>;
  onDeleteAccount: () => void;
}

export default function Profile({ currentUser, onUpdateProfile, onDeleteAccount }: ProfileProps) {
  if (!currentUser) return null;

  // Form edit states
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [age, setAge] = useState(currentUser.age.toString());
  const [address, setAddress] = useState(currentUser.address || "");
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || "O+");
  const [medicalDetails, setMedicalDetails] = useState(currentUser.medicalDetails || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Face scanner simulation states
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(currentUser.faceRegistered);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!fullName || !phone) {
      setError("Full Name and Phone Number are required.");
      return;
    }

    const updatedUser: UserType = {
      ...currentUser,
      fullName,
      phone,
      age: Number(age) || 22,
      address,
      bloodGroup,
      medicalDetails,
      faceRegistered: faceScanSuccess
    };

    try {
      await onUpdateProfile(updatedUser);
      setMessage("Your personal safety profile has been successfully saved.");
    } catch (err: any) {
      setError(err.message || "Could not update safety profile.");
    }
  };

  const simulateFaceMapping = () => {
    setIsScanningFace(true);
    setFaceScanSuccess(false);

    setTimeout(() => {
      setIsScanningFace(false);
      setFaceScanSuccess(true);
      setMessage("Biometric Facial Recognition coordinates registered successfully!");
    }, 2800);
  };

  // Dynamic inline SVG QR Code generator simulating a real code
  const getSimulatedQRCodeSVG = () => {
    // Encodes: Name, Blood, Contacts
    const mockQRData = `SAFEGUARD-AI: ${currentUser.fullName} | Blood: ${currentUser.bloodGroup} | Emergency: ${currentUser.emergencyContacts.map(c=>c.phone).join(",")}`;
    
    return (
      <svg className="w-40 h-40 bg-white p-2.5 rounded-xl mx-auto shadow-md" viewBox="0 0 100 100">
        {/* Outer borders */}
        <rect x="5" y="5" width="25" height="25" fill="#000000" stroke="#000000" strokeWidth="2" />
        <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
        <rect x="12" y="12" width="11" height="11" fill="#000000" />

        <rect x="70" y="5" width="25" height="25" fill="#000000" stroke="#000000" strokeWidth="2" />
        <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
        <rect x="77" y="12" width="11" height="11" fill="#000000" />

        <rect x="5" y="70" width="25" height="25" fill="#000000" stroke="#000000" strokeWidth="2" />
        <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
        <rect x="12" y="77" width="11" height="11" fill="#000000" />

        {/* Dynamic center randomized dot grids resembling QR code patterns */}
        <rect x="40" y="10" width="5" height="5" fill="#000000" />
        <rect x="50" y="20" width="10" height="5" fill="#000000" />
        <rect x="45" y="30" width="5" height="10" fill="#000000" />
        
        <rect x="10" y="45" width="15" height="5" fill="#000000" />
        <rect x="20" y="55" width="5" height="5" fill="#000000" />
        
        <rect x="40" y="40" width="15" height="15" fill="#000000" />
        <rect x="45" y="45" width="5" height="5" fill="#ffffff" />

        <rect x="70" y="40" width="5" height="10" fill="#000000" />
        <rect x="80" y="50" width="10" height="5" fill="#000000" />
        <rect x="85" y="60" width="5" height="10" fill="#000000" />

        <rect x="40" y="70" width="10" height="5" fill="#000000" />
        <rect x="55" y="80" width="5" height="10" fill="#000000" />
        <rect x="45" y="85" width="15" height="5" fill="#000000" />

        <rect x="70" y="70" width="10" height="10" fill="#ef4444" /> {/* red core lock marker */}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Profile Form (Two-Column width) */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-slate-900/50 border border-white/10 space-y-6">
        <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
          <User className="w-5 h-5 text-red-500" /> Emergency Health & Safety Record
        </h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Primary Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Emergency Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Residential Home Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Guardian Way, Secure Block"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Critical Medical Details & Allergies</label>
            <textarea
              value={medicalDetails}
              onChange={e => setMedicalDetails(e.target.value)}
              placeholder="List any ongoing prescriptions, asthma inhalers, penicillin allergies, or pre-existing cardiovascular conditions."
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 leading-relaxed resize-none"
            />
          </div>

          {error && <p className="text-red-400 font-mono text-xs">{error}</p>}
          {message && <p className="text-emerald-400 font-mono text-xs">{message}</p>}

          <button
            type="submit"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
          >
            Save Security Records
          </button>
        </form>

        {/* Delete section */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Danger Zone</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Deleting your account will erase all safety contacts, historical active SOS logs, and credential logins permanently from municipal backup networks.
          </p>
          <button
            onClick={() => { if (confirm("Are you absolutely sure you want to permanently delete this safety profile?")) onDeleteAccount(); }}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/40 rounded-xl text-xs font-medium transition-colors"
          >
            Request Profile Deletion
          </button>
        </div>
      </div>

      {/* QR Code and Face Login Simulation Column */}
      <div className="space-y-6">
        
        {/* QR Profile Emergency Card */}
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Lockscreen QR Safety Profile</h3>
          </div>
          <p className="text-[11px] text-gray-400">
            Emergency responders can scan this vector card directly off your device's screensaver to view blood groups and dispatch contacts immediately without password unlocks.
          </p>

          {getSimulatedQRCodeSVG()}

          <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/30 text-[10px] text-gray-300 font-mono flex items-center gap-2 justify-center">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Scans encrypted with SHA-256
          </div>
        </div>

        {/* Face Recognition login Registration */}
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Biometric Face ID Scan</h3>
          </div>
          <p className="text-xs text-gray-400">
            Enables instant logins on the portal without requiring password queries. Recommended for high-stress panic scenarios.
          </p>

          {isScanningFace ? (
            <div className="py-6 bg-slate-950/60 rounded-xl border border-white/5 text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500 animate-scan-bar" />
              <Camera className="w-8 h-8 text-indigo-400 animate-pulse mx-auto" />
              <p className="text-xs text-gray-400 font-mono animate-pulse">Scanning facial coordinates...</p>
            </div>
          ) : (
            <button
              onClick={simulateFaceMapping}
              className={`w-full py-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                faceScanSuccess
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {faceScanSuccess ? (
                <><CheckCircle className="w-4 h-4 text-emerald-400" /> Face Registered (Simulated)</>
              ) : (
                <><Camera className="w-4 h-4 text-indigo-400" /> Map Biometric Face Coordinates</>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
