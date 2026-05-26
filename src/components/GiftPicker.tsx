import { useEffect, useState } from 'react';
import { api, ApiError, CatalogGift } from '../api';
import { GiftCard } from './GiftCard';
import { err, log } from '../lib/log';

interface Props {
  sessionToken: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GiftPicker({ sessionToken, selectedId, onSelect }: Props) {
  const [gifts, setGifts] = useState<CatalogGift[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    log('CATALOG', 'mount → fetching catalog');
    const t0 = performance.now();
    api
      .listGifts(sessionToken)
      .then((data) => {
        const dt = Math.round(performance.now() - t0);
        log(
          'CATALOG',
          `listGifts OK in ${dt}ms, ${data.gifts.length} gifts; cancelled=${cancelled}`,
        );
        if (!cancelled) setGifts(data.gifts);
      })
      .catch((e) => {
        err('CATALOG', 'listGifts failed:', e);
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Failed to load gifts');
        }
      });
    return () => {
      log('CATALOG', 'unmount (cancelled=true)');
      cancelled = true;
    };
  }, [sessionToken]);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!gifts) {
    return (
      <div className="gift-loading">
        <span className="spinner" />
      </div>
    );
  }

  if (gifts.length === 0) {
    return <div className="gift-empty">No gifts available right now.</div>;
  }

  return (
    <div className="gift-grid">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          selected={selectedId === gift.id}
          onSelect={() => !gift.soldOut && onSelect(gift.id)}
        />
      ))}
    </div>
  );
}
