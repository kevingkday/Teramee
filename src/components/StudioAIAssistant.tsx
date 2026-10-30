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
  Bot
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  widgetAdded?: ProfileWidget;
  timestamp: string;
}

interface StudioAIAssistantProps {
  username: string;
  currentLayout: LayoutBlock[];
  onAddWidget: (widget: ProfileWidget) => void;
}

const QUICK_PROMPTS = [
  'Add a Montreal weather widget in Celsius',
  'Add Tokyo weather forecast in Celsius',
  'Add New York weather in Fahrenheit',
  'Add London weather radar'
];

export function StudioAIAssistant({
  username,
  currentLayout,
  onAddWidget
}: StudioAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Hey @${username}! I'm your Studio AI Assistant. Ask me to add a live retro weather widget for any city and I'll place it right onto your profile canvas!`,
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

      if (data.action === 'ADD_WIDGET' && data.widget) {
        onAddWidget(data.widget as ProfileWidget);
      }

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text:
          data.reply ||
          'I have generated your widget and added it to your live profile preview!',
        widgetAdded: data.widget,
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
            <span>Studio Assistant</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MCP Widgets
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[10px] font-mono hidden sm:inline">
            {isOpen ? 'Minimize' : 'Ask AI to add widgets'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-300" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-300" />
          )}
        </div>
      </button>

      {/* Collapsible Chat Body */}
      {isOpen && (
        <div className="p-3.5 space-y-3">
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
                <CloudSun className="w-3 h-3 text-amber-400 shrink-0" />
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
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
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
                          Added: {m.widgetAdded.title} (
                          {m.widgetAdded.initialData?.temp}
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
                <span>Calling MCP get_weather tool &amp; building widget...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
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
                placeholder="e.g. Add a Montreal weather widget in Celsius..."
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

