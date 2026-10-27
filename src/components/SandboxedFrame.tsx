'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { Monitor, Tablet, Smartphone, RefreshCw, ShieldCheck } from 'lucide-react';

interface SandboxedFrameProps {
  profile: UserProfile;
  sanitizedCss: string;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  onViewportChange?: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
}

export function SandboxedFrame({
  profile,
  sanitizedCss,
  viewport = 'desktop',
  onViewportChange
}: SandboxedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [currentViewport, setCurrentViewport] = useState<'desktop' | 'tablet' | 'mobile'>(viewport);

  const activeViewport = onViewportChange ? viewport : currentViewport;
  const setViewport = (vp: 'desktop' | 'tablet' | 'mobile') => {
    if (onViewportChange) {
      onViewportChange(vp);
    } else {
      setCurrentViewport(vp);
    }
  };

  // Dispatch postMessage state synchronization
  const sendSyncMessage = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    try {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_PROFILE',
          profile,
          sanitizedCss
        },
        '*'
      );
    } catch (err) {
      console.warn('postMessage failed:', err);
    }
  }, [profile, sanitizedCss]);

  // Listen for iframe readiness & heartbeat
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'FRAME_READY') {
        setIsFrameReady(true);
        sendSyncMessage();
      } else if (data.type === 'CSS_APPLIED') {
        setLastSyncTime(data.timestamp);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendSyncMessage]);

  // Sync state whenever profile or sanitizedCss changes
  useEffect(() => {
    if (isFrameReady) {
      sendSyncMessage();
    }
  }, [profile, sanitizedCss, isFrameReady, sendSyncMessage]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsFrameReady(false);
      iframeRef.current.src = '/sandbox-frame';
    }
  };

  // Viewport width styling
  const getViewportWidth = () => {
    switch (activeViewport) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Sandbox Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/90 text-slate-300 font-mono text-[11px] border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">iframe sandbox</span>
            <span className="text-slate-500">|</span>
            <span>postMessage 60fps</span>
          </div>
        </div>

        {/* Viewport Width Controls & Refresh */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded transition-colors ${
                activeViewport === 'desktop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded transition-colors ${
                activeViewport === 'tablet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile View (390px)"
              className={`p-1.5 rounded transition-colors ${
                activeViewport === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Sandbox Frame"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-900/50 p-3 sm:p-4 flex items-center justify-center overflow-auto">
        <div
          className={`h-full transition-all duration-300 mx-auto rounded-lg overflow-hidden shadow-2xl border border-slate-800 bg-white ${getViewportWidth()}`}
          style={{ width: '100%', minHeight: '680px' }}
        >
          <iframe
            ref={iframeRef}
            src="/sandbox-frame"
            id="sandboxed-profile-iframe"
            title="Sanitized User Profile Canvas"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            className="w-full h-full min-h-[680px] border-none block"
            onLoad={() => {
              setIsFrameReady(true);
              sendSyncMessage();
            }}
          />
        </div>
      </div>
    </div>
  );
}
