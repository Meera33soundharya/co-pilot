import React from "react";

const draft = [
  { id: 1, title: 'Youth Employment Response', source: 'Reuters', due: 'Jun 17' },
  { id: 2, title: 'Food Security', source: 'National Tribune', due: 'Jun 16' },
];

const approved = [
  { id: 3, title: 'Infrastructure Bill', source: 'The Daily Record' },
];

const published = [
  { id: 4, title: 'Foreign Policy', source: 'BBC Africa' },
];

export default function MediaQueueBoard() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        Media Queue
      </h3>
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-black uppercase text-gray-400 mb-2">Draft</div>
          <div className="space-y-2">
            {draft.map(d => (
              <div key={d.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors">
                <div className="font-black text-gray-900 mb-1">{d.title}</div>
                <div className="text-xs font-bold text-gray-500">{d.source} &middot; Due {d.due}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-gray-400 mb-2">Approved</div>
          <div className="space-y-2">
            {approved.map(a => (
              <div key={a.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors">
                <div className="font-black text-gray-900 mb-1">{a.title}</div>
                <div className="text-xs font-bold text-gray-500">{a.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-gray-400 mb-2">Published</div>
          <div className="space-y-2">
            {published.map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors">
                <div className="font-black text-gray-900 mb-1">{p.title}</div>
                <div className="text-xs font-bold text-gray-500">{p.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
