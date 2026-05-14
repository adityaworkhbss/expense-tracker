import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || user) return;

    const initGoogle = () => {
      // @ts-ignore
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error('Google Client ID is missing in environment variables');
          return;
        }

        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        
        if (buttonRef.current) {
          // @ts-ignore
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 280,
          });
        }
      } else {
        setTimeout(initGoogle, 100);
      }
    };
    
    initGoogle();
  }, [loading, user]);

  const handleCredentialResponse = async (response: any) => {
    try {
      await login(response.credential);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      alert('Login failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="page-container flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--accent-gradient)', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2rem auto',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <span className="text-3xl font-bold">C</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cashflow</h1>
        <p className="text-secondary text-sm font-medium tracking-wide">PREMIUM FINANCIAL INTELLIGENCE</p>
      </div>
      
      <div className="card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', width: '100%', maxWidth: '380px', borderRadius: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="text-xl font-bold mb-2">Welcome Back</h2>
          <p className="text-sm text-secondary">Sign in to manage your finances securely</p>
        </div>
        
        <div ref={buttonRef} style={{ minHeight: '44px' }}></div>
      </div>
    </div>
  );
};

export default Login;
