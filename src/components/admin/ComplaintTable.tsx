import React, { useMemo, useState } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

export default function ComplaintTable() {
  const { complaints } = useComplaints();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      // Requirements: Voice Assistant complaints should only appear in the Assigned list
      if (c.source === "voice" && status !== "Assigned") return false;
      
      if (status !== "All" && c.status !== status) return false;
      if (q && !(`${c.issue} ${c.description} ${c.ward}`.toLowerCase()).includes(q.toLowerCase())) return false;
      return true;
    });
  }, [complaints, q, status]);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
          Complaint Assignment & Monitoring
        </h3>
        <div className="flex items-center gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search complaints" className="px-3 py-1.5 rounded-lg border text-sm" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border text-sm">
            <option>All</option>
            <option>New</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Ward</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 40).map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-black">{c.id}</td>
                <td className="p-3">{c.issue}</td>
                <td className="p-3">{c.ward}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{c.assignedTo ?? "—"}</td>
                <td className="p-3">{c.priority ?? "Normal"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
