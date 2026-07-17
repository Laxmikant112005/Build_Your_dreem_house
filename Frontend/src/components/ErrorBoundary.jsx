import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
          <div className="max-w-md text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-6">We're sorry, an unexpected error occurred.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-navy text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-colors shadow-lg"
              >
                Reload App
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left bg-slate-100 p-4 rounded-2xl">
                <summary className="font-bold cursor-pointer mb-2">Error details (dev only)</summary>
                <pre className="text-xs text-slate-700 font-mono bg-slate-200 p-3 rounded-xl overflow-auto max-h-40">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

