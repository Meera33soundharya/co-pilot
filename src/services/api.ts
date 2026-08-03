import type { Status, Category } from "@/store/complaintsStore";
import { db } from "./db";

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
  source?: "voice" | "online" | "field";
  estimatedTime?: string;
  suggestedOfficer?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  officerDetails?: string;
  adminRemarks?: string;
  supportingDocs?: string[];
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
    dept: "Water Supply", password: "Officer@2026",
  },
  "citizen@govpilot.in": {
    id: "citizen_amit", name: "Amit Patel", role: "citizen",
    citizenId: "citizen_amit", password: "Citizen@2026",
  },
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      // Offline / local fallback
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
      return db.getAllComplaints();
    },

    getStats: async (): Promise<DashboardStats> => {
      const all = await db.getAllComplaints();
      const resolved = all.filter(c => c.status === "Resolved" || c.status === "Closed").length;
      const pending = all.length - resolved;
      const highPriority = all.filter(c => c.priority === "High" || (c.priority as any) === "Critical").length;

      // Mock other stats for now, these can be derived
      return {
        kpis: {
          total: all.length,
          resolved,
          pending,
          highPriority
        },
        categoryData: [],
        statusData: [],
        monthlyTrend: [],
        wardData: {}
      };
    },

    create: async (data: Omit<Complaint, "id" | "status" | "assignedTo" | "dept" | "time" | "timestamp" | "notified" | "sentiment" | "audit" | "category"> & { category?: Category; dept?: string }): Promise<{ id: string }> => {
      const now = new Date();
      const id = `VCE-${Date.now().toString(36).toUpperCase()}`;
      
      const complaint: Complaint = {
        ...data,
        id,
        category: data.category ?? "Other",
        dept: data.dept ?? "General Administration",
        status: "Pending",
        assignedTo: "Unassigned",
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        timestamp: now.getTime(),
        notified: false,
        sentiment: 0,
        evidence: data.evidence ?? [],
        audit: [{
          time: now.toISOString(),
          actor: data.citizen,
          action: "Complaint Filed"
        }]
      };

      await db.addComplaint(complaint);
      return { id };
    },

    updateStatus: async (
      id: string,
      status: string,
      note?: string,
      image?: string,
      actor?: string
    ): Promise<void> => {
      const c = await db.getComplaint(id);
      if (!c) throw new Error("Complaint not found");
      
      const auditEvent = {
        time: new Date().toISOString(),
        actor: actor || "System",
        action: `Status updated to ${status}`,
        note,
        image
      };

      await db.updateComplaint(id, {
        status: status as Status,
        audit: [...c.audit, auditEvent],
        ...(image ? { resolutionProof: image } : {})
      });
    },

    assign: async (
      id: string,
      dept: string,
      assignedTo: string,
      actor?: string
    ): Promise<void> => {
      const c = await db.getComplaint(id);
      if (!c) throw new Error("Complaint not found");

      const auditEvent = {
        time: new Date().toISOString(),
        actor: actor || "Admin",
        action: `Assigned to ${assignedTo} in ${dept}`,
      };

      await db.updateComplaint(id, {
        dept,
        assignedTo,
        status: "Assigned",
        audit: [...c.audit, auditEvent]
      });
    },

    rate: async (id: string, rating: number): Promise<void> => {
      await db.updateComplaint(id, { rating });
    },

    reopen: async (id: string, note: string): Promise<void> => {
      const c = await db.getComplaint(id);
      if (!c) throw new Error("Complaint not found");

      const auditEvent = {
        time: new Date().toISOString(),
        actor: "Citizen",
        action: "Reopened complaint",
        note,
      };

      await db.updateComplaint(id, {
        status: "Pending" as const,
        audit: [...c.audit, auditEvent]
      });
    },
  },

  documents: {
    upload: async (file: File): Promise<{ fileName: string; summary: string[] }> => {
      return { fileName: file.name, summary: ["Document processed locally"] };
    },
  },

  speech: {
    generate: async (topic: string, language: string): Promise<{ script: string }> => {
      return { script: "Speech generated locally" };
    },
  },
};
