'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ChatWidget from '@/app/components/ChatWidget';

// ----- Theme & accent color system -----
const accentColors: { [key: string]: string } = {
  default: '#00f2fe',
  crimson: '#ff3366',
  emerald: '#00ff9d',
  purple: '#b366ff',
  orange: '#ff9900',
  amber: '#ffbf00',
  mint: '#98fb98',
  silver: '#C0C8D0',
};

export default function Home() {
  // ----- User state -----
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ----- Theme states -----
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColor] = useState('#00f2fe');
  const [accentName, setAccentName] = useState('default');

  // ----- UI states -----
  const [selectedService, setSelectedService] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
const [hoursStatus, setHoursStatus] = useState('');
const [showToast, setShowToast] = useState(false);
const [isDatabaseConnected, setIsDatabaseConnected] = useState(true);

// ----- Platform Metrics Data States -----
  const [statsData, setStatsData] = useState({
    completedProjects: 1420,
    activeWriters: 18,
    turnaroundHours: 24
  });

  // ----- Live clock -----
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

// ----- Theme Sync Effect -----
  useEffect(() => {
    const chosenColor = accentColors[accentName] || '#00f2fe';
    setAccentColor(chosenColor);

    // Apply global variables to the document body so all pages change color together
    const root = document.documentElement;
    root.style.setProperty('--accent-color', chosenColor);
    root.style.setProperty('--bg-primary', isDark ? '#0b0f19' : '#f8fafc');
    root.style.setProperty('--text-primary', isDark ? '#f1f5f9' : '#0f172a');
    root.style.setProperty('--text-secondary', isDark ? '#94a3b8' : '#475569');
  }, [accentName, isDark]);

  // ----- Services & tiers -----
  const services = [
    'Article', 'Essay', 'Dissertation', 'PowerPoint (PP)',
    'Project', 'Literature Review', 'Case Study',
    'Research Proposal', 'Programming'
  ];

  const tiers = [
    { price: 70, label: '₦70/pw', desc: '100% Plag-Free', corrections: 4, discount: '15%' },
    { price: 60, label: '₦60/pw', desc: '90% Plag-Free', corrections: 3, discount: '12%' },
    { price: 50, label: '₦50/pw', desc: '80% Plag-Free', corrections: 2, discount: '10%' },
    { price: 40, label: '₦40/pw', desc: '60% Plag-Free', corrections: 1, discount: '8%' },
    { price: 30, label: '₦30/pw', desc: '50% Plag-Free', corrections: 0, discount: '5%' }
  ];

  // ----- Load saved theme -----
  useEffect(() => {
    const savedTheme = localStorage.getItem('writingchoice_theme');
    if (savedTheme === 'light') setIsDark(false);
    const savedAccent = localStorage.getItem('user_accent_color');
    if (savedAccent && accentColors[savedAccent]) {
      setAccentName(savedAccent);
      setAccentColor(accentColors[savedAccent]);
    }
  }, []);

  // ----- Business Hours Logic (WAT)
