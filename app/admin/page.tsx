'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      // Check if user is admin (email contains "judecherish")
      if (!user.email?.includes('judecherish')) {
        router.push('/');
        return;
      }
      setUser(user);
      loadUsers();
      loadMessages();
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  // Load all users
  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*');
    if (!error && data) {
      setUsers(data);
    }
  };

  // Load all group messages
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .order('timestamp', { ascending: false });
    if (!error && data) {
      setMessages(data);
    }
  };

  // Delete a user
  const deleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('email', email);
    if (!error) {
      loadUsers();
    }
  };

  // Delete a message
  const deleteMessage = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase
      .from('group_messages')
      .delete()
      .eq('id', id);
    if (!error) {
      loadMessages();
    }
  };

  // Send broadcast email
  const sendBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage) {
      alert('Please fill in both subject and message.');
      return;
    }
    setBroadcastStatus('Sending...');
    try {
      // Get all verified users' emails
      const { data: members, error } = await supabase
        .from('members')
        .select('email');
      if (error) throw error;
      
      const emails = members.map(m => m.email).filter(Boolean);
      if (emails.length === 0) {
        setBroadcastStatus('❌ No users found.');
        return;
      }

      // Send broadcast via API
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadcastSubject,
          message: broadcastMessage,
          emails: emails
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setBroadcastStatus(`✅ Sent to ${data.count} users!`);
        setBroadcastSubject('');
        setBroadcastMessage('');
      } else {
        setBroadcastStatus('❌ ' + data.error);
      }
    } catch (error) {
      setBroadcastStatus('❌ Network error.');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#2a2500',
        color: '#f0f0f0',
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
      background: '#2a2500',
      color: '#f0f0f0',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{ color: '#00f2fe' }}>⚙️ Admin Dashboard</h1>
          <Link href="/">
            <button style={{
              background: 'transparent',
              border: '1px solid #00f2fe',
              color: '#00f2fe',
              padding: '8px 16px',
              borderRadius: '30px',
              cursor: 'pointer'
            }}>
              Home
            </button>
          </Link>
        </div>

        {/* ===== STATISTICS ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00f2fe' }}>{users.length}</h3>
            <p>Total Users</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00f2fe' }}>{messages.length}</h3>
            <p>Total Messages</p>
          </div>
        </div>

        {/* ===== USER MANAGEMENT ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#ffd700' }}>👥 User Management</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px' }}>{u.name || 'N/A'}</td>
                      <td style={{ padding: '8px' }}>{u.email}</td>
                      <td style={{ padding: '8px' }}>{u.role || 'Member'}</td>
                      <td style={{ padding: '8px' }}>
                        {u.email !== user?.email && (
                          <button
                            onClick={() => deleteUser(u.email)}
                            style={{
                              background: '#cc0000',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== MESSAGE MANAGEMENT ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#ffd700' }}>💬 Message Management</h2>
          {messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Message</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Group</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px' }}>{msg.user_name}</td>
                      <td style={{ padding: '8px', maxWidth: '200px', wordBreak: 'break-word' }}>
                        {msg.message}
                      </td>
                      <td style={{ padding: '8px' }}>{msg.group_name}</td>
                      <td style={{ padding: '8px', fontSize: '0.8rem' }}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          style={{
                            background: '#cc0000',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== BROADCAST SYSTEM ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '20px',
          borderRadius: '20px'
        }}>
          <h2 style={{ color: '#ffd700' }}>📣 Send Update to All Members</h2>
          <input
            type="text"
            placeholder="Subject"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f0',
              borderRadius: '30px'
            }}
          />
          <textarea
            placeholder="Your update message..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f0',
              borderRadius: '15px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={sendBroadcast}
            style={{
              background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
              color: '#000',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            Send to All Users
          </button>
          {broadcastStatus && (
            <p style={{ marginTop: '12px', color: broadcastStatus.includes('✅') ? '#25d366' : '#cc0000' }}>
              {broadcastStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}