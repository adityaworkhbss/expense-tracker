import { useState, useEffect } from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  TrendingDown, Target, Wallet, 
  ArrowLeft, Zap, AlertCircle, BarChart as BarChartIcon
} from 'lucide-react';
import { analyticsApi } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [catData, setCatData] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('MONTH'); // 'WEEK', 'MONTH', 'YEAR'
  
  useEffect(() => {
    fetchAllData();
  }, [timeframe]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      let start, end;

      if (timeframe === 'WEEK') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        start = lastWeek.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
      } else if (timeframe === 'YEAR') {
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      } else {
        // MONTH
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      }

      const [summary, categories, timeline] = await Promise.all([
        analyticsApi.getSummary(start, end),
        analyticsApi.getCategoryWise(start, end),
        analyticsApi.getCashflow(start, end)
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
        <p className="text-secondary text-sm">Aggregating {timeframe.toLowerCase()}ly data...</p>
      </div>
    </div>
  );

  if (!data || !cashflow.length) return (
    <div className="page-container flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
      <AlertCircle size={48} className="text-secondary mb-4" />
      <h2 className="text-xl font-bold">Incomplete Intelligence</h2>
      <p className="text-secondary text-sm mt-1 max-w-[300px] text-center">
        We need a bit more transaction history for this period to generate a deep-dive report.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn-secondary" onClick={() => setTimeframe('YEAR')}>Try Yearly</button>
        <button className="btn-primary" onClick={() => window.location.href='/dashboard'}>Return Home</button>
      </div>
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
          
          {/* TIMEFRAME TOGGLE */}
          <div className="glass-panel" style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            padding: '0.25rem', 
            borderRadius: '12px',
            border: '1px solid var(--surface-border)'
          }}>
            {['WEEK', 'MONTH', 'YEAR'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  background: timeframe === tf ? 'var(--accent-primary)' : 'transparent',
                  color: timeframe === tf ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gradient">{timeframe.charAt(0) + timeframe.slice(1).toLowerCase()}ly Analysis</h1>
        <p className="text-secondary text-sm">Deep-dive performance report for this {timeframe.toLowerCase()} cycle</p>
      </header>

      <style>{`
        .analysis-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; margin-bottom: 1.5rem; }
        .chart-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        .split-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
        .pie-container { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        
        @media (min-width: 768px) {
          .analysis-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.25rem !important; }
          @media (min-width: 1024px) {
            .analysis-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
          .chart-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .split-grid { grid-template-columns: 1.5fr 1fr !important; gap: 3rem !important; }
          .pie-container { flex-direction: row !important; }
        }
      `}</style>

      {/* CORE PERFORMANCE CARDS */}
      <div className="analysis-grid">
        <div className="card" style={{ padding: '1rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Cash Position</span>
            <Wallet size={14} className="text-success" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.cashflowBalance)}</h2>
          <p className="text-[10px] text-secondary mt-2">Available liquid assets</p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Liabilities</span>
            <AlertCircle size={14} className="text-danger" />
          </div>
          <h2 className="text-xl font-bold text-danger">{formatCurrency(data.totalLiabilities)}</h2>
          <div className="flex-between mt-2 text-[9px] text-secondary font-bold">
            <span>CC: {formatCurrency(data.futureObligations.ccBills)}</span>
            <span>EMI: {formatCurrency(data.futureObligations.emis)}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Net Worth</span>
            <BarChartIcon size={14} className="text-accent-primary" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.netWorth)}</h2>
          <p className="text-[10px] text-secondary mt-2">Assets minus all obligations</p>
        </div>

        <div className="card" style={{ padding: '1rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.03)' }}>
          <div className="flex-between mb-3">
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">Spending Limit</span>
            <Target size={14} className="text-accent-primary" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.safeSpendingLimit)}</h2>
          <p className="text-[10px] text-secondary mt-2">Safe variable spending buffer</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="chart-grid">
        
        {/* CASHFLOW TREND */}
        <div className="card" style={{ padding: '1rem', minHeight: '350px' }}>
          <h3 className="font-bold text-base mb-6 flex-center gap-2"><TrendingDown size={18} /> Balance & Trends</h3>
          <div style={{ width: '100%', height: '250px' }}>
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
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
          <h3 className="font-bold text-base mb-6 flex-center gap-2"><Target size={18} /> Distribution</h3>
          <div className="pie-container">
            <div style={{ width: '100%', maxWidth: '200px', height: '200px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="name"
                    stroke="none"
                  >
                    {catData.map((_: any, index: number) => (
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
            <div style={{ width: '100%', flex: 1 }}>
              {catData.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex-between mb-3">
                  <div className="flex-center gap-2 overflow-hidden">
                    <div style={{ minWidth: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-secondary truncate">{item.category.name}</span>
                  </div>
                  <span className="text-[10px] font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIABILITIES DEEP DIVE */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 className="font-bold text-base mb-6">Liability Structure</h3>
        <div className="split-grid">
          <div>
             <p className="text-[11px] text-secondary mb-4 leading-relaxed">Composition of Credit Card bills and EMIs weighted against your current liquid cash position.</p>
             <div className="space-y-5">
                <div>
                   <div className="flex-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                      <span>Liquid Cash</span>
                      <span className="text-success">{formatPercent((data.cashflowBalance / (data.cashflowBalance + data.totalLiabilities)) * 100)}</span>
                   </div>
                   <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
                      <div style={{ width: `${(data.cashflowBalance / (data.cashflowBalance + data.totalLiabilities)) * 100}%`, height: '100%', background: 'var(--success)' }} />
                   </div>
                </div>
                <div>
                   <div className="flex-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                      <span>Debt & Obligations</span>
                      <span className="text-danger">{formatPercent((data.totalLiabilities / (data.cashflowBalance + data.totalLiabilities)) * 100)}</span>
                   </div>
                   <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
                      <div style={{ width: `${(data.totalLiabilities / (data.cashflowBalance + data.totalLiabilities)) * 100}%`, height: '100%', background: 'var(--danger)' }} />
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', padding: '1.5rem 0' }}>
             <div className="text-center">
                <span className="text-[9px] text-secondary uppercase font-black tracking-widest">Projected Free Cash</span>
                <h4 className="text-3xl font-black mt-1 text-accent-primary tracking-tight">{formatCurrency(data.projectedFreeCash)}</h4>
                <p className="text-[9px] text-secondary mt-3 opacity-60">Surplus after clearing all current obligations.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatPercent = (val: number) => val.toFixed(1) + '%';

export default Analysis;
