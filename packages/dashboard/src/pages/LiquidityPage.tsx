import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import GlowCard from '../components/ui/GlowCard'
import SectionTitle from '../components/ui/SectionTitle'
import StatBadge from '../components/ui/StatBadge'
import { usePoolData } from '../context/NexusContext'
import type { Pool } from '../data/MockDataEngine'

// ── Style helpers ─────────────────────────────────────────────────────────────
const TIER_STYLE: Record<string, { color: string; badge: 'cyan' | 'amber' | 'red' }> = {
  'BLUE-CHIP': { color: 'var(--cyan)',  badge: 'cyan'  },
  'MID-CAP':   { color: 'var(--amber)', badge: 'amber' },
  'DEGEN':     { color: 'var(--red)',   badge: 'red'   },
}
const APR_COLOR = (apr: number) => apr < 20 ? 'var(--green)' : apr < 60 ? 'var(--amber)' : 'var(--red)'

// IL curve — computed once, static mathematical relationship
const IL_CURVE = Array.from({ length: 41 }, (_, i) => {
  const ratio = 1 + (i / 20)
  const il    = 2 * Math.sqrt(ratio) / (1 + ratio) - 1
  return { change: `${Math.round((ratio - 1) * 100)}%`, il: Math.abs(il) * 100 }
})

const ILTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,11,18,0.96)', border: '1px solid var(--border-accent)',
      borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>Price Δ {label}</p>
      <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700 }}>IL: -{payload[0].value.toFixed(2)}%</p>
    </div>
  )
}

// ── Pool Card ─────────────────────────────────────────────────────────────────
function PoolCard({ pool, i, maxTvl }: { pool: Pool; i: number; maxTvl: number }) {
  const [hovered, setHovered] = useState(false)
  const tier = TIER_STYLE[pool.tier]
  const fmtTvl = pool.tvl >= 1e12 ? `$${(pool.tvl / 1e12).toFixed(2)}T`
    : pool.tvl >= 1e9 ? `$${(pool.tvl / 1e9).toFixed(1)}B`
    : pool.tvl >= 1e6 ? `$${(pool.tvl / 1e6).toFixed(1)}M`
    : `$${pool.tvl.toFixed(0)}`
  const fmtVol = pool.vol24h >= 1e6 ? `$${(pool.vol24h / 1e6).toFixed(2)}M`
    : pool.vol24h >= 1e3 ? `$${(pool.vol24h / 1e3).toFixed(0)}K`
    : `$${pool.vol24h.toFixed(0)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-4 transition-all duration-200 relative overflow-hidden cursor-pointer"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ borderColor: tier.badge === 'cyan' ? 'rgba(0,229,255,0.3)'
        : tier.badge === 'amber' ? 'rgba(245,158,11,0.3)' : 'rgba(255,68,68,0.3)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pool.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', border: '1px solid var(--border-dim)' }}>{pool.version}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <StatBadge label={pool.tier} color={tier.badge} />
            {pool.arb && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                  color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                ⚡ ARB
              </motion.span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-bold text-right"
          style={{ color: APR_COLOR(pool.aprRaw), fontFamily: 'var(--font-mono)' }}>
          {pool.apr}<br />
          <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>APR</span>
        </span>
      </div>

      {/* TVL bar — live width from engine */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[9px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TVL</span>
          <span className="text-[10px] font-bold" style={{ color: tier.color, fontFamily: 'var(--font-mono)' }}>{fmtTvl}</span>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div layout className="h-full rounded-full"
            style={{ width: `${(pool.tvl / maxTvl) * 100}%`, background: tier.color, opacity: 0.7 }} />
        </div>
      </div>

      {/* 3-col metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'VOL 24H', value: fmtVol,   color: 'var(--text-secondary)' },
          { label: 'VERSION', value: pool.version, color: 'var(--text-secondary)' },
          { label: 'FEE APR', value: pool.apr,  color: APR_COLOR(pool.aprRaw)   },
        ].map(m => (
          <div key={m.label}>
            <p className="text-[8px] uppercase tracking-[0.12em] mb-0.5"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</p>
            <p className="text-[10px] font-bold" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Enter Position hover button */}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-x-4 bottom-4">
            <motion.button initial={{ y: 8 }} animate={{ y: 0 }} exit={{ y: 8 }}
              className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.35)',
                color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}
              whileHover={{ background: 'rgba(0,229,255,0.2)' }} whileTap={{ scale: 0.97 }}>
              → Enter Position
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── IL Calculator ─────────────────────────────────────────────────────────────
function ILCalculator() {
  const [initPrice, setInitPrice] = useState(312.4)
  const [curPrice,  setCurPrice]  = useState(285.0)
  const [posSize,   setPosSize]   = useState(5000)

  const priceRatio = curPrice / initPrice
  const ilPct      = Math.abs((2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100)
  const ilUSD      = -(posSize * ilPct / 100)
  const feeIncome  = posSize * 0.0015 * 7
  const netPos     = feeIncome + ilUSD
  const isProfit   = netPos >= 0

  return (
    <GlowCard delay={0.35} className="p-6">
      <SectionTitle title="IL Simulator" dotColor="var(--red)" />
      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Initial Price ($)', val: initPrice, set: setInitPrice },
            { label: 'Current Price ($)', val: curPrice,  set: setCurPrice  },
          ].map(inp => (
            <div key={inp.label}>
              <label className="text-[9px] uppercase tracking-[0.2em] block mb-1.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{inp.label}</label>
              <input type="number" step="0.01" value={inp.val}
                onChange={e => inp.set(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg text-[12px] font-bold outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-accent)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border-dim)')} />
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LP Position Size</label>
            <span className="text-[11px] font-bold" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
              ${posSize.toLocaleString()}
            </span>
          </div>
          <div className="relative h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${(posSize / 10000) * 100}%`, background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0,229,255,0.5)' }} />
            <input type="range" min={0} max={10000} step={100} value={posSize}
              onChange={e => setPosSize(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
          {[
            { label: 'IL', val: `-${ilPct.toFixed(2)}%\n$${Math.abs(ilUSD).toFixed(2)}`, color: 'var(--red)', bg: 'rgba(255,68,68,0.05)', border: 'rgba(255,68,68,0.12)' },
            { label: 'Fee Income', val: `+$${feeIncome.toFixed(2)}\n7-day est.`, color: 'var(--green)', bg: 'rgba(0,255,136,0.05)', border: 'rgba(0,255,136,0.12)' },
            { label: 'Net', val: `${isProfit ? '+' : ''}$${netPos.toFixed(2)}\n${isProfit ? 'Net gain' : 'Net loss'}`,
              color: isProfit ? 'var(--green)' : 'var(--red)',
              bg: isProfit ? 'rgba(0,255,136,0.05)' : 'rgba(255,68,68,0.05)',
              border: isProfit ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)' },
          ].map(m => {
            const [main, sub] = m.val.split('\n')
            return (
              <div key={m.label} className="rounded-lg p-3 text-center"
                style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                <p className="text-[8px] uppercase tracking-[0.15em] mb-1"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</p>
                <p className="text-[13px] font-bold" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{main}</p>
                <p className="text-[9px]" style={{ color: m.color, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{sub}</p>
              </div>
            )
          })}
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] mb-2"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IL Curve (price change →)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={IL_CURVE} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="change" stroke="transparent"
                tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 8 }} tickLine={false} interval={9} />
              <YAxis stroke="transparent"
                tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 8 }} tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip content={<ILTooltip />} />
              <Line type="monotone" dataKey="il" stroke="var(--red)" strokeWidth={2} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlowCard>
  )
}

