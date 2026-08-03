import {
    createContext, useContext, useState, useEffect, useCallback
} from "react";
import type { ReactNode } from "react";
import { CATEGORY_DEPT } from "@/store/complaintsStore";
import type { Status, Category } from "@/store/complaintsStore";
import { notifsChannel, announcementsChannel, complaintsChannel } from "@/services/notificationService";
import { api } from "@/services/api";
import type { Complaint } from "@/services/api";
import { toast } from "sonner";

// ── Announcement ───────────────────────────────────────────────
export type AnnouncementType = "General" | "Alert" | "Resolution" | "Event";
export interface Announcement {
    id: string;
    title: string;
    body: string;
    type: AnnouncementType;
    ward: string;
    postedBy: string;
    date: string;
    pinned?: boolean;
    timestamp: number;
}

// ── Auth / Role ────────────────────────────────────────────────
export type Role = "admin" | "officer" | "citizen";

export interface CurrentUser {
    id: string;
    name: string;
    role: Role;
    dept?: string;
    citizenId?: string;
}

export interface AppNotification {
    id: string;
    type: "new_complaint" | "status_change" | "assignment" | "alert";
    title: string;
    message: string;
    time: string;
    timestamp: number;
    read: boolean;
    complaintId?: string;
    priority?: "High" | "Medium" | "Low";
    dept?: string;
    citizenId?: string;
    target?: "admin" | "officer" | "citizen" | "all"; // who should see this
    announcementId?: string;
}

// ── Context shape ──────────────────────────────────────────────
interface ComplaintsCtx {
    currentUser: CurrentUser | null;
    login: (user: CurrentUser) => void;
    logout: () => void;

    complaints: Complaint[];
    allComplaints: Complaint[];
    notifications: AppNotification[];
    announcements: Announcement[];

    addComplaint: (data: {
        citizen: string; phone: string; ward: string;
        issue: string; description: string; priority: "Low" | "Medium" | "High";
        category?: Category; dept?: string;
        location?: string;
        evidence?: string[]; coords?: { lat: number; lng: number };
        notifPref?: "SMS" | "Email" | "None";
        source?: string;
    }) => Promise<string>;
    updateStatus: (id: string, newStatus: Status, actorNote?: string, proofImg?: string) => void;
    assignComplaint: (id: string, dept: string, assignedTo: string) => void;
    notifyCitizen: (id: string) => void;
    categorize: (id: string, category: Category) => void;
    rateComplaint: (id: string, rating: number) => void;
    reopenComplaint: (id: string, note: string) => void;
    readNotification: (id: string) => void;
    postAnnouncement: (data: { title: string; body: string; type: AnnouncementType; ward: string }) => void;
}

const Ctx = createContext<ComplaintsCtx | null>(null);

