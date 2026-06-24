import React, { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Award } from "lucide-react";

function Card({ title, value, delta, positive = true, icon: Icon, isPrimary = false }: { title: string; value: string | number; delta?: string; positive?: boolean; icon: any; isPrimary?: boolean }) {
  const bgColor = isPrimary ? "bg-[#B91C1C] text-white shadow-[#B91C1C]/20" : "bg-white text-gray-900 border border-gray-100";
  const iconBg = isPrimary ? "bg-white/20" : "bg-gray-50";
  const iconColor = isPrimary ? "text-white" : "text-[#B91C1C]";
  const labelColor = isPrimary ? "text-white/60" : "text-gray-400";
  
  return (
    <div className={`rounded-[2.5rem] p-8 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden flex flex-col justify-between ${bgColor}`}>
      {!isPrimary && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-700" />}
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${iconBg}`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        {delta && (
          <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"} uppercase tracking-tight`}>
            {delta}
          </span>
        )}
      </div>
      
      <div className="relative z-10 mt-2">
        <p className="text-3xl font-black leading-none mb-1 uppercase tracking-tight italic">{value}</p>
        <p className={`text-sm font-black uppercase tracking-[0.2em] ${labelColor}`}>{title}</p>
      </div>
    </div>
  );
}

export default function KpiCards() {
  const [stats, setStats] = useState({ open: 128, assigned: 430, closedToday: 24, responseTime: 3.6 });

  useEffect(() => {
    const id = setInterval(() => {
      setStats(s => ({
        open: Math.max(0, s.open + (Math.random() > 0.5 ? 1 : -1)),
        assigned: Math.max(0, s.assigned + (Math.random() > 0.5 ? 2 : -2)),
        closedToday: Math.max(0, s.closedToday + (Math.random() > 0.5 ? 0 : 1)),
        responseTime: Math.max(1.0, +(s.responseTime + (Math.random() - 0.5) * 0.2).toFixed(2)),
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Open Complaints" value={stats.open} delta="+3%" positive={false} icon={Activity} isPrimary={true} />
      <Card title="Assigned" value={stats.assigned} delta="+1.2%" positive={true} icon={TrendingUp} />
      <Card title="Closed Today" value={stats.closedToday} delta="-0.4%" positive={false} icon={TrendingDown} />
      <Card title="Avg Response (hrs)" value={stats.responseTime} icon={Award} />
    </div>
  );
}
