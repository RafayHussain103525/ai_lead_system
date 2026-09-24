import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, X, PhoneCall } from 'lucide-react';
import { API_BASE } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const THINKING_MESSAGES = ['AI is thinking...', 'Doing research...', 'Please wait...', 'Cycling through...', 'Pondering...'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am the Nexus AI Assistant. How can I help you transform your enterprise today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const messagesEndRef = useRef(null);

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem('nexus_session');
    if (existing) return existing;
    const id = 'session_' + Math.random().toString(36).substring(7);
    localStorage.setItem('nexus_session', id);
    return id;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 2000);
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const addAi = (content) => setMessages((prev) => [...prev, { role: 'ai', content }]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsLoading(true);
    try {
      const postResponse = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, session_id: sessionId }),
      });
      const postData = await postResponse.json();
      if (!postResponse.ok) throw new Error(postData.detail || postData.error || `Server error ${postResponse.status}`);
      const jobId = postData.job_id;

      let isComplete = false;
      while (!isComplete) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusResponse = await fetch(`${API_BASE}/job-status?job_id=${jobId}`);
        const statusData = await statusResponse.json();
        if (statusData.status === 'completed') {
          addAi(statusData.result?.message ?? '…');
          isComplete = true;
        } else if (statusData.status === 'failed') {
          addAi('An error occurred while processing your request.');
          isComplete = true;
        } else if (statusData.status === 'not_found') {
          addAi('The request expired or was not found. Please try again.');
          isComplete = true;
        }
      }
    } catch (error) {
      addAi(`Network error: ${error.message}. Please ensure the server is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[22rem] h-[30rem] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold-500" />
              <span className="font-bold text-sm">NEXUS AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-gold-600 to-gold-400 text-black rounded-br-sm'
                    : 'bg-white/10 text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    // Plain text for user messages
                    msg.content
                  ) : (
                    // Markdown rendering for AI messages
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 prose-headings:text-gold-400 prose-strong:text-white prose-a:text-gold-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gold-500/80">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                {THINKING_MESSAGES[thinkingIndex]}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <a href="#contact" onClick={() => setIsOpen(false)}
            className="mx-4 mb-2 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gold-500 border border-white/10 rounded-full py-1.5 transition-colors">
            <PhoneCall size={12} /> Prefer a human? Book a call
          </a>
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                placeholder={isLoading ? 'Please wait…' : 'Type your message…'}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50 transition-colors"
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()}
                className="p-2.5 bg-gradient-to-br from-gold-600 to-gold-400 text-black rounded-full disabled:opacity-40 hover:scale-105 transition-transform">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-gold-600 to-gold-400 text-black rounded-full shadow-lg shadow-gold-500/30 hover:scale-105 transition-transform">
          <MessageSquare size={22} />
        </button>
      )}
    </>
  );
}