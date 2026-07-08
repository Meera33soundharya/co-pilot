import React from "react";

const mock = [
  { id: 1, title: 'Bilateral Meeting with Trade Delegation', time: 'Jun 19, 2026 10:49 AM', status: 'Scheduled', place: 'State House' },
  { id: 2, title: 'Press Briefing on Healthcare Policy', time: 'Jun 17, 2026 10:49 AM', status: 'Scheduled', place: 'Press Conference Room' },
  { id: 3, title: 'Town Hall — North District', time: 'Jun 16, 2026 10:49 AM', status: 'Scheduled', place: 'North District Community Centre' },
  { id: 4, title: 'Budget Review with Finance Committee', time: 'Jun 15, 2026 10:49 AM', status: 'Scheduled', place: 'Parliament House, Room 4B' },
];

export default function MeetingsList() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
        Upcoming Meetings
      </h3>
      <div className="space-y-4">
        {mock.map(m => (
          <div key={m.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="font-black text-gray-900 mb-1 flex items-center gap-2 text-base flex-wrap">
                {m.title}
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{m.status}</span>
              </div>
              <div className="text-sm text-gray-500 font-bold">{m.time} &middot; {m.place}</div>
            </div>
            <div>
              <button className="px-5 py-2 rounded-xl bg-white border border-gray-200 text-sm font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all shadow-sm">
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
