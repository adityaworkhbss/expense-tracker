import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, CreditCard, Landmark, Wallet, Smartphone, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountsApi } from '../services/api';

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newAcc, setNewAcc] = useState({ name: '', type: 'PAY_NOW' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAccounts();
      // Only show active accounts in the UI
      setAccounts(data.filter((a: any) => a.isActive !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newAcc.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await accountsApi.createAccount({ ...newAcc, openingBalance: 0 });
      setShowAdd(false);
      setNewAcc({ name: '', type: 'PAY_NOW' });
      setSuccess('Payment mode added!');
      fetchAccounts();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create. Check your inputs.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this payment mode? If it has transactions, it will be deactivated instead.')) {
      try {
        await accountsApi.deleteAccount(id);
        setSuccess('Removed!');
        fetchAccounts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAY_NOW': return <Wallet size={20} />;
      case 'PAY_LATER': return <CreditCard size={20} />;
      default: return <Landmark size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PAY_NOW': return 'var(--success)';
      case 'PAY_LATER': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PAY_NOW': return 'Pay Now (Immediate)';
      case 'PAY_LATER': return 'Pay Later (Loan/Credit)';
      default: return type;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <Link to="/more" className="btn-icon" style={{ background: 'transparent' }}>
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payment Methods</h1>
            <p className="text-xs text-secondary">Manage where your money flows</p>
          </div>
        </div>
        <button className="btn-icon" onClick={() => { setShowAdd(!showAdd); setError(''); }}>
          <Plus size={24} />
        </button>
      </header>

      {/* Success toast */}
      {success && (
        <div className="animate-slide-up" style={{
          background: 'var(--success-bg)', border: '1px solid var(--success)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--success)', fontSize: '0.875rem'
        }}>
          <Check size={16} /> {success}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card animate-slide-up" style={{ marginBottom: '1.5rem' }}>
          <h3 className="font-semibold" style={{ marginBottom: '1.25rem' }}>Add Payment Method</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="text-sm text-secondary">Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. HDFC Bank, Amex Card, PhonePe"
                value={newAcc.name}
                onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setNewAcc({ ...newAcc, type: 'PAY_NOW' })}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                    border: newAcc.type === 'PAY_NOW' ? '2px solid var(--success)' : '1px solid var(--surface-border)',
                    background: newAcc.type === 'PAY_NOW' ? 'var(--success-bg)' : 'transparent',
                    color: newAcc.type === 'PAY_NOW' ? 'var(--success)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                  }}
                >
                  <Wallet size={16} /> Pay Now
                </button>
                <button
                  type="button"
                  onClick={() => setNewAcc({ ...newAcc, type: 'PAY_LATER' })}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                    border: newAcc.type === 'PAY_LATER' ? '2px solid var(--warning)' : '1px solid var(--surface-border)',
                    background: newAcc.type === 'PAY_LATER' ? 'var(--warning-bg)' : 'transparent',
                    color: newAcc.type === 'PAY_LATER' ? 'var(--warning)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                  }}
                >
                  <CreditCard size={16} /> Pay Later
                </button>
              </div>
              <p className="text-xs text-muted" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                {newAcc.type === 'PAY_NOW' ? 'Immediate deduction (Bank, Wallet, UPI)' : 'Loan or Credit (Credit Card, EMI)'}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--danger)', fontSize: '0.875rem'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', boxShadow: 'none' }}
                onClick={() => { setShowAdd(false); setError(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{ flex: 2, opacity: saving ? 0.6 : 1 }}
                disabled={saving}
              >
                {saving ? 'Adding...' : 'Add Method'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account list */}
      {loading ? (
        <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="text-secondary">Loading accounts...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Landmark size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 className="font-semibold" style={{ marginBottom: '0.5rem' }}>No payment methods yet</h3>
          <p className="text-sm text-secondary">Tap the + button to add your first bank account, card, or wallet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {accounts.map((acc, i) => (
            <div
              key={acc.id}
              className="flex-between animate-slide-up"
              style={{
                padding: '1rem 1.25rem',
                borderBottom: i !== accounts.length - 1 ? '1px solid var(--surface-border)' : 'none',
                animationDelay: `${i * 0.04}s`,
                opacity: 1
              }}
            >
              <div className="flex-center" style={{ gap: '1rem' }}>
                <div
                  className="upcoming-icon"
                  style={{ background: `${getTypeColor(acc.type)}20`, color: getTypeColor(acc.type) }}
                >
                  {getIcon(acc.type)}
                </div>
                <div>
                  <h4 className="font-medium">{acc.name}</h4>
                  <p className="text-xs text-secondary">{getTypeLabel(acc.type)}</p>
                </div>
              </div>
              <div className="flex-center" style={{ gap: '0.75rem' }}>
                <button
                  onClick={() => handleDelete(acc.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '1.5rem', padding: '0 1rem' }}>
        These are the payment methods you can choose from when adding a transaction.
      </p>
    </div>
  );
};

export default Accounts;

