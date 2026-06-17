import React from "react";

const logs = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  text: `User admin performed action ${i + 1}`,
  time: `${i + 1}m ago`,
}));

export default function AuditLogs() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        Audit Logs
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto text-sm text-gray-600">
        {logs.map(l => (
          <div key={l.id} className="flex justify-between items-start gap-3 p-2 rounded hover:bg-gray-50">
            <div>{l.text}</div>
            <div className="text-xs text-gray-400">{l.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
