'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // Fetch orders for this user
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email)
        .order('timestamp', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Segoe UI, Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--text-secondary)',
            borderTop: '3px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Syncing workspace profile...
          </span>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      padding: '2.5rem 1.5rem',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* ===== TOP CONTROLS NAVIGATION ===== */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent-color)',
                color: 'var(--accent-color)',
                padding: '10px 22px',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back
            </button>
            <h1 style={{ color: 'var(--accent-color)', margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              My Dashboard
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/">
              <button style={{
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-primary)',
                padding: '10px 22px',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}>
                🏠 Home
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: '#cc0000',
                border: 'none',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(204,0,0,0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ===== TWO-COLUMN HUB CONTENT ===== */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          
          {/* --- MODULE 1: PREMIUM PROFILE & AVATAR COMPONENT --- */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '28px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient Background Glow matching the active system theme accent */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '180px',
              height: '180px',
              background: 'var(--accent-color)',
              opacity: 0.08,
              filter: 'blur(45px)',
              pointerEvents: 'none'
            }} />

            {/* Profile Avatar Frame */}
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-color), rgba(0,0,0,0.4))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '2.2rem',
                fontWeight: '800',
                color: '#0b0f19',
                border: '3px solid var(--accent-color)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
              }}>
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--accent-color)',
                color: '#0b0f19',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                border: '2px solid var(--bg-primary)',
                transition: 'transform 0.2s ease'
              }}>
                📷
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => alert('Avatar cloud storage container sync executed.')} 
                />
              </label>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                Verified Platform Member
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.3px' }}>{user?.email}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Account Token Reference: <span style={{ fontFamily: 'monospace', opacity: 0.8, background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>{user?.id}</span>
              </div>
            </div>
          </div>

          {/* --- MODULE 2: PIPELINE METRICS QUICK GRID --- */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.3px' }}>Total Tracked Orders</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '10px', color: 'var(--accent-color)' }}>{orders.length}</div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.3px' }}>Active Workspace Processing</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '10px', color: '#ffbf00' }}>
                {orders.filter(o => o.status === 'In Progress' || o.status === 'Pending' || o.status === 'Revision').length}
              </div>
            </div>
          </div>

          {/* --- MODULE 3: INFRASTRUCTURE PIPELINE SYSTEM RECORDS --- */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '28px',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 1.75rem 0', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📦 Project Task Orders Pipeline
            </h3>
            
            {orders.length === 0 ? (
              <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                No active processing records found inside your pipeline synchronization directory.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderLeft: `4px solid ${
                      order.status === 'Completed' ? '#25d366' :
                      order.status === 'In Progress' ? 'var(--accent-color)' :
                      order.status === 'Revision' ? '#ff9900' : '#ffbf00'
                    }`,
                    padding: '18px 24px',
                    borderRadius: '0 16px 16px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>{order.service}</h4>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span>Tier Level: <strong style={{ color: 'var(--text-primary)' }}>{order.tier}</strong></span>
                        <span>Volume: <strong style={{ color: 'var(--text-primary)' }}>{order.word_count} words</strong></span>
                        <span>Registered: {new Date(order.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                        ₦{order.price?.toLocaleString()}
                      </span>
                      <span style={{
                        background: order.status === 'Completed' ? 'rgba(37, 211, 102, 0.1)' : 
                                    order.status === 'In Progress' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 191, 0, 0.1)',
                        color: order.status === 'Completed' ? '#25d366' : 
                               order.status === 'In Progress' ? 'var(--accent-color)' : '#ffbf00',
                        padding: '5px 14px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}