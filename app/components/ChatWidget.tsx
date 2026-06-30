'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "👋 Hello! I'm Cherish SI, your AI research assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userEmail: user?.email || 'guest'
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 9996,
          background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
          color: '#000',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 24px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(0,242,254,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🤖</span>
        Ask Cherish SI
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '160px',
          right: '20px',
          width: '350px',
          maxWidth: '90vw',
          maxHeight: '500px',
          background: 'rgba(42, 37, 0, 0.95)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          zIndex: 9997,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            color: '#000',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🤖 Cherish SI</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#000',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            maxHeight: '350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                    : 'rgba(255,255,255,0.08)',
                  color: msg.role === 'user' ? '#000' : '#f0f0f0',
                  padding: '10px 15px',
                  borderRadius: msg.role === 'user'
                    ? '15px 15px 0 15px'
                    : '15px 15px 15px 0',
                  maxWidth: '85%',
                  wordWrap: 'break-word',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.08)',
                color: '#f0f0f0',
                padding: '10px 15px',
                borderRadius: '15px 15px 15px 0',
                maxWidth: '85%',
                fontSize: '0.9rem'
              }}>
                <span style={{ animation: 'pulse 1.5s infinite' }}>⏳ Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '10px 15px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: '10px',
                background: '#000',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f0f0',
                borderRadius: '30px',
                outline: 'none',
                fontSize: '0.9rem'
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                color: '#000',
                border: 'none',
                borderRadius: '30px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: loading || !input.trim() ? 0.5 : 1
              }}
            >
              Send
            </button>
          </div>

          {/* Rate limit notice */}
          <div style={{
            padding: '4px 15px',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#8696a0',
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            Limited to 10 messages per minute
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}