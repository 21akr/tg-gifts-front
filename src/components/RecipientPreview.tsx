import { useEffect, useState } from 'react';
import { api, ApiError, ResolvedUser } from '../api';
import { err, log } from '../lib/log';

interface Props {
  sessionToken: string;
  query: string;
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'resolved'; user: ResolvedUser }
  | { kind: 'not_found' }
  | { kind: 'invalid' };

const DEBOUNCE_MS = 400;
const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/;

export function RecipientPreview({ sessionToken, query }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  useEffect(() => {
    const trimmed = query.trim().replace(/^@/, '');

    if (!trimmed) {
      setState({ kind: 'idle' });
      return;
    }
    if (!USERNAME_RE.test(trimmed)) {
      setState({ kind: 'invalid' });
      return;
    }

    setState({ kind: 'loading' });
    const controller = new AbortController();
    const timer = setTimeout(() => {
      log('RESOLVE', '→', trimmed);
      api
        .resolveUser(sessionToken, trimmed, controller.signal)
        .then((user) => {
          log('RESOLVE', 'OK', trimmed, '→', user.firstName);
          setState({ kind: 'resolved', user });
        })
        .catch((e) => {
          if (controller.signal.aborted) return;
          if (e instanceof ApiError && e.status === 404) {
            setState({ kind: 'not_found' });
            return;
          }
          err('RESOLVE', 'failed', trimmed, e);
          setState({ kind: 'not_found' });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, sessionToken]);

  return (
    <div className={`recipient-preview recipient-${state.kind}`}>
      <div className="recipient-avatar">
        {state.kind === 'resolved' && state.user.photoUrl ? (
          <img src={state.user.photoUrl} alt="" />
        ) : (
          <Initials state={state} />
        )}
        {state.kind === 'loading' && (
          <span className="recipient-spinner" aria-hidden />
        )}
      </div>
      <div className="recipient-text">
        <div className="recipient-name">
          {state.kind === 'resolved' ? (
            <>
              {state.user.firstName}
              {state.user.lastName ? ` ${state.user.lastName}` : ''}
            </>
          ) : state.kind === 'loading' ? (
            <span className="recipient-skeleton recipient-skeleton-name" />
          ) : state.kind === 'not_found' ? (
            'No such user'
          ) : state.kind === 'invalid' ? (
            'Keep typing…'
          ) : (
            'Type a username to preview'
          )}
        </div>
        <div className="recipient-meta">
          {state.kind === 'resolved' ? (
            <>@{state.user.username ?? '—'}</>
          ) : state.kind === 'loading' ? (
            <span className="recipient-skeleton recipient-skeleton-meta" />
          ) : (
            <>&nbsp;</>
          )}
        </div>
      </div>
    </div>
  );
}

function Initials({ state }: { state: State }) {
  if (state.kind === 'resolved') {
    const initials = (state.user.firstName[0] ?? '?').toUpperCase();
    return <span className="recipient-initials">{initials}</span>;
  }
  return <span className="recipient-placeholder">@</span>;
}
