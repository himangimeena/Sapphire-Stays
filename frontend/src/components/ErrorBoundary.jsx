import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Anti-Gravity Error Boundary intercepted a crash:", error, errorInfo);
  }

  handleReset = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050E1A] flex items-center justify-center px-4 py-12 text-slate-100 font-sans">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl text-center space-y-6 bg-[#0B131E]">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">Portal Safeguard</span>
              <h1 className="font-serif text-2xl font-bold">Premium Portal Recovered</h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                An unexpected component rendering issue was intercepted. The Anti-Gravity shield prevented a white screen crash.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left font-mono text-[10px] text-slate-400 overflow-x-auto max-h-32">
              {this.state.error?.toString() || "Unknown rendering exception"}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button 
                onClick={this.handleReload} 
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F4E3B2] text-[#050E1A] font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                <RefreshCw className="w-4 h-4" /> Try Reloading Portal
              </button>
              
              <button 
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Home className="w-4 h-4" /> Reset Session & Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
