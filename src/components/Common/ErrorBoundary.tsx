import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Bliss Yoga Uncaught Error:', error, errorInfo);
  }

  public render() {
    const self = this as unknown as { state: State; props: Props };
    if (self.state?.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-[#121412] text-[#f4f1ea]">
          <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Something went unexpectedly wrong</h2>
          <p className="text-xs text-[#94a388] max-w-md mb-6">
            Our system captured an unexpected error. Please try refreshing the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-[#121412] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4" /> Reload Sanctuary
          </button>
        </div>
      );
    }

    return self.props?.children || null;
  }
}
