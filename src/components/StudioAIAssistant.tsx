'use client';

import React, { useState } from 'react';
import { LayoutBlock, ProfileWidget } from '@/lib/types';
import {
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Loader2,
  CheckCircle2,
  Bot,
  Plug,
  HelpCircle,
  Music,
  GitBranch,
  MapPin
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  widgetAdded?: ProfileWidget;
  actionType?: 'ADD_WIDGET' | 'UPDATE_WIDGET' | 'MESSAGE';
  timestamp: string;
}

interface StudioAIAssistantProps {
  username: string;
  currentLayout: LayoutBlock[];
  onAddWidget: (widget: ProfileWidget) => void;
}

const QUICK_PROMPTS = [
  'What MCP widgets can I add?',
  'Add Vancouver weather in Celsius',
  'Add Tokyo weather in Celsius',
  'Add New York weather in Fahrenheit'
];

export function StudioAIAssistant({
  username,
  currentLayout,
  onAddWidget
}: StudioAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showMcpCatalog, setShowMcpCatalog] = useState(true);
  const [quickCity, setQuickCity] = useState('');
  const [quickUnits, setQuickUnits] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);

  const existingWeatherBlock = (currentLayout || []).find(
    (b) => b.widgetType === 'weather' || String(b.id).startsWith('widget-weather-')
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Hey @${username}! I'm your AI Studio Assistant connected to Teramee's MCP Server Catalog. Right now, the Open-Meteo Weather & Radar MCP is live — tell me any city worldwide (e.g. "Add Vancouver weather in Celsius" or "Switch to Tokyo") or use the MCP Server Catalog above!`,
      timestamp: 'Just now'
    }
  ]);

  const handleSendPrompt = async (textToSubmit?: string) => {
    const query = (textToSubmit ?? prompt).trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSubmit) setPrompt('');
    setIsSending(true);

    try {
      const res = await fetch('/api/studio/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          prompt: query,
          currentLayout
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reach Studio Assistant.');
      }

      if (
        (data.action === 'ADD_WIDGET' || data.action === 'UPDATE_WIDGET') &&
        data.widget
      ) {
        onAddWidget(data.widget as ProfileWidget);
      }

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text:
          data.reply ||
          'I have updated your live profile preview!',
        widgetAdded: data.widget,
        actionType: data.action,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `Oops! ${errMsg}`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickWeatherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const city = quickCity.trim();
    if (!city || isSending) return;
    const unitLabel = quickUnits === 'fahrenheit' ? 'Fahrenheit' : 'Celsius';
    const actionVerb = existingWeatherBlock ? 'Update weather widget to' : 'Add';
    handleSendPrompt(`${actionVerb} ${city} weather in ${unitLabel}`);
    setQuickCity('');
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Collapsible Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 hover:from-indigo-900/70 hover:to-purple-900/70 border-b border-slate-800/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <span>Studio AI Assistant</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Workers AI + MCP
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[10px] font-mono hidden sm:inline">
            {isOpen ? 'Minimize' : 'Browse MCP widgets & ask AI'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-300" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-300" />
          )}
        </div>
      </button>

      {/* Collapsible Body */}
      {isOpen && (
        <div className="p-3.5 space-y-3">
          {/* Available MCP Servers Directory Toggle & Card */}
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMcpCatalog(!showMcpCatalog)}
              className="w-full px-3 py-2 flex items-center justify-between text-left bg-indigo-950/40 hover:bg-indigo-950/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plug className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-100">
                  Available MCP Servers &amp; Widgets
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1 Live
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  2 Soon
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">
                {showMcpCatalog ? 'Hide Catalog ▲' : 'Show Catalog ▼'}
              </span>
            </button>

            {showMcpCatalog && (
              <div className="p-3 space-y-2.5 border-t border-slate-800/80 text-xs">
                {/* Active Server: Open-Meteo Weather MCP */}
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                          <span>Open-Meteo Weather &amp; Radar MCP</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ONLINE
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Adds a live 90s CRT weather badge for any city worldwide. Tool:{' '}
                          <code className="text-cyan-300">get_weather(city, units)</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct City Input Form */}
                  <form
                    onSubmit={handleQuickWeatherSubmit}
                    className="flex flex-wrap items-center gap-1.5 pt-1"
                  >
                    <div className="relative flex-1 min-w-[140px]">
                      <MapPin className="w-3 h-3 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={quickCity}
                        onChange={(e) => setQuickCity(e.target.value)}
                        placeholder="Enter city (e.g. Vancouver, Tokyo)..."
                        disabled={isSending}
                        className="w-full pl-7 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <select
                      value={quickUnits}
                      onChange={(e) =>
                        setQuickUnits(e.target.value as 'celsius' | 'fahrenheit')
                      }
                      disabled={isSending}
                      aria-label="Temperature units"
                      className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="celsius">°C (Celsius)</option>
                      <option value="fahrenheit">°F (Fahrenheit)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSending || !quickCity.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {existingWeatherBlock ? 'Update City' : '+ Add Widget'}
                    </button>
                  </form>
                </div>

                {/* Coming Soon MCP Servers so users know the roadmap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-2 opacity-75">
                    <div className="flex items-center gap-1.5 truncate">
                      <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="text-[10px] text-slate-300 truncate">
                        Last.fm Scrobbler MCP
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                      SOON
                    </span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-2 opacity-75">
                    <div className="flex items-center gap-1.5 truncate">
                      <GitBranch className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-[10px] text-slate-300 truncate">
                        GitHub Commit Matrix MCP
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                      SOON
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isSending}
                onClick={() => handleSendPrompt(q)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/80 border border-slate-700/80 hover:border-indigo-500/50 text-[11px] text-cyan-300 whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {q.startsWith('What') ? (
                  <HelpCircle className="w-3 h-3 text-pink-400 shrink-0" />
                ) : (
                  <CloudSun className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.widgetAdded && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {m.actionType === 'UPDATE_WIDGET' ? 'Updated' : 'Added'}:{' '}
                          {m.widgetAdded.title} ({m.widgetAdded.initialData?.temp}
                          {m.widgetAdded.initialData?.units})
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 shrink-0">
                        Click Save Profile to keep!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono px-2 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing prompt with AI &amp; querying MCP server...</span>
              </div>
            )}
          </div>

          {/* Natural Language Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Ask AI (e.g. "Add Vancouver weather" or "What MCP widgets exist?")'
                disabled={isSending}
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !prompt.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
