'use client';

import React, { useEffect, useState } from 'react';
import { WeatherWidgetConfig, WeatherWidgetData } from '@/lib/types';

interface RetroWeatherWidgetProps {
  widgetId: string;
  username: string;
  title?: string;
  config?: WeatherWidgetConfig;
  initialData?: WeatherWidgetData;
}

function PixelSunIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="weather-icon w-11 h-11 shrink-0"
      shapeRendering="crispEdges"
      aria-label="Sunny"
    >
      <rect x="7" y="1" width="2" height="2" fill="#facc15" />
      <rect x="7" y="13" width="2" height="2" fill="#facc15" />
      <rect x="1" y="7" width="2" height="2" fill="#facc15" />
      <rect x="13" y="7" width="2" height="2" fill="#facc15" />
      <rect x="3" y="3" width="2" height="2" fill="#fde047" />
      <rect x="11" y="3" width="2" height="2" fill="#fde047" />
      <rect x="3" y="11" width="2" height="2" fill="#fde047" />
      <rect x="11" y="11" width="2" height="2" fill="#fde047" />
      <rect x="5" y="5" width="6" height="6" fill="#eab308" />
      <rect x="6" y="4" width="4" height="8" fill="#facc15" />
      <rect x="4" y="6" width="8" height="4" fill="#facc15" />
      <rect x="6" y="6" width="2" height="2" fill="#fef9c3" />
    </svg>
  );
}

function PixelCloudIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="weather-icon w-11 h-11 shrink-0"
      shapeRendering="crispEdges"
      aria-label="Cloudy"
    >
      <rect x="6" y="4" width="5" height="2" fill="#cbd5e1" />
      <rect x="4" y="6" width="9" height="2" fill="#e2e8f0" />
      <rect x="2" y="8" width="12" height="3" fill="#94a3b8" />
      <rect x="3" y="7" width="10" height="2" fill="#f8fafc" />
      <rect x="3" y="11" width="10" height="1" fill="#64748b" />
    </svg>
  );
}

function PixelRainIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="weather-icon w-11 h-11 shrink-0"
      shapeRendering="crispEdges"
      aria-label="Rainy"
    >
      <rect x="5" y="3" width="6" height="2" fill="#94a3b8" />
      <rect x="3" y="5" width="10" height="3" fill="#cbd5e1" />
      <rect x="2" y="7" width="12" height="2" fill="#64748b" />
      <rect x="4" y="11" width="1" height="2" fill="#38bdf8" />
      <rect x="7" y="12" width="1" height="2" fill="#0ea5e9" />
      <rect x="10" y="11" width="1" height="2" fill="#38bdf8" />
      <rect x="6" y="10" width="1" height="1" fill="#7dd3fc" />
      <rect x="12" y="12" width="1" height="2" fill="#0ea5e9" />
    </svg>
  );
}

function PixelSnowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="weather-icon w-11 h-11 shrink-0"
      shapeRendering="crispEdges"
      aria-label="Snowy"
    >
      <rect x="5" y="3" width="6" height="2" fill="#cbd5e1" />
      <rect x="3" y="5" width="10" height="3" fill="#f1f5f9" />
      <rect x="2" y="7" width="12" height="2" fill="#94a3b8" />
      <rect x="4" y="11" width="2" height="2" fill="#e0f2fe" />
      <rect x="8" y="12" width="2" height="2" fill="#bae6fd" />
      <rect x="11" y="10" width="2" height="2" fill="#e0f2fe" />
    </svg>
  );
}

function PixelStormIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="weather-icon w-11 h-11 shrink-0"
      shapeRendering="crispEdges"
      aria-label="Thunderstorm"
    >
      <rect x="5" y="2" width="6" height="2" fill="#64748b" />
      <rect x="3" y="4" width="10" height="3" fill="#475569" />
      <rect x="2" y="6" width="12" height="2" fill="#334155" />
      <rect x="7" y="8" width="2" height="2" fill="#facc15" />
      <rect x="6" y="10" width="3" height="1" fill="#fef08a" />
      <rect x="7" y="11" width="2" height="2" fill="#eab308" />
      <rect x="6" y="13" width="1" height="2" fill="#facc15" />
    </svg>
  );
}

