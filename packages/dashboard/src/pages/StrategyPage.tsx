import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, LineChart, Line } from 'recharts'

// ─── DATA ────────────────────────────────────────────────────────────────────

const SIGNALS = [
  { pair: 'BNB/USDC',  strategy: 'ARBITRAGE',      profit: '+$3.89', confidence: 87, risk: 2, entry: 312.40, exit: 315.20 },
  { pair: 'CAKE/BNB',  strategy: 'TREND',           profit: '+$2.15', confidence: 74, risk: 3, entry: 2.841,  exit: 2.910  },
  { pair: 'ETH/USDC',  strategy: 'MEAN-REVERSION',  profit: '+$5.60', confidence: 68, risk: 2, entry: 1847.2, exit: 1856.8 },
  { pair: 'BNB/BUSD',  strategy: 'ARBITRAGE',       profit: '+$1.20', confidence: 61, risk: 1, entry: 311.90, exit: 313.10 },
  { pair: 'BTCB/USDT', strategy: 'TREND',           profit: '+$9.88', confidence: 55, risk: 4, entry: 43201,  exit: 43450  },
  { pair: 'XRP/USDT',  strategy: 'MEAN-REVERSION',  profit: '+$0.74', confidence: 49, risk: 3, entry: 0.5210, exit: 0.5280 },
].sort((a, b) => b.confidence - a.confidence)

const STRATEGY_BADGE: Record<string, React.CSSProperties> = {
  'ARBITRAGE':     { background: 'rgba(0,229,255,0.1)',   border: '1px solid rgba(0,229,255,0.25)',   color: '#00e5ff'  },
  'TREND':         { background: 'rgba(168,85,247,0.1)',  border: '1px solid rgba(168,85,247,0.25)',  color: '#a855f7'  },
  'MEAN-REVERSION':{ background: 'rgba(245,158,11,0.1)',  border: '1px solid rgba(245,158,11,0.25)',  color: '#f59e0b'  },
}
const RISK_COLORS = ['', 'var(--green)', 'var(--cyan)', 'var(--amber)', 'var(--magenta)', 'var(--red)']

const REGIME_HISTORY = [
  { label: 'TRENDING',       ts: '00:12:11', color: '#00e5ff' },
  { label: 'HIGH-VOLATILITY',ts: '23:58:44', color: '#ff4444' },
  { label: 'MEAN-REVERTING', ts: '23:41:09', color: '#a855f7' },
  { label: 'CHOPPY',         ts: '23:19:31', color: '#f59e0b' },
]

const VOL_SPARK = Array.from({ length: 20 }, (_, i) => ({ v: 12 + Math.sin(i / 3) * 4 + Math.random() * 2 }))

const PERF_TABLE = [
  { name: 'Arbitrage Scanner', trades: 142, winPct: '71.8%', avgProfit: '+$1.24', total: '+$176.08', status: 'ACTIVE'  },
  { name: 'Trend Follower',    trades:  58, winPct: '65.5%', avgProfit: '+$3.41', total: '+$197.78', status: 'ACTIVE'  },
  { name: 'Mean Reversion',    trades:  34, winPct: '58.8%', avgProfit: '+$0.97', total: '+$32.98',  status: 'PAUSED'  },
  { name: 'Momentum Engine',   trades:   0, winPct: '—',     avgProfit: '—',      total: '$0.00',    status: 'PAUSED'  },
]

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SignalCard({ s, i }: { s: typeof SIGNALS[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-4 space-y-3 transition-all duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
      whileHover={{ borderColor: 'var(--border-accent)', background: 'var(--bg-card-hover)' }}
    >
      {/* Row 1: pair, strategy badge, profit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.pair}</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-mono)', ...STRATEGY_BADGE[s.strategy] }}>{s.strategy}</span>
        </div>
        <span className="text-[15px] font-bold" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{s.profit}</span>
      </div>

      {/* Row 2: confidence + risk dots */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Confidence</span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{s.confidence}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${s.confidence}%`, background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0,229,255,0.5)' }} />
          </div>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-[0.18em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Risk</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(d => (
              <div key={d} className="w-3 h-3 rounded-sm" style={{ background: d <= s.risk ? RISK_COLORS[s.risk] : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: entry/exit + execute */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-4">
          <div>
            <span className="text-[9px] block mb-0.5 uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Entry</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>${s.entry}</span>
          </div>
          <div>
            <span className="text-[9px] block mb-0.5 uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Target</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>${s.exit}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ background: 'rgba(0,229,255,0.15)', boxShadow: '0 0 12px rgba(0,229,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
          style={{ border: '1px solid rgba(0,229,255,0.35)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', background: 'transparent' }}
        >
          Execute
        </motion.button>
      </div>
    </motion.div>
  )
}

function RegimeDetector() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="rounded-xl p-5 space-y-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
        <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Market Regime</span>
      </div>

      {/* Current regime */}
      <div className="text-center py-6 rounded-xl" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
        <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Current</p>
        <motion.p
          animate={{ textShadow: ['0 0 8px rgba(0,229,255,0.6)', '0 0 20px rgba(0,229,255,0.9)', '0 0 8px rgba(0,229,255,0.6)'] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[22px] font-black tracking-[0.15em]"
          style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}
        >
          TRENDING
        </motion.p>
      </div>

      {/* History */}
      <div className="space-y-2">
        <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>History</p>
        {REGIME_HISTORY.map((r, i) => (
          <div key={i} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              <span className="text-[11px] font-bold" style={{ color: i === 0 ? r.color : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.label}</span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.ts}</span>
          </div>
        ))}
      </div>

      {/* Volatility index */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Volatility Index</span>
          <span className="text-[14px] font-bold" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>14.2</span>
        </div>
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={VOL_SPARK} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fill="url(#volGrad)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function StrategyPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Left: Signal Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Active Signals</span>
            <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,229,255,0.2)' }}>{SIGNALS.length} LIVE</span>
          </div>
          {SIGNALS.map((s, i) => <SignalCard key={s.pair} s={s} i={i} />)}
        </div>
        {/* Right: Regime Detector */}
        <RegimeDetector />
      </div>

      {/* Performance table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)', boxShadow: '0 0 6px var(--purple)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Strategy Performance</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
              {['Strategy','Trades','Win %','Avg Profit','Total PNL','Status'].map(c => (
                <th key={c} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERF_TABLE.map((row, i) => (
              <motion.tr key={row.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                style={{ borderBottom: '1px solid var(--border-dim)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="px-5 py-3.5 text-[12px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.name}</td>
                <td className="px-5 py-3.5 text-[12px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{row.trades}</td>
                <td className="px-5 py-3.5 text-[12px]" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{row.winPct}</td>
                <td className="px-5 py-3.5 text-[12px]" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{row.avgProfit}</td>
                <td className="px-5 py-3.5 text-[12px] font-bold" style={{ color: row.total.startsWith('+') ? 'var(--green)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.total}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{ fontFamily: 'var(--font-mono)',
                      background: row.status === 'ACTIVE' ? 'rgba(0,255,136,0.08)' : 'rgba(245,158,11,0.08)',
                      color: row.status === 'ACTIVE' ? 'var(--green)' : 'var(--amber)',
                      border: `1px solid ${row.status === 'ACTIVE' ? 'rgba(0,255,136,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    {row.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
