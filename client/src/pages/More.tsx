import { Link } from 'react-router-dom';
import { CreditCard, Tags, PieChart, Download, Settings, LogOut, ChevronRight, Bell } from 'lucide-react';

const More = () => {
  const MENU_ITEMS = [
    { icon: <PieChart size={20} />, label: 'Analysis & Reports', desc: 'Deep dive into your spending intelligence', color: 'var(--accent-primary)', bg: 'rgba(99, 102, 241, 0.1)', path: '/analysis' },
    { icon: <CreditCard size={20} />, label: 'Payment Methods', desc: 'Manage banks, cards, and wallets', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)', path: '/accounts' },
    { icon: <Tags size={20} />, label: 'Categories Manage', desc: 'Customize your transaction rules', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', path: '/categories' },
    { icon: <Download size={20} />, label: 'Export Data', desc: 'Download CSV or PDF reports', color: 'var(--text-primary)', bg: 'rgba(255, 255, 255, 0.05)', path: '/export' },
  ];

  const PREFERENCES = [
    { icon: <Bell size={18} />, label: 'Notifications', desc: 'Budget alerts and bill reminders' },
    { icon: <Settings size={18} />, label: 'App Settings', desc: 'Theme, currency, and security' },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '8rem' }}>
      {/* PREMIUM PROFILE HEADER */}
      <header style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
        <div className="flex-center" style={{ gap: '1.25rem', justifyContent: 'flex-start' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--success))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
          }}>
            AS
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Aditya Sharma</h1>
            <p className="text-secondary text-xs font-medium">Premium Financial Intelligence</p>
          </div>
        </div>
      </header>

      <section className="animate-slide-up">
        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 pl-1">Financial Environment</h3>
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
          {MENU_ITEMS.map((item, index) => (
            <Link 
              to={item.path}
              key={index}
              className="flex-between"
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: index !== MENU_ITEMS.length - 1 ? '1px solid var(--surface-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex-center" style={{ gap: '1.25rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: item.bg, 
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-sm block">{item.label}</span>
                  <span className="text-[10px] text-secondary opacity-60">{item.desc}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-secondary opacity-30" />
            </Link>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 pl-1">System Preferences</h3>
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
          {PREFERENCES.map((item, index) => (
            <div 
              key={index}
              className="flex-between"
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: index !== PREFERENCES.length - 1 ? '1px solid var(--surface-border)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex-center" style={{ gap: '1.25rem' }}>
                <div className="text-secondary opacity-60" style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-sm block">{item.label}</span>
                  <span className="text-[10px] text-secondary opacity-60">{item.desc}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-secondary opacity-30" />
            </div>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            background: 'rgba(239, 68, 68, 0.05)', 
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
        <p className="text-center text-[9px] text-secondary mt-6 opacity-30 font-bold uppercase tracking-widest">
          Version 2.4.0 • Debt Freedom Tracker
        </p>
      </section>
    </div>
  );
};

export default More;
