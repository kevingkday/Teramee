'use client';

import { useProfileHandle } from '@/components/useProfileHandle';

export function NotFoundCopy() {
  const handle = useProfileHandle();

  if (handle) {
    return (
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300">
        There is no Teramee profile for <span className="font-mono text-pink-300">@{handle}</span>.
        That handle is unclaimed, or the page drifted off the friend list.
      </p>
    );
  }

  return (
    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300">
      That URL is not a page on Teramee. The link may be broken, or the page was never saved to the server.
    </p>
  );
}
