import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy Gemini API Initializer
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI with key:", err);
      }
    }
  }
  return aiClient;
}

// Low-Db Local JSON Database Setup
interface DBState {
  users: any[];
  emergencies: any[];
  notifications: any[];
  activityLogs: any[];
  settings: {
    voiceAlertEnabled: boolean;
    shakeSensitivity: number; // 1-10
    batteryOptimization: boolean;
    soundEnabled: boolean;
  };
}

const DEFAULT_DB: DBState = {
  users: [
    {
      id: "admin-1",
      fullName: "Admin Officer",
      email: "admin@safeguard.ai",
      phone: "+15550199",
      password: "admin", // simple for demo
      age: 32,
      gender: "Female",
      address: "100 Security HQ, Safe City",
      bloodGroup: "O+",
      medicalDetails: "None",
      emergencyContacts: [],
      role: "admin",
      faceRegistered: false,
    },
    {
      id: "user-1",
      fullName: "Sanjana Rajasekaran",
      email: "sanjara@safeguard.ai",
      phone: "+15550177",
      password: "user123",
      age: 24,
      gender: "Female",
      address: "Downtown Residence, Apt 4B",
      bloodGroup: "A+",
      medicalDetails: "Asthma inhaler in purse",
      emergencyContacts: [
        { name: "Mom", phone: "+15551234", email: "mom@family.com", relationship: "Mother" },
        { name: "Dad", phone: "+15555678", email: "dad@family.com", relationship: "Father" }
      ],
      role: "user",
      faceRegistered: true,
      faceImage: "simulated_face_id_token"
    }
  ],
  emergencies: [
    {
      id: "sos-past-1",
      userId: "user-1",
      userName: "Sanjana Rajasekaran",
      userPhone: "+15550177",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: "Near 120 Market St, San Francisco, CA"
      },
      status: "resolved",
      resolvedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
      resolvedNotes: "Police arrived on scene. User escorted home safely.",
      notes: "Voice activation triggered - Loud scream detected.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      videoUrl: "",
      emotionResult: "Panic (92%)"
    },
    {
      id: "sos-past-2",
      userId: "user-1",
      userName: "Sanjana Rajasekaran",
      userPhone: "+15550177",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      location: {
        lat: 37.7833,
        lng: -122.4167,
        address: "Golden Gate Ave, San Francisco, CA"
      },
      status: "active",
      notes: "Manual SOS Button pressed.",
      videoUrl: "",
      emotionResult: "Fear (88%)",
      activityResult: "Falling Detected"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Active Alert",
      body: "SOS Alert is currently active for Sanjana Rajasekaran.",
      timestamp: new Date().toISOString(),
      type: "sos",
      read: false
    },
    {
      id: "notif-2",
      title: "System Update",
      body: "SafeGuard AI v2.0 successfully active. Real-time protection is online.",
      timestamp: new Date().toISOString(),
      type: "info",
      read: true
    }
  ],
  activityLogs: [],
  settings: {
    voiceAlertEnabled: true,
    shakeSensitivity: 7,
    batteryOptimization: false,
    soundEnabled: true
  }
};

function readDB(): DBState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return DEFAULT_DB;
  }
}

function writeDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// --- Dynamic Crime Hotspots & Safe Routes Generator ---
const CRIME_HOTSPOTS = [
  { id: "hot-1", lat: 37.7790, lng: -122.4180, severity: "high", description: "High crime area (reported theft & assault)" },
  { id: "hot-2", lat: 37.7725, lng: -122.4220, severity: "medium", description: "Poorly lit underpass - Frequent incident reports" },
  { id: "hot-3", lat: 37.7850, lng: -122.4110, severity: "high", description: "Avoid after 9 PM (high pickpocket and vandalism)" }
];