// ── Provider ───────────────────────────────────────────────────
export function ComplaintsProvider({ children }: { children: ReactNode }) {
    const [allComplaints, setAll] = useState<Complaint[]>([]);
    
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        try {
            const saved = localStorage.getItem("co_pilot_notifications_v2");
            return saved ? (JSON.parse(saved) as AppNotification[]) : [];
        } catch {
            return [];
        }
    });
    
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
        try {
            const saved = sessionStorage.getItem("co_pilot_user");
            return saved ? (JSON.parse(saved) as CurrentUser) : null;
        } catch {
            return null;
        }
    });

    const INITIAL_ANNOUNCEMENTS: Announcement[] = [
        { id: "ANN-001", title: "Water Supply Disruption — Ward 5 & 7", body: "Due to emergency pipe replacement work scheduled on 17 March, water supply will be interrupted from 6AM to 2PM. Residents are advised to store water in advance.", type: "Alert", ward: "Ward 5, Ward 7", postedBy: "Municipal Commissioner", date: "15 Mar 2026", pinned: true, timestamp: Date.now() - 86400000 },
        { id: "ANN-002", title: "Street Light Installation Completed — Ward 3", body: "We are pleased to announce the successful installation of 32 new LED streetlights along the Main Road stretch in Ward 3. The work was completed 2 days ahead of schedule.", type: "Resolution", ward: "Ward 3", postedBy: "Roads & PWD Dept", date: "14 Mar 2026", timestamp: Date.now() - 172800000 },
        { id: "ANN-003", title: "Free Health Camp — Ward 11 Community Center", body: "A free health check-up camp will be held on 20 March 2026 at the Ward 11 Community Hall from 9AM–4PM. Services include blood pressure, sugar, eye check-up, and general physician consult.", type: "Event", ward: "Ward 11", postedBy: "Public Health Department", date: "13 Mar 2026", timestamp: Date.now() - 259200000 },
        { id: "ANN-004", title: "Pothole Repair Drive — Wards 1–6 This Week", body: "The Roads & PWD Department will carry out a comprehensive pothole repair drive across Wards 1 through 6 this week.", type: "General", ward: "Wards 1–6", postedBy: "Roads & PWD", date: "12 Mar 2026", timestamp: Date.now() - 345600000 },
        { id: "ANN-005", title: "Garbage Collection Timings Updated", body: "Effective from 16 March, morning garbage collection will begin at 7AM instead of 8AM. The evening round will continue as usual at 5PM.", type: "General", ward: "All Wards", postedBy: "Sanitation Department", date: "11 Mar 2026", timestamp: Date.now() - 432000000 },
    ];

    const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
        try {
            const saved = localStorage.getItem("co_pilot_announcements_v2");
            return saved ? (JSON.parse(saved) as Announcement[]) : INITIAL_ANNOUNCEMENTS;
        } catch {
            return INITIAL_ANNOUNCEMENTS;
        }
    });

    // 🔄 Fetch all complaints from DB on mount + poll for real-time updates
    const fetchAll = useCallback(async () => {
        try {
            const data = await api.complaints.getAll();
            setAll(data as any[]);
        } catch (err) {
            console.error("Backend connection error: complaints fetch failed", err);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        // Poll every 4 seconds for near-real-time sync
        const timer = setInterval(fetchAll, 4000);
        // Also re-fetch instantly when another tab makes a change
        const offComplaints = complaintsChannel.onMessage(() => fetchAll());
        return () => {
            clearInterval(timer);
            offComplaints();
        };
    }, [fetchAll]);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem("co_pilot_user", JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem("co_pilot_user");
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem("co_pilot_announcements_v2", JSON.stringify(announcements));
    }, [announcements]);

    useEffect(() => {
        localStorage.setItem("co_pilot_notifications_v2", JSON.stringify(notifications));
        notifsChannel.send(notifications);       // instant cross-tab broadcast
    }, [notifications]);

    // 🔄 Real-time cross-tab sync via BroadcastChannel
    useEffect(() => {
        const offNotifs = notifsChannel.onMessage(data => {
            const incoming = data as AppNotification[];
            setNotifications(incoming);

            if (incoming.length > 0) {
                const latest = incoming[0];
                if (Date.now() - latest.timestamp < 2000) {
                    const isTarget = (() => {
                        if (!currentUser) return false;
                        if (latest.target === "admin" && currentUser.role === "admin") return true;
                        if (latest.target === "officer" && currentUser.role === "officer" && latest.dept === currentUser.dept) return true;
                        if (latest.target === "citizen" && currentUser.role === "citizen" && latest.citizenId === currentUser.citizenId) return true;
                        if (latest.target === "all") return true;
                        return false;
                    })();

                    if (isTarget) {
                        toast(latest.title, {
                            description: latest.message,
                            icon: latest.type === "new_complaint" ? "🚨" : latest.type === "status_change" ? "📍" : "🔔",
                        });
                    }
                }
            }
        });
        const offAnnouncements = announcementsChannel.onMessage(data => setAnnouncements(data as Announcement[]));

        const handleStorage = (e: StorageEvent) => {
            if (e.key === "co_pilot_notifications_v2" && e.newValue) setNotifications(JSON.parse(e.newValue));
            if (e.key === "co_pilot_announcements_v2" && e.newValue) setAnnouncements(JSON.parse(e.newValue));
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            offNotifs();
            offAnnouncements();
            window.removeEventListener("storage", handleStorage);
        };
    }, [currentUser]);

    const login = useCallback((user: CurrentUser) => setCurrentUser(user), []);
    const logout = useCallback(() => setCurrentUser(null), []);

    // Role-based filtering
    const complaints: Complaint[] = (() => {
        if (!currentUser || currentUser.role === "admin") return allComplaints;
        if (currentUser.role === "officer" && currentUser.dept)
            // Officers see complaints assigned to their dept AND newly-filed complaints with no dept yet
            return allComplaints.filter(c => c.dept === currentUser.dept || !c.dept || c.dept === "");
        if (currentUser.role === "citizen") {
            const cid = currentUser.citizenId;
            const cname = currentUser.name?.toLowerCase().trim();
            return allComplaints.filter(c =>
                (cid && c.citizenId === cid) ||
                (cname && c.citizen.toLowerCase().trim() === cname)
            );
        }
        return allComplaints;
    })();


    const userNotifications: AppNotification[] = (() => {
        if (!currentUser) return [];
        if (currentUser.role === "admin") {
            return notifications.filter(n => n.target !== "citizen");
        }
        if (currentUser.role === "officer" && currentUser.dept) {
            return notifications.filter(n =>
                n.target === "all" ||
                (n.target === "officer" && (!n.dept || n.dept === currentUser.dept))
            );
        }
        if (currentUser.role === "citizen") {
            const cid = currentUser.citizenId;
            return notifications.filter(n =>
                n.target === "all" ||
                (n.target === "citizen" && n.citizenId === cid)
            );
        }
        return [];
    })();

    const pushNotif = useCallback((data: Omit<AppNotification, "id" | "time" | "timestamp" | "read">) => {
        const id = "NOTIF-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        const newN: AppNotification = {
            ...data,
            id,
            time: "Just now",
            timestamp: Date.now(),
            read: false
        };

        setNotifications(prev => [newN, ...prev]);

        const isTarget = (() => {
            if (!currentUser) return false;
            if (data.target === "admin" && currentUser.role === "admin") return true;
            if (data.target === "officer" && currentUser.role === "officer" && data.dept === currentUser.dept) return true;
            if (data.target === "citizen" && currentUser.role === "citizen" && data.citizenId === currentUser.citizenId) return true;
            if (data.target === "all") return true;
            return false;
        })();

        if (isTarget) {
            toast(data.title, {
                description: data.message,
                icon: data.type === "new_complaint" ? "🚨" : data.type === "status_change" ? "📍" : "🔔",
            });
        }
    }, [currentUser]);

    const readNotification = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    async function addComplaint(data: {
        citizen: string; phone: string; ward: string;
        issue: string; description: string; priority: "Low" | "Medium" | "High";
        category?: Category; dept?: string;
        location?: string;
        evidence?: string[]; coords?: { lat: number; lng: number };
        notifPref?: "SMS" | "Email" | "None";
        source?: string;
    }): Promise<string> {
        const citizenId = currentUser?.citizenId || `citizen_${data.citizen.toLowerCase().replace(/\s+/g, "_")}`;
        
        const res = await api.complaints.create({
            citizen: data.citizen,
            phone: data.phone,
            ward: data.ward,
            citizenId,
            issue: data.issue,
            description: data.description,
            priority: data.priority,
            category: data.category,
            dept: data.dept,
            location: data.location,
            coords: data.coords,
            notifPref: data.notifPref ?? "SMS",
            evidence: data.evidence ?? [],
            source: data.source
        });

        // Re-fetch and broadcast to all open tabs instantly
        const updated = await api.complaints.getAll();
        setAll(updated as any[]);
        complaintsChannel.send({ type: "new_complaint", id: res.id });
        
        // Trigger notifications
        pushNotif({
            type: "new_complaint",
            title: "🚨 New Complaint Filed",
            message: `${data.citizen} (${data.ward}): ${data.issue}`,
            complaintId: res.id,
            priority: data.priority,
            dept: data.dept ?? CATEGORY_DEPT[data.category ?? "Other"],
            target: "admin"
        });

        pushNotif({
            type: "new_complaint",
            title: "📋 New Online Task Assigned",
            message: `New complaint assigned to department: "${data.issue}" · ${data.ward}`,
            complaintId: res.id,
            priority: data.priority,
            dept: data.dept ?? CATEGORY_DEPT[data.category ?? "Other"],
            target: "officer"
        });

        return res.id;
    }

    function updateStatus(id: string, newStatus: Status, actorNote?: string, proofImg?: string) {
        const actor = currentUser?.name ?? "Officer";
        api.complaints.updateStatus(id, newStatus, actorNote, proofImg, actor).then(async () => {
            const updated = await api.complaints.getAll();
            setAll(updated as any[]);
            complaintsChannel.send({ type: "status_update", id, status: newStatus });
        });

        const targetComplaint = allComplaints.find(c => c.id === id);
        
        pushNotif({
            type: "status_change",
            title: "📍 Complaint Status Updated",
            message: `Your complaint ${id} status is now: ${newStatus}`,
            complaintId: id,
            citizenId: targetComplaint?.citizenId,
            target: "citizen"
        });
        
        pushNotif({
            type: "status_change",
            title: "Status Change: " + id,
            message: `${id} moved to ${newStatus} by ${actor}: ${actorNote ?? ""}`,
            complaintId: id,
            dept: targetComplaint?.dept,
            target: "admin"
        });
    }

    function assignComplaint(id: string, dept: string, assignedTo: string) {
        const actor = currentUser?.name ?? "Admin";
        api.complaints.assign(id, dept, assignedTo, actor).then(async () => {
            const updated = await api.complaints.getAll();
            setAll(updated as any[]);
            complaintsChannel.send({ type: "assigned", id, dept });
        });

        const targetComplaint = allComplaints.find(c => c.id === id);
        pushNotif({
            type: "assignment",
            title: "👷 Complaint Assigned!",
            message: `Your complaint ${id} has been assigned to ${assignedTo}. Work will begin shortly.`,
            complaintId: id,
            citizenId: targetComplaint?.citizenId,
            target: "citizen"
        });
        pushNotif({
            type: "assignment",
            title: "Assignment: " + id,
            message: `${id} assigned to ${assignedTo} (${dept}) by ${actor}`,
            complaintId: id,
            dept: dept,
            target: "admin"
        });
    }

    function notifyCitizen(id: string) {
        api.complaints.updateStatus(id, "Resolved", "Citizen notified of resolution via SMS").then(() => {
            api.complaints.getAll().then(setAll);
        });
    }

    function categorize(id: string, category: Category) {
        const dept = CATEGORY_DEPT[category];
        api.complaints.assign(id, dept, "General", currentUser?.name ?? "Admin").then(() => {
            api.complaints.getAll().then(setAll);
        });
    }

    function rateComplaint(id: string, rating: number) {
        api.complaints.rate(id, rating).then(() => {
            api.complaints.getAll().then(setAll);
        });
    }

    function reopenComplaint(id: string, note: string) {
        api.complaints.reopen(id, note).then(() => {
            api.complaints.getAll().then(setAll);
        });
    }

    function postAnnouncement(data: { title: string; body: string; type: AnnouncementType; ward: string }) {
        const ann: Announcement = {
            id: `ANN-${String(announcements.length + 1).padStart(3, "0")}`,
            title: data.title,
            body: data.body,
            type: data.type,
            ward: data.ward,
            postedBy: currentUser?.name ?? "Administrator",
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            timestamp: Date.now(),
        };
        const updated = [ann, ...announcements];
        setAnnouncements(updated);

        announcementsChannel.send(updated);
        localStorage.setItem("co_pilot_announcements_v2", JSON.stringify(updated));

        pushNotif({
            type: "alert",
            title: `📢 ${data.type === "Alert" ? "⚠️ URGENT: " : ""}${data.title}`,
            message: `${data.ward} — ${data.body.slice(0, 100)}${data.body.length > 100 ? "..." : ""}`,
            target: "all",
            announcementId: ann.id,
        });
    }

    return (
        <Ctx.Provider value={{
            currentUser, login, logout,
            complaints, allComplaints,
            notifications: userNotifications, readNotification,
            announcements, postAnnouncement,
            addComplaint, updateStatus, assignComplaint, notifyCitizen, categorize,
            rateComplaint, reopenComplaint
        }}>
            {children}
        </Ctx.Provider>
    );
}

export function useComplaints() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useComplaints must be inside ComplaintsProvider");
    return ctx;
}
