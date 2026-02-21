import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import RewordGame from "./pages/RewordGame";
import PolicySimulator from "./pages/PolicySimulator";
import ExplainableAI from "./pages/ExplainableAI";
import AIAssistant from "./components/AIAssistant";
import CommandPalette from "./components/CommandPalette";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interactive-dashboard" element={<InteractiveDashboard />} />
        <Route path="/brainspark" element={<BrainSpark />} />
        <Route path="/study-buddy" element={<StudyBuddy />} />
        <Route path="/proverbs" element={<Proverbs />} />
        <Route path="/reword-game" element={<RewordGame />} />
        <Route path="/policy-simulator" element={<PolicySimulator />} />
        <Route path="/explainable-ai" element={<ExplainableAI />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/speech-ai" element={<SpeechAI />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/mentions" element={<Mentions />} />
        <Route path="/ai-alerts" element={<AIAlerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Global overlays — available on every page */}
      <AIAssistant />
      <CommandPalette />
    </BrowserRouter>
  );
}

export default App;
