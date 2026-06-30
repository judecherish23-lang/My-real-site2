'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setMessage('✅ Check your email for verification!');
      }
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#2a2500',
      color: '#f0f0f0',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: '#00f2fe', textAlign: 'center' }}>
          {isLogin ? 'Login' : 'Register'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f0',
              borderRadius: '30px',
              fontSize: '1rem'
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f0',
              borderRadius: '30px',
              fontSize: '1rem'
            }}
            required
          />
          
          {message && (
            <p style={{
              color: message.includes('✅') ? '#25d366' : '#cc0000',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              {message}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
              color: '#000',
              padding: '12px',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              fontSize: '1rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: '#ffd700',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </span>
        </p>
      </div>
    </div>
  );
}