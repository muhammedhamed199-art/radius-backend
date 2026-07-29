import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Force unregister any existing service workers to prevent aggressive mobile caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// 2. Clear all existing caches used by service workers or other aggressive caching mechanisms
if ('caches' in window) {
  caches.keys().then((names) => {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // @ts-ignore
  public state: ErrorBoundaryState;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fee', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

window.addEventListener('error', (e) => {
  if (
    e.message && 
    (e.message.includes('WebSocket') || e.message.includes('rate limit') || e.message.includes('Rate exceeded') || e.message.includes('ResizeObserver') || e.message.includes('Script error'))
  ) {
    e.preventDefault();
    return;
  }
  console.error("Global Error caught:", e.message, e.filename, e.lineno, e.colno, e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  const reasonStr = typeof reason === 'string' ? reason : reason?.message || reason?.stack || '';
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('rate limit') ||
    reasonStr.includes('Rate exceeded') ||
    reasonStr.includes('Failed to fetch')
  ) {
    e.preventDefault();
    return;
  }
  console.warn("Unhandled Promise Rejection:", reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
