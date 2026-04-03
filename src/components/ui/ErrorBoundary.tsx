import { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>Etwas ist schiefgelaufen</h2>
            <p>Ein unerwarteter Fehler ist aufgetreten.</p>
            {this.state.error && (
              <details className="error-details">
                <summary>Fehlerdetails</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <button onClick={() => window.location.reload()} className="error-reload-btn">
              App neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
