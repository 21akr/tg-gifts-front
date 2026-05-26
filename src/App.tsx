import { useEffect, useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { SupportCreator } from './components/SupportCreator';
import { PhoneScreen } from './screens/Phone';
import { CodeScreen } from './screens/Code';
import { PasswordScreen } from './screens/Password';
import { GiftScreen } from './screens/Gift';
import { log } from './lib/log';

type Step = 'phone' | 'code' | 'password' | 'gift';

const SESSION_KEY = 'stargift.sessionToken';

export function App() {
  const [step, setStep] = useState<Step>('phone');
  const [authId, setAuthId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    log('APP', 'mount → localStorage token present?', !!saved);
    if (saved) {
      setSessionToken(saved);
      setStep('gift');
    }
  }, []);

  useEffect(() => {
    log('APP', 'step =', step, 'hasToken =', !!sessionToken);
  }, [step, sessionToken]);

  const onCodeSent = (id: string, phone: string) => {
    setAuthId(id);
    setPhoneNumber(phone);
    setStep('code');
  };

  const onAuthenticated = (token: string) => {
    localStorage.setItem(SESSION_KEY, token);
    setSessionToken(token);
    setAuthId(null);
    setStep('gift');
  };

  const onPasswordRequired = () => {
    setStep('password');
  };

  const restartAuth = () => {
    setAuthId(null);
    setPhoneNumber('');
    setStep('phone');
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
    restartAuth();
  };

  const openSupportFromFooter = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSupportOpen(true);
  };

  return (
    <div className="app">
      <ThemeToggle />
      <SupportCreator open={supportOpen} onOpenChange={setSupportOpen} />

      <div className="brand">
        <div className="brand-mark">
          <StarIcon />
        </div>
        <span className="brand-name">Stargift</span>
      </div>

      {step === 'phone' && <PhoneScreen onCodeSent={onCodeSent} />}

      {step === 'code' && authId && (
        <CodeScreen
          authId={authId}
          phoneNumber={phoneNumber}
          onAuthenticated={onAuthenticated}
          onPasswordRequired={onPasswordRequired}
          onBack={restartAuth}
        />
      )}

      {step === 'password' && authId && (
        <PasswordScreen
          authId={authId}
          onAuthenticated={onAuthenticated}
          onBack={restartAuth}
        />
      )}

      {step === 'gift' && sessionToken && (
        <GiftScreen sessionToken={sessionToken} onLogout={onLogout} />
      )}

      <div className="footer">
        Sessions are temporary and stored locally. Stars come from your own
        Telegram account.
        <div className="footer-support">
          Built by{' '}
          <a
            href="https://t.me/v21akr"
            target="_blank"
            rel="noopener noreferrer"
          >
            @v21akr
          </a>
          <span className="footer-dot">·</span>
          <button
            type="button"
            className="footer-link"
            onClick={openSupportFromFooter}
          >
            Support the creator
          </button>
        </div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.18 21 12 16.5 5.82 21l2.37-7.14L2 9.36h7.61L12 2z" />
    </svg>
  );
}
