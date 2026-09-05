import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';

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

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your AI Support Assistant. I can help you inspect product stock, prices, categories, or look up your order status!'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/chat', { message: messageText });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.data.reply,
        toolsUsed: response.data.tools_used
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an issue reaching the AI backend assistant.'
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
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              AI Support Agent
              <Sparkles className="h-3 w-3 text-amber-400" />
            </h3>
            <p className="text-[11px] text-zinc-400">Real-time DB tool execution</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
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
              className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none'
                  : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 rounded-tl-none'
              }`}
            >
              {msg.text}
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
            <span>AI agent executing database tools...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="my-2 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/60">
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

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about products or orders..."
          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-50 hover:bg-violet-500 transition"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
