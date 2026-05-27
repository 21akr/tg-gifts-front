import { CatalogGift } from '../api';
import { StarIcon } from './StarIcon';
import { LottieGift } from './LottieGift';
import { tgsByGiftId } from './giftAssets';

interface Props {
  gift: CatalogGift;
  selected: boolean;
  onSelect: () => void;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GiftCard({ gift, selected, onSelect }: Props) {
  const classes = ['gift-card'];
  if (selected) classes.push('selected');
  if (gift.soldOut) classes.push('sold-out');
  if (gift.featured) classes.push('featured');

  const badge = gift.auction
    ? { text: 'Auction', className: 'auction' }
    : gift.soldOut
    ? { text: 'Sold', className: 'sold' }
    : gift.limited
    ? { text: 'Limited', className: '' }
    : null;

  const supplyHint =
    gift.soldOut && gift.availabilityTotal
      ? gift.availabilityTotal.toLocaleString()
      : !gift.soldOut && gift.limited && gift.availabilityRemains != null
      ? `${gift.availabilityRemains.toLocaleString()} left`
      : null;

  const title = gift.featured
    ? `${gift.featured.holiday} · ${new Date(gift.featured.releasedAt).toLocaleDateString()}`
    : undefined;

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onSelect}
      disabled={gift.soldOut}
      title={title}
    >
      {badge && (
        <span className={`gift-badge ${badge.className}`}>{badge.text}</span>
      )}

      <div className="gift-thumb">
        {tgsByGiftId[gift.id] ? (
          <LottieGift
            src={tgsByGiftId[gift.id]}
            size={56}
            fallback={<GradientFallback />}
          />
        ) : gift.thumbnail ? (
          <img src={gift.thumbnail} alt="" />
        ) : (
          <GradientFallback />
        )}
      </div>

      {gift.auction ? (
        <div className="gift-meta gift-meta-auction">Bid in Telegram</div>
      ) : gift.featured ? (
        <div className="gift-featured">
          {gift.featured.emoji && (
            <div className="gift-featured-emoji" aria-hidden>
              {gift.featured.emoji}
            </div>
          )}
          <div className="gift-featured-holiday">{gift.featured.holiday}</div>
          <div className="gift-featured-date">
            {formatShortDate(gift.featured.releasedAt)}
          </div>
        </div>
      ) : (
        <>
          <div className="gift-stars">
            <StarIcon size={11} />
            {gift.stars.toLocaleString()}
          </div>
          {supplyHint && <div className="gift-supply">{supplyHint}</div>}
        </>
      )}
    </button>
  );
}

function GradientFallback() {
  return (
    <div className="gift-thumb-fallback">
      <StarIcon size={22} />
    </div>
  );
}
