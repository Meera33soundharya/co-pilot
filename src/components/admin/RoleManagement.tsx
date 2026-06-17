import React from "react";

const mock = [
  { id: 1, name: 'Chief Admin', role: 'admin', email: 'chief@gov.local' },
  { id: 2, name: 'Field Lead', role: 'officer', email: 'field1@gov.local' },
  { id: 3, name: 'Citizen Rep', role: 'citizen', email: 'citizen@gov.local' },
];

export default function RoleManagement() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        Role & Permission Management
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Role</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mock.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-black">{u.name}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <button className="px-4 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all shadow-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
