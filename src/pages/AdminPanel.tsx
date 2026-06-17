import { Navigate } from "react-router-dom";

// Admin Panel is now merged into the main Dashboard
export default function AdminPanel() {
  return <Navigate to="/dashboard" replace />;
}