// ── Pool Leaderboard ──────────────────────────────────────────────────────────
function PoolLeaderboard({ pools }: { pools: Pool[] }) {
  const sorted = [...pools].sort((a, b) => b.aprRaw - a.aprRaw)
  const maxApr = sorted[0]?.aprRaw ?? 1

  return (
    <GlowCard delay={0.4} className="p-6">
      <SectionTitle title="Top Pools by Fee APR" dotColor="var(--purple)" />
      <div className="mt-5 space-y-3">
        {sorted.map((pool, i) => {
          const color = APR_COLOR(pool.aprRaw)
          const fmtVol = pool.vol24h >= 1e6 ? `$${(pool.vol24h / 1e6).toFixed(2)}M`
            : pool.vol24h >= 1e3 ? `$${(pool.vol24h / 1e3).toFixed(0)}K`
            : `$${pool.vol24h.toFixed(0)}`
          return (
            <motion.div key={pool.name}
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07 }}
              className="flex items-center gap-3 py-2 transition-all duration-150 rounded-lg px-2 cursor-pointer"
              style={{ borderBottom: '1px solid var(--border-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

              <span className="w-5 text-center text-[11px] font-black flex-shrink-0"
                style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pool.name}</span>
                  <span className="text-[7px] font-bold px-1 rounded"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{pool.version}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div layout className="h-full rounded-full"
                    style={{ width: `${(pool.aprRaw / maxApr) * 100}%`, background: color, boxShadow: `0 0 4px ${color}60` }} />
                </div>
              </div>

              <span className="text-[9px] flex-shrink-0"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{fmtVol}</span>
              <span className="text-[12px] font-black flex-shrink-0 w-16 text-right"
                style={{ color, fontFamily: 'var(--font-mono)' }}>{pool.apr}</span>
            </motion.div>
          )
        })}
      </div>
    </GlowCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LiquidityPage() {
  const pools  = usePoolData()
  const maxTvl = Math.max(...pools.map(p => p.tvl), 1)

  return (
    <div className="space-y-6">

      {/* Pool Map — live from engine */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Active Pools — PancakeSwap V3 / V2
          </span>
          <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold"
            style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--cyan)',
              fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,229,255,0.2)' }}>
            {pools.length} POOLS
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
          {pools.map((pool, i) => (
            <PoolCard key={pool.name} pool={pool} i={i} maxTvl={maxTvl} />
          ))}
        </div>
      </div>

      {/* IL Calc + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ILCalculator />
        <PoolLeaderboard pools={pools} />
      </div>

    </div>
  )
}
