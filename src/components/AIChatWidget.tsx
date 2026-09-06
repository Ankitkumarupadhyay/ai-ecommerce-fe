import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient } from '@/api/client';
import { useAppSelector } from '@/store/hooks';

// ─── Constants ────────────────────────────────────────────────────────────────
const GUEST_CHAT_KEY = 'ai_guest_chat_count';
const GUEST_CHAT_LIMIT = 3;

function getGuestCount(): number {
  return parseInt(localStorage.getItem(GUEST_CHAT_KEY) || '0', 10);
}
function incrementGuestCount(): number {
  const next = getGuestCount() + 1;
  localStorage.setItem(GUEST_CHAT_KEY, String(next));
  return next;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  toolsUsed?: string[];
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ isOpen, onClose }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your AI Support Assistant. I can help you with product info, prices, stock availability, or your order status!'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Reset login gate if user signs in while chat is open
  useEffect(() => {
    if (isAuthenticated && showLoginGate) {
      setShowLoginGate(false);
    }
  }, [isAuthenticated]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    // ── Guest chat limit check ─────────────────────────────────────────────
    if (!isAuthenticated) {
      const count = getGuestCount();
      if (count >= GUEST_CHAT_LIMIT) {
        setShowLoginGate(true);
        return;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/chat', {
        message: messageText,
        session_id: sessionId,
      });

      // Persist session ID so all messages in one chat session are grouped
      if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.data.reply,
        toolsUsed: response.data.tools_used
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Increment guest counter AFTER successful response
      if (!isAuthenticated) {
        const newCount = incrementGuestCount();
        if (newCount >= GUEST_CHAT_LIMIT) {
          // Show the gate after this message renders
          setTimeout(() => setShowLoginGate(true), 800);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an issue reaching the AI assistant backend.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'What products are available?',
    'What is the price of Wireless Headphones?',
    'What is the status of my order?'
  ];

  return (
    <div className="fixed bottom-36 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl backdrop-blur-xl flex flex-col h-[540px] max-h-[calc(100vh-10rem)]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              AI Support Agent
              <Sparkles className="h-3 w-3 text-amber-400" />
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isAuthenticated ? 'Signed in · Full access' : `Guest · ${GUEST_CHAT_LIMIT - getGuestCount()} messages left`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 px-4 py-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-950 border border-violet-800 text-violet-400 mt-0.5">
                <Bot className="h-3 w-3" />
              </div>
            )}

            <div
              className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none'
                  : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 rounded-tl-none'
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="mt-1.5 pt-1 border-t border-zinc-700/40 text-[10px] text-violet-300 font-mono flex items-center gap-1">
                  <span>Tools:</span>
                  <span className="bg-violet-950/80 px-1.5 py-0.5 rounded border border-violet-800/50">
                    {msg.toolsUsed.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 mt-0.5">
                <User className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic pl-8">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
            <span>AI agent thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Login Gate Banner ──────────────────────────────────────────────── */}
      {showLoginGate && !isAuthenticated && (
        <div className="mx-4 mb-3 rounded-xl bg-violet-950/80 border border-violet-700/60 px-4 py-3 flex items-start gap-3 shrink-0">
          <ShieldAlert className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-violet-200 mb-1">
              You've used your {GUEST_CHAT_LIMIT} free AI messages
            </p>
            <p className="text-violet-300/80 mb-2">
              Sign in with Google to continue chatting with no limits.
            </p>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In to Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Prompts ─────────────────────────────────────────────────── */}
      {!showLoginGate && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-zinc-800/60 pt-2 shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-[10px] bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full border border-zinc-700/50 transition truncate max-w-full"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !showLoginGate && handleSend()}
          placeholder={showLoginGate ? 'Sign in to continue chatting...' : 'Ask AI about products or orders...'}
          disabled={showLoginGate && !isAuthenticated}
          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim() || (showLoginGate && !isAuthenticated)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-50 hover:bg-violet-500 transition"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
