'use client';

import { useSyncExternalStore } from 'react';
import { readProfileHandle } from '@/lib/handles';

function subscribe(onChange: () => void) {
  const id = window.setTimeout(onChange, 0);
  return () => window.clearTimeout(id);
}

/**
 * `undefined` until the browser path is read, then the handle or null.
 * The server snapshot stays `undefined` so static HTML does not mismatch.
 */
export function useProfileHandle(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readProfileHandle(window.location.pathname),
    () => undefined
  );
}
