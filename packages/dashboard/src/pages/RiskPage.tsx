import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ReferenceLine, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import RiskGuardian from '../components/market/RiskGuardian'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const DRAWDOWN_DATA = Array.from({ length: 40 }, (_, i) => ({
  t: i,
  dd: -(Math.abs(Math.sin(i / 6)) * 6 + Math.random() * 1.5),
}))

const EXPOSURE = [
  { token: 'WBNB',  exposure: '$845.20', pct: '58.3%', risk: 'LOW',    riskColor: 'var(--green)'  },
  { token: 'USDT',  exposure: '$412.00', pct: '28.4%', risk: 'LOW',    riskColor: 'var(--green)'  },
  { token: 'CAKE',  exposure: '$193.40', pct: '13.3%', risk: 'MEDIUM', riskColor: 'var(--amber)'  },
]

const BREAKERS = [
  { label: 'Max Drawdown 15%',       armed: true  },
  { label: 'Flash Crash Detection',  armed: true  },
  { label: 'Oracle Failure Guard',   armed: true  },
  { label: 'Depeg Alert',            armed: true  },
]

const RISK_METRICS = [
  { label: 'Sharpe Ratio',   value: '2.41',   color: 'var(--cyan)'   },
  { label: 'Max Drawdown',   value: '-4.8%',  color: 'var(--red)'    },
  { label: 'VaR (95%)',      value: '-$24',   color: 'var(--magenta)' },
  { label: 'Volatility',     value: '12.3%',  color: 'var(--amber)'  },
]

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ armed, onToggle }: { armed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
      style={{
        background: armed ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)',
        border: armed ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: armed ? '0 0 8px rgba(0,229,255,0.3)' : 'none',
      }}
    >
      <motion.div
        animate={{ x: armed ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
        style={{ background: armed ? 'var(--cyan)' : 'var(--text-muted)', boxShadow: armed ? '0 0 6px var(--cyan)' : 'none' }}
      />
    </button>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function RiskPage() {
  const [breakers, setBreakers] = useState(BREAKERS.map(b => ({ ...b })))
  const toggle = (i: number) => setBreakers(prev => prev.map((b, j) => j === i ? { ...b, armed: !b.armed } : b))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

      {/* ── Left column ── */}
      <div className="space-y-5">

        {/* Reuse RiskGuardian */}
        <RiskGuardian />

        {/* Drawdown chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Drawdown History</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DRAWDOWN_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ff4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}%`} />
              <ReferenceLine y={-15} stroke="rgba(255,68,68,0.4)" strokeDasharray="4 4"
                label={{ value: 'MAX -15%', fill: 'rgba(255,68,68,0.6)', fontFamily: 'var(--font-mono)', fontSize: 9 }} />
              <Tooltip formatter={(v: any) => [`${v.toFixed(2)}%`, 'Drawdown']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 8, fontFamily: 'var(--font-mono)', color: 'var(--red)' }} />
              <Area type="monotone" dataKey="dd" stroke="#ff4444" strokeWidth={1.5} fill="url(#ddGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Position exposure table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Position Exposure</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
                {['Token','Exposure','% Portfolio','Risk Level'].map(c => (
                  <th key={c} className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXPOSURE.map((row, i) => (
                <motion.tr key={row.token} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                  style={{ borderBottom: '1px solid var(--border-dim)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5 text-[12px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.token}</td>
                  <td className="px-5 py-3.5 text-[11px]" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{row.exposure}</td>
                  <td className="px-5 py-3.5 text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{row.pct}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.12em]"
                      style={{ fontFamily: 'var(--font-mono)', color: row.riskColor,
                        background: row.riskColor === 'var(--green)' ? 'rgba(0,255,136,0.08)' : 'rgba(245,158,11,0.08)',
                        border: `1px solid ${row.riskColor === 'var(--green)' ? 'rgba(0,255,136,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      {row.risk}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* ── Right column ── */}
      <div className="space-y-5">

        {/* Circuit Breakers */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl p-5 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Circuit Breakers</span>
          </div>
          <div className="space-y-4">
            {breakers.map((b, i) => (
              <div key={b.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{b.label}</p>
                  <p className="text-[9px] mt-0.5 uppercase tracking-[0.15em]"
                    style={{ color: b.armed ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                    {b.armed ? '● ARMED' : '○ DISARMED'}
                  </p>
                </div>
                <Toggle armed={b.armed} onToggle={() => toggle(i)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Metrics cards */}
        <div className="grid grid-cols-2 gap-3">
          {RISK_METRICS.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</p>
              <p className="text-[20px] font-black leading-none" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
