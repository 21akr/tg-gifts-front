// Auto-discovers `.tgs` files in src/assets/gifts/ and exposes a
// {giftId -> assetUrl} map. Drop a file named `{giftId}.tgs` and it gets
// picked up at build time. No code change needed.

import { log } from '../lib/log';

const tgsModules = import.meta.glob('../assets/gifts/*.tgs', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const tgsByGiftId: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [path, url] of Object.entries(tgsModules)) {
    const match = path.match(/\/(\d+)\.tgs$/);
    if (match) {
      map[match[1]] = url;
    }
  }
  return map;
})();

log('ASSETS', 'discovered TGS files:', Object.keys(tgsByGiftId));

export function hasTgsFor(giftId: string): boolean {
  return giftId in tgsByGiftId;
}
