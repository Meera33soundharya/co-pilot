/**
 * GovPilot Database Layer
 * Uses IndexedDB to simulate a robust backend across multiple browser tabs.
 */

import type { Complaint, LoginResponse } from "./api";

const DB_NAME = "GovPilotEnterpriseDB";
const DB_VERSION = 1;

export class GovPilotDB {
  private db: IDBDatabase | null = null;
  private bc = new BroadcastChannel("govpilot_db_sync");
  private listeners: ((event: string, data: any) => void)[] = [];

  constructor() {
    this.bc.onmessage = (e) => {
      this.listeners.forEach((fn) => fn(e.data.type, e.data.payload));
    };
  }

  public subscribe(fn: (event: string, data: any) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      
      req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        
        // Complaints Store
        if (!db.objectStoreNames.contains("complaints")) {
          const store = db.createObjectStore("complaints", { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("dept", "dept", { unique: false });
          store.createIndex("citizenId", "citizenId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
        
        // Users Store
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "email" });
        }
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        this.seedInitialData();
        resolve();
      };
      
      req.onerror = () => reject(req.error);
    });
  }

  private async seedInitialData() {
    const counts = await this.getAllComplaints();
    if (counts.length === 0) {
      // Seed some initial complaints if empty
      console.log("Seeding initial data...");
    }
  }

  public async getAllComplaints(): Promise<Complaint[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("complaints", "readonly");
      const store = tx.objectStore("complaints");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getComplaint(id: string): Promise<Complaint | undefined> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("complaints", "readonly");
      const store = tx.objectStore("complaints");
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public async addComplaint(complaint: Complaint): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("complaints", "readwrite");
      const store = tx.objectStore("complaints");
      const req = store.add(complaint);
      req.onsuccess = () => {
        this.bc.postMessage({ type: "COMPLAINT_ADDED", payload: complaint.id });
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    await this.init();
    const existing = await this.getComplaint(id);
    if (!existing) throw new Error("Complaint not found");

    const updated = { ...existing, ...updates };
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("complaints", "readwrite");
      const store = tx.objectStore("complaints");
      const req = store.put(updated);
      req.onsuccess = () => {
        this.bc.postMessage({ type: "COMPLAINT_UPDATED", payload: updated });
        resolve(updated);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteComplaint(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("complaints", "readwrite");
      const store = tx.objectStore("complaints");
      const req = store.delete(id);
      req.onsuccess = () => {
        this.bc.postMessage({ type: "COMPLAINT_DELETED", payload: id });
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const db = new GovPilotDB();
