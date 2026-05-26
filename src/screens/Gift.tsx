import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { GiftPicker } from '../components/GiftPicker';
import { FeaturedPicker } from '../components/FeaturedPicker';
import { log } from '../lib/log';

interface Props {
  sessionToken: string;
  onLogout: () => void;
}

type Mode = 'featured' | 'browse' | 'manual';

export function GiftScreen({ sessionToken, onLogout }: Props) {
  const [mode, setMode] = useState<Mode>('featured');
  const [targetUser, setTargetUser] = useState('');
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [manualGiftId, setManualGiftId] = useState('');
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    log('GIFT-SCREEN', 'mount with token', sessionToken.slice(0, 8) + '...');
    return () => log('GIFT-SCREEN', 'unmount');
  }, [sessionToken]);

  useEffect(() => {
    log('GIFT-SCREEN', 'mode =', mode, 'selectedGiftId =', selectedGiftId);
  }, [mode, selectedGiftId]);

  const giftId = mode === 'manual' ? manualGiftId.trim() : selectedGiftId;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!giftId) return;
    setLoading(true);
    try {
      const cleaned = targetUser.trim().replace(/^@/, '');
      const result = await api.buyGift(sessionToken, {
        targetUser: cleaned,
        giftId,
        comment: comment.trim() || undefined,
        anonymous,
      });
      setSuccess(result.message);
      setTargetUser('');
      setSelectedGiftId(null);
      setManualGiftId('');
      setComment('');
      setAnonymous(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout(sessionToken);
    } catch {
      /* noop */
    }
    onLogout();
  };

  const switchMode = (next: Mode) => {
    log('GIFT-SCREEN', 'switchMode →', next);
    setMode(next);
    setSelectedGiftId(null);
  };

  return (
    <div className="card">
      <div className="profile-bar">
        <div className="profile-info">
          <span className="profile-dot" />
          <span className="profile-text">
            <b>Connected</b> · session active
          </span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <div className="card-header">
        <h1 className="card-title">Send a gift</h1>
        <p className="card-subtitle">
          Stars come from your account. Pick a curated gift, browse the catalog,
          or paste an ID.
        </p>
      </div>

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="recipient">
            Recipient
          </label>
          <input
            id="recipient"
            className="input"
            type="text"
            placeholder="@username"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label">Gift</label>
          <div className="segmented" role="tablist">
            <button
              type="button"
              className={`segmented-option ${mode === 'featured' ? 'active' : ''}`}
              onClick={() => switchMode('featured')}
              role="tab"
              aria-selected={mode === 'featured'}
            >
              Featured
            </button>
            <button
              type="button"
              className={`segmented-option ${mode === 'browse' ? 'active' : ''}`}
              onClick={() => switchMode('browse')}
              role="tab"
              aria-selected={mode === 'browse'}
            >
              Catalog
            </button>
            <button
              type="button"
              className={`segmented-option ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => switchMode('manual')}
              role="tab"
              aria-selected={mode === 'manual'}
            >
              By ID
            </button>
          </div>

          {mode === 'featured' && (
            <FeaturedPicker
              sessionToken={sessionToken}
              selectedId={selectedGiftId}
              onSelect={setSelectedGiftId}
            />
          )}

          {mode === 'browse' && (
            <GiftPicker
              sessionToken={sessionToken}
              selectedId={selectedGiftId}
              onSelect={setSelectedGiftId}
            />
          )}

          {mode === 'manual' && (
            <>
              <input
                id="giftId"
                className="input"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 5170145012310081615"
                value={manualGiftId}
                onChange={(e) =>
                  setManualGiftId(e.target.value.replace(/\D/g, ''))
                }
                disabled={loading}
              />
              <span className="field-hint">
                Numeric ID of a hidden or specific gift
              </span>
            </>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="comment">
            Message <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <textarea
            id="comment"
            className="input"
            placeholder="A short note for the recipient"
            maxLength={255}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={loading}
          />
          <span className="toggle-label">
            <span className="toggle-title">Send anonymously</span>
            <span className="toggle-desc">Hide your name from the recipient</span>
          </span>
          <span className="toggle-switch" />
        </label>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button
          type="submit"
          className="btn btn-accent btn-block"
          disabled={loading || !targetUser.trim() || !giftId}
        >
          {loading ? <span className="spinner" /> : 'Send gift'}
        </button>
      </form>
    </div>
  );
}
