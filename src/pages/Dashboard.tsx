import { DashboardLayout } from "@/components/DashboardLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
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
        <HeroBanner />
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
      </div>
    </DashboardLayout>
  );
}
