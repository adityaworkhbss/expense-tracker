import React, { useState, useEffect } from 'react';
import { Activity, Plus, Settings, Trash2, X, AlertCircle, Check } from 'lucide-react';
import { emisApi, recurringApi, accountsApi, categoriesApi } from '../services/api';

const Emis = () => {
  const [emis, setEmis] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'EMI' | 'SUBSCRIPTION'>('SUBSCRIPTION');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [newSub, setNewSub] = useState({
    note: '',
    amount: '',
    frequency: 'MONTHLY',
    nextRunAt: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
    type: 'EXPENSE'
  });

  const [newEmi, setNewEmi] = useState({
    name: '',
    principal: '',
    tenure: '',
    monthlyEmi: '',
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date().toISOString().split('T')[0],
    accountId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const fetchData = async () => {
    try {
      const [emisData, subsData] = await Promise.all([
        emisApi.getEmis(),
        recurringApi.getRecurring()
      ]);
      setEmis(emisData);
      setSubscriptions(subsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
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
      if (activeAccs.length > 0) {
        if (!newSub.accountId) setNewSub(prev => ({ ...prev, accountId: activeAccs[0].id }));
        if (!newEmi.accountId) setNewEmi(prev => ({ ...prev, accountId: activeAccs[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newSub.amount || parseFloat(newSub.amount) <= 0) { setError('Enter a valid amount'); return; }
    if (!newSub.accountId) { setError('Select a payment method'); return; }
    if (!newSub.note) { setError('Name/Note is required'); return; }

    setSaving(true);
    try {
      await recurringApi.createRecurring({
        type: newSub.type, amount: parseFloat(newSub.amount), frequency: newSub.frequency,
        nextRunAt: new Date(newSub.nextRunAt).toISOString(), accountId: newSub.accountId,
        categoryId: newSub.categoryId || undefined, note: newSub.note,
      });
      setShowAdd(false);
      setNewSub({
        note: '', amount: '', frequency: 'MONTHLY', nextRunAt: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || '', categoryId: '', type: 'EXPENSE'
      });
      setSuccess('Subscription added!');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newEmi.name || !newEmi.principal || !newEmi.tenure || !newEmi.monthlyEmi || !newEmi.accountId) {
      setError('All fields are required'); return;
    }

    setSaving(true);
    try {
      await emisApi.createEmi({
        name: newEmi.name, principal: parseFloat(newEmi.principal), tenure: parseInt(newEmi.tenure, 10),
        monthlyEmi: parseFloat(newEmi.monthlyEmi), 
        startDate: new Date(newEmi.startDate).toISOString(),
        nextDueDate: new Date(newEmi.nextDueDate).toISOString(),
        accountId: newEmi.accountId,
      });
      setShowAdd(false);
      setNewEmi({
        name: '', principal: '', tenure: '', monthlyEmi: '',
        startDate: new Date().toISOString().split('T')[0],
        nextDueDate: new Date().toISOString().split('T')[0], accountId: accounts[0]?.id || ''
      });
      setSuccess('EMI added!');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create EMI.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (window.confirm('Delete this subscription?')) {
      try {
        await recurringApi.deleteRecurring(id);
        setSuccess('Deleted successfully!');
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteEmi = async (id: string) => {
    if (window.confirm('Delete this EMI?')) {
      try {
        await emisApi.deleteEmi(id);
        setSuccess('EMI deleted successfully!');
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const calculateProgress = (remaining: number, principal: number) => {
    if (!principal || principal === 0) return 0;
    return Math.max(0, Math.min(100, ((principal - remaining) / principal) * 100));
  };

  const getMonthsPaid = (startDate: string) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();
    // If we haven't reached the exact day of the month yet, subtract 1
    if (now.getDate() < start.getDate()) {
      months--;
    }
    return Math.max(0, months);
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold">Obligations</h1>
        <button className="btn-icon" onClick={openAddForm}>
          <Plus size={20} />
        </button>
      </header>

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

      {showAdd && (
        <div className="card animate-slide-up" style={{ 
          marginBottom: '2rem', 
          border: '1px solid var(--accent-primary)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
            <div>
              <h3 className="text-xl font-bold">New Obligation</h3>
              <p className="text-xs text-secondary">Set up a recurring payment or income item</p>
            </div>
            <button type="button" className="btn-icon" style={{ width: '32px', height: '32px' }}
              onClick={() => { setShowAdd(false); setError(''); }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              background: 'var(--bg-tertiary)', 
              padding: '4px', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--surface-border)'
            }}>
              <button type="button" onClick={() => { setAddType('EMI'); setError(''); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'calc(var(--radius-sm) - 2px)',
                  border: 'none',
                  background: addType === 'EMI' ? 'var(--accent-primary)' : 'transparent',
                  color: addType === 'EMI' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s'
                }}>
                🏦 EMI / Loan
              </button>
              <button type="button" onClick={() => { setAddType('SUBSCRIPTION'); setError(''); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'calc(var(--radius-sm) - 2px)',
                  border: 'none',
                  background: addType === 'SUBSCRIPTION' ? 'var(--accent-primary)' : 'transparent',
                  color: addType === 'SUBSCRIPTION' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s'
                }}>
                🔄 Fixed Item
              </button>
            </div>
          </div>

          {addType === 'SUBSCRIPTION' ? (
            <form onSubmit={handleAddSub}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-secondary">Item Name</label>
                <input type="text" className="input" placeholder="e.g. Rent, Insurance, Parent Support"
                  value={newSub.note} onChange={e => setNewSub({ ...newSub, note: e.target.value })} autoFocus />
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button type="button" onClick={() => setNewSub({ ...newSub, type: 'EXPENSE' })}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--surface-border)',
                        background: newSub.type === 'EXPENSE' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
                        color: newSub.type === 'EXPENSE' ? 'var(--danger)' : 'var(--text-secondary)',
                        borderColor: newSub.type === 'EXPENSE' ? 'var(--danger)' : 'var(--surface-border)'
                      }}>Expense</button>
                    <button type="button" onClick={() => setNewSub({ ...newSub, type: 'INCOME' })}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--surface-border)',
                        background: newSub.type === 'INCOME' ? 'rgba(46, 204, 113, 0.1)' : 'transparent',
                        color: newSub.type === 'INCOME' ? 'var(--success)' : 'var(--text-secondary)',
                        borderColor: newSub.type === 'INCOME' ? 'var(--success)' : 'var(--surface-border)'
                      }}>Income</button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Frequency</label>
                  <select className="input" value={newSub.frequency}
                    onChange={e => setNewSub({ ...newSub, frequency: e.target.value })}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Amount (₹)</label>
                  <input type="number" className="input" placeholder="0"
                    value={newSub.amount} onChange={e => setNewSub({ ...newSub, amount: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Debit/Credit Date</label>
                  <input type="date" className="input" value={newSub.nextRunAt}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    onChange={e => setNewSub({ ...newSub, nextRunAt: e.target.value })} />
                </div>
              </div>
 
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Payment Method</label>
                  <select className="input" value={newSub.accountId}
                    onChange={e => setNewSub({ ...newSub, accountId: e.target.value })}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Category</label>
                  <select className="input" value={newSub.categoryId}
                    onChange={e => setNewSub({ ...newSub, categoryId: e.target.value })}>
                    <option value="">— None —</option>
                    {categories
                      .filter(c => c.type === newSub.type)
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button type="submit" className="btn" style={{ width: '100%', opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Fixed Item'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddEmi}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-secondary">Loan / EMI Name</label>
                <input type="text" className="input" placeholder="e.g. Personal Loan, Car Loan"
                  value={newEmi.name} onChange={e => setNewEmi({ ...newEmi, name: e.target.value })} autoFocus />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Total Principal (₹)</label>
                  <input type="number" className="input" placeholder="0"
                    value={newEmi.principal} onChange={e => setNewEmi({ ...newEmi, principal: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Tenure (Months)</label>
                  <input type="number" className="input" placeholder="e.g. 12"
                    value={newEmi.tenure} onChange={e => setNewEmi({ ...newEmi, tenure: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Monthly EMI (₹)</label>
                  <input type="number" className="input" placeholder="0"
                    value={newEmi.monthlyEmi} onChange={e => setNewEmi({ ...newEmi, monthlyEmi: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Deduct From</label>
                  <select className="input" value={newEmi.accountId}
                    onChange={e => setNewEmi({ ...newEmi, accountId: e.target.value })}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Loan Start Date</label>
                  <input type="date" className="input" value={newEmi.startDate}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    onChange={e => setNewEmi({ ...newEmi, startDate: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-sm text-secondary">Next Due Date</label>
                  <input type="date" className="input" value={newEmi.nextDueDate}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    onChange={e => setNewEmi({ ...newEmi, nextDueDate: e.target.value })} />
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button type="submit" className="btn" style={{ width: '100%', opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Saving...' : 'Add EMI'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Active EMIs Section */}
      <section className="animate-slide-up">
        <div className="section-title">Active EMIs</div>
        <div className="upcoming-list">
          {loading ? (
            <div className="text-secondary text-sm">Loading...</div>
          ) : emis.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <Activity size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', margin: '0 auto' }} />
              <p className="text-secondary text-sm">No active EMIs</p>
            </div>
          ) : emis.map((emi, i) => {
            const paidAmount = Number(emi.principal) - Number(emi.remainingBalance);
            const progress = (emi.monthsPaid / emi.tenure) * 100;

            return (
              <div key={emi.id} className="card" style={{ 
                animationDelay: `${i * 0.1}s`, padding: '1.5rem', marginBottom: '1rem',
                opacity: emi.active ? 1 : 0.6,
                borderLeft: emi.active ? '4px solid var(--accent-primary)' : '4px solid var(--text-muted)'
              }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div className="flex-center" style={{ gap: '0.75rem' }}>
                    <div className={`upcoming-icon ${emi.active ? 'emi' : ''}`} style={{ 
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: emi.active ? 'var(--accent-primary-transparent)' : 'var(--surface-border)'
                    }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 className="font-semibold text-lg">{emi.name}</h3>
                        {!emi.active && <span className="text-[10px] bg-gray-500 text-white px-1.5 py-0.5 rounded">PAID OFF</span>}
                      </div>
                      <p className="text-xs text-secondary">
                        {emi.active ? `Due ${new Date(emi.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Fully Paid'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-center" style={{ gap: '1rem' }}>
                    <div className="text-xl font-bold text-warning">{formatCurrency(emi.monthlyEmi)}<span className="text-xs text-secondary font-normal">/mo</span></div>
                    <button onClick={() => handleDeleteEmi(emi.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex-between text-xs text-secondary" style={{ marginBottom: '0.5rem' }}>
                    <span>Paid: {formatCurrency(paidAmount)}</span>
                    <span>Remaining: {formatCurrency(emi.remainingBalance)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: emi.active ? 'var(--warning)' : 'var(--success)', 
                      width: `${progress}%`,
                      borderRadius: '3px',
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                  <div className="flex-between text-xs text-secondary" style={{ marginTop: '0.5rem' }}>
                    <span>{emi.monthsPaid} of {emi.tenure} months</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fixed Payments & Income Section */}
      <section className="animate-slide-up" style={{ marginTop: '2rem', animationDelay: '0.3s' }}>
        <div className="section-title">Fixed Payments & Income</div>
        
        {loading ? (
          <div className="text-secondary text-sm">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <Settings size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', margin: '0 auto' }} />
            <h4 className="font-semibold" style={{ marginBottom: '0.25rem' }}>No Fixed Items</h4>
            <p className="text-secondary text-sm">Tap the + button to add recurring payments or income.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {subscriptions.map((sub, i) => (
              <div key={sub.id} className="flex-between animate-slide-up" style={{
                padding: '1rem 1.25rem',
                borderBottom: i !== subscriptions.length - 1 ? '1px solid var(--surface-border)' : 'none',
                animationDelay: `${i * 0.04}s`
              }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                  <div className="upcoming-icon" style={{ 
                    background: sub.type === 'INCOME' ? 'rgba(46, 204, 113, 0.1)' : 'var(--surface-border)',
                    color: sub.type === 'INCOME' ? 'var(--success)' : 'inherit'
                  }}>
                    <Settings size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{sub.note || 'Fixed Item'}</h4>
                    <p className="text-xs text-secondary">
                      {sub.frequency.charAt(0) + sub.frequency.slice(1).toLowerCase()} • Next: {new Date(sub.nextRunAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                  <div className={`font-semibold ${sub.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                    {sub.type === 'INCOME' ? '+' : '-'}{formatCurrency(sub.amount)}
                  </div>
                  <button onClick={() => handleDeleteSub(sub.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Emis;
