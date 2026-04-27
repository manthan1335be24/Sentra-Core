/**
 * Error Boundary component for catching React errors
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-sentra-bg text-white p-6">
          <div className="bg-sentra-glass border border-red-500/50 rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-black text-red-500 mb-4">⚠️ SYSTEM ERROR</h2>
            <p className="text-sm text-slate-300 mb-2 font-mono">
              {this.state.error?.message}
            </p>
            {this.state.errorInfo && (
              <details className="text-xs text-slate-500 mb-4 bg-black/30 p-2 rounded overflow-auto max-h-32">
                <summary className="cursor-pointer">Stack Trace</summary>
                <pre className="mt-2 text-[10px]">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.resetError}
                className="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/40 text-red-500 rounded-xl hover:bg-red-500/20 transition-all duration-300"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-slate-500/10 border border-slate-500/40 text-slate-300 rounded-xl hover:bg-slate-500/20 transition-all duration-300"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}