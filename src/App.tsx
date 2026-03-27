import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ComplaintsProvider } from "@/context/ComplaintsContext";
import { useComplaints } from "@/context/ComplaintsContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Grievances from "./pages/Grievances";
import Documents from "./pages/Documents";
import SpeechAI from "./pages/SpeechAI";
import Analytics from "./pages/Analytics";
import Mentions from "./pages/Mentions";
import AIAlerts from "./pages/AIAlerts";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import InteractiveDashboard from "./pages/InteractiveDashboard";
import BrainSpark from "./pages/BrainSpark";
import StudyBuddy from "./pages/StudyBuddy";
import Proverbs from "./pages/Proverbs";
import PolicySimulator from "./pages/PolicySimulator";
import ExplainableAI from "./pages/ExplainableAI";
import Schedule from "./pages/Schedule";
import CitizenPortal from "./pages/CitizenPortal";
import CitizenModule from "./pages/CitizenModule";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import CitizenModuleGuide from "./pages/CitizenModuleGuide";
import ScheduleOperationGuide from "./pages/ScheduleOperationGuide";
import Heatmap from "./pages/Heatmap";
import PeopleManagement from "./pages/PeopleManagement";
import FieldPortal from "./pages/FieldPortal";
import Landing from "./pages/Landing";
import AIAssistant from "./components/AIAssistant";
import CommandPalette from "./components/CommandPalette";
import { Toaster } from 'sonner';

// 🔒 Route Guard - redirect to /login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useComplaints();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ComplaintsProvider>
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(17, 17, 17, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1.5rem',
          }
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-complaint" element={<CitizenPortal />} />

          {/* Protected pages */}
          <Route path="/citizen" element={<ProtectedRoute><CitizenModule /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/field-portal" element={<ProtectedRoute><FieldPortal /></ProtectedRoute>} />
          <Route path="/interactive-dashboard" element={<ProtectedRoute><InteractiveDashboard /></ProtectedRoute>} />
          <Route path="/brainspark" element={<ProtectedRoute><BrainSpark /></ProtectedRoute>} />
          <Route path="/study-buddy" element={<ProtectedRoute><StudyBuddy /></ProtectedRoute>} />
          <Route path="/proverbs" element={<ProtectedRoute><Proverbs /></ProtectedRoute>} />
          <Route path="/policy-simulator" element={<ProtectedRoute><PolicySimulator /></ProtectedRoute>} />
          <Route path="/explainable-ai" element={<ProtectedRoute><ExplainableAI /></ProtectedRoute>} />
          <Route path="/grievances" element={<ProtectedRoute><Grievances /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/speech-ai" element={<ProtectedRoute><SpeechAI /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/mentions" element={<ProtectedRoute><Mentions /></ProtectedRoute>} />
          <Route path="/ai-alerts" element={<ProtectedRoute><AIAlerts /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/citizen-guide" element={<ProtectedRoute><CitizenModuleGuide /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule-guide" element={<ProtectedRoute><ScheduleOperationGuide /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute><PeopleManagement /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global overlays */}
        <AIAssistant />
        <CommandPalette />
      </BrowserRouter>
    </ComplaintsProvider>
  );
}

export default App;
