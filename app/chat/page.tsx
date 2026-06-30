'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('General');
  const [reactions, setReactions] = useState<any[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const groups = ['General', 'Art', 'Science', 'Entertainment', 'Friends Zone'];
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '🤝'];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: msgData, error: msgError } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_name', group)
          .order('timestamp', { ascending: true });

        if (!msgError) setMessages(msgData || []);

        const { data: reactData, error: reactError } = await supabase
          .from('chat_reactions')
          .select('*');

        if (!reactError) setReactions(reactData || []);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();

    const msgChannel = supabase
      .channel('group_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_name=eq.${group}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    const reactChannel = supabase
      .channel('chat_reactions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_reactions'
      }, (payload) => {
        setReactions(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reactChannel);
    };
  }, [user, group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('group_messages').insert([{
      group_name: group,
      user_name: user.email,
      message: newMessage.trim()
    }]);

    if (!error) setNewMessage('');
  };

  const addReaction = async (messageId: number, reaction: string) => {
    if (!user) return;

    const { error } = await supabase.from('chat_reactions').insert([{
      message_id: messageId,
      user_name: user.email,
      reaction: reaction
    }]);

    if (!error) {
      setShowReactionPicker(null);
    }
  };

  const getReactionsForMessage = (messageId: number) => {
    const msgReactions = reactions.filter(r => r.message_id === messageId);
    const counts: { [key: string]: number } = {};
    msgReactions.forEach(r => {
      counts[r.reaction] = (counts[r.reaction] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b141a',
        color: '#e9edef',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b141a',
      color: '#e9edef',
      fontFamily: '"Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Back and Home buttons */}
      <div style={{
        background: '#1f2c33',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* BACK button - goes one step back */}
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#aebac1',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '20px'
            }}
          >
            ← Back
          </button>
          {/* HOME button - goes to root */}
          <Link href="/">
            <button style={{
              background: 'none',
              border: 'none',
              color: '#aebac1',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '5px 8px'
            }}>
              🏠
            </button>
          </Link>
          <div style={{ marginLeft: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', color: '#e9edef' }}>{group}</h2>
            <span style={{ fontSize: '0.8rem', color: '#8696a0' }}>0 online</span>
          </div>
        </div>
      </div>

      {/* Group tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 20px',
        overflowX: 'auto',
        background: '#1f2c33'
      }}>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            style={{
              background: group === g ? '#005c4b' : 'transparent',
              color: group === g ? '#e9edef' : '#8696a0',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {messages.map((msg) => {
          const isOwn = msg.user_name === user.email;
          const reactionCounts = getReactionsForMessage(msg.id);

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                position: 'relative'
              }}
            >
              <div style={{
                background: isOwn ? '#005c4b' : '#1f2c33',
                padding: '8px 12px 6px 12px',
                borderRadius: '8px',
                borderTopRightRadius: isOwn ? '0' : '8px',
                borderTopLeftRadius: isOwn ? '8px' : '0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {!isOwn && (
                  <small style={{ color: '#00f2fe', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {msg.user_name}
                  </small>
                )}
                <div style={{ wordWrap: 'break-word', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  {msg.message}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '6px',
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#8696a0' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Reaction button */}
                  <button
                    onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8696a0',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    😊
                  </button>
                </div>
              </div>

              {/* Reactions display */}
              {Object.keys(reactionCounts).length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '3px',
                  marginTop: '2px',
                  paddingLeft: '4px'
                }}>
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} style={{
                      background: '#1f2c33',
                      borderRadius: '12px',
                      padding: '1px 8px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {emoji} {count > 1 && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{count}</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Reaction picker */}
              {showReactionPicker === msg.id && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '6px 10px',
                  background: 'rgba(30,30,30,0.95)',
                  borderRadius: '20px',
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: isOwn ? 'auto' : '0',
                  right: isOwn ? '0' : 'auto',
                  zIndex: 100,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        transition: 'transform 0.15s',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: '#1f2c33',
        padding: '10px 20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 18px',
            background: '#2a3942',
            border: 'none',
            color: '#e9edef',
            borderRadius: '25px',
            outline: 'none',
            fontSize: '0.95rem'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: '#00a884',
            color: '#fff',
            border: 'none',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}