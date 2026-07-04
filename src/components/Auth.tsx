import React, { useState } from "react";
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Activity, 
  Key, 
  Camera, 
  CheckCircle, 
  ChevronRight,
  UserPlus
} from "lucide-react";

interface AuthProps {
  onLogin: (email: string, password?: string, faceToken?: string) => Promise<boolean>;
  onRegister: (fields: any) => Promise<boolean>;
}

export default function Auth({ onLogin, onRegister }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [faceLoggingIn, setFaceLoggingIn] = useState(false);

  // Register states
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regGender, setRegGender] = useState("Female");
  const [regAddress, setRegAddress] = useState("");
  const [regBloodGroup, setRegBloodGroup] = useState("O+");
  const [regMedicalDetails, setRegMedicalDetails] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!loginEmail || !loginPassword) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(loginEmail, loginPassword);
      if (!success) {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLoginSimulate = async () => {
    setError("");
    setMessage("");
    setFaceLoggingIn(true);

    // Simulate biometric camera mapping
    setTimeout(async () => {
      try {
        const success = await onLogin("", "", "simulated_face_id_token");
        if (!success) {
          setError("Face identification failed. Biometric signature mismatch or Face ID not registered under account profiles.");
        }
      } catch (err) {
        setError("Face scanner error.");
      } finally {
        setFaceLoggingIn(false);
      }
    }, 2800);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!regFullName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setError("Please fill out all asterisk (*) required fields.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const success = await onRegister({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        age: Number(regAge) || 22,
        gender: regGender,
        address: regAddress,
        bloodGroup: regRegGroupMap(regBloodGroup),
        medicalDetails: regMedicalDetails,
        emergencyContacts: []
      });

      if (success) {
        setMessage("Account registered! You can now switch to login.");
        setIsLogin(true);
        setLoginEmail(regEmail);
        setLoginPassword(regPassword);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Account phone or email might be duplicate.");
    } finally {
      setLoading(false);
    }
  };

  const regRegGroupMap = (val: string) => val || "O+";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white font-sans relative overflow-hidden">
      
      {/* Absolute background glowing vector nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 p-8 rounded-3xl bg-slate-800/40 border border-white/5 shadow-2xl relative z-10 backdrop-blur-md">
        
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            SafeGuard <span className="text-red-500 font-extrabold">AI</span> Portal
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin 
              ? "Access women's secure personal tracking networks." 
              : "Register secure medical & guardian profiles."
            }
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
            {message}
          </div>
        )}

        {/* Auth Forms */}
        {isLogin ? (
          /* Login Frame */
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-3.5">
              
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Account Email *"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Secret Password *"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>

            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading || faceLoggingIn}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-gray-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
              >
                {loading ? "Authenticating security..." : "Login Secure Session"}
              </button>

              {/* Biometric Scan login trigger */}
              <button
                type="button"
                onClick={handleFaceLoginSimulate}
                disabled={loading || faceLoggingIn}
                className="w-full py-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {faceLoggingIn ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" /> Scanning Biometrics...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-indigo-400" /> Scan Biometric Face ID
                  </>
                )}
              </button>
            </div>

            {/* Hint Box */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 uppercase tracking-wider text-[9px] font-mono">Simulated Demo Credentials:</p>
              <p>➔ Standard User: <strong className="text-rose-400">sanjara@safeguard.ai</strong> / <strong className="text-rose-400">user123</strong> (Face scan available)</p>
              <p>➔ Central Admin: <strong className="text-indigo-400">admin@safeguard.ai</strong> / <strong className="text-indigo-400">admin</strong></p>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Don't have a secure profile? <span className="text-red-400 underline">Register Now</span>
              </button>
            </div>
          </form>
        ) : (
          /* Registration Frame */
          <form className="space-y-4 max-h-[500px] overflow-y-auto pr-1" onSubmit={handleRegisterSubmit}>
            <div className="space-y-3">
              
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name *"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Cellular Phone Number *"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={regAge}
                  onChange={e => setRegAge(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <select
                  value={regGender}
                  onChange={e => setRegGender(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer Not to Say">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Emergency Blood Group</label>
                <select
                  value={regBloodGroup}
                  onChange={e => setRegBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Home Address"
                value={regAddress}
                onChange={e => setRegAddress(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />

              <textarea
                placeholder="Medical conditions, allergies, or medicines list"
                value={regMedicalDetails}
                onChange={e => setRegMedicalDetails(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
              />

              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Create Secure Password *"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Confirm Password *"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-gray-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
            >
              {loading ? "Registering network profile..." : "Register Secure Account"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Already registered? <span className="text-red-400 underline">Login Here</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
