import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, RefreshCw, CreditCard, PieChart, 
  TrendingUp, TrendingDown, Wallet, Calendar, AlertCircle, CheckCircle2
} from 'lucide-react';
import { analyticsApi } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsApi.getExcelDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatPercent = (val: number) => {
    return (val || 0).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex-center" style={{ height: '80vh' }}>
        <RefreshCw className="animate-spin text-accent-primary" size={32} />
        <p className="text-secondary ml-3">Synthesizing analytics...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="page-container flex-center" style={{ height: '80vh' }}>
      <p className="text-secondary">No data available. Add some transactions to get started!</p>
    </div>
  );

  const StatusBadge = ({ savingsRate }: { savingsRate: number }) => {
    if (savingsRate >= 30) return <span className="badge-success">Exceeding Targets</span>;
    if (savingsRate >= 15) return <span className="badge-warning">Healthy Savings</span>;
    return <span className="badge-danger">Budget Warning</span>;
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-3xl font-bold text-gradient">Executive Summary</h1>
          <p className="text-secondary text-sm">Fiscal Year {data.fyString}</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <button 
            onClick={() => window.location.href='/analysis'}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--surface-border)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Advanced Analysis <TrendingUp size={14} />
          </button>
          <StatusBadge savingsRate={data.ytd.savingsRate} />
        </div>
      </header>
      <style>{`
        .dashboard-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; margin-bottom: 1.5rem; }
        .hero-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(2, 1fr); margin-bottom: 1.5rem; }
        .ratios-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        
        @media (min-width: 768px) {
          .dashboard-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
          .hero-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 1rem !important; }
          .ratios-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* MONTHLY COMPARISON SECTION - NOW FIRST */}
      <div className="dashboard-grid">
        
        {/* CURRENT MONTH CARD */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--surface-border)' }}>
            <div className="flex-between">
              <span className="font-bold flex-center text-sm" style={{ gap: '0.5rem' }}><Calendar size={14} /> Current: {data.currentMonthString}</span>
              <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${data.currentMonth.netBalance >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                {data.currentMonth.netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Income (+)</span>
              <span className="font-semibold text-sm">+{formatCurrency(data.currentMonth.income)}</span>
            </div>
            
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Expenses (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.currentMonth.fixedExpenses)}</span>
            </div>
            
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">EMI Outflow (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.insights?.emiTotal || 0)}</span>
            </div>

            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">CC Usage (+)</span>
              <span className="font-semibold text-sm">+{formatCurrency(data.currentMonth.ccExpensesCurrent)}</span>
            </div>
            
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">CC Bill Payment (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.currentMonth.ccPaymentPrev)}</span>
            </div>

            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Variable Spending (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.currentMonth.variableExpenses)}</span>
            </div>

            <div className="flex-between mt-3 pt-2" style={{ borderTop: '1px dashed var(--surface-border)' }}>
              <span className="font-bold text-sm">Left Off Money</span>
              <span className={`font-bold text-base ${data.currentMonth.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(data.currentMonth.netBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* NEXT MONTH PROJECTION CARD */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div className="flex-between">
              <span className="font-bold flex-center text-sm" style={{ gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <TrendingUp size={14} /> Projected: {data.nextMonthString}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {data.nextMonth.expectedFixed < data.currentMonth.expectedFixed && (
                  <span className="bg-success text-[9px] text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                    SAVING {formatCurrency(data.currentMonth.expectedFixed - data.nextMonth.expectedFixed)} ✨
                  </span>
                )}
                <span className="text-[10px] bg-accent-primary text-white px-1.5 py-0.5 rounded font-bold uppercase">Estimated</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Income (+)</span>
              <span className="font-semibold text-sm">{formatCurrency(data.nextMonth.expectedIncome)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Expense (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.nextMonth.expectedFixed - (data.insights.emiPercentOfIncome * data.nextMonth.expectedIncome / 100))}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">EMI (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.insights.emiPercentOfIncome * data.nextMonth.expectedIncome / 100)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">CC Payment Due (-)</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.nextMonth.ccPaymentDue)}</span>
            </div>
            <div className="flex-between pt-2" style={{ borderTop: '1px dashed var(--surface-border)' }}>
              <span className="font-bold text-xs">Forecasted Balance</span>
              <span className="font-bold text-base text-accent-primary">
                {formatCurrency(data.nextMonth.estBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP METRICS HERO - NOW SECOND & COMPACT */}
      <div className="hero-grid">
        <div className="card glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--danger)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-[10px] font-bold text-danger uppercase">Today's Spent</span>
            <Wallet size={14} className="text-danger" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.summary?.dailyExpense || 0)}</h2>
        </div>

        <div className="card glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--success)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-[10px] font-bold text-success uppercase">YTD Surplus</span>
            <TrendingUp size={14} className="text-success" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.ytd.netSavings)}</h2>
        </div>

        <div className="card glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-[10px] font-bold text-accent-primary uppercase">Savings Rate</span>
            <PieChart size={14} className="text-accent-primary" />
          </div>
          <h2 className="text-xl font-bold">{formatPercent(data.ytd.savingsRate)}</h2>
        </div>

        <div className="card glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--warning)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span className="text-[10px] font-bold text-warning uppercase">Avg Spending</span>
            <CreditCard size={14} className="text-warning" />
          </div>
          <h2 className="text-xl font-bold">{formatCurrency(data.currentMonth.totalExpenses)}</h2>
        </div>
      </div>

      {/* RATIOS & ANALYTICS GRID */}
      <div className="ratios-grid">
        <div className="card" style={{ padding: '1.5rem' }}>
          <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Health Indicators</h4>
          <div className="flex-between mb-3">
            <span className="text-sm">EMI-to-Income</span>
            <span className={`font-bold ${data.insights.emiPercentOfIncome > 40 ? 'text-danger' : 'text-success'}`}>
              {formatPercent(data.insights.emiPercentOfIncome)}
            </span>
          </div>
          <div className="flex-between mb-3">
            <span className="text-sm">Fixed-to-Variable</span>
            <span className="font-bold">{formatPercent(data.insights.fixedVsVariable)}</span>
          </div>
          <div className="flex-between">
            <span className="text-sm">Credit Utilization</span>
            <span className="font-bold">{formatPercent(data.insights.ccVsBankSpending)}</span>
          </div>
        </div>

        <div className="card flex-center" style={{ padding: '1.5rem', textAlign: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          {data.ytd.savingsRate >= 20 ? (
            <CheckCircle2 size={40} className="text-success" />
          ) : (
            <AlertCircle size={40} className="text-warning" />
          )}
          <div>
            <h4 className="font-bold">Recommendation</h4>
            <p className="text-xs text-secondary mt-1 px-4">
              {data.ytd.savingsRate >= 20 ? 
                'You are maintaining a strong savings discipline. Consider investing the surplus.' : 
                'Spending is high relative to income. Review variable costs to hit your 20% savings target.'}
            </p>
          </div>
        </div>
      </div>

      {/* DEBT FREEDOM TRACKER - VERTICAL MOBILE VIEW */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
        <div className="flex-between mb-6">
          <div className="flex-center gap-3">
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <TrendingDown size={18} className="text-success" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Debt Freedom Tracker</h3>
              <p className="text-secondary text-[9px] uppercase font-bold tracking-widest mt-0.5">6-Month Roadmap</p>
            </div>
          </div>
          <span className="text-[8px] bg-success/10 text-success px-2 py-1 rounded-full font-bold uppercase">Active</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {data.projections.map((p: any, i: number) => {
            const maxVal = Math.max(...data.projections.map((d: any) => d.fixedObligations));
            const width = maxVal > 0 ? (p.fixedObligations / maxVal) * 100 : 0;
            
            return (
              <div key={i} style={{ position: 'relative' }}>
                <div className="flex-between mb-1.5">
                  <span className="text-[10px] font-black uppercase text-secondary tracking-tight">{p.month}</span>
                  <div className="flex-center gap-2">
                    {p.savingsGained > 0 && (
                      <span className="text-[8px] font-black text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20 animate-pulse">
                        +{formatCurrency(p.savingsGained)} SAVED
                      </span>
                    )}
                    <span className={`text-[10px] font-black ${p.savingsGained > 0 ? 'text-success' : ''}`}>
                      {formatCurrency(p.fixedObligations)}
                    </span>
                  </div>
                </div>
                
                <div style={{ 
                  height: '8px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  border: '1px solid var(--surface-border)'
                }}>
                  <div 
                    style={{ 
                      width: `${width}%`, 
                      height: '100%', 
                      background: p.savingsGained > 0 
                        ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.6))' 
                        : 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.3))',
                      borderRadius: '10px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRight: p.savingsGained > 0 ? '2px solid var(--success-text)' : 'none'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <p className="text-secondary text-[10px] leading-relaxed italic text-center">
            Your monthly burden is projected to drop by <span className="text-success font-bold">{formatCurrency(data.projections[0].fixedObligations - data.projections[data.projections.length - 1].fixedObligations)}</span> by year-end.
          </p>
        </div>
      </div>

      {/* MASTER LIST SNEAK PEEK */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex-between mb-4">
          <h3 className="font-bold text-lg flex-center gap-2">
            <CreditCard size={16} className="text-accent-primary" /> Fixed Master List
          </h3>
          <button 
            onClick={() => window.location.href='/emis'}
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--surface-border)',
              color: 'var(--accent-primary)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-border)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          >
            VIEW ALL <ArrowUpRight size={14} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.fixedMasterList.items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-[10px] text-secondary">{item.notes}</div>
                  </td>
                  <td className="text-sm font-bold">{formatCurrency(item.amount)}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {item.remainingTenure !== null ? (
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${item.remainingTenure <= 2 ? 'bg-success/20 text-success' : 'bg-secondary/20 text-secondary'}`}>
                        {item.remainingTenure} {item.remainingTenure === 1 ? 'month' : 'months'} left
                        {item.remainingTenure <= 2 && ' ✨'}
                      </div>
                    ) : (
                      <span className="text-[10px] text-secondary font-medium italic">Fixed</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge-${item.type === 'INCOME' ? 'success' : 'danger'}`} style={{ fontSize: '0.6rem' }}>
                      {item.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
