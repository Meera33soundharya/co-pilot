import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, ArrowRight, CheckCircle2, Clock, Bot, User, Bell, Sparkles, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

// Defines the strict sequence of stages
type PipelineStage = 
  | "DRAFT" 
  | "AI_REVIEW" 
  | "ADMIN_APPROVAL" 
  | "SCHEDULED" 
  | "PUBLISHED" 
  | "ARCHIVED";

interface QueueItem {
  id: number;
  title: string;
  source: string;
  status: PipelineStage;
  dueDate?: string;
  assignedResponder: string;
  
  // AI Review data
  aiReviewResult?: "PASS" | "FLAGGED";
  aiFlagReason?: string;
  
  // Admin Approval data
  approvedBy?: string;
  approvedAt?: string;
  
  // Scheduling data
  publishDate?: string;

  // Notification data (Post-Published)
  notificationStatus?: "PENDING" | "DELIVERED";
  
  // Audit trail
  history: { stage: PipelineStage; by: string; timestamp: string }[];
}

const INITIAL_QUEUE: QueueItem[] = [
  { 
    id: 1, title: "Youth Employment Scheme", source: "Reuters", status: "DRAFT", dueDate: "Jun 17", assignedResponder: "Press Sec", 
    history: [{ stage: "DRAFT", by: "Press Sec", timestamp: new Date().toISOString() }] 
  },
  { 
    id: 2, title: "Food Security Initiative", source: "National Tribune", status: "AI_REVIEW", dueDate: "Jun 16", assignedResponder: "Comm Director",
    history: [{ stage: "DRAFT", by: "Comm Director", timestamp: new Date().toISOString() }, { stage: "AI_REVIEW", by: "Comm Director", timestamp: new Date().toISOString() }]
  },
  { 
    id: 3, title: "Infrastructure Bill Progress", source: "The Daily Record", status: "ADMIN_APPROVAL", assignedResponder: "Minister Office",
    aiReviewResult: "PASS",
    history: [{ stage: "DRAFT", by: "Minister Office", timestamp: new Date().toISOString() }, { stage: "ADMIN_APPROVAL", by: "System (AI)", timestamp: new Date().toISOString() }]
  }
];

// Helper to check valid transitions
const isValidTransition = (from: PipelineStage, to: PipelineStage): boolean => {
  const flow: Record<PipelineStage, PipelineStage[]> = {
    "DRAFT": ["AI_REVIEW"],
    "AI_REVIEW": ["ADMIN_APPROVAL", "DRAFT"], // Can fail back to DRAFT
    "ADMIN_APPROVAL": ["SCHEDULED", "DRAFT"], // Can be rejected back to DRAFT
    "SCHEDULED": ["PUBLISHED", "DRAFT"], // Can be pulled back to DRAFT
    "PUBLISHED": ["ARCHIVED"],
    "ARCHIVED": []
  };
  return flow[from]?.includes(to) || false;
};