// --- Static Safe Services near user coordinate ---
function getServicesNear(lat: number, lng: number) {
  return [
    {
      id: "srv-1",
      name: "Central Police Station (HQ)",
      type: "police",
      phone: "+15559111",
      address: "850 Bryant St, San Francisco, CA",
      lat: lat + 0.005,
      lng: lng - 0.004,
      distance: 0.6,
      isOpen: true
    },
    {
      id: "srv-2",
      name: "St. Francis Memorial Hospital",
      type: "hospital",
      phone: "+15554400",
      address: "900 Hyde St, San Francisco, CA",
      lat: lat - 0.006,
      lng: lng + 0.007,
      distance: 0.9,
      isOpen: true
    },
    {
      id: "srv-3",
      name: "Women Safe Haven Center",
      type: "women_center",
      phone: "+15558822",
      address: "425 Divisadero St, San Francisco, CA",
      lat: lat + 0.002,
      lng: lng + 0.003,
      distance: 0.4,
      isOpen: true
    },
    {
      id: "srv-4",
      name: "Emergency Night Shelter Home",
      type: "shelter",
      phone: "+15556611",
      address: "1050 Geary Blvd, San Francisco, CA",
      lat: lat - 0.003,
      lng: lng - 0.008,
      distance: 1.1,
      isOpen: true
    },
    {
      id: "srv-5",
      name: "24/7 Wellness Pharmacy",
      type: "pharmacy",
      phone: "+15553311",
      address: "1351 Post St, San Francisco, CA",
      lat: lat + 0.008,
      lng: lng - 0.001,
      distance: 1.2,
      isOpen: true
    }
  ];
}

// REST APIs

