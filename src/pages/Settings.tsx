import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { User, Bell, Shield, Globe, Palette, Key, Save, Camera, ChevronRight } from "lucide-react";

const settingsSections = [
    { icon: User, label: "Profile & Account", active: true },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security & Privacy" },
    { icon: Globe, label: "Language & Region" },
    { icon: Palette, label: "Appearance" },
    { icon: Key, label: "API & Integrations" },
];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <button
            onClick={() => setOn(!on)}
            className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-gray-200"}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
        </button>
    );
}

export default function Settings() {
    const [activeSection, setActiveSection] = useState("Profile & Account");
    const [name, setName] = useState("Arjun Kumar");
    const [email, setEmail] = useState("arjun.kumar@govpilot.in");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [dept, setDept] = useState("Urban Development");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <DashboardLayout title="Settings" subtitle="Manage your account configuration and preferences">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 h-fit lg:sticky lg:top-6">
                    <div className="space-y-1">
                        {settingsSections.map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                onClick={() => setActiveSection(label)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeSection === label ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-bold">{label}</span>
                                {activeSection !== label && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Profile Section */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
                        <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Profile & Account
                        </h2>

                        {/* Avatar */}
                        <div className="flex items-center gap-5 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">AK</div>
                                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-all">
                                    <Camera className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                            </div>
                            <div>
                                <p className="font-black text-gray-900">{name}</p>
                                <p className="text-sm text-gray-400 font-medium">Executive Admin · {dept}</p>
                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 hover:text-blue-800 transition-colors">Change Photo</button>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { label: "Full Name", value: name, setter: setName },
                                { label: "Email Address", value: email, setter: setEmail },
                                { label: "Phone Number", value: phone, setter: setPhone },
                                { label: "Department", value: dept, setter: setDept },
                            ].map(({ label, value, setter }) => (
                                <div key={label}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{label}</label>
                                    <input
                                        value={value}
                                        onChange={e => setter(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Role</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                                <option>Executive Admin</option>
                                <option>Department Admin</option>
                                <option>Field Officer</option>
                                <option>Read-Only Viewer</option>
                            </select>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"}`}
                            >
                                <Save className="w-4 h-4" />
                                {saved ? "Saved!" : "Save Changes"}
                            </button>
                            <button className="px-6 py-2.5 bg-gray-100 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
                        <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Notification Preferences
                        </h2>
                        <div className="space-y-5">
                            {[
                                { label: "Critical AI Alerts", desc: "Immediate notification for critical anomalies", on: true },
                                { label: "New Grievances", desc: "When a new complaint is assigned to your ward", on: true },
                                { label: "Resolution Updates", desc: "Status changes on grievances you're tracking", on: true },
                                { label: "Sentiment Spikes", desc: "When social sentiment changes significantly", on: false },
                                { label: "Weekly Reports", desc: "Automated performance summary every Monday", on: true },
                                { label: "System Maintenance", desc: "Scheduled downtime and update notices", on: false },
                            ].map(({ label, desc, on }) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{label}</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle defaultOn={on} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
                        <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Security Settings
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", on: true },
                                { label: "Session Timeout", desc: "Auto logout after 30 mins of inactivity", on: true },
                                { label: "Login Activity Alerts", desc: "Notify on new device logins", on: false },
                            ].map(({ label, desc, on }) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{label}</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle defaultOn={on} />
                                </div>
                            ))}
                            <button className="mt-2 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5">
                                <Key className="w-4 h-4" />
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
