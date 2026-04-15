import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend
} from 'recharts'
import GlowCard from '../components/ui/GlowCard'
import SectionTitle from '../components/ui/SectionTitle'
import MonoValue from '../components/ui/MonoValue'
import StatBadge from '../components/ui/StatBadge'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const EQUITY_7D = [
  { d: 'Apr 8',  pnl: 0,       bench: 0       },
  { d: 'Apr 9',  pnl: 48,      bench: 30       },
  { d: 'Apr 10', pnl: 210,     bench: 95       },
  { d: 'Apr 11', pnl: 120,     bench: 110      },  // worst day dip
  { d: 'Apr 12', pnl: 540,     bench: 190      },
  { d: 'Apr 13', pnl: 980,     bench: 280      },  // best day
  { d: 'Apr 14', pnl: 1200,    bench: 340      },
  { d: 'Apr 15', pnl: 1452.5,  bench: 420      },
]

const EQUITY_1D = Array.from({ length: 24 }, (_, i) => ({
  d: `${i}:00`,
  pnl:   Math.max(0, 1200 + Math.sin(i / 3) * 120 + i * 12 + Math.random() * 30),
  bench: Math.max(0, 350 + i * 3 + Math.random() * 20),
}))

const EQUITY_30D = Array.from({ length: 30 }, (_, i) => ({
  d: `Day ${i + 1}`,
  pnl:   Math.max(0, Math.pow(i, 1.6) * 8 + Math.random() * 40),
  bench: Math.max(0, i * 14 + Math.random() * 20),
}))

const DATASETS: Record<string, typeof EQUITY_7D> = { '1D': EQUITY_1D, '7D': EQUITY_7D, '30D': EQUITY_30D }

const STRATEGY_TABLE = [
  { name: 'Cross-pool Arb',  trades: 142, win: '71.8%', gross: '+$198.41', gas: '$22.33', net: '+$176.08', sharpe: '2.41' },
  { name: 'Trend Following', trades:  58, win: '65.5%', gross: '+$221.11', gas: '$23.33', net: '+$197.78', sharpe: '1.87' },
  { name: 'Mean Reversion',  trades:  34, win: '58.8%', gross: '+$41.91',  gas: '$8.93',  net: '+$32.98',  sharpe: '1.12' },
  { name: 'LP Provision',    trades:  12, win: '91.7%', gross: '+$53.24',  gas: '$7.56',  net: '+$45.68',  sharpe: '3.02' },
]

// PNL histogram buckets
const DIST_DATA = [
  { bucket: '-$5',  trades: 4,  profit: false },
  { bucket: '-$3',  trades: 7,  profit: false },
  { bucket: '-$1',  trades: 11, profit: false },
  { bucket: '+$1',  trades: 18, profit: true  },
  { bucket: '+$3',  trades: 22, profit: true  },
  { bucket: '+$5',  trades: 14, profit: true  },
  { bucket: '+$7',  trades: 9,  profit: true  },
  { bucket: '+$10', trades: 4,  profit: true  },
]

// ─── CUSTOM COMPONENTS ────────────────────────────────────────────────────────

const EquityTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,11,18,0.96)', border: '1px solid var(--border-accent)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 700, margin: '2px 0' }}>
          {p.name}: ${p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

const DistTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,11,18,0.96)', border: '1px solid var(--border-accent)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10 }}>{label}</p>
      <p style={{ color: payload[0].fill, fontSize: 13, fontWeight: 700 }}>{payload[0].value} trades</p>
    </div>
  )
}

