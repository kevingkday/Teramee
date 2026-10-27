'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DirectMessage } from '@/lib/types';
import { Mail, MailOpen, Send, X, ArrowLeft, RefreshCw, Sparkles, User } from 'lucide-react';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
}

export function InboxModal({ isOpen, onClose, currentUser }: InboxModalProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');

  // Compose state
  const [toUser, setToUser] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  const fetchMessages = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMessages();
    }
  }, [isOpen, currentUser]);

  const handleSelectMessage = async (msg: DirectMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: msg.id })
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
      } catch (e) {
        console.error('Failed to mark message read', e);
      }
    }
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUser.trim() || !body.trim()) return;
    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUsername: toUser.trim(),
          subject: subject.trim() || 'No Subject',
          body: body.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSendSuccess(true);
        setToUser('');
        setSubject('');
        setBody('');
        setTimeout(() => {
          setSendSuccess(false);
          setActiveTab('inbox');
          fetchMessages();
        }, 1500);
      } else {
        setSendError(data.error || 'Failed to send message.');
      }
    } catch {
      setSendError('Network error sending message.');
    } finally {
      setIsSending(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale text-slate-100 font-sans my-auto">
        {/* Retro Window Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white select-none border-b border-indigo-500/30">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-blue-200" />
            <span className="font-bold text-sm tracking-tight">Teramee Mail &mdash; Inbox &amp; Private Messages</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher & Action bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Inbox ({messages.filter((m) => !m.read).length} new)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('compose'); setSelectedMessage(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'compose'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Message</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMessages}
              disabled={isLoading}
              title="Refresh inbox"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              @{currentUser || 'guest'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'compose' ? (
            /* COMPOSE TAB */
            <form onSubmit={handleSendCompose} className="space-y-4 max-w-lg mx-auto py-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Write Private Message</span>
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Recipient Username</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs focus-within:border-blue-500">
                  <span className="text-slate-500 font-mono mr-1">@</span>
                  <input
                    type="text"
                    value={toUser}
                    onChange={(e) => setToUser(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="kevin, glitterqueen99, etc."
                    required
                    className="bg-transparent text-white font-mono focus:outline-none w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Hey, check out my new layout!"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Message Body</label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your retro message here..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Message delivered to @{toUser}! Returning to inbox...</span>
                </div>
              )}

              {sendError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {sendError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inbox')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !toUser.trim() || !body.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          ) : selectedMessage ? (
            /* MESSAGE READER VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Inbox</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToUser(selectedMessage.fromUsername);
                    setSubject(`Re: ${selectedMessage.subject}`);
                    setActiveTab('compose');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>

              {/* Message Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMessage.fromAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={selectedMessage.fromDisplayName || selectedMessage.fromUsername}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {selectedMessage.fromDisplayName || selectedMessage.fromUsername}
                      </h4>
                      <p className="text-xs font-mono text-cyan-400">
                        @{selectedMessage.fromUsername}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedMessage.timestamp}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-200">
                    Subject: {selectedMessage.subject}
                  </h3>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>
              </div>
            </div>
          ) : (
            /* INBOX MESSAGES LIST */
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                    <MailOpen className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-300">Your inbox is empty!</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No messages yet. Send a blurb or direct message to another member like @glitterqueen99 or @kevin!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send First Message</span>
                  </button>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      !msg.read
                        ? 'bg-blue-950/30 border-blue-500/40 hover:bg-blue-900/40'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.fromAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={msg.fromUsername}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {msg.fromDisplayName || msg.fromUsername}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            @{msg.fromUsername}
                          </span>
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 opacity-80">
                        {msg.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
