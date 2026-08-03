import React, { useMemo } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

const ALL_WARDS = [
  "Ward 01", "Ward 02", "Ward 03", "Ward 04",
  "Ward 05", "Ward 06", "Ward 07", "Ward 08",
  "Ward 09", "Ward 10", "Ward 11", "Ward 12",
];

export default function HeatmapPanel() {
  const { complaints } = useComplaints();

  const wardData = useMemo(() => {
    return ALL_WARDS.map(ward => {
      const wc = complaints.filter(c => c.ward === ward);
      const total = wc.length;
      const open = wc.filter(c => c.status === ("New" as any) || c.status === ("Categorized" as any)).length;
      const resolved = wc.filter(c => c.status === "Resolved" || c.status === "Closed").length;
      const highPri = wc.filter(c => c.priority === "High" && c.status !== "Resolved" && c.status !== "Closed").length;
      const resoPct = total > 0 ? Math.round(((resolved) / total) * 100) : 100;
      const health = Math.min(100, Math.max(0, Math.round(
        resoPct * 0.5 + (total > 0 ? (1 - open / total) : 1) * 100 * 0.3 + Math.max(0, 100 - highPri * 20) * 0.2
      )));
      return { ward, total, open, health };
    });
  }, [complaints]);

  const getColor = (health: number) => {
    if (health >= 70) return "bg-emerald-100 border-emerald-200 hover:bg-emerald-200 text-emerald-800";
    if (health >= 40) return "bg-amber-100 border-amber-200 hover:bg-amber-200 text-amber-800";
    return "bg-red-200 border-red-300 hover:bg-red-300 text-red-800";
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
        Issue Heatmap by Ward
      </h3>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {wardData.map(({ ward, total, open, health }) => (
          <div
            key={ward}
            title={`${ward}: Health ${health}% · ${open} open / ${total} total`}
            className={`aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all ${getColor(health)}`}
          >
            <span className="text-[0.5rem] font-black uppercase leading-none opacity-70">{ward.replace("Ward ", "W")}</span>
            <span className="text-[0.65rem] font-black mt-0.5">{health}%</span>
            {open > 0 && (
              <span className="text-[0.45rem] font-black opacity-60">{open} open</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-200 inline-block border border-emerald-300" /> Healthy ≥70%</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-200 inline-block border border-amber-300" /> At Risk 40–69%</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-300 inline-block border border-red-400" /> Critical &lt;40%</span>
      </div>
    </div>
  );
}
