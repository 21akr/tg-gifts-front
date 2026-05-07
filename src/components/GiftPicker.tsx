import { useEffect, useState } from 'react';
import { api, ApiError, CatalogGift } from '../api';
import { GiftCard } from './GiftCard';

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
    api
      .listGifts(sessionToken)
      .then((data) => {
        if (!cancelled) setGifts(data.gifts);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load gifts',
          );
        }
      });
    return () => {
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
