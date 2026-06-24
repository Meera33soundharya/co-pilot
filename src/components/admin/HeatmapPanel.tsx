import React from "react";

export default function HeatmapPanel() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        Issue Heatmap
      </h3>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 36 }).map((_, i) => {
          const intensity = Math.floor(Math.random() * 5);
          const colors = ["bg-emerald-50", "bg-emerald-200", "bg-amber-200", "bg-orange-300", "bg-red-400"];
          return <div key={i} className={`h-10 rounded ${colors[intensity]}`} />;
        })}
      </div>
      <p className="text-base text-gray-400 mt-2">Interactive ward heatmap (placeholder). Hover to see details in the full product.</p>
    </div>
  );
}
