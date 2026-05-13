import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Wallet, Calendar, 
  ChevronRight, ArrowLeft, Filter, Download, Zap, AlertCircle
} from 'lucide-react';
import { analyticsApi } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [catData, setCatData] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const [summary, categories, timeline] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getCategoryWise(monthStart, monthEnd),
        analyticsApi.getCashflow(monthStart, monthEnd)
      ]);

      setData(summary);
      setCatData(categories.map((c: any) => ({ ...c, name: c.category.name })));
      
      // Calculate Running Balance for the trend chart
      let runningBalance = 0;
      const timelineWithBalance = timeline.map((day: any) => {
        runningBalance = runningBalance + day.income - day.expense;
        return { ...day, balance: runningBalance };
      });
      setCashflow(timelineWithBalance);
    } catch (err) {
      console.error('Failed to fetch analysis data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ 
          padding: '0.75rem 1rem', 
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.8rem'
        }}>
          {label && <p className="font-bold mb-2 text-secondary">{label}</p>}
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex-center gap-3 mb-1">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
              <span className="text-secondary">{p.name || (p.payload?.category?.name || 'Total')}:</span>
              <span className="font-bold">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="page-container flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="relative">
        <Zap className="text-accent-primary animate-pulse" size={64} />
        <div className="absolute inset-0 animate-ping rounded-full bg-accent-primary/20"></div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-1">Synthesizing Report</h2>
        <p className="text-secondary text-sm">Aggregating multiple data streams...</p>
      </div>
    </div>
  );

  if (!data || !cashflow.length) return (
    <div className="page-container flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
      <AlertCircle size={48} className="text-secondary mb-4" />
      <h2 className="text-xl font-bold">Incomplete Intelligence</h2>
      <p className="text-secondary text-sm mt-1 max-w-[300px] text-center">
        We need a bit more transaction history for this month to generate a deep-dive report.
      </p>
      <button className="btn-primary mt-6" onClick={() => window.location.href='/dashboard'}>Return Home</button>
    </div>
  );

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div className="flex-between mb-6">
          <button 
            className="flex-center gap-2" 
            onClick={() => window.history.back()}
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--surface-border)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="flex-center gap-2" style={{ 
              background: 'var(--bg-tertiary)', border: '1px solid var(--surface-border)', 
              padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600
            }}>
              <Filter size={14} /> Filter
            </button>
            <button className="flex-center gap-2 btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gradient">Financial Analysis</h1>
        <p className="text-secondary text-sm">Comprehensive performance report for this cycle</p>
      </header>

      {/* CORE PERFORMANCE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Cash Position</span>
            <Wallet size={14} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold">{formatCurrency(data.cashflowBalance)}</h2>
          <p className="text-[10px] text-secondary mt-2">Available liquid assets</p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Liabilities</span>
            <AlertCircle size={14} className="text-danger" />
          </div>
          <h2 className="text-2xl font-bold text-danger">{formatCurrency(data.totalLiabilities)}</h2>
          <div className="flex-between mt-2 text-[9px] text-secondary font-bold">
            <span>CC: {formatCurrency(data.futureObligations.ccBills)}</span>
            <span>EMI: {formatCurrency(data.futureObligations.emis)}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Net Worth</span>
            <BarChart size={14} className="text-accent-primary" />
          </div>
          <h2 className="text-2xl font-bold">{formatCurrency(data.netWorth)}</h2>
          <p className="text-[10px] text-secondary mt-2">Assets minus all obligations</p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.03)' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">Spending Limit</span>
            <Target size={14} className="text-accent-primary" />
          </div>
          <h2 className="text-2xl font-bold">{formatCurrency(data.safeSpendingLimit)}</h2>
          <p className="text-[10px] text-secondary mt-2">Safe variable spending buffer</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* CASHFLOW TREND */}
        <div className="card" style={{ padding: '1.5rem', minHeight: '400px' }}>
          <h3 className="font-bold text-lg mb-6 flex-center gap-2"><TrendingDown size={18} /> Balance & Spending Analysis</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <ComposedChart data={cashflow}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar name="Daily Spent" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
                <Area type="monotone" name="Running Balance" dataKey="balance" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-center gap-6 mt-4">
            <div className="flex-center gap-2"><div style={{ width: 10, height: 10, background: 'var(--accent-primary)', borderRadius: '50%' }} /> <span className="text-xs text-secondary">Available Balance (Curve)</span></div>
            <div className="flex-center gap-2"><div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '2px' }} /> <span className="text-xs text-secondary">Daily Spending Bars</span></div>
          </div>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="card" style={{ padding: '1.5rem', minHeight: '400px' }}>
          <h3 className="font-bold text-lg mb-6 flex-center gap-2"><Target size={18} /> Spending Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%', height: '300px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="name"
                    stroke="none"
                  >
                    {catData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '50%', paddingLeft: '1rem' }}>
              {catData.slice(0, 5).map((item, i) => (
                <div key={i} className="flex-between mb-3">
                  <div className="flex-center gap-2 overflow-hidden">
                    <div style={{ minWidth: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-secondary truncate">{item.category.name}</span>
                  </div>
                  <span className="text-xs font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIABILITIES DEEP DIVE */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="font-bold text-lg mb-6">Liability Structure</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div>
             <p className="text-sm text-secondary mb-4">Your current liabilities are composed of Credit Card bills and EMIs. The chart below shows the weight of each category against your liquid cash.</p>
             <div className="space-y-4">
                <div>
                   <div className="flex-between text-xs mb-1">
                      <span>Liquid Cash</span>
                      <span>{formatPercent((data.cashflowBalance / (data.cashflowBalance + data.totalLiabilities)) * 100)}</span>
                   </div>
                   <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
                      <div style={{ width: `${(data.cashflowBalance / (data.cashflowBalance + data.totalLiabilities)) * 100}%`, height: '100%', background: 'var(--success)' }} />
                   </div>
                </div>
                <div>
                   <div className="flex-between text-xs mb-1">
                      <span>Debt & Obligations</span>
                      <span>{formatPercent((data.totalLiabilities / (data.cashflowBalance + data.totalLiabilities)) * 100)}</span>
                   </div>
                   <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
                      <div style={{ width: `${(data.totalLiabilities / (data.cashflowBalance + data.totalLiabilities)) * 100}%`, height: '100%', background: 'var(--danger)' }} />
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--surface-border)', paddingLeft: '3rem' }}>
             <div className="text-center">
                <span className="text-xs text-secondary uppercase font-bold">Projected Free Cash</span>
                <h4 className="text-3xl font-bold mt-1 text-accent-primary">{formatCurrency(data.projectedFreeCash)}</h4>
                <p className="text-[10px] text-secondary mt-2 max-w-[200px]">This is the money left after all bills, EMIs, and liabilities are cleared.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatPercent = (val: number) => val.toFixed(1) + '%';

export default Analysis;
