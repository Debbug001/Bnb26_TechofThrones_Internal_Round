import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, RotateCcw, Bot } from 'lucide-react';
import { AIMessage, SessionData } from '../types';
import { SUGGESTED_PROMPTS, generateMockAIResponse } from '../utils/aiResponses';

interface AIAssistantTabProps {
  session: SessionData;
  initialQuery?: string;
  onCitationClick?: (timestamp: string) => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  session,
  initialQuery,
  onCitationClick,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle initial query if provided (e.g. from "View AI summary")
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    // Add user query
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Simulate brief AI reasoning
    setTimeout(() => {
      const aiResponse = generateMockAIResponse(query, session);
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden select-none">
      
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#FCFBF9]/80">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-none">
              AI Assistant
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Grounded in transcript
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Main Conversation Stream / Empty State */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          /* EMPTY STATE with heading and suggested questions */
          <div className="h-full flex flex-col justify-center py-4">
            <div className="text-center mb-5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 mx-auto mb-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>

              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Ask your conversation anything.
              </h3>

              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Explore decisions, speaker summaries, or action items from this meeting.
              </p>
            </div>

            {/* Suggested Prompts Stack */}
            <div className="space-y-1.5 w-full">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Suggested Questions
              </div>

              {SUGGESTED_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => handleSendMessage(promptText)}
                  className="w-full p-2.5 text-left rounded-xl border border-slate-200/90 bg-[#FCFBF9] hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-150 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-1">
                      {promptText}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* CHAT MESSAGES THREAD (ChatGPT-style) */
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                } animate-in fade-in duration-150`}
              >
                {/* User Message */}
                {msg.role === 'user' ? (
                  <div className="flex flex-col items-end max-w-[88%]">
                    <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs bg-slate-900 text-white text-xs font-medium shadow-2xs leading-relaxed">
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  /* Assistant Structured Message */
                  <div className="w-full bg-[#FCFBF9] border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-teal-600 text-white flex items-center justify-center">
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Roundtable AI
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Main Content text */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {msg.content}
                    </p>

                    {/* Structured Sections */}
                    {msg.sections && msg.sections.length > 0 && (
                      <div className="mt-3 space-y-2.5">
                        {msg.sections.map((section, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-white border border-slate-100"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-[11px] font-bold text-slate-900">
                                {section.title}
                              </h4>
                              {section.timestampBadge && (
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-200/60 px-1 py-0.2 rounded">
                                  {section.timestampBadge}
                                </span>
                              )}
                            </div>

                            <ul className="space-y-1 text-xs text-slate-600">
                              {section.points.map((point, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                                  <span className="leading-snug select-text text-[11px]">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Citations Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>References</span>
                        </div>

                        <div className="space-y-1.5">
                          {msg.citations.map((cite, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => onCitationClick && onCitationClick(cite.timestamp)}
                              className="w-full text-left p-2 rounded bg-white hover:bg-slate-50 border border-slate-200/70 text-[10px] text-slate-600 leading-snug transition-colors cursor-pointer"
                              title="Click to jump in transcript"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                                <span>{cite.speaker}</span>
                                <span className="text-teal-700 font-mono text-[9px] bg-teal-50 px-1 rounded">
                                  {cite.timestamp}
                                </span>
                              </div>
                              <p className="italic text-slate-500 line-clamp-1">
                                "{cite.snippet}"
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 animate-in fade-in duration-150">
                <div className="w-4 h-4 rounded bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1 h-1 rounded-full bg-teal-600 animate-pulse" />
                  <span>Synthesizing answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Prompts Row when chatting */}
      {messages.length > 0 && (
        <div className="px-3 py-1.5 border-t border-slate-100 bg-[#FCFBF9]/60 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {SUGGESTED_PROMPTS.slice(0, 3).map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => handleSendMessage(promptText)}
              className="text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:border-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {promptText}
            </button>
          ))}
        </div>
      )}

      {/* ChatGPT-style Message Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 border-t border-slate-200/80 bg-white shrink-0"
      >
        <div className="relative flex items-center bg-[#FCFBF9] border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 focus-within:bg-white transition-all shadow-2xs">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about this meeting..."
            disabled={isLoading}
            className="w-full text-xs pl-3.5 pr-9 py-2.5 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-30 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Send query"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
