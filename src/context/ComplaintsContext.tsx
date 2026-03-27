import {
    createContext, useContext, useState, useEffect, useCallback
} from "react";
import type { ReactNode } from "react";
import {
    initialComplaints,
    generateId, timeAgo, autoCategory, CATEGORY_DEPT
} from "@/store/complaintsStore";
import type { Complaint, Status, Category, AuditEntry } from "@/store/complaintsStore";
import {
    complaintsChannel, notifsChannel, announcementsChannel
} from "@/services/notificationService";
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
    }) => string;
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
    const [allComplaints, setAll] = useState<Complaint[]>(() => {
        try {
            const saved = localStorage.getItem("co_pilot_complaints_v2");
            const data = saved ? (JSON.parse(saved) as Complaint[]) : initialComplaints;
            // Deduplicate by ID to prevent ghost items in the UI
            const seen = new Set();
            return data.filter(c => {
                if (seen.has(c.id)) return false;
                seen.add(c.id);
                return true;
            });
        } catch {
            return initialComplaints;
        }
    });
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
        localStorage.setItem("co_pilot_complaints_v2", JSON.stringify(allComplaints));
        complaintsChannel.send(allComplaints);   // instant cross-tab broadcast
    }, [allComplaints]);

    useEffect(() => {
        localStorage.setItem("co_pilot_notifications_v2", JSON.stringify(notifications));
        notifsChannel.send(notifications);       // instant cross-tab broadcast
    }, [notifications]);

    // 🔄 Real-time cross-tab sync via BroadcastChannel
    useEffect(() => {
        const offComplaints = complaintsChannel.onMessage(data => setAll(data as Complaint[]));
        const offNotifs = notifsChannel.onMessage(data => {
            const incoming = data as AppNotification[];
            setNotifications(incoming);

            // Check for the most recent notification to show a toast
            if (incoming.length > 0) {
                const latest = incoming[0];
                // Only toast if it was created in the last 2 seconds (to avoid spamming on initial sync)
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

        // Fallback: localStorage storage events (different browser instances on same device)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "co_pilot_complaints_v2" && e.newValue) setAll(JSON.parse(e.newValue));
            if (e.key === "co_pilot_notifications_v2" && e.newValue) setNotifications(JSON.parse(e.newValue));
            if (e.key === "co_pilot_announcements_v2" && e.newValue) setAnnouncements(JSON.parse(e.newValue));
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            offComplaints();
            offNotifs();
            offAnnouncements();
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const login = useCallback((user: CurrentUser) => setCurrentUser(user), []);
    const logout = useCallback(() => setCurrentUser(null), []);

    // Role-based filtering
    const complaints: Complaint[] = (() => {
        if (!currentUser || currentUser.role === "admin") return allComplaints;
        if (currentUser.role === "officer" && currentUser.dept)
            return allComplaints.filter(c => c.dept === currentUser.dept);
        if (currentUser.role === "citizen") {
            // Match by citizenId OR citizen name so public-portal submissions also appear
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
            // Admin sees everything except citizen-only notifications
            return notifications.filter(n => n.target !== "citizen");
        }
        if (currentUser.role === "officer" && currentUser.dept) {
            // Officers see: officer-targeted, all-target, or dept-matched notifications
            return notifications.filter(n =>
                n.target === "all" ||
                (n.target === "officer" && (!n.dept || n.dept === currentUser.dept))
            );
        }
        if (currentUser.role === "citizen") {
            // Citizens see their own notifications + broadcast announcements (target: "all")
            const cid = currentUser.citizenId;
            return notifications.filter(n =>
                n.target === "all" ||
                (n.target === "citizen" && n.citizenId === cid)
            );
        }
        return [];
    })();

    function makeAudit(actor: string, action: string, note?: string): AuditEntry {
        return { time: "Just now", actor, action, note };
    }

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

        // Show toast if the current user is a target
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

    function addComplaint(data: {
        citizen: string; phone: string; ward: string;
        issue: string; description: string; priority: "Low" | "Medium" | "High";
        category?: Category; dept?: string;
        location?: string;
        evidence?: string[]; coords?: { lat: number; lng: number };
        notifPref?: "SMS" | "Email" | "None";
    }): string {
        const id = generateId();
        const ts = Date.now();
        const cat = data.category ?? autoCategory(`${data.issue} ${data.description}`);
        const dept = data.dept ?? CATEGORY_DEPT[cat];
        const newC: Complaint = {
            id,
            citizen: data.citizen,
            phone: data.phone,
            ward: data.ward,
            // Use logged-in user's citizenId so tracking works correctly
            citizenId: currentUser?.citizenId
                ?? `citizen_${data.citizen.toLowerCase().replace(/\s+/g, "_")}`,
            location: data.location,
            category: cat,
            issue: data.issue,
            description: data.description,
            priority: data.priority,
            status: "New",
            assignedTo: "",
            dept,
            time: "Just now",
            timestamp: ts,
            notified: false,
            evidence: data.evidence,
            coords: data.coords,
            notifPref: data.notifPref ?? "SMS",
            sentiment: Math.floor(Math.random() * 40 + 60), // Dummy high sentiment for new reports
            audit: [
                makeAudit("Citizen", "Complaint submitted online"),
                makeAudit("System", `Auto-categorized as ${cat}`),
            ],
        };
        setAll(prev => [newC, ...prev]);

        // 🔔 1. Notify ADMIN about new complaint
        pushNotif({
            type: "new_complaint",
            title: "🚨 New Complaint Filed",
            message: `${data.citizen} (${data.ward}): ${data.issue}`,
            complaintId: id,
            priority: data.priority,
            dept: dept,
            target: "admin"
        });

        // 🔔 2. Notify OFFICER in that department
        pushNotif({
            type: "new_complaint",
            title: "📋 New Online Task Assigned",
            message: `New complaint in your dept (${dept}): "${data.issue}" · ${data.ward}`,
            complaintId: id,
            priority: data.priority,
            dept: dept,
            target: "officer"
        });

        // 🔔 3. Confirm to CITIZEN that complaint was received
        pushNotif({
            type: "alert",
            title: "✅ Complaint Received",
            message: `Your complaint ${id} has been submitted and is being reviewed. We will keep you updated.`,
            complaintId: id,
            citizenId: newC.citizenId,
            target: "citizen"
        });

        return id;
    }

    function updateStatus(id: string, newStatus: Status, actorNote?: string, proofImg?: string) {
        const actor = currentUser?.name ?? "Officer";
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                status: newStatus,
                time: timeAgo(c.timestamp),
                resolutionProof: proofImg ?? c.resolutionProof,
                audit: [...c.audit, {
                    time: "Just now",
                    actor,
                    action: actorNote ?? `Status changed to ${newStatus}`,
                    image: proofImg
                }],
            };
        }));

        // 🔔 Alert for status change - notify citizen + admin
        const targetComplaint = allComplaints.find(c => c.id === id);
        // Notify citizen
        pushNotif({
            type: "status_change",
            title: "📍 Complaint Status Updated",
            message: `Your complaint ${id} status is now: ${newStatus}`,
            complaintId: id,
            citizenId: targetComplaint?.citizenId,
            target: "citizen"
        });
        // Notify admin
        pushNotif({
            type: "status_change",
            title: "Status Change: " + id,
            message: `${id} moved to ${newStatus} by ${currentUser?.name ?? "Officer"}: ${actorNote ?? ''}`,
            complaintId: id,
            dept: targetComplaint?.dept,
            target: "admin"
        });
    }

    function assignComplaint(id: string, dept: string, assignedTo: string) {
        const actor = currentUser?.name ?? "Admin";
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                dept,
                assignedTo,
                status: "Assigned" as Status,
                time: timeAgo(c.timestamp),
                audit: [...c.audit, makeAudit(actor, `Assigned to ${assignedTo} (${dept})`)],
            };
        }));

        // 🔔 Alert for assignment - notify citizen + admin
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
            message: `${id} assigned to ${assignedTo} (${dept}) by ${currentUser?.name ?? "Admin"}`,
            complaintId: id,
            dept: dept,
            target: "admin"
        });
    }

    function notifyCitizen(id: string) {
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                notified: true,
                audit: [...c.audit, makeAudit("System", "Citizen notified of resolution via SMS")],
            };
        }));
    }

    function categorize(id: string, category: Category) {
        const dept = CATEGORY_DEPT[category];
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                category,
                dept,
                status: "Categorized" as Status,
                audit: [...c.audit, makeAudit(currentUser?.name ?? "Admin", `Re-categorized as ${category}`)],
            };
        }));
    }

    function rateComplaint(id: string, rating: number) {
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                rating,
                audit: [...c.audit, makeAudit("Citizen", `Rated resolution ${rating} stars`)],
            };
        }));
    }

    function reopenComplaint(id: string, note: string) {
        setAll(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                status: "In Progress",
                audit: [...c.audit, makeAudit("Citizen", "Complaint Reopened", note)],
            };
        }));
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

        // Immediately broadcast to all open tabs (citizen portal etc.)
        announcementsChannel.send(updated);
        localStorage.setItem("co_pilot_announcements_v2", JSON.stringify(updated));

        // Push a notification targeting ALL users so citizens see it immediately in bell + toast
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
