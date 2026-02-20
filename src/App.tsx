import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Grievances from "./pages/Grievances";
import Documents from "./pages/Documents";
import SpeechAI from "./pages/SpeechAI";
import Analytics from "./pages/Analytics";
import Mentions from "./pages/Mentions";
import AIAlerts from "./pages/AIAlerts";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import AIAssistant from "./components/AIAssistant";
import CommandPalette from "./components/CommandPalette";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/speech-ai" element={<SpeechAI />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/mentions" element={<Mentions />} />
        <Route path="/ai-alerts" element={<AIAlerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
      {/* Global overlays — available on every page */}
      <AIAssistant />
      <CommandPalette />
    </BrowserRouter>
  );
}

export default App;
