'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { UserProfile } from '@/lib/types';
import { ProfileCanvas } from '@/components/ProfileCanvas';

export default function SandboxFramePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sanitizedCss, setSanitizedCss] = useState<string>('');
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Notify parent window that sandboxed iframe is ready to receive state
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'FRAME_READY' }, '*');
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'UPDATE_PROFILE') {
        startTransition(() => {
          if (data.profile) {
            setProfile(data.profile);
          }
          if (typeof data.sanitizedCss === 'string') {
            setSanitizedCss(data.sanitizedCss);
          }
        });

        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            { type: 'CSS_APPLIED', timestamp: Date.now() },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Automatically report full content height to parent so desktop preview doesn't need an internal scrollbar
  useEffect(() => {
    if (!profile || typeof window === 'undefined') return;

    const sendHeight = () => {
      if (!window.parent || window.parent === window) return;
      const el = rootRef.current;
      const measured = Math.max(
        el ? el.scrollHeight : 0,
        document.body ? document.body.scrollHeight : 0,
        900
      );
      window.parent.postMessage({ type: 'FRAME_HEIGHT', height: measured }, '*');
    };

    sendHeight();
    const timer = setTimeout(sendHeight, 250);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && rootRef.current) {
      observer = new ResizeObserver(() => {
        sendHeight();
      });
      observer.observe(rootRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [profile, sanitizedCss]);

  // Fallback initial profile while waiting for parent postMessage
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-sm p-4 text-center">
        <div className="space-y-2">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Sandboxed Iframe Root Active</p>
          <p className="text-xs text-slate-500">Listening for postMessage synchronization...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="w-full min-h-screen overflow-x-hidden">
      <ProfileCanvas
        profile={profile}
        sanitizedCss={sanitizedCss}
        isInsideIframe={true}
      />
    </div>
  );
}
