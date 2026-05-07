import { FormEvent, useState } from 'react';
import { api, ApiError } from '../api';

interface Props {
  authId: string;
  onAuthenticated: (sessionToken: string) => void;
  onBack: () => void;
}

export function PasswordScreen({ authId, onAuthenticated, onBack }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { sessionToken } = await api.verifyPassword(authId, password);
      onAuthenticated(sessionToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Wrong password');
      setPassword('');
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
        <h1 className="card-title">Two-factor auth</h1>
        <p className="card-subtitle">
          Your account is protected with a cloud password. Enter it to finish
          signing in.
        </p>
      </div>

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="password">
            Cloud password
          </label>
          <input
            id="password"
            className={`input ${error ? 'input-error' : ''}`}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || password.length === 0}
          >
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