export function RetroWeatherWidget({
  widgetId,
  username,
  title,
  config,
  initialData
}: RetroWeatherWidgetProps) {
  const [data, setData] = useState<WeatherWidgetData | undefined>(initialData);

  // Sync when initialData prop updates via live Studio postMessage
  useEffect(() => {
    if (initialData && typeof initialData.temp === 'number') {
      setData(initialData);
    }
  }, [initialData]);

  // Fetch cached/stale-while-revalidate weather data if none was embedded in layout block
  useEffect(() => {
    if (initialData && typeof initialData.temp === 'number') return;
    if (!username) return;

    let cancelled = false;
    fetch(`/api/profiles/${encodeURIComponent(username)}/widgets`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.widgets) return;
        const matched = payload.widgets.find(
          (w: { id?: string; type?: string }) =>
            w.id === widgetId || w.type === 'weather'
        );
        const resolved = matched?.cachedData || matched?.initialData;
        if (resolved && typeof resolved.temp === 'number') {
          setData(resolved);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [username, widgetId, initialData]);

  const resolvedCity = data?.city || config?.city || 'Montreal';
  const resolvedUnits =
    data?.units || (config?.units === 'fahrenheit' ? '°F' : '°C');
  const resolvedTemp = typeof data?.temp === 'number' ? data.temp : 16;
  const resolvedCondition = data?.condition || 'Partly Cloudy';
  const resolvedWind = typeof data?.windspeed === 'number' ? data.windspeed : 11;

  const resolveIcon = () => {
    const iconType = data?.iconType;
    const condLower = resolvedCondition.toLowerCase();
    if (iconType === 'sun' || condLower.includes('clear') || condLower.includes('sun')) {
      return <PixelSunIcon />;
    }
    if (iconType === 'rain' || condLower.includes('rain') || condLower.includes('drizzle')) {
      return <PixelRainIcon />;
    }
    if (iconType === 'snow' || condLower.includes('snow')) {
      return <PixelSnowIcon />;
    }
    if (iconType === 'storm' || condLower.includes('thunder') || condLower.includes('storm')) {
      return <PixelStormIcon />;
    }
    return <PixelCloudIcon />;
  };

  return (
    <div
      id={widgetId}
      className="weather-widget rounded-lg overflow-hidden border-2 transition-all"
      style={{
        borderColor: 'var(--border-color, #99b3cc)',
        borderRadius: 'var(--border-radius, 6px)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.97) 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 14px rgba(56, 189, 248, 0.15)'
      }}
    >
      {/* Retro 90s/00s Window Title Bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between border-b text-[11px] font-mono font-bold tracking-wider uppercase"
        style={{
          backgroundColor: 'var(--accent-color, #0055aa)',
          borderColor: 'var(--border-color, #99b3cc)',
          color: '#ffffff'
        }}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="truncate">{title || `${resolvedCity} WeatherCam`}</span>
        </div>
        <span className="px-1.5 py-0.2 rounded bg-black/30 text-[9px] font-mono tracking-widest">
          MCP•LIVE
        </span>
      </div>

      {/* CRT Display Body */}
      <div className="p-3.5 font-mono text-white space-y-3 relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded bg-slate-900/90 border border-cyan-500/30 shadow-inner">
              {resolveIcon()}
            </div>
            <div className="min-w-0">
              <div className="weather-city text-sm font-black tracking-tight text-cyan-300 truncate">
                {resolvedCity}
                {data?.country ? `, ${data.country}` : ''}
              </div>
              <div className="weather-condition text-xs text-emerald-300 font-semibold mt-0.5">
                {resolvedCondition}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                WIND: {resolvedWind} km/h
              </div>
            </div>
          </div>

          {/* LED Digital Readout */}
          <div className="text-right shrink-0 px-3 py-1.5 rounded bg-black/70 border border-emerald-500/30 shadow-inner">
            <div
              className="weather-temp text-2xl sm:text-3xl font-black tracking-tighter text-amber-300 leading-none"
              style={{ textShadow: '0 0 8px rgba(251, 191, 36, 0.45)' }}
            >
              {resolvedTemp}
              <span className="text-sm font-bold ml-0.5 text-amber-200">
                {resolvedUnits}
              </span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-emerald-400 mt-1">
              RADAR OK
            </div>
          </div>
        </div>

        {/* Retro Ticker Footer */}
        <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[10px] text-slate-400">
          <span>SOURCE: OPEN-METEO MCP</span>
          <span className="text-cyan-400 font-bold">★ 2006 DESKTOP WIDGET</span>
        </div>
      </div>
    </div>
  );
}

