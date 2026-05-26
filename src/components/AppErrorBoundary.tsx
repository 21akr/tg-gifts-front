import { Component, ErrorInfo, ReactNode } from 'react';
import { err } from '../lib/log';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    err('REACT', 'Render crashed:', error);
    err('REACT', 'Component stack:', info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            margin: 24,
            border: '1px solid var(--error, #dc2626)',
            borderRadius: 12,
            background: 'var(--error-soft, #fee2e2)',
            color: 'var(--error, #dc2626)',
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            fontSize: 13,
            whiteSpace: 'pre-wrap',
            maxWidth: 600,
          }}
        >
          <strong>Render error — captured by boundary</strong>
          {'\n\n'}
          {this.state.error.message}
          {this.state.error.stack ? '\n\n' + this.state.error.stack : ''}
          {'\n\n'}
          Open DevTools → Console for full details (filtered: <code>[REACT]</code>).
        </div>
      );
    }
    return this.props.children;
  }
}
