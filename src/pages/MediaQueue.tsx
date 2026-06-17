import React from "react";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function MediaQueue() {
  return (
    <DashboardLayout 
      title="Media Queue" 
      subtitle="Manage press queries and official responses."
      actions={
        <button className="flex items-center gap-3 bg-[#B91C1C] hover:bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl">
          <Plus className="w-4 h-4" /> New Response
        </button>
      }
    >
      <div className="min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Draft Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-[10px] tracking-widest uppercase">DRAFT</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-xs">2</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {/* Card 1 */}
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer shadow-sm group">
                <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-red-700">Youth Employme...</h4>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-[10px]">📄</span>
                  Reuters
                </div>
                <div className="text-red-600 bg-red-50 w-fit px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-4 bg-white rounded-full inline-flex items-center justify-center text-[10px] shadow-sm">🕒</span>
                  Due Jun 17
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer shadow-sm group">
                <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-red-700">Food Security</h4>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-[10px]">📄</span>
                  National Tribune
                </div>
                <div className="text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-4 bg-white rounded-full inline-flex items-center justify-center text-[10px] shadow-sm">🕒</span>
                  Due Jun 16
                </div>
              </div>
            </div>
          </div>

          {/* Approved Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-[10px] tracking-widest uppercase">APPROVED</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-xs">1</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {/* Card 1 */}
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm group">
                <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-blue-700">Infrastructure Bill</h4>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-[10px]">📄</span>
                  The Daily Record
                </div>
              </div>
            </div>
          </div>

          {/* Published Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-[10px] tracking-widest uppercase">PUBLISHED</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-xs">1</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {/* Card 1 */}
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-sm group">
                <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-emerald-700">Foreign Policy</h4>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-[10px]">📄</span>
                  BBC Africa
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
