import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="message-screen">
        <h1>Skill Studio hit a problem</h1>
        <p>Reload the page to try again. Your skills weren't changed.</p>
        <button type="button" className="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </main>
    );
  }
}
