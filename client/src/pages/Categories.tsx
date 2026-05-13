import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Tag, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCat, setNewCat] = useState({ name: '', type: 'EXPENSE', color: '#6366f1' });

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newCat.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      await categoriesApi.createCategory(newCat);
      setShowAdd(false);
      setNewCat({ name: '', type: 'EXPENSE', color: '#6366f1' });
      setSuccess('Category created!');
      fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      try {
        await categoriesApi.deleteCategory(id);
        setSuccess('Deleted!');
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  return (
    <div className="page-container animate-fade-in">
      <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <Link to="/more" className="btn-icon" style={{ background: 'transparent' }}>
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-xs text-secondary">Organize your income & expenses</p>
          </div>
        </div>
        <button className="btn-icon" onClick={() => { setShowAdd(!showAdd); setError(''); }}>
          <Plus size={24} />
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
        <div className="card animate-slide-up" style={{ marginBottom: '1.5rem' }}>
          <h3 className="font-semibold" style={{ marginBottom: '1.25rem' }}>New Category</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="text-sm text-secondary">Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Groceries, Freelance, Rent"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['EXPENSE', 'INCOME'].map(type => (
                  <button key={type} type="button"
                    onClick={() => setNewCat({ ...newCat, type })}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                      border: newCat.type === type ? '2px solid' : '1px solid var(--surface-border)',
                      borderColor: newCat.type === type
                        ? (type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)')
                        : 'var(--surface-border)',
                      background: newCat.type === type
                        ? (type === 'EXPENSE' ? 'var(--danger-bg)' : 'var(--success-bg)')
                        : 'transparent',
                      color: newCat.type === type
                        ? (type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)')
                        : 'var(--text-secondary)',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type === 'EXPENSE' ? '📤 Expense' : '📥 Income'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="text-sm text-secondary" style={{ marginBottom: '0.5rem', display: 'block' }}>Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCat({ ...newCat, color: c })}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: c, border: newCat.color === c ? '3px solid white' : '3px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: newCat.color === c ? `0 0 12px ${c}60` : 'none'
                    }}
                  />
                ))}
              </div>
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
              <button type="button" className="btn"
                style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', boxShadow: 'none' }}
                onClick={() => { setShowAdd(false); setError(''); }}
              >
                Cancel
              </button>
              <button type="submit" className="btn" style={{ flex: 2, opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>Loading...</div>
      ) : (
        <>
          {expenseCategories.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3 className="text-sm font-semibold text-secondary" style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
                Expense ({expenseCategories.length})
              </h3>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {expenseCategories.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="flex-between animate-slide-up"
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: i !== expenseCategories.length - 1 ? '1px solid var(--surface-border)' : 'none',
                      animationDelay: `${i * 0.03}s`
                    }}
                  >
                    <div className="flex-center" style={{ gap: '0.75rem' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: cat.color || 'var(--text-muted)', flexShrink: 0
                      }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <button onClick={() => handleDelete(cat.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {incomeCategories.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3 className="text-sm font-semibold text-secondary" style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
                Income ({incomeCategories.length})
              </h3>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {incomeCategories.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="flex-between animate-slide-up"
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: i !== incomeCategories.length - 1 ? '1px solid var(--surface-border)' : 'none',
                      animationDelay: `${i * 0.03}s`
                    }}
                  >
                    <div className="flex-center" style={{ gap: '0.75rem' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: cat.color || 'var(--success)', flexShrink: 0
                      }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <button onClick={() => handleDelete(cat.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {categories.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Tag size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 className="font-semibold" style={{ marginBottom: '0.5rem' }}>No categories yet</h3>
              <p className="text-sm text-secondary">Tap + to create your first expense or income category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Categories;
