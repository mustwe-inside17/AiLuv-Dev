import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props { 
  children: ReactNode; 
  fallback?: ReactNode; 
}

interface State { 
  hasError: boolean; 
  error?: Error; 
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full min-h-[50vh] bg-slate-950 text-slate-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">😢</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">ระบบพบข้อผิดพลาด</h1>
            <div className="bg-slate-950 rounded-lg p-3 w-full mb-6 max-h-32 overflow-auto text-left border border-slate-800">
              <p className="text-pink-400 font-mono text-xs break-words">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={this.handleReset} 
                className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20"
              >
                ลองอีกครั้ง (Try Again)
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all border border-slate-700"
              >
                รีเฟรชหน้าต่าง (Refresh Page)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
