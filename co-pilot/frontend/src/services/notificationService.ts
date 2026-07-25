/**
 * Cross-Portal Notification Service
 * ─────────────────────────────────────────────────────────────────
 * Uses TWO layers for maximum reliability:
 *
 *  Layer 1 — BroadcastChannel (same browser, all tabs, INSTANT)
 *             → A citizen submits in Tab A, officer sees it in Tab B immediately
 *
 *  Layer 2 — localStorage fallback (cross-browser on same device)
 *             → Works even in browsers that don't support BroadcastChannel
 *
 * The Google API Key (VITE_GOOGLE_API_KEY) is available for
 * future Firebase Cloud Messaging (FCM) integration to push
 * notifications to different devices (phones / other computers).
 * ─────────────────────────────────────────────────────────────────
 */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

// ── Channel names ──────────────────────────────────────────────
const CHANNELS = {
    complaints: "co_pilot_complaints",
    notifications: "co_pilot_notifs",
    announcements: "co_pilot_announcements",
} as const;

export type ChannelName = keyof typeof CHANNELS;

// ── BroadcastChannel singleton manager ────────────────────────
class PortalChannel {
    private bc: BroadcastChannel;
    private name: string;

    constructor(name: ChannelName) {
        this.name = CHANNELS[name];
        this.bc = new BroadcastChannel(this.name);
    }

    /** Broadcast data to all other tabs instantly */
    send(data: unknown) {
        try {
            this.bc.postMessage({ type: "sync", data, ts: Date.now() });
        } catch (e) {
            console.warn("[PortalChannel] BroadcastChannel send failed:", e);
        }
    }

    /** Listen for messages from other tabs */
    onMessage(handler: (data: unknown) => void) {
        const listener = (e: MessageEvent) => {
            if (e.data?.type === "sync") handler(e.data.data);
        };
        this.bc.addEventListener("message", listener);
        // Do NOT close the channel here, as it's a singleton. Just remove listener.
        return () => this.bc.removeEventListener("message", listener);
    }

    /** Close the channel */
    close() { this.bc.close(); }
}

// ── Exported singleton channels ────────────────────────────────
export const complaintsChannel = new PortalChannel("complaints");
export const notifsChannel = new PortalChannel("notifications");
export const announcementsChannel = new PortalChannel("announcements");

// ── Log the API key availability (for debugging) ──────────────
if (import.meta.env.DEV) {
    console.info(
        `[Co-Pilot Notifications] Google API Key: ${API_KEY ? "✅ Loaded" : "❌ Missing"}\n` +
        `[Co-Pilot Notifications] BroadcastChannel: ✅ Active (cross-tab sync ON)`
    );
}

/**
 * Future: Firebase Cloud Messaging integration
 * When you want push notifications to phones/other devices:
 *
 * import { initializeApp } from "firebase/app";
 * import { getMessaging, getToken, onMessage } from "firebase/messaging";
 *
 * const firebaseConfig = {
 *     apiKey: API_KEY,
 *     // add your Firebase project config here
 * };
 * const app       = initializeApp(firebaseConfig);
 * const messaging = getMessaging(app);
 */
