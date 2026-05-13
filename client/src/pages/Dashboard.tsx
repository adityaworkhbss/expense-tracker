import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard, PieChart, 
  TrendingUp, TrendingDown, Wallet, Calendar, AlertCircle, CheckCircle2,
  ChevronRight, Zap
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

      {/* MONTHLY COMPARISON SECTION - NOW FIRST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* CURRENT MONTH CARD */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--surface-border)' }}>
            <div className="flex-between">
              <span className="font-bold flex-center text-sm" style={{ gap: '0.5rem' }}><Calendar size={14} /> Current: {data.currentMonthString}</span>
              <span className={`text-[10px] font-bold ${data.currentMonth.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {data.currentMonth.netBalance >= 0 ? 'SURPLUS' : 'DEFICIT'}
              </span>
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Realized Income</span>
              <span className="font-semibold text-sm">{formatCurrency(data.currentMonth.income)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Obligations</span>
              <span className="font-semibold text-sm">{formatCurrency(data.currentMonth.fixedExpenses)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Variable Spending</span>
              <span className="font-semibold text-sm">{formatCurrency(data.currentMonth.variableExpenses)}</span>
            </div>
            <div className="flex-between pt-2" style={{ borderTop: '1px dashed var(--surface-border)' }}>
              <span className="font-bold text-xs">Net Position</span>
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
              <span className="text-[10px] bg-accent-primary text-white px-1.5 py-0.5 rounded font-bold uppercase">Estimated</span>
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Expected Inflow</span>
              <span className="font-semibold text-sm">{formatCurrency(data.nextMonth.expectedIncome)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">Fixed Outflow</span>
              <span className="font-semibold text-sm text-danger">-{formatCurrency(data.nextMonth.expectedFixed)}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-secondary text-xs">CC Payment Due</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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

      {/* MASTER LIST SNEAK PEEK */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex-between mb-4">
          <h3 className="font-bold text-lg">Fixed Master List</h3>
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
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NAME</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>AMOUNT</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>TYPE</th>
              </tr>
            </thead>
            <tbody>
              {data.fixedMasterList?.items.slice(0, 5).map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: item.type === 'INCOME' ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: item.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                      fontWeight: 'bold'
                    }}>{item.type}</span>
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
