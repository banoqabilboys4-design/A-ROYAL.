import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendChatMessageStreamApi } from '../utils/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  orderFound?: any;
  timestamp: string;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedText, setLastSubmittedText] = useState<string>('');
  const [lastSubmittedTime, setLastSubmittedTime] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>(() => {
    return 'session_' + Math.random().toString(36).substring(2, 9);
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'concierge',
      text: 'Assalam-o-Alaikum! Welcome to A.ROYAL. I am your personal AI Horology & Fragrance Concierge. You may ask me regarding our timepiece specifications, pure extrait perfume notes, Cash on Delivery policy, or track an existing order by sharing your ROYAL-XXXX reference.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Prevent accidental duplicate submission within 4 seconds
    const now = Date.now();
    if (text === lastSubmittedText && now - lastSubmittedTime < 4000) {
      return;
    }
    setLastSubmittedText(text);
    setLastSubmittedTime(now);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const tempBotId = `bot-${Date.now()}`;
    const initialBotMsg: ChatMessage = {
      id: tempBotId,
      sender: 'concierge',
      text: '', // will be populated as chunks stream in
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let accumulated = '';
      const response = await sendChatMessageStreamApi(text, sessionId, (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempBotId ? { ...m, text: accumulated } : m))
        );
      });

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      if (response.orderFound) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempBotId ? { ...m, orderFound: response.orderFound } : m
          )
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempBotId
            ? {
                ...m,
                text: 'Apologies, our concierge connection encountered a brief delay. Please try again or reach our WhatsApp team directly.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#151515] hover:bg-[#8b7650] text-[#faf9f6] px-4 py-3.5 rounded-full shadow-2xl border border-[#c9ad79]/40 hover:border-[#c9ad79] transition-all duration-300 hover:scale-105"
          aria-label="Open AI Concierge Chat"
        >
          <div className="w-8 h-8 rounded-full bg-[#8b7650] group-hover:bg-[#151515] flex items-center justify-center text-white transition-colors">
            <Sparkles className="w-4 h-4 text-[#c9ad79]" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold uppercase tracking-wider text-white">AI Concierge</span>
            <span className="block text-[10px] text-[#c9ad79]">Ask products & track order</span>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#151515] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#151515]" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh] bg-[#faf9f6] border border-[#dfd8cc] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#151515] text-white p-4 border-b border-[#c9ad79]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8b7650] flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-[#c9ad79]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide flex items-center gap-1.5">
                  <span>A.ROYAL AI Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <span className="text-[10px] text-[#c9ad79] tracking-wider uppercase block">
                  Official Atelier Assistant
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="bg-white border-b border-[#dfd8cc] p-2.5 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleQuickPrompt('Which watches are available in stock?')}
              className="px-2.5 py-1 bg-[#faf9f6] hover:bg-[#8b7650] hover:text-white border border-[#dfd8cc] rounded-full shrink-0 transition-colors"
            >
              ⌚ In-stock Watches
            </button>
            <button
              onClick={() => handleQuickPrompt('Tell me about Royal Oud Extrait')}
              className="px-2.5 py-1 bg-[#faf9f6] hover:bg-[#8b7650] hover:text-white border border-[#dfd8cc] rounded-full shrink-0 transition-colors"
            >
              🌹 Royal Oud
            </button>
            <button
              onClick={() => handleQuickPrompt('What is your Cash on Delivery & delivery fee policy?')}
              className="px-2.5 py-1 bg-[#faf9f6] hover:bg-[#8b7650] hover:text-white border border-[#dfd8cc] rounded-full shrink-0 transition-colors"
            >
              🚚 COD & Shipping
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#151515] text-[#dfd8cc] rounded-br-none'
                      : 'bg-white text-[#151515] border border-[#dfd8cc] rounded-bl-none'
                  }`}
                >
                  {m.text ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 py-1 text-[#8b7650]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b7650] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b7650] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b7650] animate-bounce [animation-delay:0.4s]" />
                    </span>
                  )}

                  {/* Render Order Card if Order Was Found */}
                  {m.orderFound && (
                    <div className="mt-2.5 p-2.5 bg-[#faf9f6] rounded border border-[#dfd8cc] text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#151515]">
                        <span className="flex items-center gap-1 text-[#8b7650]">
                          <Package className="w-3.5 h-3.5" /> {m.orderFound.id}
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                          {m.orderFound.status}
                        </span>
                      </div>
                      <div className="text-neutral-600">
                        Destination: <strong>{m.orderFound.city}</strong>
                      </div>
                      <div className="text-neutral-600">
                        Amount: <strong>PKR {m.orderFound.total?.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-neutral-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white border border-[#dfd8cc] p-2.5 rounded-lg w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8b7650]" />
                <span>Concierge is consulting the royal archives...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#dfd8cc] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about watches, oud, or Order ID..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded-lg px-3 py-2 text-xs text-[#151515] placeholder-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-[#151515] hover:bg-[#8b7650] text-[#c9ad79] hover:text-white rounded-lg transition-colors disabled:opacity-40"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