export default function MediaQueue() {
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem("politico_media_queue_v2");
    if (saved) return JSON.parse(saved);
    return INITIAL_QUEUE;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newResponder, setNewResponder] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  
  // Scheduling modal state
  const [showScheduleModal, setShowScheduleModal] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    localStorage.setItem("politico_media_queue_v2", JSON.stringify(queue));
  }, [queue]);

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSource || !newResponder) return;

    const newItem: QueueItem = {
      id: Date.now(),
      title: newTitle,
      source: newSource,
      assignedResponder: newResponder,
      status: "DRAFT",
      dueDate: newDueDate || undefined,
      history: [{ stage: "DRAFT", by: "Current User", timestamp: new Date().toISOString() }]
    };

    setQueue(prev => [...prev, newItem]);
    setNewTitle("");
    setNewSource("");
    setNewResponder("");
    setNewDueDate("");
    setShowAddForm(false);
  };

  const deleteItem = (id: number) => {
    if (window.confirm("Delete this response permanently?")) {
      setQueue(prev => prev.filter(item => item.id !== id));
    }
  };

  const advanceStage = (id: number, to: PipelineStage, updates: Partial<QueueItem> = {}) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        if (!isValidTransition(item.status, to)) {
          alert(`Invalid pipeline transition from ${item.status} to ${to}`);
          return item;
        }
        return {
          ...item,
          ...updates,
          status: to,
          history: [...item.history, { stage: to, by: "Current User", timestamp: new Date().toISOString() }]
        };
      }
      return item;
    }));
  };

  const handleSimulateAIReview = (id: number) => {
    // Simulate AI taking 1 second then deciding pass/fail
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: "AI_REVIEW" } : item));
    
    setTimeout(() => {
      const passes = Math.random() > 0.3; // 70% pass rate
      if (passes) {
        advanceStage(id, "ADMIN_APPROVAL", { aiReviewResult: "PASS", aiFlagReason: undefined });
      } else {
        advanceStage(id, "DRAFT", { 
          aiReviewResult: "FLAGGED", 
          aiFlagReason: "Tone is too aggressive and contradicts recent policy statement regarding rural development." 
        });
      }
    }, 1500);
  };

  const handleApprove = (id: number) => {
    setShowScheduleModal(id);
  };

  const confirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (showScheduleModal && scheduleDate) {
      advanceStage(showScheduleModal, "SCHEDULED", { 
        approvedBy: "Admin User", 
        approvedAt: new Date().toISOString(),
        publishDate: scheduleDate
      });
      setShowScheduleModal(null);
      setScheduleDate("");
    }
  };

  const handlePublish = (id: number) => {
    advanceStage(id, "PUBLISHED", { notificationStatus: "PENDING" });
    
    // Simulate Citizen Notification delivery after 2 seconds
    setTimeout(() => {
      setQueue(prev => prev.map(item => item.id === id ? { ...item, notificationStatus: "DELIVERED" } : item));
    }, 2000);
  };

  const drafts = queue.filter(item => item.status === "DRAFT");
  const aiReview = queue.filter(item => item.status === "AI_REVIEW");
  const adminApproval = queue.filter(item => item.status === "ADMIN_APPROVAL");
  const scheduled = queue.filter(item => item.status === "SCHEDULED");
  const published = queue.filter(item => item.status === "PUBLISHED");

  const renderCard = (item: QueueItem, actions: React.ReactNode) => (
    <div key={item.id} className="bg-gray-50 border border-gray-100 p-5 rounded-[1.5rem] hover:border-red-200 transition-all shadow-sm group relative flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-gray-900 font-black text-lg italic tracking-tight group-hover:text-[#C81D25] leading-tight">{item.title}</h4>
        <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-300 hover:text-red-600 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {item.aiReviewResult === "FLAGGED" && item.status === "DRAFT" && (
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-orange-800 text-sm font-bold flex gap-2 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
          <span className="leading-tight">AI Flagged: {item.aiFlagReason}</span>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest">
        <div className="text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md">
          {item.source}
        </div>
        <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
          <User className="w-3 h-3" /> {item.assignedResponder}
        </div>
        {item.dueDate && item.status === "DRAFT" && (
          <div className="text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" /> Due {item.dueDate}
          </div>
        )}
        {item.publishDate && item.status === "SCHEDULED" && (
          <div className="text-purple-600 bg-purple-50 px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pub: {item.publishDate}
          </div>
        )}
      </div>

      {item.status === "PUBLISHED" && (
        <div className={`mt-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${item.notificationStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          <Bell className="w-4 h-4" />
          Citizen Notification: {item.notificationStatus}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-2 pt-3 border-t border-gray-200/50 flex items-center justify-between">
        {actions}
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      title="Media Queue" 
      subtitle="Strict 8-stage pipeline for press queries and official responses."
      actions={
        <button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-3 bg-[#C81D25] hover:bg-[#a01520] text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Media
        </button>
      }
    >
      <div className="min-h-[500px] relative w-full overflow-x-auto pb-6">
        
        {/* Create Response Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 uppercase italic">New Press Response</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Response Topic *</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Youth Employment Scheme" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">News Outlet / Source *</label>
                  <input type="text" required value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="e.g. Reuters, BBC" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Assigned Responder *</label>
                  <input type="text" required value={newResponder} onChange={e => setNewResponder(e.target.value)} placeholder="e.g. Press Secretary" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-400">Due Date (Optional)</label>
                  <input type="text" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} placeholder="e.g. Jun 17" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" className="w-full py-4 bg-[#C81D25] hover:bg-[#a01520] text-white text-base font-black uppercase tracking-widest transition-all rounded-2xl shadow-lg active:scale-95">
                  Submit to Draft
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
              <h3 className="text-lg font-black text-gray-900 uppercase italic mb-4">Schedule Publish Date</h3>
              <form onSubmit={confirmSchedule} className="space-y-4">
                <input type="datetime-local" required value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all shadow-inner" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowScheduleModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex gap-6 min-w-max">
          
          {/* Draft Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 flex flex-col shadow-xl w-80">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-gray-400 font-black text-sm tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"/> DRAFT</h3>
              <span className="text-gray-900 bg-gray-100 rounded-full px-3 py-1 font-black text-sm">{drafts.length}</span>
            </div>
            <div className="space-y-4 flex-1">
              {drafts.map(item => renderCard(item, 
                <button onClick={() => advanceStage(item.id, "AI_REVIEW")} className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
                  Send to AI Review <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Review Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 flex flex-col shadow-xl w-80 border-t-4 border-t-purple-500">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-purple-600 font-black text-sm tracking-widest uppercase flex items-center gap-2"><Bot className="w-4 h-4"/> AI REVIEW</h3>
              <span className="text-purple-900 bg-purple-100 rounded-full px-3 py-1 font-black text-sm">{aiReview.length}</span>
            </div>
            <div className="space-y-4 flex-1">
              {aiReview.map(item => renderCard(item, 
                <button onClick={() => handleSimulateAIReview(item.id)} className="w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Run Fact/Tone Check
                </button>
              ))}
            </div>
          </div>

          {/* Admin Approval Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 flex flex-col shadow-xl w-80">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-amber-500 font-black text-sm tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> ADMIN APPROVAL</h3>
              <span className="text-amber-900 bg-amber-100 rounded-full px-3 py-1 font-black text-sm">{adminApproval.length}</span>
            </div>
            <div className="space-y-4 flex-1">
              {adminApproval.map(item => renderCard(item, 
                <div className="flex w-full gap-2">
                  <button onClick={() => advanceStage(item.id, "DRAFT")} className="flex-1 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-1">
                    Reject
                  </button>
                  <button onClick={() => handleApprove(item.id)} className="flex-[2] py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-1">
                    Approve <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 flex flex-col shadow-xl w-80">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-blue-500 font-black text-sm tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> SCHEDULED</h3>
              <span className="text-blue-900 bg-blue-100 rounded-full px-3 py-1 font-black text-sm">{scheduled.length}</span>
            </div>
            <div className="space-y-4 flex-1">
              {scheduled.map(item => renderCard(item, 
                <button onClick={() => handlePublish(item.id)} className="w-full py-2 bg-[#C81D25] text-white hover:bg-[#991717] rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 shadow-md">
                  Publish Now <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Published Column */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 flex flex-col shadow-xl w-80">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-emerald-500 font-black text-sm tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> PUBLISHED</h3>
              <span className="text-emerald-900 bg-emerald-100 rounded-full px-3 py-1 font-black text-sm">{published.length}</span>
            </div>
            <div className="space-y-4 flex-1">
              {published.map(item => renderCard(item, 
                <button onClick={() => advanceStage(item.id, "ARCHIVED")} className="w-full py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
                  Move to Archive
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
