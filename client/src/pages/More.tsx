import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Tags, PieChart, Download, Settings, User, LogOut, ChevronRight, Bell } from 'lucide-react';

const More = () => {
  const MENU_ITEMS = [
    { icon: <PieChart size={20} />, label: 'Analysis & Reports', color: 'var(--accent-primary)', bg: 'var(--bg-tertiary)', path: '/analysis' },
    { icon: <CreditCard size={20} />, label: 'Payment Methods', color: 'var(--success)', bg: 'var(--success-bg)', path: '/accounts' },
    { icon: <Tags size={20} />, label: 'Categories Manage', color: 'var(--warning)', bg: 'var(--warning-bg)', path: '/categories' },
    { icon: <Download size={20} />, label: 'Export Data', color: 'var(--text-primary)', bg: 'var(--surface-border)', path: '/export' },
  ];

  const PREFERENCES = [
    { icon: <User size={20} />, label: 'Profile' },
    { icon: <Bell size={20} />, label: 'Notifications' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="page-container animate-fade-in">
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-2xl font-bold">Manage</h1>
      </header>

      <section className="animate-slide-up">
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          {MENU_ITEMS.map((item, index) => (
            <Link 
              to={item.path}
              key={index}
              className="flex-between"
              style={{
                padding: '1.25rem',
                borderBottom: index !== MENU_ITEMS.length - 1 ? '1px solid var(--surface-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex-center" style={{ gap: '1rem' }}>
                <div className="upcoming-icon" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-secondary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-semibold text-secondary" style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>Preferences</h3>
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          {PREFERENCES.map((item, index) => (
            <div 
              key={index}
              className="flex-between"
              style={{
                padding: '1.25rem',
                borderBottom: index !== PREFERENCES.length - 1 ? '1px solid var(--surface-border)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex-center" style={{ gap: '1rem' }}>
                <div className="text-secondary">
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-secondary" />
            </div>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </section>
    </div>
  );
};

export default More;
