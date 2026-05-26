// Tiny tagged logger. Always logs — strip the import when shipping.
// Filter in the browser console with e.g. `[FEATURED]` or `[LOTTIE]`.

type Level = 'log' | 'warn' | 'error';

function emit(level: Level, tag: string, args: unknown[]) {
  const ts = new Date().toISOString().slice(11, 23);
  // eslint-disable-next-line no-console
  console[level](`%c${ts}%c [${tag}]`, 'color:#999', 'color:#f59e0b', ...args);
}

export function log(tag: string, ...args: unknown[]) {
  emit('log', tag, args);
}

export function warn(tag: string, ...args: unknown[]) {
  emit('warn', tag, args);
}

export function err(tag: string, ...args: unknown[]) {
  emit('error', tag, args);
}
