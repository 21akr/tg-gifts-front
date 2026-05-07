import { FormEvent, useState } from 'react';
import { api, ApiError } from '../api';

interface Props {
  authId: string;
  phoneNumber: string;
  onAuthenticated: (sessionToken: string) => void;
  onPasswordRequired: () => void;
  onBack: () => void;
}

export function CodeScreen({
  authId,
  phoneNumber,
  onAuthenticated,
  onPasswordRequired,
  onBack,
}: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.verifyCode(authId, code);
      if (result.status === 'authenticated' && result.sessionToken) {
        onAuthenticated(result.sessionToken);
      } else if (result.status === 'password_required') {
        onPasswordRequired();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    try {
      await api.cancelAuth(authId);
    } catch {
      /* noop */
    }
    onBack();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Enter code</h1>
        <p className="card-subtitle">
          Telegram sent a code to <b>{phoneNumber}</b>. Check your other devices.
        </p>
      </div>

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="code">
            Verification code
          </label>
          <input
            id="code"
            className={`input input-code ${error ? 'input-error' : ''}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="•••••"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            disabled={loading}
            autoFocus
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="btn-row">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={cancel}
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || code.length < 4}
          >
            {loading ? <span className="spinner" /> : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}
