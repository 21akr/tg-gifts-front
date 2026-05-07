import { CatalogGift } from '../api';
import { StarIcon } from './StarIcon';
import { LottieGift } from './LottieGift';
import { tgsByGiftId } from './giftAssets';

interface Props {
  gift: CatalogGift;
  selected: boolean;
  onSelect: () => void;
}

export function GiftCard({ gift, selected, onSelect }: Props) {
  const classes = ['gift-card'];
  if (selected) classes.push('selected');
  if (gift.soldOut) classes.push('sold-out');

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

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onSelect}
      disabled={gift.soldOut}
    >
      {badge && (
        <span className={`gift-badge ${badge.className}`}>{badge.text}</span>
      )}

      <div className="gift-thumb">
        {tgsByGiftId[gift.id] ? (
          <LottieGift src={tgsByGiftId[gift.id]} size={56} />
        ) : gift.thumbnail ? (
          <img src={gift.thumbnail} alt="" />
        ) : (
          <div className="gift-thumb-fallback">
            <StarIcon size={22} />
          </div>
        )}
      </div>

      {gift.auction ? (
        <div className="gift-meta gift-meta-auction">Bid in Telegram</div>
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
