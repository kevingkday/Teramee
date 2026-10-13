'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { UserProfile } from '@/lib/types';
import { ProfileCanvas } from '@/components/ProfileCanvas';
import { THEME_PRESETS } from '@/lib/presets';

export default function SandboxFramePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sanitizedCss, setSanitizedCss] = useState<string>('');
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Notify parent window that sandboxed iframe is ready to receive state
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'FRAME_READY' }, '*');
    }

    const handleMessage = (event: MessageEvent) => {
      // Validate event structure
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

        // Acknowledge receipt
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
    <div className="w-full min-h-screen overflow-x-hidden">
      <ProfileCanvas
        profile={profile}
        sanitizedCss={sanitizedCss}
        isInsideIframe={true}
      />
    </div>
  );
}
