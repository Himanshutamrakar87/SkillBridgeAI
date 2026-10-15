import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIAssistantViewProps {
  onRecordActivity: (title: string, summary?: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onRecordActivity }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Hello! I am your **SkillBridge AI Learning Mentor**.\n\nI can help you understand engineering concepts, algorithms, physics, calculus, or exam topics with crystal clarity. Ask me anything, or pick one of the sample topics below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    'Explain how Dijkstra\'s shortest path algorithm works step-by-step with an example graph.',
    'What is the difference between TCP and UDP? When should an engineer use each?',
    'Explain Database Normalization from 1NF to 3NF with a practical table example.',
    'How does backpropagation update weights in a deep neural network?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendChatMessage(query, historyPayload);

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
      onRecordActivity(`Asked: "${query.slice(0, 45)}${query.length > 45 ? '...' : ''}"`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to reach AI mentor. Please try again.');
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Chat session reset. What topic or concept would you like to explore next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-2xs">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              AI Learning Mentor
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium">
                Smart Mentor
              </span>
            </h2>
            <p className="text-xs text-slate-500">Ask conceptual, mathematical, or coding questions with session memory</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="text-xs text-slate-500 hover:text-rose-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FBFDFF]">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shrink-0 mt-1 shadow-2xs">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-2xs ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-indigo-500/10'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-slate-100">
                  <span className={`font-semibold tracking-wide ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {isUser ? 'You (Student)' : 'SkillBridge AI Mentor'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {message.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyMessage(message.content, message.id)}
                      className={`hover:opacity-100 transition-opacity ml-1 ${isUser ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base text-white">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shrink-0 mt-1 shadow-2xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 text-xs text-slate-600 flex items-center gap-3 shadow-2xs">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Analyzing concept & formulating structured educational response...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Unable to complete response:</span> {errorMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Topics */}
      {messages.length <= 2 && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
            Recommended Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-700 transition-colors truncate max-w-xs text-left shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or request an explanation (Press Enter to send, Shift+Enter for new line)..."
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>SkillBridge AI is tuned for student learning and clarity</span>
          <span>{input.length}/4000 characters</span>
        </div>
      </div>
    </div>
  );
};
