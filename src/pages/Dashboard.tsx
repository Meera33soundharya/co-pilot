import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { AnalyticsSuite } from "@/components/dashboard/AnalyticsSuite";
import { IntelligencePanel } from "@/components/dashboard/IntelligencePanel";
import { RecentGrievances } from "@/components/dashboard/RecentGrievances";

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Executive Dashboard"
      subtitle="Real-time Governance Intelligence · AI-Powered Co-Pilot"
    >
      <div className="space-y-8 pb-12">
        {/* Tactical Readiness Overlay */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-3 px-5 py-3 bg-[#0B1221] rounded-[1.5rem] border border-white/5 text-white shadow-xl shadow-blue-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Tactical Status: Optimized</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">System Load: 14%</span>
            <div className="h-1.5 w-24 bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[14%]" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
            Deployment Node: Gov-DC-04 · Latency: 12ms
          </div>
        </div>

        {/* Global Briefing & Hero Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-[#0B1221] rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
            {/* Visual Flair */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <span className="text-xl font-black text-white">AD</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">System Administrator</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/80 mt-1">Global Intelligence Authorization</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Morning Intelligence Summary</h3>
                    <p className="text-lg text-white/80 leading-relaxed font-medium">
                      Your governance grid has processed <span className="text-white font-black underline decoration-blue-500 underline-offset-4 decoration-2">2,847 signals</span> this cycle.
                      <span className="text-emerald-400 font-bold ml-1">Critical success:</span> Infrastructure resolution in Ward 03 exceeded SLA by 4.2h.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                      Execute Daily Audit
                    </button>
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      View Raw Logs
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm self-start">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Active Anomaly Detection</span>
                    <div className="p-1 px-2 bg-rose-500/20 border border-rose-500/30 rounded text-[8px] font-black text-rose-400">CRITICAL</div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                      <span className="text-white font-black block mb-1">Ward 03: Water Pressure Spike</span>
                      AI indicates 82% resolution probability with current node bypass.
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[82%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-50 rounded-2xl text-violet-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Governance Score</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Trust Index</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900">88.4</div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                      <span>Public Sentiment</span>
                      <span className="text-emerald-500">+12%</span>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                      <span>Resolution Accuracy</span>
                      <span className="text-blue-500">98.2%</span>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '98.2%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">Node {i}</div>)}
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800">
                View Matrix →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Policy Impact Simulator
              </h3>
              <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Launch Engine</button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Currently simulating: <span className="font-bold text-gray-900">'Ward 12 Solar Retrofit'</span>.
                Impact on Public Satisfaction: <span className="text-emerald-500 font-bold">+18.4%</span>.
              </p>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 flex items-center gap-3">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Real-time AI Sentiment
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-100 uppercase">
                High Trust
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-black text-gray-900">88.4</p>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Co-Pilot Confidence</p>
              </div>
              <div className="flex-1 h-12 flex items-end gap-1">
                {[40, 60, 45, 90, 65, 80, 50, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-violet-100 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <KpiGrid />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Analytics</span>
          <div className="flex-1 h-px bg-gradient-to-l from-gray-100 to-transparent" />
        </div>

        <AnalyticsSuite />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Intelligence</span>
          <div className="flex-1 h-px bg-gradient-to-l from-gray-100 to-transparent" />
        </div>

        <IntelligencePanel />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Live Tracker</span>
          <div className="flex-1 h-px bg-gradient-to-l from-gray-100 to-transparent" />
        </div>

        <RecentGrievances />

        {/* Tactical Cockpit Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0B1221] rounded-[2rem] p-6 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Neural Stream</h4>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Buffer: 98.4kb/s</span>
              </div>
              <div className="space-y-2 font-mono text-[10px] text-white/40">
                <div className="flex gap-3"><span className="text-blue-500">[SYSTEM]</span> Parsing constituency reports for 'Water Scarcity' spikes...</div>
                <div className="flex gap-3"><span className="text-emerald-500">[LOGS]</span> Ward 03 anomaly confirmed. Severity: CRITICAL. Recommendation generated.</div>
                <div className="flex gap-3"><span className="text-amber-500">[AI]</span> Predicting 14% sentiment drop if resolution exceeds 24h.</div>
                <div className="flex gap-3"><span className="text-white/20">[IDLE]</span> Awaiting executive acknowledgement for Tactical Audit ID: T-004.</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Uptime Score</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Integrity</p>
              </div>
              <div className="ml-auto text-emerald-500 font-black text-xl">99.8%</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Database</span>
                <span className="text-emerald-500">SYNCED</span>
              </div>
              <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[100%]" />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Security</span>
                <span className="text-blue-500">ENCRYPTED</span>
              </div>
              <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[100%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
