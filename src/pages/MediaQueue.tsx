import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface QueueItem {
  id: number;
  title: string;
  source: string;
  status: "DRAFT" | "APPROVED" | "PUBLISHED";
  dueDate?: string;
}

const INITIAL_QUEUE: QueueItem[] = [
  { id: 1, title: "Youth Employment Scheme", source: "Reuters", status: "DRAFT", dueDate: "Due Jun 17" },
  { id: 2, title: "Food Security Initiative", source: "National Tribune", status: "DRAFT", dueDate: "Due Jun 16" },
  { id: 3, title: "Infrastructure Bill Progress", source: "The Daily Record", status: "APPROVED" },
  { id: 4, title: "Foreign Policy Alignment", source: "BBC Africa", status: "PUBLISHED" }
];

export default function MediaQueue() {
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem("politico_media_queue");
    return saved ? JSON.parse(saved) : INITIAL_QUEUE;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newStatus, setNewStatus] = useState<"DRAFT" | "APPROVED" | "PUBLISHED">("DRAFT");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    localStorage.setItem("politico_media_queue", JSON.stringify(queue));
  }, [queue]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSource) return;

    const newItem: QueueItem = {
      id: Date.now(),
      title: newTitle,
      source: newSource,
      status: newStatus,
      dueDate: newDueDate ? `Due ${newDueDate}` : undefined
    };

    setQueue(prev => [...prev, newItem]);
    setNewTitle("");
    setNewSource("");
    setNewDueDate("");
    setNewStatus("DRAFT");
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: number) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateStatus = (id: number, status: "DRAFT" | "APPROVED" | "PUBLISHED") => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const drafts = queue.filter(item => item.status === "DRAFT");
  const approved = queue.filter(item => item.status === "APPROVED");
  const published = queue.filter(item => item.status === "PUBLISHED");

  return (
    <DashboardLayout 
      title="Media Queue" 
      subtitle="Manage press queries and official responses."
      actions={
        <button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-3 bg-[#B91C1C] hover:bg-[#991717] text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Response
        </button>
      }
    >
      <div className="min-h-[500px] relative">
        {/* Create Response Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 uppercase italic">New Press Response</h3>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Response Topic *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Youth Employment Scheme" 
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">News Outlet / Source *</label>
                  <input 
                    type="text" 
                    required 
                    value={newSource} 
                    onChange={e => setNewSource(e.target.value)}
                    placeholder="e.g. Reuters, BBC" 
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Initial Status</label>
                    <select 
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Due Date (Optional)</label>
                    <input 
                      type="text" 
                      value={newDueDate} 
                      onChange={e => setNewDueDate(e.target.value)}
                      placeholder="e.g. Jun 17" 
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-[#B91C1C] hover:bg-[#991717] text-white text-base font-black uppercase tracking-widest transition-all rounded-2xl shadow-lg active:scale-95"
                >
                  Create Press Response
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Draft Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-sm tracking-widest uppercase">DRAFT</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-base">{drafts.length}</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {drafts.map(item => (
                <div key={item.id} className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-red-200 hover:bg-red-50/30 transition-all shadow-sm group relative">
                  <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-red-700">{item.title}</h4>
                  <div className="text-gray-500 text-base font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                    <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-sm">📄</span>
                    {item.source}
                  </div>
                  {item.dueDate && (
                    <div className="text-red-600 bg-red-50 w-fit px-3 py-1.5 rounded-lg text-base font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-4 bg-white rounded-full inline-flex items-center justify-center text-sm shadow-sm">🕒</span>
                      {item.dueDate}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStatus(item.id, "APPROVED")}
                      className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Approve <ArrowRight className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-sm tracking-widest uppercase">APPROVED</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-base">{approved.length}</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {approved.map(item => (
                <div key={item.id} className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm group relative">
                  <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-blue-700">{item.title}</h4>
                  <div className="text-gray-500 text-base font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-sm">📄</span>
                    {item.source}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStatus(item.id, "DRAFT")}
                      className="text-[9px] font-black uppercase text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Draft
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, "PUBLISHED")}
                      className="text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      Publish <ArrowRight className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Published Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gray-400 font-black text-sm tracking-widest uppercase">PUBLISHED</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-base">{published.length}</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {published.map(item => (
                <div key={item.id} className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-emerald-200 hover:bg-emerald-50/30 transition-all shadow-sm group relative">
                  <h4 className="text-gray-900 font-black text-lg italic tracking-tight mb-4 group-hover:text-emerald-700">{item.title}</h4>
                  <div className="text-gray-500 text-base font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-200 rounded-md inline-flex items-center justify-center text-sm">📄</span>
                    {item.source}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStatus(item.id, "APPROVED")}
                      className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Approve
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
