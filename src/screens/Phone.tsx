import { FormEvent, useState } from 'react';
import { api, ApiError } from '../api';
import { PhoneCodeInput } from '../components/PhoneCodeInput';

interface Props {
  onCodeSent: (authId: string, phoneNumber: string) => void;
}

export function PhoneScreen({ onCodeSent }: Props) {
  const [code, setCode] = useState('998');
  const [number, setNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const phoneNumber = `+${code}${number}`;
      const { authId } = await api.sendCode(phoneNumber);
      onCodeSent(authId, phoneNumber);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const valid = code.length >= 1 && number.length >= 5;

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Sign in</h1>
        <p className="card-subtitle">
          Enter your Telegram phone number to continue. We'll send you a code.
        </p>
      </div>

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label className="field-label">Phone number</label>
          <PhoneCodeInput
            code={code}
            number={number}
            onCodeChange={setCode}
            onNumberChange={setNumber}
            disabled={loading}
            error={!!error}
            autoFocus
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading || !valid}
        >
          {loading ? <span className="spinner" /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
