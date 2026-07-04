export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  bloodGroup: string;
  medicalDetails: string;
  emergencyContacts: EmergencyContact[];
  profileImage?: string;
  faceRegistered?: boolean;
  faceImage?: string;
  role: 'user' | 'admin';
}

export interface EmergencyRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedNotes?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  emotionResult?: string;
  activityResult?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'sos' | 'info' | 'alert' | 'system';
  read: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface SafeRouteItem {
  name: string;
  description: string;
  safetyScore: number; // 1-100
  distance: string;
  duration: string;
  points: [number, number][]; // coordinates
  crimeHotspots: { lat: number; lng: number; description: string; radius: number }[];
}

export interface CrimeHotspot {
  id: string;
  lat: number;
  lng: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface NearbyService {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'women_center' | 'shelter' | 'pharmacy';
  phone: string;
  address: string;
  lat: number;
  lng: number;
  distance: number; // in km
  isOpen: boolean;
}
