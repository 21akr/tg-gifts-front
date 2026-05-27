import { useEffect, useMemo, useState } from 'react';
import { api, ApiError, CatalogGift } from '../api';
import { GiftCard } from './GiftCard';
import { StarIcon } from './StarIcon';
import { err, log } from '../lib/log';

interface FeaturedDef {
  id: string;
  releasedAt: string;
  holiday: string;
  emoji?: string;
}

// Curated list. Order here = default display order.
const FEATURED: FeaturedDef[] = [
  {
    id: '6026193266406327981',
    releasedAt: '2026-05-01',
    holiday: "International Workers' Day",
    emoji: '🌹',
  },
  {
    id: '5969796561943660080',
    releasedAt: '2026-04-12',
    holiday: 'Easter',
    emoji: '🐣',
  },
  {
    id: '5935895822435615975',
    releasedAt: '2026-04-01',
    holiday: 'April Fools',
    emoji: '🤡',
  },
  {
    id: '5893356958802511476',
    releasedAt: '2026-03-17',
    holiday: "St. Patrick's Day",
    emoji: '🍀',
  },
  {
    id: '5866352046986232958',
    releasedAt: '2026-03-08',
    holiday: "International Women's Day",
    emoji: '🌷',
  },
  {
    id: '5800655655995968830',
    releasedAt: '2026-02-14',
    holiday: "Valentine's Day",
    emoji: '💝',
  },
  {
    id: '5801108895304779062',
    releasedAt: '2026-02-14',
    holiday: "Valentine's Day",
    emoji: '💌',
  },
  {
    id: '5956217000635139069',
    releasedAt: '2025-12-31',
    holiday: 'New Year',
    emoji: '🎆',
  },
  {
    id: '5922558454332916696',
    releasedAt: '2025-12-31',
    holiday: 'New Year',
    emoji: '✨',
  },
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
    log('FEATURED', 'mount → fetching catalog');
    const t0 = performance.now();
    api
      .listGifts(sessionToken)
      .then((data) => {
        const dt = Math.round(performance.now() - t0);
        log(
          'FEATURED',
          `listGifts OK in ${dt}ms, ${data.gifts.length} gifts; cancelled=${cancelled}`,
        );
        if (cancelled) return;
        const map = new Map(data.gifts.map((g) => [g.id, g] as const));
        setCatalog(map);
        log(
          'FEATURED',
          'catalog map built, matched featured:',
          FEATURED.filter((f) => map.has(f.id)).length,
          '/',
          FEATURED.length,
        );
      })
      .catch((e) => {
        err('FEATURED', 'listGifts failed:', e);
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Failed to load gifts');
        }
      });
    return () => {
      log('FEATURED', 'unmount (cancelled=true)');
      cancelled = true;
    };
  }, [sessionToken]);

  const items = useMemo<CatalogGift[]>(() => {
    const ordered = sort === 'asc' ? FEATURED : [...FEATURED].reverse();
    return ordered.map((f) => {
      const fromCatalog = catalog?.get(f.id);
      return {
        id: f.id,
        stars: FEATURED_PRICE,
        limited: false,
        soldOut: false,
        auction: false,
        thumbnail: fromCatalog?.thumbnail,
        featured: {
          holiday: f.holiday,
          releasedAt: f.releasedAt,
          emoji: f.emoji,
        },
      };
    });
  }, [catalog, sort]);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <>
      <div className="featured-toolbar">
        <span className="price-pill" title={`Each gift costs ${FEATURED_PRICE} stars`}>
          <StarIcon size={11} />
          {FEATURED_PRICE}
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
