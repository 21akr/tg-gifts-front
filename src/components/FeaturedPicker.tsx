import { useEffect, useMemo, useState } from 'react';
import { api, ApiError, CatalogGift } from '../api';
import { GiftCard } from './GiftCard';

const FEATURED_IDS: string[] = [
  '5922558454332916696',
  '5956217000635139069',
  '5801108895304779062',
  '5800655655995968830',
  '5866352046986232958',
  '5893356958802511476',
  '5935895822435615975',
  '5969796561943660080',
  '6026193266406327981',
];

const FEATURED_PRICE = 50;

interface Props {
  sessionToken: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type SortDir = 'asc' | 'desc';

export function FeaturedPicker({ sessionToken, selectedId, onSelect }: Props) {
  const [catalog, setCatalog] = useState<Map<string, CatalogGift> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortDir>('asc');

  useEffect(() => {
    let cancelled = false;
    api
      .listGifts(sessionToken)
      .then((data) => {
        if (cancelled) return;
        const map = new Map(data.gifts.map((g) => [g.id, g] as const));
        setCatalog(map);
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

  const items = useMemo<CatalogGift[]>(() => {
    const ordered = sort === 'asc' ? FEATURED_IDS : [...FEATURED_IDS].reverse();
    return ordered.map((id) => {
      const fromCatalog = catalog?.get(id);
      return {
        id,
        stars: FEATURED_PRICE,
        limited: false,
        soldOut: false,
        auction: false,
        thumbnail: fromCatalog?.thumbnail,
      };
    });
  }, [catalog, sort]);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <>
      <div className="featured-toolbar">
        <span className="featured-count">
          {FEATURED_IDS.length} curated gifts
        </span>
        <div className="sort-toggle" role="group" aria-label="Sort order">
          <button
            type="button"
            className={`sort-btn ${sort === 'asc' ? 'active' : ''}`}
            onClick={() => setSort('asc')}
            aria-pressed={sort === 'asc'}
            title="Original order"
          >
            <ArrowIcon dir="up" />
          </button>
          <button
            type="button"
            className={`sort-btn ${sort === 'desc' ? 'active' : ''}`}
            onClick={() => setSort('desc')}
            aria-pressed={sort === 'desc'}
            title="Reversed"
          >
            <ArrowIcon dir="down" />
          </button>
        </div>
      </div>

      <div className="gift-grid">
        {items.map((gift) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            selected={selectedId === gift.id}
            onSelect={() => onSelect(gift.id)}
          />
        ))}
      </div>
    </>
  );
}

function ArrowIcon({ dir }: { dir: 'up' | 'down' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === 'down' ? 'rotate(180deg)' : 'none' }}
      aria-hidden
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