useEffect(() => {
  const checkHours = () => {
    const now = new Date();
    const wat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const day = wat.getDay(); // 0=Sun, 1=Mon...6=Sat
    const hour = wat.getHours();
    const minute = wat.getMinutes();

    const isWeekday = day >= 1 && day <= 6; // Monday to Saturday
    const isInHours = hour >= 8 && (hour < 22 || (hour === 22 && minute === 0)); // 8:00 AM - 10:00 PM

    if (isWeekday && isInHours) {
      setIsOpen(true);
      setHoursStatus('Open Now: Mon - Sat (8:00 AM - 10:00 PM WAT)');
    } else {
      setIsOpen(false);
      setHoursStatus('Currently Closed: Opens Monday at 8:00 AM WAT');
    }
  };

  checkHours();
  const interval = setInterval(checkHours, 60000); // Check status every minute
  return () => clearInterval(interval);
}, []);

  // ----- Live clock updater -----
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const wat = now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' });
      const d = new Date(wat);
      setTime(d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ----- User session syncing & Guest Toast Timer -----
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // If no active user session is authenticated, activate guest toast after 5 seconds
      if (!user) {
        const timer = setTimeout(() => {
          setShowToast(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };
    fetchUser();
  }, []);

  // ----- Apply theme to body -----
  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#1a1a2e' : '#f5f5dc';
    document.body.style.color = isDark ? '#f0f0f0' : '#1a1a1a';
    document.body.style.transition = 'background 0.3s, color 0.3s';
  }, [isDark]);

  // ----- Toggle functions -----
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('writingchoice_theme', newTheme ? 'dark' : 'light');
  };

  const changeAccent = (name: string) => {
    setAccentName(name);
    setAccentColor(accentColors[name]);
    localStorage.setItem('user_accent_color', name);
  };

  const selectService = (service: string) => {
    setSelectedService(service);
    setShowMenu(false);
  };

  const calculatePrice = (tierPrice: number, words: number) => {
    let total = words * tierPrice;
    if (words >= 10000) total = total * 0.85;
    return Math.round(total);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileUploaded(true);
    }
  };

  const selectTier = (price: number) => {
    setSelectedTier(price);
    setTotalPrice(calculatePrice(price, wordCount));
  };

  const handleWordCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setWordCount(val);
    if (selectedTier) setTotalPrice(calculatePrice(selectedTier, val));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ----- Sidebar menu style -----
  const menuItemStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid transparent',
    padding: '15px 20px',
    textAlign: 'left',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
    color: isDark ? '#f0f0f0' : '#1a1a1a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  // ----- Render -----
  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#1a1a2e' : '#f5f5dc',
        color: isDark ? '#f0f0f0' : '#1a1a1a',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        padding: '20px',
        transition: 'background 0.3s, color 0.3s',
      }}>
        {/* ===== TOP BAR ===== */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 20px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'transparent',
                border: `1px solid ${accentColor}`,
                color: accentColor,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.3rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ☰
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Object.entries(accentColors).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => changeAccent(name)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: color,
                    border: accentName === name ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: accentName === name ? `0 0 8px ${color}` : 'none',
                    transition: 'all 0.2s',
                    transform: accentName === name ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: `1px solid ${accentColor}`,
                color: accentColor,
                padding: '6px 12px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <span style={{ color: isDark ? '#25d366' : '#128C7E' }}>👋 {user.email}</span>
                <Link href="/dashboard">
                  <button style={{
                    background: 'transparent',
                    border: `1px solid ${accentColor}`,
                    color: accentColor,
                    padding: '6px 14px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    Dashboard
                  </button>
                </Link>
                <Link href="/chat">
                  <button style={{
                    background: 'transparent',
                    border: '1px solid #25d366',
                    color: '#25d366',
                    padding: '6px 14px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    💬 Chat
                  </button>
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  style={{
                    background: '#cc0000',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    Logout
                  </button>
              </>
            ) : (
              <Link href="/auth/login">
                <button style={{
                  background: 'transparent',
                  border: `1px solid ${accentColor}`,
                  color: accentColor,
                  padding: '8px 20px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  🔐 Login / Register
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ===== LIVE CLOCK & DATE ===== */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 10px auto',
          textAlign: 'center',
          fontSize: '0.95rem',
          opacity: 0.8,
        }}>
          <span style={{ color: accentColor }}>🕐 {time} WAT</span> &nbsp;|&nbsp;
          <span>{date}</span>
        </div>

        {/* ===== HEADER ===== */}
        <div style={{ textAlign: 'center', padding: '30px 0 10px 0' }}>
          <h1 style={{
            fontSize: '3.8rem',
            color: isDark ? '#fff' : '#1a1a1a',
            textShadow: `0 0 20px ${accentColor}`,
            border: `4px solid ${accentColor}`,
            borderRadius: '60px 10px 60px 10px',
            padding: '20px 50px',
            display: 'inline-block',
            fontWeight: '900',
            boxShadow: `0 0 30px ${accentColor}33`,
            transition: 'all 0.3s',
          }}>
            WritingChoice
          </h1>
        </div>

        {/* ===== LED BAR ===== */}
        <div style={{
          background: isDark ? '#000' : '#eee',
          border: `2px solid ${isDark ? '#0a0a0a' : '#ccc'}`,
          padding: '12px 0',
          maxWidth: '1000px',
          margin: '15px auto',
          borderRadius: '6px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 15px ${accentColor}44`,
        }}>
          <div style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            animation: 'scrollLed 25s linear infinite',
          }}>
            <span style={{
              fontFamily: 'Courier New, Courier, monospace',
              color: isDark ? '#C0C8D0' : '#333',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              letterSpacing: '2px',
              textShadow: isDark ? '0 0 5px #C0C8D0' : 'none',
              display: 'inline-block',
              paddingRight: '50px',
            }}>
              Project • Article • Essay • Dissertation • PowerPoint • Programming • Research Proposal • Analysis • Literature Review • Case Study
            </span>
            <span style={{
              fontFamily: 'Courier New, Courier, monospace',
              color: isDark ? '#C0C8D0' : '#333',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              letterSpacing: '2px',
              textShadow: isDark ? '0 0 5px #C0C8D0' : 'none',
              display: 'inline-block',
              paddingRight: '50px',
            }}>
              Project • Article • Essay • Dissertation • PowerPoint • Programming • Research Proposal • Analysis • Literature Review • Case Study
            </span>
          </div>
        </div>

        {/* ===== BUSINESS HOURS BANNER ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 20px auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 24px',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '0.95rem',
            background: isOpen ? 'rgba(37, 211, 102, 0.1)' : 'rgba(204, 0, 0, 0.1)',
            border: isOpen ? '2px solid #25d366' : '2px solid #cc0000',
            color: isOpen ? '#25d366' : '#cc0000',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isOpen ? '#25d366' : '#cc0000',
              boxShadow: isOpen ? '0 0 8px #25d366' : '0 0 8px #cc0000',
              animation: isOpen ? 'pulse-dot 1.5s infinite' : 'none'
            }} />
            <span>{hoursStatus}</span>
          </div>
        </div>

        {/* ===== WELCOME SECTION ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '30px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{
              color: accentColor,
              margin: '0 0 8px 0',
              fontSize: '1.8rem',
            }}>
              ✨ Welcome to WritingChoice
            </h2>
            <p style={{
              color: isDark ? '#f0f0f0' : '#1a1a1a',
              lineHeight: '1.8',
              fontSize: '1rem',
              margin: '0',
            }}>
              Hello and welcome! Whether you're a student racing against a deadline, a researcher polishing a proposal,
              or a professional needing a flawless document, <strong style={{ color: accentColor }}>WritingChoice</strong> is built for you.
              Our platform combines expert human writers, a powerful AI assistant (Cherish SI), and a suite of smart tools
              to deliver <strong>100% human-written, plagiarism-free academic and professional work</strong>.
            </p>
          </div>
        </div>

        {/* ===== 3 MAIN CARDS ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Card 1: Research Options */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ color: accentColor }}>✦ Research Options</h3>
            <p style={{ color: isDark ? '#888' : '#555' }}>
              {selectedService ? `Selected: ${selectedService}` : 'Tap below to view sectors'}
            </p>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '14px',
                fontSize: '1rem',
                boxShadow: `0 4px 15px ${accentColor}44`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              View Sectors
            </button>
            {showMenu && (
              <ul style={{
                listStyle: 'none',
                padding: '0',
                marginTop: '15px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                paddingTop: '15px',
              }}>
                {services.map((service) => (
                  <li
                    key={service}
                    onClick={() => selectService(service)}
                    style={{
                      color: '#cc0000',
                      fontWeight: 'bold',
                      padding: '10px 0',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    {service}
                  </li>
                ))}
              </ul>
            )}
            {selectedService && (
              <div style={{ marginTop: '20px', padding: '15px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
                <label style={{ color: accentColor, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  📎 Attach Work Brief (PDF/DOC):
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: isDark ? '#000' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#f0f0f0' : '#1a1a1a',
                    borderRadius: '5px',
                  }}
                />
                {fileUploaded && selectedFile && (
                  <div style={{ color: '#25d366', fontSize: '0.85rem', marginTop: '10px' }}>
                    ✅ Uploaded: {selectedFile.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Price Plan */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ color: accentColor }}>✦ Price Plan</h3>
            <p style={{ color: isDark ? '#888' : '#555' }}>Choose your strictly enforced tier.</p>
            <button
              onClick={() => setShowCalculator(true)}
              style={{
                background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '14px',
                fontSize: '1rem',
                boxShadow: `0 4px 15px ${accentColor}44`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Open Calculator
            </button>
          </div>

          {/* Card 3: Terms & Conditions */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ color: accentColor }}>✦ Terms & Conditions</h3>
            <p style={{ color: isDark ? '#888' : '#555' }}>Framework of Omni-Protocol use.</p>
            <button
              onClick={() => setShowTerms(true)}
              style={{
                background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '14px',
                fontSize: '1rem',
                boxShadow: `0 4px 15px ${accentColor}44`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Read Protocol
            </button>
          </div>
        </div>

        {/* ===== PLATFORM METRICS GRID SECTION ===== */}
        <section style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '40px auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Completed Projects */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--text-secondary)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '8px' }}>
              {statsData.completedProjects.toLocaleString()}+
            </div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Completed Research Projects
            </h4>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Academic papers and high-tier full-stack builds delivered globally.
            </p>
          </div>

          {/* Card 2: Active Experts */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--text-secondary)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#25d366', marginBottom: '8px' }}>
              {statsData.activeWriters} Active
            </div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Vetted Specialists Online
            </h4>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Full-stack engineers and elite academic writers actively processing tasks.
            </p>
          </div>

          {/* Card 3: Speed Turnaround */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--text-secondary)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffbf00', marginBottom: '8px' }}>
              &lt; {statsData.turnaroundHours} Hours
            </div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Average Cycle Delivery
            </h4>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Rapid development sprint milestones and accelerated draft review timelines.
            </p>
          </div>
        </section>

        {/* ===== HOW TO NAVIGATE ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '40px auto 30px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              color: accentColor,
              margin: '0 0 20px 0',
              fontSize: '1.4rem',
            }}>
              🧭 How to Navigate WritingChoice — A Quick Guide
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '25px',
            }}>
              {[
                { num: '1', title: 'Choose Your Service', desc: 'Tap "View Sectors" in the Research Options card. Select from Article, Essay, Dissertation, PowerPoint, Project, Literature Review, Case Study, Research Proposal, or Programming.' },
                { num: '2', title: 'Upload Your Brief', desc: 'Attach your assignment brief (PDF/DOC) securely. This gives our writer all the details — deadline, word count, formatting style, and any special instructions.' },
                { num: '3', title: 'Pick a Pricing Tier', desc: 'Open the Price Calculator. Choose your preferred tier (from ₦30/pw to ₦70/pw), enter your word count, and get an instant quote. Discounts apply for 10,000+ words.' },
                { num: '4', title: 'Send Order via WhatsApp', desc: 'Tap "Send Order to WhatsApp" — your order details and brief link are automatically formatted. Cherish receives it instantly and confirms within minutes.' },
                { num: '5', title: 'Join the Community', desc: 'Register or log in to access group chats (Art, Science, Entertainment, Friends Zone), the built-in document editor, and your personal dashboard to track orders.' },
                { num: '6', title: 'Ask Cherish SI', desc: 'Stuck on a concept? Tap the "Ask Cherish SI" button (bottom-right) to chat with our AI research assistant. It explains topics, brainstorms ideas, and remembers your conversations.' }
              ].map((step) => (
                <div key={step.num} style={{
                  flex: '1 1 250px',
                  background: isDark ? `rgba(0,242,254,0.05)` : `rgba(0,242,254,0.1)`,
                  borderLeft: `3px solid ${accentColor}`,
                  borderRadius: '10px',
                  padding: '18px 16px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? `rgba(0,242,254,0.1)` : `rgba(0,242,254,0.15)`}
                onMouseLeave={(e) => e.currentTarget.style.background = isDark ? `rgba(0,242,254,0.05)` : `rgba(0,242,254,0.1)`}>
                  <span style={{
                    background: accentColor,
                    color: '#000',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                  }}>{step.num}</span>
                  <h4 style={{
                    color: accentColor,
                    margin: '0 0 8px 0',
                  }}>{step.title}</h4>
                  <p style={{
                    color: isDark ? '#f0f0f0' : '#1a1a1a',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    margin: '0',
                  }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== WHO WE SERVE ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 30px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              color: accentColor,
              margin: '0 0 20px 0',
              fontSize: '1.4rem',
            }}>
              👥 Who We Serve
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
            }}>
              {[
                { icon: '🎓', title: 'Undergraduates', desc: 'From essays to final-year projects, we help you meet deadlines without compromising quality. Our writers understand university grading rubrics and deliver work that matches your level.' },
                { icon: '📖', title: 'Postgraduates', desc: 'Masters dissertations, PhD proposals, and advanced research papers are handled with the rigour they demand. We cite properly, structure logically, and polish every chapter.' },
                { icon: '💼', title: 'Professionals', desc: 'Business plans, white papers, reports, and presentations — we translate your expertise into polished, persuasive documents ready for clients, investors, or management.' },
                { icon: '💻', title: 'Programmers & Developers', desc: 'Programming assignments, code documentation, web development and technical reports. We cover Python, JavaScript, C++, and more — with clean, commented, and functional code.' }
              ].map((item) => (
                <div key={item.title} style={{
                  flex: '1 1 220px',
                  background: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)',
                  borderRadius: '12px',
                  padding: '18px 16px',
                  border: `1px solid ${isDark ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.2)'}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <h4 style={{
                    color: '#ffd700',
                    margin: '0 0 8px 0',
                  }}>
                    {item.icon} {item.title}
                  </h4>
                  <p style={{
                    color: isDark ? '#f0f0f0' : '#1a1a1a',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    margin: '0',
                  }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== HOW WE ENSURE QUALITY ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 30px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              color: accentColor,
              margin: '0 0 20px 0',
              fontSize: '1.4rem',
            }}>
              ✅ How We Ensure Quality Jobs — Our Process
            </h3>
            <div style={{
              color: isDark ? '#f0f0f0' : '#1a1a1a',
              lineHeight: '1.9',
              fontSize: '0.98rem',
            }}>
              {[
                { title: 'In-Depth Brief Analysis', desc: 'Every order starts with a thorough review of your brief. If anything is unclear — deadline, word count, formatting style, or special instructions — we ask you before work begins. No assumptions, no guesswork.' },
                { title: 'Subject-Matched Writers', desc: 'Your project is assigned to a writer with proven experience in your subject area. A law essay goes to a legal writer; a programming task goes to a developer. This ensures accuracy, depth, and proper terminology from the first draft.' },
                { title: 'Multi-Layer Plagiarism Checking', desc: 'Every draft passes through Turnitin and additional internal checks before it reaches you. We provide the Turnitin report as proof. Our 100% human-written guarantee means zero AI generation, every sentence is crafted by a real person.' },
                { title: 'Free Corrections & Revisions', desc: 'You receive the draft, and you have one week to request any changes. Corrections are free and unlimited within that window. We iterate until you\'re satisfied.' },
                { title: 'Secure Delivery & Full Handover', desc: 'Once the balance is cleared, you receive the complete, editable document in your preferred format. We never reuse or resell your work, every project is confidential and yours alone.' }
              ].map((item, index) => (
                <p key={index} style={{ margin: '0 0 12px 0' }}>
                  <strong style={{ color: accentColor }}>{index + 1}. {item.title}</strong><br />
                  {item.desc}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ===== REFUND POLICY ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              color: accentColor,
              marginTop: '0',
            }}>
              🔄 Refund & Money-Back Policy
            </h3>
            <div style={{
              background: isDark ? 'rgba(255,215,0,0.07)' : 'rgba(255,215,0,0.15)',
              borderLeft: `3px solid #ffd700`,
              borderRadius: '8px',
              padding: '14px 16px',
              margin: '12px 0',
            }}>
              <strong style={{ color: '#ffd700' }}>When you ARE eligible for a refund:</strong>
              <ul style={{
                margin: '8px 0 0 0',
                paddingLeft: '18px',
                lineHeight: '1.8',
                fontSize: '0.95rem',
                color: isDark ? '#f0f0f0' : '#1a1a1a',
              }}>
                <li>Work delivered is plagiarised <strong>above the agreed Turnitin limit</strong> for your tier.</li>
                <li>Work was <strong>not delivered on time</strong> and no corrective action was taken by WritingChoice per the Terms of Service.</li>
              </ul>
            </div>
            <div style={{
              background: isDark ? 'rgba(204,0,0,0.07)' : 'rgba(204,0,0,0.15)',
              borderLeft: `3px solid #cc0000`,
              borderRadius: '8px',
              padding: '14px 16px',
              margin: '12px 0',
            }}>
              <strong style={{ color: '#cc0000' }}>When you are NOT eligible for a refund:</strong>
              <ul style={{
                margin: '8px 0 0 0',
                paddingLeft: '18px',
                lineHeight: '1.8',
                fontSize: '0.95rem',
                color: isDark ? '#f0f0f0' : '#1a1a1a',
              }}>
                <li>You chose to terminate a contract that is already in progress.</li>
                <li>You are unhappy with the content after the free one-week correction window has closed.</li>
                <li>Requirements were changed or added after the contract began.</li>
                <li>You did not provide a complete brief before work started.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== FAQ SECTION ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{
              color: accentColor,
              fontSize: '1.5rem',
              fontWeight: '800',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ❓ Frequently Asked Questions
            </h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {[
              { q: 'How long does delivery take?', a: 'Delivery time depends on word count and complexity. Short essays (under 2,000 words) typically take 24–48 hours. Dissertations and large projects (10,000+ words) can take 5–14 days. Always provide your exact deadline when placing an order so we can confirm feasibility before you pay.' },
              { q: 'Is the work 100% human-written?', a: 'Yes, absolutely. Every document is written from scratch by a qualified human writer with subject-area expertise. We do not use AI generation tools, paraphrasing bots, or spinners. A Turnitin plagiarism report is included as proof of originality with every order.' },
              { q: 'How does the 60/40 payment work?', a: 'You pay 60% of the quoted price upfront to begin the contract. When the work is completed, a preview is sent to you. You then pay the remaining 40% to receive the full, editable document. This structure protects both parties — you never pay in full for work you haven\'t seen, and the writer is fairly compensated for work in progress.' },
              { q: 'What if I need corrections after delivery?', a: 'You are entitled to free, unlimited corrections within one week of delivery. Simply send your feedback via WhatsApp with specific details of what needs to change. After the one-week window, corrections may be treated as a new mini-contract depending on the scope of changes required.' },
              { q: 'When can I get a refund?', a: 'A refund applies in two specific cases: (1) the work is plagiarised above the agreed limit confirmed by Turnitin, or (2) the work was not delivered on time AND no corrective action was taken by us per our Terms of Service. Refunds do not apply to contracts terminated mid-progress or to dissatisfaction with content after the correction window has closed.' },
              { q: 'What is your standard turnaround time for academic research?', a: 'For standard projects, turnaround is typically within 3-5 business days. Urgent requests can be expedited depending on complexity and word count.' },
              { q: 'Do you offer full-stack web development services?', a: 'Yes! I build complete, scalable web applications using React, Next.js, and Node.js, fully integrated with databases like Supabase.' },
              { q: 'How do revisions work for my projects?', a: 'I offer up to three free revision cycles for all standard tier orders to ensure the final delivery perfectly aligns with your project requirements.' },
              { q: 'Is my personal data and project IP secure?', a: 'Absolutely. All project files, intellectual property, and client identities are kept under strict confidentiality and are never shared with third parties.' }
            ].map((faq, index) => (
              <div key={index} style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: openFaq === index ? `1px solid ${accentColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '16px',
                marginBottom: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                <div
                  onClick={() => toggleFaq ? toggleFaq(index) : setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  {faq.q}
                  <span style={{
                    color: accentColor,
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s',
                    transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0)',
                  }}>+</span>
                </div>
                {openFaq === index && (
                  <div style={{
                    padding: '0 20px 18px 20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* ===== TESTIMONIALS SECTION ===== */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px',
        }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '20px',
            padding: '30px 25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{
              color: accentColor,
              fontSize: '1.5rem',
              fontWeight: '800',
              marginBottom: '20px',
            }}>
              ⭐ What Our Clients Say
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}>
              {[
                { name: 'Adaeze O.', role: 'MSc Student · University of Lagos', text: 'My 15,000-word dissertation was delivered two days before the deadline. The Turnitin report showed 4% similarity. My supervisor was impressed with the structure. Worth every kobo.' },
                { name: 'Emmanuel T.', role: 'BSc Computer Science · UNIABUJA', text: 'I needed a Python data analysis project with documentation. Cherish delivered clean, commented code with a full README. I submitted it with confidence. Absolutely professional.' },
                { name: 'Funmilayo B.', role: 'Entrepreneur · Lagos', text: 'Used WritingChoice for a business proposal and a research article. Both were delivered on time, well-referenced, and required zero corrections. My go-to writing service now.' },
                { name: 'Kelechi N.', role: 'PhD Candidate · FUTO', text: 'I was sceptical at first because of bad experiences elsewhere. But the 60/40 payment structure made me feel safe. The literature review was thorough and well-cited. Will use again.' }
              ].map((testimonial, index) => (
                <div key={index} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '20px',
                  padding: '22px 20px',
                  position: 'relative',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ color: '#ffd700', fontSize: '0.95rem', marginBottom: '10px' }}>
                    ★★★★★
                  </div>
                  <p style={{
                    color: isDark ? '#f0f0f0' : '#1a1a1a',
                    fontSize: '0.9rem',
                    lineHeight: '1.7',
                    fontStyle: 'italic',
                    marginBottom: '14px',
                  }}>
                    "{testimonial.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '800',
                      fontSize: '1rem',
                    }}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: accentColor }}>
                        {testimonial.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isDark ? '#888' : '#555' }}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== PRICE CALCULATOR OVERLAY ===== */}
        {showCalculator && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isDark ? 'rgba(0,0,0,0.98)' : 'rgba(245,245,220,0.98)',
            zIndex: 20000,
            overflowY: 'auto',
            padding: '40px 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              maxWidth: '800px',
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              backdropFilter: 'blur(15px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '20px',
              padding: '30px',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <button
                onClick={() => setShowCalculator(false)}
                style={{
                  position: 'sticky',
                  top: '20px',
                  float: 'right',
                  background: 'linear-gradient(135deg, #cc0000, #ff4444)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  zIndex: 21000,
                }}
              >
                ✕ CLOSE
              </button>

              <div style={{ clear: 'both' }} />

              <h2 style={{ color: accentColor, marginTop: '20px' }}>Choose Your Tier</h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginTop: '20px',
              }}>
                {tiers.map((tier) => (
                  <div
                    key={tier.price}
                    onClick={() => selectTier(tier.price)}
                    style={{
                      background: selectedTier === tier.price ? `rgba(0,242,254,0.1)` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      border: selectedTier === tier.price ? `2px solid ${accentColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '12px',
                      padding: '15px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transform: selectedTier === tier.price ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <h3 style={{ color: accentColor, margin: '5px 0' }}>{tier.label}</h3>
                    <p style={{ color: isDark ? '#f0f0f0' : '#1a1a1a', fontSize: '0.75rem' }}>{tier.desc}</p>
                    <ul style={{
                      textAlign: 'left',
                      padding: '0',
                      listStyle: 'none',
                      fontSize: '0.75rem',
                      color: isDark ? '#f0f0f0' : '#1a1a1a',
                    }}>
                      <li>✅ Turnitin Report</li>
                      <li>✅ {tier.corrections} Corrections</li>
                      <li>✅ {tier.discount} off @ 10k+ words</li>
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <h3 style={{ color: accentColor }}>Enter Word Count</h3>
                <input
                  type="number"
                  placeholder="Enter Word Count"
                  onChange={handleWordCount}
                  style={{
                    background: isDark ? '#000' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: accentColor,
                    padding: '12px',
                    width: '80%',
                    maxWidth: '300px',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    margin: '15px 0',
                    outline: 'none',
                  }}
                />
                {selectedTier && wordCount > 0 && (
                  <div>
                    <div style={{ fontSize: '2rem', color: '#ffd700', fontWeight: '900' }}>
                      ₦{totalPrice.toLocaleString()}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              service: selectedService || 'Not selected',
                              tier: `₦${selectedTier}/pw`,
                              words: wordCount,
                              total: totalPrice,
                              brief: selectedFile ? selectedFile.name : 'No file attached',
                              customerName: 'Guest',
                              email: 'guest@email.com'
                            })
                          });
                          const data = await response.json();
                          if (!response.ok) alert('Error saving order: ' + (data.error || 'Unknown error'));
                        } catch (error) {
                          console.error(error);
                          alert('Network error. Check console.');
                        }
                        const message = `*NEW ORDER*%0A%0A*Service:* ${selectedService || 'Not selected'}%0A*Tier:* ₦${selectedTier}/pw%0A*Words:* ${wordCount}%0A*Total:* ₦${totalPrice.toLocaleString()}%0A*Brief:* ${selectedFile ? selectedFile.name : 'No file attached'}`;
                        window.open(`https://wa.me/2348138842719?text=${message}`, '_blank');
                      }}
                      style={{
                        background: '#25d366',
                        color: 'white',
                        padding: '15px',
                        border: 'none',
                        borderRadius: '10px',
                        width: '100%',
                        maxWidth: '400px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '15px',
                        fontSize: '1.1rem',
                      }}
                    >
                      SEND ORDER TO WHATSAPP
                    </button>
                    <p style={{ color: '#cc0000', fontSize: '0.75rem', marginTop: '10px' }}>
                      *Emergency/Math works treated differently.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TERMS OVERLAY ===== */}
        {showTerms && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isDark ? 'rgba(0,0,0,0.98)' : 'rgba(245,245,220,0.98)',
            zIndex: 20000,
            overflowY: 'auto',
            padding: '40px 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              maxWidth: '800px',
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              backdropFilter: 'blur(15px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '20px',
              padding: '30px',
              position: 'relative',
              color: isDark ? '#f0f0f0' : '#1a1a1a',
              lineHeight: '1.6',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  position: 'sticky',
                  top: '20px',
                  float: 'right',
                  background: 'linear-gradient(135deg, #cc0000, #ff4444)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  zIndex: 21000,
                }}
              >
                ✕ CLOSE
              </button>

              <div style={{ clear: 'both' }} />

              <h2 style={{ color: accentColor }}>My Terms of Service</h2>

              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>0.</b> You are required to <b>provide the full task brief, including deadline, word count, formatting style, and any specific instructions</b> before work begins. Work cannot start without a complete brief.
              </div>
              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>1.</b> I take a <b>60% non-negotiable upfront payment</b> before I begin any work, and the payment signifies we have a contract and that you have agreed to the offer, and my <b>terms of service.</b> And when I am done with the work, I'll send you a preview of the finished work and you are required to balance up to get the full document.
              </div>
              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>2.</b> Each writing job you bring is a different contract. Please understand that you cannot transfer the terms of one contract to another. Also note that terminating a contract that is in progress is unacceptable as it cannot lead to a refund.<br /><br />
                The basis of a refund applies when we did not meet our sides of the bargain according to your brief and materials (delivery, or it is plagiarized above the agreed limit).
              </div>
              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>3.</b> You are required to:
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>a. Provide the task brief of your work.</div>
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>b. Provide a deadline. Please, unless otherwise stated, it is not acceptable to try to coerce the writer to submit the work half to the deadline.</div>
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>c. Provide a word count. (<b>We do not work on a blind wordcount</b>).</div>
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>d. We advise you provide a sample work from the archives of your school to guide us too.</div>
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>e. Provide every other details of the work beforehand. <i>Sending requirements after a contract has begun is not acceptable.</i></div>
              </div>
              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>4.</b> While I yearn to serve you better, I hope you try to work with me on my terms. Please note that you are required to give me feedback exactly within one week of my submitting your work to you. After one week, we will mark the contract has successfully done automatically, and feedbacks may become null and void to the contract.
              </div>
              <div style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: `2px solid ${accentColor}` }}>
                <b>5.</b> Please we prefer <b>WhatsApp chats only</b>. We do not accept calls where the call has to do with describing the job. Do type all the requirements for reference purposes.
              </div>

              <div style={{
                background: isDark ? 'rgba(255,215,0,0.07)' : 'rgba(255,215,0,0.15)',
                borderLeft: '3px solid #ffd700',
                borderRadius: '8px',
                padding: '14px 16px',
                margin: '12px 0',
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ffd700', marginRight: '8px' }}></i>
                <b>Please note that an upfront payment signifies that you accept our terms of service and our contract has begun. We cannot begin your work without an upfront payment.</b>
              </div>
            </div>
          </div>
        )}

        {/* ===== KEYFRAMES ===== */}
        <style>{`
          @keyframes scrollLed {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ===== SIDEBAR OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 39999,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? '0' : '-300px',
        width: '280px',
        height: '100vh',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: '5px 0 25px rgba(0,0,0,0.5)',
        zIndex: 40000,
        transition: 'left 0.3s ease',
        padding: '30px 20px',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          paddingBottom: '15px',
        }}>
          <h3 style={{ color: accentColor, margin: 0 }}>⚡ Menu</h3>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#f0f0f0' : '#1a1a1a',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '10px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderRadius: '20px',
            marginBottom: '15px',
          }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <strong>{user.email}</strong>
              <br />
              <small style={{ color: '#ffd700' }}>Member</small>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              window.location.href = '/auth/login';
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${accentColor}`,
              color: accentColor,
              padding: '12px',
              borderRadius: '15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              marginBottom: '15px',
            }}
          >
            🔐 Login / Sign Up
          </button>
        )}

        {/* ===== BUSINESS HOURS BANNER ===== */}
<div style={{
  maxWidth: '1000px',
  margin: '0 auto 20px auto',
  padding: '0 20px'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 24px',
    borderRadius: '50px',
    fontWeight: '700',
    fontSize: '0.95rem',
    background: isOpen ? 'rgba(37, 211, 102, 0.1)' : 'rgba(204, 0, 0, 0.1)',
    border: isOpen ? '2px solid #25d366' : '2px solid #cc0000',
    color: isOpen ? '#25d366' : '#cc0000',
    flexWrap: 'wrap',
    textAlign: 'center'
  }}>
    <span style={{
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: isOpen ? '#25d366' : '#cc0000',
      boxShadow: isOpen ? '0 0 8px #25d366' : '0 0 8px #cc0000',
      animation: isOpen ? 'pulse-dot 1.5s infinite' : 'none'
    }} />
    <span>{hoursStatus}</span>
  </div>
</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user && (
            <>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  window.location.href = '/dashboard';
                }}
                style={menuItemStyle}
              >
                👤 Profile
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  window.location.href = '/chat';
                }}
                style={menuItemStyle}
              >
                💬 Groups
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  window.location.href = '/admin';
                }}
                style={menuItemStyle}
              >
                ⚙️ Admin
              </button>
              <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '15px 0' }} />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                style={{
                  ...menuItemStyle,
                  color: '#cc0000',
                }}
              >
                🚪 Logout
              </button>
            </>
          )}
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              window.location.href = '/';
            }}
            style={menuItemStyle}
          >
            🏠 Home
          </button>
        </div>
      </div>

      {/* ===== CHAT WIDGET ===== */}
      <ChatWidget />
      <style>{`
        @keyframes scrollLed {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>

      {/* ===== GUEST REGISTRATION REMINDER TOAST ===== */}
        {showToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid #333333',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '320px',
            zIndex: 9999,
            animation: 'slideUpToast 0.4s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#25d366' }}>
                Hey there, Guest! 👋
              </h4>
              <button 
                onClick={() => setShowToast(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888888',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cccccc', lineHeight: '1.4' }}>
              Create an account or log in to save your workspace progress and unlock all premium platform tools.
            </p>
          </div>
        )}

        {/* ===== FOOTER WORKSPACE CREDITS & PLATFORM STATUS ===== */}
        <footer style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '60px auto 0 auto',
          padding: '24px 20px',
          borderTop: '1px solid var(--text-secondary)',
          opacity: 0.8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Cherish Jude. All Workspace Rights Reserved.
          </div>

          {/* Platform Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isDatabaseConnected ? 'rgba(37, 211, 102, 0.06)' : 'rgba(255, 51, 102, 0.06)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: isDatabaseConnected ? '1px solid rgba(37, 211, 102, 0.2)' : '1px solid rgba(255, 51, 102, 0.2)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDatabaseConnected ? '#25d366' : '#ff3366',
              boxShadow: isDatabaseConnected ? '0 0 6px #25d366' : '0 0 6px #ff3366'
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {isDatabaseConnected ? 'Supabase Sync: Operational' : 'Supabase Sync: Offline'}
            </span>
          </div>
        </footer>
    </>
  );
}