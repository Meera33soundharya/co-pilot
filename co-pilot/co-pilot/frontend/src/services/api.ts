import type { Status, Category } from "@/store/complaintsStore";

export interface LoginResponse {
  id: string;
  name: string;
  role: "admin" | "officer" | "citizen";
  dept?: string;
  citizenId?: string;
}

export interface Complaint {
  id: string;
  citizen: string;
  phone: string;
  ward: string;
  citizenId: string;
  category: Category;
  issue: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: Status;
  assignedTo: string;
  dept: string;
  time: string;
  timestamp: number;
  notified: boolean;
  evidence: string[];
  location?: string;
  coords?: { lat: number; lng: number };
  notifPref: "SMS" | "Email" | "None";
  sentiment: number;
  rating?: number;
  resolutionProof?: string;
  audit: {
    time: string;
    actor: string;
    action: string;
    note?: string;
    image?: string;
  }[];
}

export interface DashboardStats {
  kpis: {
    total: number;
    resolved: number;
    pending: number;
    highPriority: number;
  };
  categoryData: { name: string; count: number }[];
  statusData: { name: string; value: number }[];
  monthlyTrend: { month: string; complaints: number }[];
  wardData: Record<string, number>;
}

// ── Local demo accounts (offline fallback) ──────────────────────────────────
const LOCAL_ACCOUNTS: Record<string, LoginResponse & { password: string }> = {
  "admin@govpilot.in": {
    id: "admin_1", name: "District Admin", role: "admin",
    password: "Admin@2026",
  },
  "officer@govpilot.in": {
    id: "officer_1", name: "Rajiv Kumar", role: "officer",
    dept: "Water Supply Department", password: "Officer@2026",
  },
  "citizen@govpilot.in": {
    id: "citizen_amit", name: "Amit Patel", role: "citizen",
    citizenId: "citizen_amit", password: "Citizen@2026",
  },
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      // Try real backend first
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const text = await res.text();
          if (text) return JSON.parse(text);
        }
        if (res.status !== 502 && res.status !== 503 && res.status !== 504) {
          // Backend is up but rejected credentials
          let detail = "Authentication failed";
          try { detail = (JSON.parse(await res.text()))?.detail || detail; } catch {}
          throw new Error(detail);
        }
      } catch (err: any) {
        // If it's an auth rejection (not a network error), re-throw
        if (err.message && !err.message.includes("fetch") && !err.message.includes("JSON") && !err.message.includes("network")) {
          throw err;
        }
        // Otherwise fall through to local auth
      }

      // ── Offline / local fallback ────────────────────────────────────────────
      const account = LOCAL_ACCOUNTS[email.toLowerCase().trim()];
      if (account && account.password === password) {
        const { password: _pwd, ...user } = account;
        return user;
      }
      throw new Error("Invalid credentials — use quick access below to auto-fill.");
    },
  },

  complaints: {
    getAll: async (): Promise<Complaint[]> => {
      const res = await fetch(`/api/complaints?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },

    getStats: async (): Promise<DashboardStats> => {
      const res = await fetch(`/api/complaints/stats?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },

    create: async (data: Omit<Complaint, "id" | "status" | "assignedTo" | "dept" | "time" | "timestamp" | "notified" | "sentiment" | "audit" | "category"> & { category?: Category; dept?: string }): Promise<{ id: string }> => {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to file complaint");
      return res.json();
    },

    updateStatus: async (
      id: string,
      status: string,
      note?: string,
      image?: string,
      actor?: string
    ): Promise<void> => {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, image, actor }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    },

    assign: async (
      id: string,
      dept: string,
      assignedTo: string,
      actor?: string
    ): Promise<void> => {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dept, assignedTo, actor }),
      });
      if (!res.ok) throw new Error("Failed to assign complaint");
    },

    rate: async (id: string, rating: number): Promise<void> => {
      const res = await fetch(`/api/complaints/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to submit rating");
    },

    reopen: async (id: string, note: string): Promise<void> => {
      const res = await fetch(`/api/complaints/${id}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Failed to reopen complaint");
    },
  },

  documents: {
    upload: async (file: File): Promise<{ fileName: string; summary: string[] }> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Document upload failed");
      return res.json();
    },
  },

  speech: {
    generate: async (topic: string, language: string): Promise<{ script: string }> => {
      const res = await fetch("/api/speech/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, language }),
      });
      if (!res.ok) throw new Error("Speech script generation failed");
      return res.json();
    },
  },
};
