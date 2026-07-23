import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-[#0A0F1C] text-white flex items-center justify-center px-6">
          <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-white/50">GovPilot</p>
            <h1 className="mt-4 text-2xl font-black">Something went wrong</h1>
            <p className="mt-3 text-base text-white/70">
              The app hit a runtime error. Refreshing the page should restore the dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-[#B91C1C] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-red-700"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