// Mini Donut for win-rate card
function WinDonut({ value }: { value: number }) {
  const data = [{ v: value }, { v: 100 - value }]
  return (
    <PieChart width={64} height={64}>
      <Pie data={data} cx={28} cy={28} innerRadius={20} outerRadius={28} startAngle={90} endAngle={-270} stroke="none" dataKey="v">
        <Cell fill="var(--cyan)" />
        <Cell fill="rgba(255,255,255,0.04)" />
      </Pie>
    </PieChart>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [range, setRange] = useState<'1D' | '7D' | '30D'>('7D')
  const data = DATASETS[range]

  return (
    <div className="space-y-6">

      {/* ── SECTION A: Equity Curve ── */}
      <GlowCard delay={0} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle title="Portfolio Equity Curve" dotColor="var(--cyan)" />
          <div className="flex gap-1.5">
            {(['1D', '7D', '30D'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: range === r ? 'rgba(0,229,255,0.12)' : 'transparent',
                  color: range === r ? 'var(--cyan)' : 'var(--text-muted)',
                  border: range === r ? '1px solid rgba(0,229,255,0.3)' : '1px solid var(--border-dim)',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="d" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }} tickLine={false} />
            <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }} tickLine={false} tickFormatter={v => `$${v}`} domain={[0, 1600]} />
            <Tooltip content={<EquityTooltip />} />
            {/* Annotations for best/worst day (only on 7D) */}
            {range === '7D' && (
              <>
                <ReferenceLine x="Apr 13" stroke="rgba(0,255,136,0.4)" strokeDasharray="4 4"
                  label={{ value: '▲ Best Day', position: 'top', fill: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 9 }} />
                <ReferenceLine x="Apr 11" stroke="rgba(255,68,68,0.4)" strokeDasharray="4 4"
                  label={{ value: '▼ Worst Day', position: 'top', fill: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 9 }} />
              </>
            )}
            <Area type="monotone" dataKey="bench" name="Benchmark" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 4" fill="url(#purpGrad)" isAnimationActive animationDuration={1200} />
            <Area type="monotone" dataKey="pnl" name="Total Return" stroke="#00e5ff" strokeWidth={2.5} fill="url(#cyanGrad)" isAnimationActive animationDuration={1400} />
          </AreaChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* ── SECTION B: Performance Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Return */}
        <GlowCard delay={0.1} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Total Return</p>
          <MonoValue value="+$1,452.50" color="var(--green)" size="xl" />
          <p className="text-[10px] mt-2" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>↑ 121.0% ROI</p>
        </GlowCard>

        {/* Win Rate with Donut */}
        <GlowCard delay={0.2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Win Rate</p>
          <div className="flex items-center gap-3">
            <WinDonut value={68.4} />
            <MonoValue value="68.4%" color="var(--cyan)" size="xl" />
          </div>
        </GlowCard>

        {/* Avg Profit/Trade */}
        <GlowCard delay={0.3} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Avg Profit / Trade</p>
          <MonoValue value="+$3.22" color="var(--text-primary)" size="xl" />
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>246 total trades</p>
        </GlowCard>

        {/* Gas Efficiency */}
        <GlowCard delay={0.4} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Gas Efficiency</p>
          <MonoValue value="89.2%" color="var(--amber)" size="xl" />
          <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: '89.2%', background: 'var(--amber)', boxShadow: '0 0 6px rgba(245,158,11,0.5)' }} />
          </div>
        </GlowCard>
      </div>

      {/* ── SECTION C + D: Table + Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

        {/* Strategy Breakdown Table (6 cols) */}
        <GlowCard delay={0.3} className="p-6 lg:col-span-6">
          <SectionTitle title="Strategy Breakdown" dotColor="var(--purple)" />
          <div className="mt-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  {['Strategy', 'Trades', 'Win %', 'Gross PNL', 'Gas Cost', 'Net PNL', 'Sharpe'].map(c => (
                    <th key={c} className="pb-3 text-left text-[9px] font-bold uppercase tracking-[0.2em] pr-4"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STRATEGY_TABLE.map((row, i) => (
                  <motion.tr key={row.name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                    style={{ borderBottom: '1px solid var(--border-dim)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="py-3.5 pr-4 text-[11px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.name}</td>
                    <td className="py-3.5 pr-4 text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{row.trades}</td>
                    <td className="py-3.5 pr-4 text-[11px]" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{row.win}</td>
                    <td className="py-3.5 pr-4 text-[11px]" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{row.gross}</td>
                    <td className="py-3.5 pr-4 text-[11px]" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{row.gas}</td>
                    <td className="py-3.5 pr-4 text-[11px] font-bold" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{row.net}</td>
                    <td className="py-3.5 pr-4">
                      <span className="text-[11px] font-bold" style={{ color: parseFloat(row.sharpe) >= 2 ? 'var(--cyan)' : parseFloat(row.sharpe) >= 1.5 ? 'var(--amber)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{row.sharpe}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>

        {/* Trade Distribution (4 cols) */}
        <GlowCard delay={0.4} className="p-6 lg:col-span-4">
          <SectionTitle title="PNL Distribution" dotColor="var(--magenta)" />
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DIST_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="bucket" stroke="transparent"
                  tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9 }} tickLine={false} />
                <YAxis stroke="transparent"
                  tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9 }} tickLine={false} />
                <Tooltip content={<DistTooltip />} />
                <Bar dataKey="trades" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={1000}>
                  {DIST_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`}
                      fill={entry.profit ? 'var(--green)' : 'var(--red)'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--green)' }} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Profitable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--red)' }} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loss</span>
            </div>
          </div>
        </GlowCard>
      </div>

    </div>
  )
}
