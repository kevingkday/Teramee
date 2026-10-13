'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { UserProfile } from '@/lib/types';
import { ProfileCanvas } from './ProfileCanvas';

interface ShadowDomSandboxProps {
  profile: UserProfile;
  sanitizedCss: string;
}

export function ShadowDomSandbox({
  profile,
  sanitizedCss
}: ShadowDomSandboxProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const reactRootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    if (!shadowRootRef.current) {
      // Attach Shadow DOM root with strict encapsulation
      const shadow = hostRef.current.attachShadow({ mode: 'open' });
      shadowRootRef.current = shadow;

      // Inject base stylesheet & Tailwind utility classes inside the Shadow DOM
      const baseStyle = document.createElement('style');
      baseStyle.textContent = `
        :host {
          display: block;
          contain: content;
          all: initial;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
      `;
      shadow.appendChild(baseStyle);

      // Create a mount container
      const mountNode = document.createElement('div');
      mountNode.id = 'shadow-mount-point';
      shadow.appendChild(mountNode);

      reactRootRef.current = createRoot(mountNode);
    }

    if (reactRootRef.current) {
      reactRootRef.current.render(
        <ProfileCanvas
          profile={profile}
          sanitizedCss={sanitizedCss}
          isInsideIframe={false}
        />
      );
    }
  }, [profile, sanitizedCss]);

  return (
    <div
      ref={hostRef}
      id="shadow-sandbox-host"
      className="w-full min-h-[680px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800"
    />
  );
}
