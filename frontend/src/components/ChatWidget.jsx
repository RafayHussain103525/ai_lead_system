import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

const THINKING_MESSAGES =[
  "AI is thinking...",
  "Doing research...",
  "Please wait...",
  "Cycling through..."
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am the Nexus AI Assistant. How can I help you transform your enterprise today?' }
  ]);
  const[input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const[thinkingIndex, setThinkingIndex] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cycle through thinking messages while loading
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 2000); // changes every 2 seconds
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Generate a random session ID once per page load
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(7));

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Send message to FastAPI (Queue it)
      const postResponse = await fetch(`http://localhost:8080/chat?query=${encodeURIComponent(userText)}&session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      const postData = await postResponse.json();
      const jobId = postData.job_id;

      // 2. Poll the job-status endpoint
      let isComplete = false;
      while (!isComplete) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before checking
        
        const statusResponse = await fetch(`http://localhost:8080/job-status?job_id=${jobId}`);
        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          // Add the AI's response to the chat
          setMessages(prev =>[...prev, { role: 'ai', content: statusData.result.message }]);
          isComplete = true;
        } else if (statusData.status === 'failed') {
          setMessages(prev =>[...prev, { role: 'ai', content: "An error occurred while processing your request." }]);
          isComplete = true;
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev =>[...prev, { role: 'ai', content: "Network error. Please ensure the server is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* The Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-2xl shadow-gold-500/20 bg-dark/60 backdrop-blur-xl border border-gold-500/30">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-dark to-black border-b border-gold-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold-500 w-5 h-5" />
              <h3 className="text-gold-500 font-semibold tracking-wider">NEXUS AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X w={5} h={5} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gold-500/20 text-gold-100 border border-gold-500/30 rounded-br-none' 
                    : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white/5 text-gold-400 border border-gold-500/20 rounded-2xl rounded-bl-none text-sm flex items-center gap-2 italic">
                  <span className="animate-pulse">●</span>
                  {THINKING_MESSAGES[thinkingIndex]}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gold-500/20 bg-black/50">
            <div className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                placeholder={isLoading ? "Please wait..." : "Type your message..."}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-1 p-1.5 bg-gold-500 hover:bg-gold-400 text-black rounded-full disabled:opacity-50 disabled:hover:bg-gold-500 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Floating Chat Bubble */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-br from-gold-600 to-gold-400 text-black rounded-full shadow-lg shadow-gold-500/30 hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}