// 1. Auth APIs
app.post("/api/auth/login", (req, res) => {
  const { email, password, faceRecognitionToken } = req.body;
  const db = readDB();

  let user = null;
  if (faceRecognitionToken === "simulated_face_id_token") {
    // Face log in match
    user = db.users.find(u => u.faceRegistered === true);
  } else {
    user = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase() && u.password === password);
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid email, password, or facial scan." });
  }

  // Log activity
  db.activityLogs.push({
    id: "act-" + Date.now(),
    userId: user.id,
    timestamp: new Date().toISOString(),
    action: "Login",
    details: `User logged in successfully via ${faceRecognitionToken ? "Face Recognition" : "Credentials"}.`
  });
  writeDB(db);

  // Return simulated JWT token and user info
  res.json({
    token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulatedTokenForUser${user.id}`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      address: user.address,
      bloodGroup: user.bloodGroup,
      medicalDetails: user.medicalDetails,
      emergencyContacts: user.emergencyContacts,
      faceRegistered: user.faceRegistered,
      role: user.role
    }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password, age, gender, address, bloodGroup, medicalDetails, emergencyContacts } = req.body;
  const db = readDB();

  if (db.users.some(u => u.email.toLowerCase() === email?.toLowerCase())) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }
  if (db.users.some(u => u.phone === phone)) {
    return res.status(400).json({ message: "An account with this phone number already exists." });
  }

  const newUser = {
    id: "user-" + Date.now(),
    fullName,
    email,
    phone,
    password,
    age: Number(age) || 22,
    gender: gender || "Female",
    address: address || "",
    bloodGroup: bloodGroup || "O+",
    medicalDetails: medicalDetails || "",
    emergencyContacts: emergencyContacts || [],
    role: "user",
    faceRegistered: false
  };

  db.users.push(newUser);
  
  db.activityLogs.push({
    id: "act-" + Date.now(),
    userId: newUser.id,
    timestamp: new Date().toISOString(),
    action: "Registration",
    details: "New user registered account successfully."
  });
  writeDB(db);

  res.status(201).json({
    message: "Registration successful. You can now login.",
    user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email }
  });
});

app.put("/api/auth/profile", (req, res) => {
  const { userId, fullName, phone, age, address, bloodGroup, medicalDetails, emergencyContacts, faceRegistered, faceImage } = req.body;
  const db = readDB();
  const userIdx = db.users.findIndex(u => u.id === userId);

  if (userIdx === -1) {
    return res.status(404).json({ message: "User not found." });
  }

  const updatedUser = {
    ...db.users[userIdx],
    fullName: fullName || db.users[userIdx].fullName,
    phone: phone || db.users[userIdx].phone,
    age: age ? Number(age) : db.users[userIdx].age,
    address: address !== undefined ? address : db.users[userIdx].address,
    bloodGroup: bloodGroup || db.users[userIdx].bloodGroup,
    medicalDetails: medicalDetails !== undefined ? medicalDetails : db.users[userIdx].medicalDetails,
    emergencyContacts: emergencyContacts !== undefined ? emergencyContacts : db.users[userIdx].emergencyContacts,
    faceRegistered: faceRegistered !== undefined ? faceRegistered : db.users[userIdx].faceRegistered,
    faceImage: faceImage !== undefined ? faceImage : db.users[userIdx].faceImage,
  };

  db.users[userIdx] = updatedUser;
  writeDB(db);

  res.json({
    message: "Profile updated successfully.",
    user: {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      age: updatedUser.age,
      gender: updatedUser.gender,
      address: updatedUser.address,
      bloodGroup: updatedUser.bloodGroup,
      medicalDetails: updatedUser.medicalDetails,
      emergencyContacts: updatedUser.emergencyContacts,
      faceRegistered: updatedUser.faceRegistered,
      role: updatedUser.role
    }
  });
});

// 2. SOS Trigger API
app.post("/api/emergencies/trigger", (req, res) => {
  const { userId, lat, lng, triggerSource, emotionResult, activityResult, audioBase64, videoBase64 } = req.body;
  const db = readDB();

  let user = db.users.find(u => u.id === userId);
  if (!user) {
    // Fallback simulated user if unregistered trigger occurs
    user = db.users.find(u => u.role === "user") || DEFAULT_DB.users[1];
  }

  // Reverse Geocoding simulation
  const mockAddress = `Near Latitude ${lat?.toFixed(4) || "37.7749"}, Longitude ${lng?.toFixed(4) || "-122.4194"}, Safe City Area`;

  const newEmergency = {
    id: "sos-" + Date.now(),
    userId: user.id,
    userName: user.fullName,
    userPhone: user.phone,
    timestamp: new Date().toISOString(),
    location: {
      lat: lat || 37.7749,
      lng: lng || -122.4194,
      address: mockAddress
    },
    status: "active",
    emotionResult: emotionResult || "N/A",
    activityResult: activityResult || "N/A",
    notes: `Triggered via ${triggerSource || "Manual Button"}.`,
    audioUrl: audioBase64 ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" : "",
    videoUrl: videoBase64 ? "https://assets.mixkit.co/videos/preview/mixkit-security-camera-recording-outdoor-facility-43339-large.mp4" : ""
  };

  db.emergencies.unshift(newEmergency);

  // Add highly visible notification
  const newNotif = {
    id: "notif-" + Date.now(),
    userId: user.id,
    title: `🚨 SOS RED ALERT`,
    body: `Emergency active for ${user.fullName} (${user.phone}) triggered by ${triggerSource || "Manual Button"}. Address: ${mockAddress}`,
    timestamp: new Date().toISOString(),
    type: "sos",
    read: false
  };
  db.notifications.unshift(newNotif);

  // Dispatch simulated alerts
  console.log(`\n===================================`);
  console.log(`🚨 [SMS DISPATCHED TO EMERGENCY CONTACTS]`);
  user.emergencyContacts.forEach((contact: any) => {
    console.log(`To: ${contact.name} (${contact.phone})`);
    console.log(`Message: "ALERT! ${user.fullName} is in danger! Google Maps Live Location: https://maps.google.com/?q=${lat},${lng}. Safety status: RED ALERT."`);
  });
  console.log(`🚨 [EMAIL DISPATCHED TO CONTACTS]`);
  user.emergencyContacts.forEach((contact: any) => {
    console.log(`To: ${contact.email}`);
    console.log(`Subject: EMERGENCY SAFETY ALERT - ${user.fullName}`);
    console.log(`Body: We detected an emergency. Active live tracker link: https://maps.google.com/?q=${lat},${lng}`);
  });
  console.log(`===================================\n`);

  // Log activity
  db.activityLogs.push({
    id: "act-" + Date.now(),
    userId: user.id,
    timestamp: new Date().toISOString(),
    action: "SOS Triggered",
    details: `Emergency active via ${triggerSource || "Manual Button"}. Lat: ${lat}, Lng: ${lng}.`
  });

  writeDB(db);

  res.status(201).json({
    message: "SOS Emergency Triggered successfully. Dispatchers & emergency contacts have been notified.",
    emergency: newEmergency
  });
});

