import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
    User, Bell, Shield, Save, Camera,
    ChevronRight, FileBarChart2, Star, Activity, Clock,
    ExternalLink, CheckCircle2
} from "lucide-react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useLanguage } from "@/context/LanguageContext";

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <button
            onClick={() => setOn(!on)}
            className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-[#B91C1C]" : "bg-gray-200"}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
        </button>
    );
}

export default function Settings() {
    const { t } = useLanguage();
    const { currentUser, complaints } = useComplaints();

    const SECTIONS = [
        { icon: User,          key: "settings.profileIdentity" },
        { icon: Bell,          key: "settings.notificationsAlerts" },
        { icon: Shield,        key: "settings.securityAccess" },
        { icon: FileBarChart2, key: "settings.performanceMetrics" },
    ];

    const [activeKey, setActiveKey] = useState("settings.profileIdentity");
    const [name, setName] = useState(currentUser?.name || "Administrator");
    const [email, setEmail] = useState("officer@govpilot.in");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [dept, setDept] = useState(currentUser?.dept || "AI Governance");
    const [designation, setDesignation] = useState(currentUser?.role === "admin" ? "District Collector" : "Ward Supervisor");
    const [ward, setWard] = useState("Ward 03 (Sanjay Nagar)");
    const [saved, setSaved] = useState(false);
    const [action, setAction] = useState<string | null>(null);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleAction = (type: string) => {
        setAction(type);
        setTimeout(() => setAction(null), 2000);
    };

    const stats = {
        resolved: complaints.filter(c => c.status === "Resolved").length,
        avgTime: "4.2 hrs",
        satisfaction: "92%",
    };

    const profileFields = [
        { labelKey: "settings.officerName",    value: name,        setter: setName },
        { labelKey: "settings.mailNode",        value: email,       setter: setEmail },
        { labelKey: "settings.designation",     value: designation, setter: setDesignation },
        { labelKey: "settings.deptWard",        value: ward,        setter: setWard },
        { labelKey: "settings.encryptedContact",value: phone,       setter: setPhone },
        { labelKey: "settings.govDivision",     value: dept,        setter: setDept },
    ];

    const notifItems = [
        { labelKey: "settings.notif.newGrievance",     descKey: "settings.notif.newGrievanceDesc",     on: true },
        { labelKey: "settings.notif.criticalEscalation", descKey: "settings.notif.criticalEscalationDesc", on: true },
        { labelKey: "settings.notif.sentimentSpike",   descKey: "settings.notif.sentimentSpikeDesc",   on: true },
        { labelKey: "settings.notif.deptMemo",         descKey: "settings.notif.deptMemoDesc",         on: false },
        { labelKey: "settings.notif.maintenance",      descKey: "settings.notif.maintenanceDesc",      on: false },
    ];

    const securityItems = [
        { labelKey: "settings.security.bio2fa",        descKey: "settings.security.bio2faDesc",        on: true },
        { labelKey: "settings.security.sessionTimeout",descKey: "settings.security.sessionTimeoutDesc",on: true },
        { labelKey: "settings.security.loginAnomaly",  descKey: "settings.security.loginAnomalyDesc",  on: false },
    ];

    return (
        <DashboardLayout title={t("settings.pageTitle")} subtitle={t("settings.pageSubtitle")}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-4 h-fit lg:sticky lg:top-6">
                        <div className="space-y-1">
                            {SECTIONS.map(({ icon: Icon, key }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveKey(key)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left group ${activeKey === key ? "bg-[#B91C1C] text-white shadow-xl shadow-red-900/20" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${activeKey === key ? "text-white" : "text-gray-300 group-hover:text-[#B91C1C] transition-colors"}`} />
                                    <span className="text-sm font-black uppercase tracking-widest leading-none">{t(key)}</span>
                                    {activeKey !== key && <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-40" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* ──── PROFILE SECTION ──── */}
                    {activeKey === "settings.profileIdentity" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] pointer-events-none" />
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                {t("settings.identityProtocol")}
                            </h2>

                            <div className="flex items-center gap-8 mb-10 relative z-10">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-neutral-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                        {name.slice(0,2).toUpperCase()}
                                    </div>
                                    <button onClick={() => handleAction("photo")} className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-gray-100 shadow-xl flex items-center justify-center hover:bg-red-50 transition-all hover:border-red-100">
                                        <Camera className="w-4 h-4 text-gray-400 group-hover:text-[#B91C1C]" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-gray-900 tracking-tight">{name}</p>
                                    <p className="text-sm text-gray-400 font-black uppercase tracking-widest">{designation} · {dept}</p>
                                    <button onClick={() => handleAction("photo")} className="text-sm font-black text-[#B91C1C] uppercase tracking-widest mt-2 hover:translate-x-1 transition-transform flex items-center gap-1.5">
                                        {action === "photo" ? t("settings.initializing") : <>{t("settings.requestCredential")} <ChevronRight className="w-3 h-3" /></>}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                {profileFields.map(({ labelKey, value, setter }) => (
                                    <div key={labelKey} className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-widest text-gray-400 ml-1">{t(labelKey)}</label>
                                        <input
                                            value={value}
                                            onChange={e => setter(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 transition-all shadow-inner"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex gap-4 relative z-10">
                                <button
                                    onClick={handleSave}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#B91C1C] text-white hover:bg-neutral-800 shadow-red-900/20"}`}
                                >
                                    <Save className="w-4 h-4" />
                                    {saved ? t("settings.committed") : t("settings.commitProtocol")}
                                </button>
                                <button onClick={() => { setSaved(false); }} className="px-10 py-4 bg-gray-100 rounded-2xl text-base font-black text-gray-900 hover:bg-gray-200 transition-all uppercase tracking-widest">
                                    {t("settings.abort")}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ──── NOTIFICATIONS SECTION ──── */}
                    {activeKey === "settings.notificationsAlerts" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {t("settings.notifAlertsHeader")}
                            </h2>
                            <div className="space-y-6">
                                {notifItems.map(({ labelKey, descKey, on }) => (
                                    <div key={labelKey} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-amber-100 transition-all group">
                                        <div className="max-w-md">
                                            <p className="text-lg font-black text-gray-900">{t(labelKey)}</p>
                                            <p className="text-base text-gray-400 font-medium mt-0.5">{t(descKey)}</p>
                                        </div>
                                        <Toggle defaultOn={on} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ──── SECURITY SECTION ──── */}
                    {activeKey === "settings.securityAccess" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {t("settings.securityHeader")}
                            </h2>
                            <div className="space-y-6">
                                {securityItems.map(({ labelKey, descKey, on }) => (
                                    <div key={labelKey} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group">
                                        <div className="max-w-md">
                                            <p className="text-lg font-black text-gray-900">{t(labelKey)}</p>
                                            <p className="text-base text-gray-400 font-medium mt-0.5">{t(descKey)}</p>
                                        </div>
                                        <Toggle defaultOn={on} />
                                    </div>
                                ))}

                                <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">{t("settings.trustedDevices")}</h4>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50 text-base font-bold text-gray-900">
                                        <span>District-Mobile (Samsung S23)</span>
                                        <span className="text-emerald-500 font-black">{t("settings.active")}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 text-base font-bold text-gray-400">
                                        <span>Officer-Laptop (MacBook Pro)</span>
                                        <button className="text-red-500 hover:underline">{t("settings.revokeAccess")}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──── PERFORMANCE SECTION ──── */}
                    {activeKey === "settings.performanceMetrics" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.resolved}</h4>
                                    <p className="text-sm font-black uppercase text-gray-400 tracking-widest mt-1">{t("settings.grievancesResolved")}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4"><Clock className="w-5 h-5 text-blue-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.avgTime}</h4>
                                    <p className="text-sm font-black uppercase text-gray-400 tracking-widest mt-1">{t("settings.avgResolutionTime")}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4"><Star className="w-5 h-5 text-amber-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.satisfaction}</h4>
                                    <p className="text-sm font-black uppercase text-gray-400 tracking-widest mt-1">{t("settings.satisfactionScore")}</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-[#B91C1C]" />
                                        {t("settings.efficiencyTrend")}
                                    </h2>
                                    <button className="text-sm font-black uppercase text-[#B91C1C] flex items-center gap-2">{t("settings.downloadReport")} <ExternalLink className="w-3 h-3" /></button>
                                </div>
                                <div className="h-48 flex items-end gap-3 px-4">
                                    {[30, 45, 25, 60, 80, 55, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-[#B91C1C]/10 rounded-t-xl group relative cursor-pointer" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-[#B91C1C] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Day {i+1}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
