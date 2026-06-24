import React from "react";

export default function SettingsPanel() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
        System Settings
      </h3>
      <div className="space-y-3 text-lg text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black">Enable Real-time Monitoring</div>
            <div className="text-base text-gray-400">Push updates to dashboards and portals</div>
          </div>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-black">Enable AI Insights</div>
            <div className="text-base text-gray-400">Run predictive models and anomaly detection</div>
          </div>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-black">Audit Logging</div>
            <div className="text-base text-gray-400">Keep full immutable audit trail</div>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
    </div>
  );
}
