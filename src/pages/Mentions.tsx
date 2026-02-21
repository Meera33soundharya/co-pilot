import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Twitter, Facebook, ExternalLink, ThumbsUp, ThumbsDown, Minus, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mentions = [
    { platform: "Twitter", handle: "@ANI", text: "Municipal Corporation launches 'GovPilot' AI system to track citizen grievances in real-time. Officials say the system has already resolved 78% of pending cases.", sentiment: "positive", time: "12 min ago", engagement: 2847, reach: "142K" },
    { platform: "Facebook", handle: "Residents of Ward 03", text: "The new AI monitoring has finally flagged our water supply issue. Commissioner's office responded within 2 hours! This is what digital governance looks like.", sentiment: "positive", time: "45 min ago", engagement: 892, reach: "18K" },
    { platform: "Twitter", handle: "@CivicVoice_IN", text: "Critical: Water supply disruption in Ward 03 affects 12,000+ residents. @MunicipalCorp yet to provide timeline for resolution. #GovFailure", sentiment: "negative", time: "1h ago", engagement: 4132, reach: "89K" },
    { platform: "Twitter", handle: "@TechReporterIN", text: "Interesting use of AI in public governance. The GovCoPilot system seems to be setting a new benchmark for smart city administration. Worth watching.", sentiment: "neutral", time: "2h ago", engagement: 567, reach: "32K" },
    { platform: "Facebook", handle: "Ward 12 Citizens Forum", text: "Street lights near SV School broken for 4 days. Multiple complaints filed but no action. Is anyone monitoring this?", sentiment: "negative", time: "3h ago", engagement: 1203, reach: "9K" },
    { platform: "Twitter", handle: "@SmartCityIndia", text: "Resolution rate improved by 18% in just 3 months after implementing AI-powered complaint management. Great work @MunicipalCorp!", sentiment: "positive", time: "5h ago", engagement: 334, reach: "24K" },
];

const sentimentData = [
    { label: "Positive", value: 62, color: "#10B981" },
    { label: "Neutral", value: 23, color: "#3B82F6" },
    { label: "Negative", value: 15, color: "#EF4444" },
];

const engagementHistory = [
    { date: "Feb 14", positive: 45, negative: 22, neutral: 18 },
    { date: "Feb 15", positive: 52, negative: 18, neutral: 24 },
    { date: "Feb 16", positive: 38, negative: 31, neutral: 20 },
    { date: "Feb 17", positive: 67, negative: 14, neutral: 28 },
    { date: "Feb 18", positive: 58, negative: 19, neutral: 22 },
    { date: "Feb 19", positive: 72, negative: 12, neutral: 30 },
    { date: "Feb 20", positive: 61, negative: 15, neutral: 23 },
];

const sentimentIcon: Record<string, React.ReactElement> = {
    positive: <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />,
    negative: <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />,
    neutral: <Minus className="w-3.5 h-3.5 text-blue-400" />,
};

const sentimentBadge: Record<string, string> = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-100",
    negative: "bg-rose-50 text-rose-700 border-rose-100",
    neutral: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function Mentions() {
    const [filter, setFilter] = useState("All");

    const filtered = filter === "All" ? mentions : mentions.filter(m => m.sentiment === filter.toLowerCase());

    return (
        <DashboardLayout title="Mentions" subtitle="Real-time social media monitoring & sentiment analysis">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Mentions", value: "1,284", change: "+24%", icon: TrendingUp, positive: true },
                        { label: "Positive Sentiment", value: "61.8%", change: "+3.2%", icon: ThumbsUp, positive: true },
                        { label: "Negative Mentions", value: "192", change: "-12%", icon: ThumbsDown, positive: true },
                        { label: "Avg Engagement", value: "1,663", change: "+8.4%", icon: TrendingDown, positive: false },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-xl bg-gray-50"><s.icon className="w-4 h-4 text-gray-400" /></div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${s.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{s.change}</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Feed */}
                    <div className="xl:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex bg-white border border-gray-100 p-1 rounded-xl gap-1 shadow-sm">
                                {["All", "Positive", "Negative", "Neutral"].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-gray-700"}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => window.alert('Refreshing social media feed...')} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-all">
                                <RefreshCw className="w-3.5 h-3.5" />
                                Refresh
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filtered.map((m, i) => (
                                <div key={i} onClick={() => window.alert(`Mention Detail:\n\nHandle: ${m.handle}\nPlatform: ${m.platform}\nSentiment: ${m.sentiment}\nReach: ${m.reach}\n\n"${m.text}"`)} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group text-left">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl shrink-0 ${m.platform === "Twitter" ? "bg-sky-50" : "bg-blue-50"}`}>
                                            {m.platform === "Twitter" ? (
                                                <Twitter className="w-4 h-4 text-sky-500" />
                                            ) : (
                                                <Facebook className="w-4 h-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-xs font-black text-gray-900">{m.handle}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 ${sentimentBadge[m.sentiment]}`}>
                                                    {sentimentIcon[m.sentiment]}
                                                    {m.sentiment}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold ml-auto">{m.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{m.text}</p>
                                            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 font-bold">
                                                <span>👍 {m.engagement.toLocaleString()}</span>
                                                <span>📡 {m.reach} reach</span>
                                                <button onClick={(e) => { e.stopPropagation(); window.alert(`Opening source post from ${m.handle} on ${m.platform}...`); }} className="flex items-center gap-1 ml-auto text-blue-500 hover:text-blue-700 transition-colors">
                                                    <ExternalLink className="w-3 h-3" /> View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div className="space-y-5">
                        <div className="bg-[#0B1221] rounded-2xl p-6 text-white shadow-2xl">
                            <h3 className="font-black text-sm mb-5">Sentiment Breakdown</h3>
                            <div className="space-y-4">
                                {sentimentData.map(s => (
                                    <div key={s.label}>
                                        <div className="flex justify-between mb-2 text-[10px] font-black">
                                            <span className="text-white/60">{s.label}</span>
                                            <span>{s.value}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-black text-gray-900 text-sm mb-5">7-Day Engagement</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={engagementHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                                        <Tooltip />
                                        <Bar dataKey="positive" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                                        <Bar dataKey="neutral" fill="#3B82F6" stackId="a" />
                                        <Bar dataKey="negative" fill="#EF4444" stackId="a" radius={[0, 0, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
