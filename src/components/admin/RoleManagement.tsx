import React from "react";
import { Shield, Building2, User, Edit2 } from "lucide-react";

const mock = [
  { id: 1, name: 'Chief Admin', role: 'admin', email: 'chief@gov.local', dept: 'District HQ', icon: Shield, color: 'bg-red-50 text-red-700 border-red-100' },
  { id: 2, name: 'Field Lead', role: 'officer', email: 'field1@gov.local', dept: 'Water Supply Department', icon: Building2, color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 3, name: 'Citizen Rep', role: 'citizen', email: 'citizen@gov.local', dept: 'Public', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
];

export default function RoleManagement() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
        Role &amp; Permission Management
      </h3>
      <div className="space-y-3">
        {mock.map(u => {
          const Icon = u.icon;
          return (
            <div
              key={u.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all group"
            >
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${u.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-base truncate">{u.name}</p>
                <p className="text-sm text-gray-400 font-medium truncate">{u.email}</p>
              </div>

              {/* Role badge */}
              <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-black uppercase tracking-widest border ${u.color} shrink-0`}>
                {u.role}
              </span>

              {/* Edit button */}
              <button className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
