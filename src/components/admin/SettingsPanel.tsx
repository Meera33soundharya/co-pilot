import React from "react";

export default function SettingsPanel() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
        System Settings
      </h3>
      <div className="space-y-4 text-base text-gray-600">
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">Enable Real-time Monitoring</div>
            <div className="text-sm text-gray-400 mt-0.5">Push updates to dashboards and portals</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">Enable AI Insights</div>
            <div className="text-sm text-gray-400 mt-0.5">Run predictive models and anomaly detection</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">Audit Logging</div>
            <div className="text-sm text-gray-400 mt-0.5">Keep full immutable audit trail</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>
      </div>
    </div>
  );
}
