import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Constituency() {
  return (
    <DashboardLayout title="Constituency" subtitle="Constituency insights & scores">
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-black text-lg">Constituency Insights</h2>
          <p className="text-lg text-gray-500">Health scores, trends, and affected populations per ward.</p>
          <div className="mt-4 text-lg text-gray-600">Placeholder: constituency list, KPIs and filters.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
