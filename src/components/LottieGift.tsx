import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { ungzip } from 'pako';

interface Props {
  src: string;
  size?: number;
}

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function loadTgs(url: string): Promise<unknown> {
  const cached = cache.get(url);
  if (cached) return cached;

  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const decompressed = ungzip(new Uint8Array(buffer));
    const json = JSON.parse(new TextDecoder().decode(decompressed));
    cache.set(url, json);
    inflight.delete(url);
    return json;
  })();

  inflight.set(url, promise);
  return promise;
}

export function LottieGift({ src, size = 56 }: Props) {
  const [data, setData] = useState<unknown | null>(() => cache.get(src) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (cache.has(src)) {
      setData(cache.get(src));
      return;
    }
    loadTgs(src)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (failed) return null;

  if (!data) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      style={{ width: size, height: size }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
    />
  );
}
