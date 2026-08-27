import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '../lib/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-100">Ops! Algo inesperado aconteceu</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ocorreu um erro no Zola Books. A nossa equipa foi notificada automaticamente em tempo real via Sentry.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
                {String(this.state.error.message || this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Recarregar Aplicação Zola Books
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


