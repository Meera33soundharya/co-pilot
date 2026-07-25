import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import { api } from "@/services/api";
import {
  Shield, Building2, User, Mail, Lock,
  Eye, EyeOff, ChevronRight, MessageSquare, Mic, Loader2
} from "lucide-react";

const ACCOUNTS = [
  {
    role: "admin" as const,
    label: "ADMIN",
    icon: Shield,
    email: "admin@govpilot.in",
    password: "Admin@2026",
  },
  {
    role: "officer" as const,
    label: "FIELD OFFICER",
    icon: Building2,
    email: "officer@govpilot.in",
    password: "Officer@2026",
  },
  {
    role: "citizen" as const,
    label: "CITIZEN",
    icon: User,
    email: "citizen@govpilot.in",
    password: "Citizen@2026",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useComplaints();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  const handleRoleSelect = (acct: typeof ACCOUNTS[0]) => {
    setSelectedRole(acct.role);
    setEmail(acct.email);
    setPassword(acct.password);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const user = await api.auth.login(email, password);
      login(user);
      if (user.role === "citizen")      navigate("/citizen");
      else if (user.role === "officer") navigate("/grievances");
      else                              navigate("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ══ LEFT PANEL — 55% — Robot hand image ══════════════════════ */}
      <div className="hidden lg:block" style={{ width: "55%", flexShrink: 0, position: "relative", background: "#000" }}>
        <img
          src="/robot_hand.png"
          alt="AI Robot Hand with Energy Ball"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        {/* subtle dark gradient on right edge for blending */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, transparent 70%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      </div>

      {/* ══ RIGHT PANEL — 45% ════════════════════════════════════════ */}
      <div
        className="flex flex-col items-center justify-center flex-1 relative"
        style={{ background: "#f0efed", padding: "2rem" }}
      >

        {/* ── 1. Role Selector Cards ─────────────────────────────── */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
          {ACCOUNTS.map((acct) => {
            const Icon = acct.icon;
            const active = selectedRole === acct.role;
            return (
              <button
                key={acct.role}
                onClick={() => handleRoleSelect(acct)}
                style={{
                  display:         "flex",
                  flexDirection:   "column",
                  alignItems:      "center",
                  justifyContent:  "center",
                  width:           "90px",
                  height:          "90px",
                  borderRadius:    "16px",
                  border:          active ? "2px solid #ddd" : "2px solid #e0dedd",
                  background:      active ? "#ffffff" : "#ebe9e7",
                  boxShadow:       active ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
                  cursor:          "pointer",
                  transition:      "all 0.18s ease",
                  transform:       active ? "translateY(-2px)" : "none",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: active ? "#CC0000" : "#888", marginBottom: "8px" }}
                />
                <span
                  style={{
                    fontSize:      "10px",
                    fontWeight:    "800",
                    color:         active ? "#222" : "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    textAlign:     "center",
                    lineHeight:    "1.2",
                  }}
                >
                  {acct.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 2. Helper text ─────────────────────────────────────── */}
        <p
          style={{
            fontSize:      "11px",
            color:         "#888",
            textAlign:     "center",
            marginBottom:  "20px",
            maxWidth:      "260px",
            lineHeight:    "1.6",
            fontWeight:    "500",
          }}
        >
          Tap a role to auto-fill credentials, then click Sign In
        </p>

        {/* ── 3. Form Card ───────────────────────────────────────── */}
        <div
          style={{
            background:   "#ffffff",
            borderRadius: "24px",
            padding:      "28px 28px 32px",
            width:        "100%",
            maxWidth:     "380px",
            boxShadow:    "0 4px 24px rgba(0,0,0,0.07)",
            marginBottom: "0",
          }}
        >
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display:       "block",
                  fontSize:      "9px",
                  fontWeight:    "700",
                  color:         "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom:  "6px",
                  marginLeft:    "4px",
                }}
              >
                EMAIL / AREA
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  strokeWidth={1.5}
                  style={{
                    position:  "absolute",
                    left:      "14px",
                    top:       "50%",
                    transform: "translateY(-50%)",
                    color:     "#aaa",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@govpilot.in"
                  style={{
                    width:         "100%",
                    paddingLeft:   "40px",
                    paddingRight:  "16px",
                    paddingTop:    "13px",
                    paddingBottom: "13px",
                    background:    "#eef2f7",
                    border:        "none",
                    borderRadius:  "12px",
                    fontSize:      "13px",
                    fontWeight:    "500",
                    color:         "#333",
                    outline:       "none",
                    boxSizing:     "border-box",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display:       "block",
                  fontSize:      "9px",
                  fontWeight:    "700",
                  color:         "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom:  "6px",
                  marginLeft:    "4px",
                }}
              >
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  strokeWidth={1.5}
                  style={{
                    position:  "absolute",
                    left:      "14px",
                    top:       "50%",
                    transform: "translateY(-50%)",
                    color:     "#aaa",
                  }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width:         "100%",
                    paddingLeft:   "40px",
                    paddingRight:  "44px",
                    paddingTop:    "13px",
                    paddingBottom: "13px",
                    background:    "#eef2f7",
                    border:        "none",
                    borderRadius:  "12px",
                    fontSize:      "13px",
                    fontWeight:    "500",
                    color:         "#333",
                    outline:       "none",
                    boxSizing:     "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position:   "absolute",
                    right:      "14px",
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    color:      "#aaa",
                    padding:    "0",
                    display:    "flex",
                  }}
                >
                  {showPwd
                    ? <EyeOff size={16} strokeWidth={1.5} />
                    : <Eye size={16} strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: "#CC0000", fontSize: "11px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
                {error}
              </p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width:         "100%",
                padding:       "15px",
                background:    loading ? "#e57373" : "#CC0000",
                border:        "none",
                borderRadius:  "14px",
                color:         "#fff",
                fontSize:      "11px",
                fontWeight:    "800",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                cursor:        loading ? "not-allowed" : "pointer",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                gap:           "8px",
                boxShadow:     "0 4px 16px rgba(204,0,0,0.25)",
                transition:    "background 0.2s",
              }}
            >
              {loading
                ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                : <>SIGN IN SECURELY <span style={{ fontSize: "15px", fontWeight: "400" }}>→</span></>
              }
            </button>
          </form>

          {/* ── 4. Divider ──────────────────────────────────────── */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
            <p
              style={{
                textAlign:     "center",
                fontSize:      "9px",
                fontWeight:    "700",
                color:         "#bbb",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom:  "16px",
                lineHeight:    "1.6",
              }}
            >
              CITIZEN SERVICES (NO ACCOUNT REQUIRED)
            </p>

            {/* ── 5a. Submit Complaint ────────────────────────── */}
            <button
              type="button"
              onClick={() => navigate("/submit-complaint")}
              style={{
                width:         "100%",
                padding:       "14px",
                background:    "#fff",
                border:        "1.5px solid #e0e0e0",
                borderRadius:  "14px",
                color:         "#444",
                fontSize:      "11px",
                fontWeight:    "800",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                cursor:        "pointer",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                gap:           "8px",
                marginBottom:  "10px",
                transition:    "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ccc";
                (e.currentTarget as HTMLButtonElement).style.background = "#fafafa";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0";
                (e.currentTarget as HTMLButtonElement).style.background = "#fff";
              }}
            >
              <MessageSquare size={14} strokeWidth={1.5} style={{ color: "#CC0000" }} />
              SUBMIT COMPLAINT
              <ChevronRight size={13} style={{ color: "#bbb" }} />
            </button>

            {/* ── 5b. Speak to Register ───────────────────────── */}
            <button
              type="button"
              onClick={() => navigate("/voice-portal")}
              style={{
                width:         "100%",
                padding:       "14px",
                background:    "#CC0000",
                border:        "none",
                borderRadius:  "14px",
                color:         "#fff",
                fontSize:      "11px",
                fontWeight:    "800",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                cursor:        "pointer",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                gap:           "8px",
                boxShadow:     "0 4px 16px rgba(204,0,0,0.22)",
                transition:    "background 0.2s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#aa0000")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#CC0000")}
            >
              <Mic size={14} strokeWidth={1.5} />
              SPEAK TO REGISTER
              <ChevronRight size={13} style={{ opacity: 0.7 }} />
            </button>
          </div>
        </div>

        {/* ── 6. Footer ──────────────────────────────────────────── */}
        <p
          style={{
            position:      "absolute",
            bottom:        "20px",
            fontSize:      "9px",
            fontWeight:    "700",
            color:         "#bbb",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          SECURED · DISTRICT COUNCIL · 2026
        </p>

      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
