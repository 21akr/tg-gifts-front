import { ComponentType, ReactNode, useEffect, useState } from 'react';
import LottieImport from 'lottie-react';
import { ungzip } from 'pako';
import { err, log } from '../lib/log';

// Vite pre-bundles lottie-react as UMD, so the default import resolves to
// the whole namespace { default: Lottie, useLottie, ... } instead of the
// component itself. Unwrap defensively.
const Lottie = ((LottieImport as unknown as { default?: ComponentType<any> })
  .default ?? LottieImport) as ComponentType<{
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  rendererSettings?: Record<string, unknown>;
}>;

interface Props {
  src: string;
  size?: number;
  fallback?: ReactNode;
}

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function loadTgs(url: string): Promise<unknown> {
  const cached = cache.get(url);
  if (cached) return cached;

  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    log('LOTTIE', 'fetch start', url);
    const t0 = performance.now();
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`fetch ${url} → ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    log(
      'LOTTIE',
      `fetched ${buffer.byteLength}B in ${Math.round(performance.now() - t0)}ms`,
      url,
    );
    const decompressed = ungzip(new Uint8Array(buffer));
    const text = new TextDecoder().decode(decompressed);
    const json = JSON.parse(text);
    cache.set(url, json);
    log('LOTTIE', `decoded + parsed JSON (${text.length} chars)`, url);
    return json;
  })().finally(() => {
    inflight.delete(url);
  });

  inflight.set(url, promise);
  return promise;
}

export function LottieGift({ src, size = 56, fallback = null }: Props) {
  const [data, setData] = useState<unknown | null>(() => cache.get(src) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    if (cache.has(src)) {
      log('LOTTIE', 'cache hit', src);
      setData(cache.get(src));
      return;
    }

    loadTgs(src)
      .then((json) => {
        if (cancelled) {
          log('LOTTIE', 'late resolve, cancelled', src);
          return;
        }
        setData(json);
      })
      .catch((e) => {
        err('LOTTIE', 'load failed', src, e);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (failed || !data) {
    return <>{fallback}</>;
  }

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      style={{ width: size, height: size, display: 'block' }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
    />
  );
}
