import { lazy, Suspense } from 'react';

interface Props {
  src: string;
  size?: number;
}

// Heavy deps (lottie-react + pako) load only when the first .tgs needs to render.
const LottieGiftImpl = lazy(() =>
  import('./LottieGiftImpl').then((m) => ({ default: m.LottieGift })),
);

export function LottieGift(props: Props) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: props.size ?? 56,
            height: props.size ?? 56,
          }}
        />
      }
    >
      <LottieGiftImpl {...props} />
    </Suspense>
  );
}
