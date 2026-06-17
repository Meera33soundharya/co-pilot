import React from "react";
import { useComplaints } from "@/context/ComplaintsContext";

export default function NotificationCenter() {
  const { notifications } = useComplaints();

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        Notification Center
      </h3>
      <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
        {notifications.slice(0, 10).map(n => (
          <div key={n.id} className="p-2 rounded-lg border hover:bg-gray-50 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black">N</div>
            <div className="flex-1">
              <div className="text-sm font-black">{n.title}</div>
              <div className="text-xs text-gray-500">{n.message}</div>
            </div>
            <div className="text-xs text-gray-400">{n.time}</div>
          </div>
        ))}
        {notifications.length === 0 && <div className="text-xs text-gray-400">No notifications</div>}
      </div>
    </div>
  );
}
