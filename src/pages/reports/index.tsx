import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { 
  BarChart3, Building2, Brain, Users, 
  TrendingUp, Shield, Clock, Award,
  FileText, Download, RefreshCw, Sparkles
} from "lucide-react";

const reports = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "High-level governance performance overview for executives and administrators",
    icon: Shield,
    color: "bg-red-50 text-red-600 border-red-100",
    route: "/reports/executive-summary",
    metrics: ["Overall KPIs", "Budget Utilization", "Governance Risk", "Citizen Satisfaction"],
    lastUpdated: "Just now"
  },
  {
    id: "department-performance",
    title: "Department Performance",
    description: "Compare departmental performance and operational efficiency",
    icon: Building2,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    route: "/reports/department-performance",
    metrics: ["Performance Score", "Resolution Time", "Productivity", "Budget Utilization"],
    lastUpdated: "2 hours ago"
  },
  {
    id: "ai-impact-analysis",
    title: "AI Impact Analysis",
    description: "Measure effectiveness and business impact of AI across the platform",
    icon: Brain,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    route: "/reports/ai-impact-analysis",
    metrics: ["AI Accuracy", "Time Saved", "Cost Saved", "Automation %"],
    lastUpdated: "1 day ago"
  },
  {
    id: "citizen-sentiment",
    title: "Citizen Sentiment",
    description: "Understand citizen satisfaction and public opinion trends",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    route: "/reports/citizen-sentiment",
    metrics: ["Sentiment Score", "Feedback Analysis", "Complaint Trends", "Public Concerns"],
    lastUpdated: "3 hours ago"
  }
];

export default function ReportsIndex() {
  return (
    <DashboardLayout 
      title="AI Governance Intelligence Portal" 
      subtitle="Enterprise analytics dashboards for governance performance monitoring"
    >
      <div className="space-y-8 pb-20">
        
        {/* ── Hero Section ────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0D1425] to-[#1A1F2E] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-white leading-tight">
                  AI Governance Intelligence Portal
                </h1>
                <p className="text-lg text-white/70 max-w-3xl">
                  Enterprise analytics platform providing executive insights, departmental performance tracking, 
                  AI impact measurement, and citizen sentiment analysis for data-driven governance decisions.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button className="px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh All
                </button>
                <button className="px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Insights
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-right ml-auto">
                    <span className="text-xs font-black text-white/50 uppercase tracking-widest">Live</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">4</p>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Active Reports</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-right ml-auto">
                    <span className="text-xs font-black text-white/50 uppercase tracking-widest">Updated</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">12</p>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Departments</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-right ml-auto">
                    <span className="text-xs font-black text-white/50 uppercase tracking-widest">Score</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">87%</p>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Gov. Index</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-right ml-auto">
                    <span className="text-xs font-black text-white/50 uppercase tracking-widest">AI</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">94%</p>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">AI Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reports Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Link
                key={report.id}
                to={report.route}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className={`p-4 rounded-2xl ${report.color} border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-100 rounded-xl">
                    {report.lastUpdated}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {report.description}
                </p>
                
                <div className="space-y-3 mb-8">
                  {report.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="text-sm font-bold text-gray-700">{metric}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest">
                    <FileText className="w-4 h-4" />
                    PDF • Excel • CSV
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    Open Dashboard
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Quick Actions ───────────────────────────────────── */}
        <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">
                Enterprise Export Suite
              </h3>
              <p className="text-gray-600">
                Generate comprehensive reports with AI-powered insights and professional formatting
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Export All Reports
              </button>
              <button className="px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate AI Summary
              </button>
              <button className="px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Print Portfolio
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
