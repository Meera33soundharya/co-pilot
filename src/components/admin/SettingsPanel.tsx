import { useLanguage } from "@/context/LanguageContext";
import React from "react";

export default function SettingsPanel() {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
        {t("admin.systemSettings", "System Settings")}
      </h3>
      <div className="space-y-4 text-base text-gray-600">
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">{t("admin.realtimeMonitoring", "Enable Real-time Monitoring")}</div>
            <div className="text-sm text-gray-400 mt-0.5">{t("admin.realtimeMonitoringDesc", "Push updates to dashboards and portals")}</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">{t("admin.aiInsights", "Enable AI Insights")}</div>
            <div className="text-sm text-gray-400 mt-0.5">{t("admin.aiInsightsDesc", "Run predictive models and anomaly detection")}</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <div>
            <div className="font-black text-gray-900">{t("admin.auditLogging", "Audit Logging")}</div>
            <div className="text-sm text-gray-400 mt-0.5">{t("admin.auditLoggingDesc", "Keep full immutable audit trail")}</div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#B91C1C]" />
        </div>
      </div>
    </div>
  );
}
