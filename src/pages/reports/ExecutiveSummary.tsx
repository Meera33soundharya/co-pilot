import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import {
  BarChart3, TrendingUp, Shield, Users, Clock, Award,
  Building2, FileText, Download, Printer, RefreshCw,
  Search, Filter, Calendar, ChevronDown, Sparkles,
  AlertTriangle, CheckCircle2, XCircle, TrendingDown
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const timeframes = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "Last 180 Days", days: 180 },
  { label: "Last 1 Year", days: 365 },
  { label: "All Time", days: 9999 },
];

const departments = [
  { name: "Water Supply", value: 45, color: "#3B82F6" },
  { name: "Electricity", value: 38, color: "#10B981" },
  { name: "Roads & Infrastructure", value: 52, color: "#F59E0B" },
  { name: "Sanitation", value: 41, color: "#8B5CF6" },
  { name: "Public Health", value: 29, color: "#EF4444" },
  { name: "Education", value: 33, color: "#6366F1" },
];

export default function ExecutiveSummary() {
  const { complaints } = useComplaints();
  const [period, setPeriod] = useState("Last 90 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const selectedDays = timeframes.find(t => t.label === period)?.days ?? 90;

  // Filter complaints by date
  const filteredComplaints = complaints.filter(c => {
    const cutoff = Date.now() - selectedDays * 86400000;
    return c.timestamp >= cutoff;
  });

  // Calculate KPIs
  const totalDepartments = 12;
  const activeProjects = filteredComplaints.filter(c => 
    c.status === "In Progress" || c.status === "Assigned"
  ).length;
  const budgetUtilization = 78; // Mock data
  const citizenSatisfaction = Math.round(
    filteredComplaints.filter(c => c.rating && c.rating >= 4).length / 
    Math.max(filteredComplaints.filter(c => c.rating).length, 1) * 100
  ) || 85;
  const pendingIssues = filteredComplaints.filter(c => 
    c.status !== "Resolved" && c.status !== "Closed"
  ).length;
  const completedTasks = filteredComplaints.filter(c => 
    c.status === "Resolved" || c.status === "Closed"
  ).length;
  
  // Governance Risk Level calculation
  const highPriority = filteredComplaints.filter(c => c.priority === "High").length;
  const riskLevel = highPriority > 20 ? "High" : highPriority > 10 ? "Medium" : "Low";

  // KPI Cards Data
  const kpiCards = [
    {
      title: "Total Departments",
      value: totalDepartments,
      change: "+2",
      trend: "up",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Active Projects",
      value: activeProjects,
      change: "-3",
      trend: "down",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Budget Utilization",
      value: `${budgetUtilization}%`,
      change: "+5%",
      trend: "up",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Citizen Satisfaction",
      value: `${citizenSatisfaction}%`,
      change: "+2%",
      trend: "up",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Pending Issues",
      value: pendingIssues,
      change: "-8",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      change: "+12",
      trend: "up",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Governance Risk",
      value: riskLevel,
      change: riskLevel === "High" ? "⚠️ High" : riskLevel === "Medium" ? "⚠️ Medium" : "✅ Low",
      trend: riskLevel === "High" ? "up" : riskLevel === "Medium" ? "neutral" : "down",
      icon: Shield,
      color: riskLevel === "High" ? "text-red-600" : riskLevel === "Medium" ? "text-amber-600" : "text-emerald-600",
      bg: riskLevel === "High" ? "bg-red-50" : riskLevel === "Medium" ? "bg-amber-50" : "bg-emerald-50"
    },
    {
      title: "Avg. Resolution Time",
      value: "3.2 days",
      change: "-0.8 days",
      trend: "down",
      icon: Clock,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ];

  // KPI Trend Data
  const kpiTrendData = [
    { month: "Jan", kpi: 72, budget: 65 },
    { month: "Feb", kpi: 75, budget: 68 },
    { month: "Mar", kpi: 78, budget: 72 },
    { month: "Apr", kpi: 82, budget: 75 },
    { month: "May", kpi: 85, budget: 78 },
    { month: "Jun", kpi: 87, budget: 82 },
    { month: "Jul", kpi: 90, budget: 85 },
  ];

  // Department Performance Data
  const departmentPerformance = [
    { name: "Water", performance: 88, target: 85 },
    { name: "Electricity", performance: 92, target: 90 },
    { name: "Roads", performance: 78, target: 85 },
    { name: "Sanitation", performance: 85, target: 80 },
    { name: "Health", performance: 82, target: 85 },
    { name: "Education", performance: 90, target: 88 },
  ];

  // Budget Allocation Data
  const budgetData = [
    { name: "Infrastructure", value: 35, color: "#3B82F6" },
    { name: "Public Services", value: 25, color: "#10B981" },
    { name: "Administration", value: 20, color: "#F59E0B" },
    { name: "Technology", value: 15, color: "#8B5CF6" },
    { name: "Emergency", value: 5, color: "#EF4444" },
  ];

  // Monthly Progress Data
  const monthlyProgress = [
    { month: "Jan", planned: 65, actual: 60 },
    { month: "Feb", planned: 70, actual: 68 },
    { month: "Mar", planned: 75, actual: 72 },
    { month: "Apr", planned: 80, actual: 78 },
    { month: "May", planned: 85, actual: 82 },
    { month: "Jun", planned: 90, actual: 87 },
    { month: "Jul", planned: 95, actual: 90 },
  ];

  // AI Insights
  const generateAIInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAiInsights([
        "Governance performance shows strong upward trend with 12% improvement in Q2",
        "Citizen satisfaction at 87% indicates effective public service delivery",
        "Budget utilization optimized at 78% with room for infrastructure investment",
        "High-risk projects identified in Roads department require immediate attention",
        "AI recommendations: Implement predictive analytics for resource allocation"
      ]);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    generateAIInsights();
  }, [period]);

  const handleExport = (format: string) => {
    alert(`Exporting Executive Summary as ${format}...`);
  };

  return (
    <DashboardLayout 
      title="Executive Summary Report" 
      subtitle="High-level governance performance overview for executive decision making"
    >
      <div className="space-y-8 pb-20">
        
        {/* ── Header Controls ────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Executive Summary Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive overview of governance performance, budget utilization, and strategic KPIs
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-black text-gray-400 uppercase tracking-widest">
                <span className="text-emerald-600">●</span> Last updated: Just now
              </div>
              <button 
                onClick={() => generateAIInsights()}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isLoading ? "Processing..." : "Refresh AI Insights"}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                placeholder="Search metrics, departments, or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            {/* Period Selector */}
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none cursor-pointer min-w-[200px]"
              >
                {timeframes.map(t => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                    Department
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900">
                    <option>All Departments</option>
                    <option>Water Supply</option>
                    <option>Electricity</option>
                    <option>Roads & Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                    Priority Level
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900">
                    <option>All Priorities</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                    Status
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3.5 rounded-2xl ${kpi.bg} border border-gray-50`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black ${
                    kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    kpi.trend === 'down' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                     kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                     <span className="w-3 h-3">●</span>}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-3">{kpi.value}</p>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-400">{kpi.title}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts Section ──────────────────────���──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KPI Trend Chart */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  KPI Trend Analysis ({period})
                </h3>
                <p className="text-sm text-gray-500 mt-1">Governance performance vs budget utilization</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-black text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  KPI Score
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                  Budget %
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="kpi" stroke="#B91C1C" fill="#B91C1C" fillOpacity={0.1} strokeWidth={3} />
                  <Area type="monotone" dataKey="budget" stroke="#111827" fill="#111827" fillOpacity={0.05} strokeWidth={3} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Department Performance Ranking
                </h3>
                <p className="text-sm text-gray-500 mt-1">Performance vs target scores by department</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="target" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="performance" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Allocation */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Budget Allocation Distribution
                </h3>
                <p className="text-sm text-gray-500 mt-1">Current fiscal year budget breakdown</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {budgetData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">{item.value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Governance Progress */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Monthly Governance Progress
                </h3>
                <p className="text-sm text-gray-500 mt-1">Planned vs actual achievement</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="planned" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── AI Insights Section ────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0D1425] to-[#1A1F2E] rounded-[3rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-red-400" />
                AI-Generated Executive Insights
              </h3>
              <p className="text-white/70">
                Strategic recommendations and risk analysis powered by AI
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-white/50 uppercase tracking-widest">
              <span className="text-emerald-400">●</span> Live Analysis
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-600/20 rounded-xl flex items-center justify-center shrink-0">
                      {index === 0 ? <TrendingUp className="w-4 h-4 text-red-400" /> :
                       index === 1 ? <Users className="w-4 h-4 text-emerald-400" /> :
                       index === 2 ? <FileText className="w-4 h-4 text-blue-400" /> :
                       index === 3 ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                       <Sparkles className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-lg font-medium text-white/90 leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-white/50 text-sm">
                <p className="font-bold">AI Processing Summary:</p>
                <p>Analysis based on {filteredComplaints.length} records • Confidence: 94% • Updated: Just now</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleExport("PDF")}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button 
                  onClick={() => handleExport("Excel")}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Report
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}