// Admin Resolve API
app.post("/api/emergencies/resolve", (req, res) => {
  const { id, resolvedNotes } = req.body;
  const db = readDB();
  const emergencyIdx = db.emergencies.findIndex(e => e.id === id);

  if (emergencyIdx === -1) {
    return res.status(404).json({ message: "Emergency record not found." });
  }

  db.emergencies[emergencyIdx].status = "resolved";
  db.emergencies[emergencyIdx].resolvedAt = new Date().toISOString();
  db.emergencies[emergencyIdx].resolvedNotes = resolvedNotes || "Resolved by emergency responders.";

  // Create update notification
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    title: "SOS Resolved",
    body: `SOS Alert for ${db.emergencies[emergencyIdx].userName} was successfully resolved.`,
    timestamp: new Date().toISOString(),
    type: "info",
    read: false
  });

  writeDB(db);
  res.json({ message: "Emergency record updated to resolved state successfully." });
});

// Fetch all emergencies
app.get("/api/emergencies", (req, res) => {
  const { userId } = req.query;
  const db = readDB();

  if (userId) {
    const userEm = db.emergencies.filter(e => e.userId === userId);
    return res.json(userEm);
  }

  // return all for admin
  res.json(db.emergencies);
});

// Nearby Services API
app.get("/api/nearby", (req, res) => {
  const lat = Number(req.query.lat) || 37.7749;
  const lng = Number(req.query.lng) || -122.4194;

  const services = getServicesNear(lat, lng);
  res.json(services);
});

// Safe Routes Suggestion API
app.get("/api/safe-routes", (req, res) => {
  const userLat = Number(req.query.lat) || 37.7749;
  const userLng = Number(req.query.lng) || -122.4194;

  // Formulate 3 distinct simulated routes with safety details
  const routes = [
    {
      name: "Route A (Direct / High Safety)",
      description: "Well-lit primary avenues, active police patrol sector, camera-monitored lanes.",
      safetyScore: 96,
      distance: "1.4 km",
      duration: "12 mins walking",
      points: [
        [userLat, userLng],
        [userLat + 0.003, userLng + 0.002],
        [userLat + 0.006, userLng + 0.005]
      ],
      crimeHotspots: []
    },
    {
      name: "Route B (Main Boulevard / Medium Safety)",
      description: "Standard street routes with minor commercial blocks.",
      safetyScore: 82,
      distance: "1.8 km",
      duration: "16 mins walking",
      points: [
        [userLat, userLng],
        [userLat + 0.001, userLng - 0.004],
        [userLat + 0.004, userLng - 0.002],
        [userLat + 0.006, userLng + 0.005]
      ],
      crimeHotspots: [
        { lat: userLat + 0.002, lng: userLng - 0.002, description: "Moderate evening burglary warnings", radius: 50 }
      ]
    },
    {
      name: "Route C (Short Path - AVOID / High Risk)",
      description: "Industrial back alleys. Crosses poorly lit zones with recent reported incidents.",
      safetyScore: 41,
      distance: "1.1 km",
      duration: "9 mins walking",
      points: [
        [userLat, userLng],
        [userLat + 0.005, userLng - 0.001],
        [userLat + 0.006, userLng + 0.005]
      ],
      crimeHotspots: [
        { lat: userLat + 0.004, lng: userLng - 0.001, description: "Active High Theft & Crime Hotspot", radius: 100 }
      ]
    }
  ];

  res.json({ routes, hotspots: CRIME_HOTSPOTS });
});

