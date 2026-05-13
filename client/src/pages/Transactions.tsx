import React, { useState, useEffect } from 'react';
import { Filter, Search, ArrowUpRight, ArrowDownLeft, Plus, X, AlertCircle, Check } from 'lucide-react';
import { transactionsApi, accountsApi, categoriesApi } from '../services/api';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data for adding a transaction
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newTx, setNewTx] = useState({
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    categoryId: '',
    merchant: '',
    note: '',
    transactionDate: new Date().toISOString().split('T')[0], // today YYYY-MM-DD
  });

  useEffect(() => {
    fetchTransactions();
  }, [activeTab]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'ALL' ? undefined : activeTab;
      const response = await transactionsApi.getTransactions({ type, limit: 50 });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = async () => {
    setShowAdd(true);
    setError('');
    try {
      const [accs, cats] = await Promise.all([
        accountsApi.getAccounts(),
        categoriesApi.getCategories(),
      ]);
      const activeAccs = accs.filter((a: any) => a.isActive !== false);
      setAccounts(activeAccs);
      setCategories(cats);
      if (activeAccs.length > 0 && !newTx.accountId) {
        setNewTx(prev => ({ ...prev, accountId: activeAccs[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTx.amount || parseFloat(newTx.amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!newTx.accountId) {
      setError('Select a payment method. Add one in Manage > Payment Methods first.');
      return;
    }
    setSaving(true);
    try {
      await transactionsApi.createTransaction({
        type: newTx.type,
        amount: parseFloat(newTx.amount),
        accountId: newTx.accountId,
        categoryId: newTx.categoryId || undefined,
        merchant: newTx.merchant || undefined,
        note: newTx.note || undefined,
        transactionDate: new Date(newTx.transactionDate).toISOString(),
      });
      setShowAdd(false);
      setNewTx({
        type: 'EXPENSE', amount: '', accountId: accounts[0]?.id || '',
        categoryId: '', merchant: '', note: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });
      setSuccess('Transaction added!');
      fetchTransactions();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create transaction.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredCategories = categories.filter(c =>
    newTx.type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  return (
    <div className="page-container animate-fade-in">
      <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex-center" style={{ gap: '0.5rem' }}>
          <button className="btn-icon" onClick={openAddForm}>
            <Plus size={20} />
          </button>
        </div>
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

      {/* Add Transaction Form */}
      {showAdd && (
        <div className="card animate-slide-up" style={{ marginBottom: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 className="font-semibold">Add Transaction</h3>
            <button className="btn-icon" style={{ width: '32px', height: '32px' }}
              onClick={() => { setShowAdd(false); setError(''); }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAddTransaction}>
            {/* Type toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['EXPENSE', 'INCOME'].map(type => (
                <button key={type} type="button"
                  onClick={() => setNewTx({ ...newTx, type, categoryId: '' })}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                    border: newTx.type === type ? '2px solid' : '1px solid var(--surface-border)',
                    borderColor: newTx.type === type
                      ? (type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)')
                      : 'var(--surface-border)',
                    background: newTx.type === type
                      ? (type === 'EXPENSE' ? 'var(--danger-bg)' : 'var(--success-bg)')
                      : 'transparent',
                    color: newTx.type === type
                      ? (type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)')
                      : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  {type === 'EXPENSE' ? '📤 Expense' : '📥 Income'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="text-sm text-secondary">Amount (₹)</label>
              <input type="number" className="input" placeholder="0"
                value={newTx.amount}
                onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                autoFocus style={{ fontSize: '1.25rem', fontWeight: 700 }}
              />
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="text-sm text-secondary">Payment Method</label>
              {accounts.length === 0 ? (
                <p className="text-sm text-warning" style={{ marginTop: '0.35rem' }}>
                  No payment methods found. Add one in Manage → Payment Methods first.
                </p>
              ) : (
                <select className="input" value={newTx.accountId}
                  onChange={e => setNewTx({ ...newTx, accountId: e.target.value })}>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="text-sm text-secondary">Category</label>
              <select className="input" value={newTx.categoryId}
                onChange={e => setNewTx({ ...newTx, categoryId: e.target.value })}>
                <option value="">— None —</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date & Merchant */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="text-sm text-secondary">Date</label>
                <input type="date" className="input" value={newTx.transactionDate}
                  onChange={e => setNewTx({ ...newTx, transactionDate: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-sm text-secondary">Merchant</label>
                <input type="text" className="input" placeholder="e.g. Zomato"
                  value={newTx.merchant}
                  onChange={e => setNewTx({ ...newTx, merchant: e.target.value })} />
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="text-sm text-secondary">Note (optional)</label>
              <input type="text" className="input" placeholder="What was this for?"
                value={newTx.note}
                onChange={e => setNewTx({ ...newTx, note: e.target.value })} />
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

            <button type="submit" className="btn" style={{ width: '100%', opacity: saving ? 0.6 : 1 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'EXPENSE', 'INCOME'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '0.5rem',
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: activeTab === tab ? 'var(--surface-border)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer', fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'ALL' ? 'All' : tab === 'EXPENSE' ? 'Expenses' : 'Income'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p className="text-secondary">No transactions found.</p>
        </div>
      ) : (
        <div className="upcoming-list">
          {transactions.map((t, i) => (
            <div key={t.id} className="upcoming-item animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="upcoming-info">
                <div className="upcoming-icon" style={{
                  background: t.type === 'INCOME' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                  color: t.type === 'INCOME' ? 'var(--success)' : 'var(--text-primary)'
                }}>
                  {t.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="upcoming-details">
                  <h4>{t.merchant || t.note || 'Transaction'}</h4>
                  <p>{t.category?.name || 'Uncategorized'} · {t.account?.name || ''}</p>
                </div>
              </div>
              <div className="upcoming-amount">
                <div className="amount" style={{ color: t.type === 'INCOME' ? 'var(--success)' : 'var(--text-primary)' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                <div className="date">{formatDate(t.transactionDate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
