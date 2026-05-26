import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { err, log, warn } from './lib/log';
import './styles.css';

log('BOOT', 'main.tsx loading', {
  href: window.location.href,
  ua: navigator.userAgent,
});

window.addEventListener('error', (e) => {
  err('WINDOW', 'Uncaught error:', e.message, e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  err('WINDOW', 'Unhandled promise rejection:', e.reason);
});

window.addEventListener('visibilitychange', () => {
  warn('WINDOW', 'visibilitychange →', document.visibilityState);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);

log('BOOT', 'React root rendered');