// Notifications API
app.get("/api/notifications", (req, res) => {
  const db = readDB();
  res.json(db.notifications);
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  const db = readDB();

  if (id === "all") {
    db.notifications.forEach(n => n.read = true);
  } else {
    const notif = db.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  writeDB(db);
  res.json({ message: "Notification state updated." });
});

// Activity logs
app.get("/api/activity-logs", (req, res) => {
  const db = readDB();
  res.json(db.activityLogs.slice(-50).reverse()); // return last 50
});

// 3. AI Chatbot API endpoint using @google/genai SDK
app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "No message supplied" });
  }

  const ai = getAIClient();

  if (!ai) {
    // Elegant offline/local rule-based safety instructions if Gemini API key is missing
    console.log("No Gemini API key supplied or loaded. Serving offline rule-based responder.");
    const fallbackAnswer = getRuleBasedSafetyResponse(message);
    return res.json({ text: fallbackAnswer });
  }

  try {
    const prompt = `You are an expert women's personal safety assistant chatbot, integrated into the SafeGuard AI app.
Your tone should be professional, empathetic, clear, objective, and supportive.
Provide safety advice, immediate procedures, guidance on travel safety, domestic laws, first aid, or emergency directions.
Keep the advice highly practical, brief, actionable, and visually organized with clean bullet points.
If the message indicates a current active danger or extreme panic, instruct the user clearly to TAP THE SOS BUTTON in the app immediately and try to seek a well-lit public space.

User's message: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const botText = response.text || "I am here to support you. What safety assistance can I provide?";
    res.json({ text: botText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const fallbackAnswer = getRuleBasedSafetyResponse(message);
    res.json({ text: `[Offline safety guidelines] ${fallbackAnswer}` });
  }
});

// Settings API
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.put("/api/settings", (req, res) => {
  const { voiceAlertEnabled, shakeSensitivity, batteryOptimization, soundEnabled } = req.body;
  const db = readDB();

  db.settings = {
    voiceAlertEnabled: voiceAlertEnabled !== undefined ? voiceAlertEnabled : db.settings.voiceAlertEnabled,
    shakeSensitivity: shakeSensitivity !== undefined ? Number(shakeSensitivity) : db.settings.shakeSensitivity,
    batteryOptimization: batteryOptimization !== undefined ? batteryOptimization : db.settings.batteryOptimization,
    soundEnabled: soundEnabled !== undefined ? soundEnabled : db.settings.soundEnabled,
  };

  writeDB(db);
  res.json({ message: "Settings saved successfully.", settings: db.settings });
});

// Helper Offline Safety Responder
function getRuleBasedSafetyResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("emergency") || msg.includes("danger") || msg.includes("help") || msg.includes("stalk") || msg.includes("follow")) {
    return `🚨 **IMMEDIATE EMERGENCY SAFETY ACTION PLAN**:\n\n1. **Tap the Red SOS Button** on your dashboard immediately. This triggers instant alerts with your exact GPS link to your emergency contacts & administrators.\n2. **Head for Crowds**: Seek well-lit, open commercial venues like shops, pharmacies, hotels, or cafes.\n3. **Call Official Dispatchers**: Dial 911 (or local police) directly.\n4. **Utilize Fake Call**: Use our 'Fake Call' quick-action in the sidebar to simulate an incoming ring to deter pursuers.`;
  }
  if (msg.includes("law") || msg.includes("legal") || msg.includes("rights")) {
    return `⚖️ **WOMEN'S PROTECTIVE LAWS & LEGAL RIGHTS**:\n\n* **Protection of Women from Domestic Violence Act**: Provides comprehensive protection against physical, emotional, sexual, and financial abuse.\n* **Right to Safe Workplace**: Prevention of Sexual Harassment (POSH) regulations mandate formal internal complaint committees in all workspaces.\n* **Right to Zero FIR**: Police must register your complaint at any station, regardless of where the incident occurred.\n* **Right to Privacy**: Medical examinations and statement recordings must be private and respect dignity.`;
  }
  if (msg.includes("travel") || msg.includes("night") || msg.includes("cab") || msg.includes("taxi")) {
    return `🚕 **SAFE TRAVEL GUIDELINES**:\n\n* **Share Live Location**: Activate the Live Tracking feature in SafeGuard AI to share your route with friends/family.\n* **Verify Rides**: Always cross-examine the license plate, driver details, and verify child locks are disabled before boarding.\n* **Stick to Main Roads**: Do not accept shortcuts through dark or unmonitored routes. Check our 'Safe Routes' feature for secure corridors.`;
  }
  if (msg.includes("first aid") || msg.includes("injury") || msg.includes("hurt")) {
    return `🩹 **FIRST AID & MEDICAL EMERGENCY PROCEDURE**:\n\n* **Heavy Bleeding**: Apply firm, continuous direct pressure to the wound with a clean cloth. Elevate the area.\n* **Panic Attack**: Inhale slowly for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat until breathing steadies.\n* **Fainting**: Lay the person flat on their back, elevate their feet slightly, and ensure fresh air ventilation.`;
  }
  return `ℹ️ **SafeGuard AI Personal Safety Assistant**:\n\nI can assist you with:\n* Immediate safety instructions for active distress.\n* Practical travel safety guidelines.\n* Summary of domestic protection laws and legal rights.\n* Emergency medical and first-aid instructions.\n\n*Tip: Use the floating SOS button to simulate immediate assistance, or turn on Voice Activation in Settings to trigger SOS hands-free!*`;
}

// Vite and Static File Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===================================================`);
    console.log(`🛡️  SafeGuard AI Server booted on http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}

startServer();
