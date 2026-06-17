import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type NavItem = { icon?: any; label: string; path: string; badge?: string };
type NavGroup = { group: string; items: NavItem[] };

export default function AdminSlide({ open, onClose, navGroups }: { open: boolean; onClose: () => void; navGroups: NavGroup[] }) {
  if (!open) return null;
  return (
    <div>
      <div className="fixed inset-0 z-60 bg-black/40" onClick={onClose} />
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white z-70 shadow-2xl border-r border-gray-100 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black">Admin Quick Nav</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>

        {navGroups.map(g => (
          <div key={g.group} className="mb-4">
            <p className="text-xs font-black uppercase text-gray-400 mb-2">{g.group}</p>
            <div className="space-y-2">
              {g.items.map(it => (
                <NavLink key={it.path} to={it.path} onClick={onClose} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-gray-100 rounded-sm" />
                    <span className="font-bold text-sm text-gray-700">{it.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
