import React from "react";
import { Plus, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function SpeechStudio() {
  return (
    <DashboardLayout 
      title="Speech Studio" 
      subtitle="Draft, review, and manage all speeches."
      actions={
        <button className="flex items-center gap-3 bg-[#B91C1C] hover:bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl">
          <Plus className="w-4 h-4" /> New Speech
        </button>
      }
    >
      <div className="w-full">
        <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-xl flex flex-col">
          
          <div className="divide-y divide-gray-50 flex-1 space-y-4">
            
            {/* Card 1 */}
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-gray-900 font-black text-2xl italic uppercase tracking-tight">Healthcare Reform Address</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-black px-3 py-1 rounded-xl uppercase tracking-widest ml-auto">Final</span>
              </div>
              <p className="text-gray-500 font-medium mb-6">Health Ministry Annual Conference</p>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-base font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Health Professionals, Policy Makers
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Jun 25, 2026
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Persuasive Tone
                </div>
                <div className="flex items-center gap-2 ml-auto text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <FileText className="w-4 h-4 text-red-600" /> 126 chars
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer group shadow-sm mt-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-gray-900 font-black text-2xl italic uppercase tracking-tight">Independence Day Keynote</h3>
                <span className="bg-amber-50 text-amber-700 border border-amber-100 text-sm font-black px-3 py-1 rounded-xl uppercase tracking-widest ml-auto">Draft</span>
              </div>
              <p className="text-gray-500 font-medium mb-6">National Independence Day Celebrations</p>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-base font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  General Public, National Media
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Aug 15, 2026
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Inspirational Tone
                </div>
                <div className="flex items-center gap-2 ml-auto text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 border-dashed">
                  <FileText className="w-4 h-4 opacity-50" /> No content
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer group shadow-sm mt-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-gray-900 font-black text-2xl italic uppercase tracking-tight">National Budget Day Address</h3>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-sm font-black px-3 py-1 rounded-xl uppercase tracking-widest ml-auto">Reviewed</span>
              </div>
              <p className="text-gray-500 font-medium mb-6">Annual Budget Presentation</p>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-base font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Parliament and National Media
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Jul 1, 2026
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Formal Tone
                </div>
                <div className="flex items-center gap-2 ml-auto text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <FileText className="w-4 h-4 text-red-600" /> 161 chars
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
