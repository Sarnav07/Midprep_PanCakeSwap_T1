import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import GlowCard from '../components/ui/GlowCard'
import SectionTitle from '../components/ui/SectionTitle'
import MonoValue from '../components/ui/MonoValue'
import StatBadge from '../components/ui/StatBadge'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

interface Pool {
  name: string; version: 'V2' | 'V3'; tier: 'BLUE-CHIP' | 'MID-CAP' | 'DEGEN'
  tvl: string; tvlRaw: number; vol: string; apr: string; aprRaw: number; depth: string; arb?: boolean
}

const POOLS: Pool[] = [
  { name: 'BNB/BUSD',   version: 'V3', tier: 'BLUE-CHIP', tvl: '$1.08T', tvlRaw: 1080,  vol: '$1.24M',  apr: '14.1%', aprRaw: 14.1,  depth: '$4.2M' },
  { name: 'CAKE/BNB',   version: 'V3', tier: 'MID-CAP',   tvl: '$2.40T', tvlRaw: 2400,  vol: '$320K',   apr: '47.2%', aprRaw: 47.2,  depth: '$1.1M', arb: true },
  { name: 'ETH/USDC',   version: 'V3', tier: 'BLUE-CHIP', tvl: '$720M',  tvlRaw: 720,   vol: '$78K',    apr: '12.2%', aprRaw: 12.2,  depth: '$2.8M' },
  { name: 'BTCB/USDT',  version: 'V2', tier: 'BLUE-CHIP', tvl: '$441M',  tvlRaw: 441,   vol: '$48K',    apr: '9.8%',  aprRaw: 9.8,   depth: '$3.1M' },
  { name: 'XRP/USDT',   version: 'V2', tier: 'MID-CAP',   tvl: '$128M',  tvlRaw: 128,   vol: '$22K',    apr: '31.4%', aprRaw: 31.4,  depth: '$0.4M', arb: true },
  { name: 'INJ/USDT',   version: 'V3', tier: 'DEGEN',     tvl: '$44M',   tvlRaw: 44,    vol: '$12K',    apr: '82.5%', aprRaw: 82.5,  depth: '$0.1M' },
  { name: 'DOGE/USDT',  version: 'V2', tier: 'MID-CAP',   tvl: '$91M',   tvlRaw: 91,    vol: '$31K',    apr: '21.8%', aprRaw: 21.8,  depth: '$0.3M' },
  { name: 'SHIB/BUSD',  version: 'V2', tier: 'DEGEN',     tvl: '$18M',   tvlRaw: 18,    vol: '$4.2K',   apr: '124.7%',aprRaw: 124.7, depth: '$0.05M' },
]

const MAX_TVL = Math.max(...POOLS.map(p => p.tvlRaw))

const TIER_STYLE: Record<string, { color: string; badge: 'cyan' | 'amber' | 'red' }> = {
  'BLUE-CHIP': { color: 'var(--cyan)',    badge: 'cyan'  },
  'MID-CAP':   { color: 'var(--amber)',   badge: 'amber' },
  'DEGEN':     { color: 'var(--red)',     badge: 'red'   },
}

const APR_COLOR = (apr: number) => apr < 20 ? 'var(--green)' : apr < 60 ? 'var(--amber)' : 'var(--red)'

// IL curve data: price change 0–200%, IL%
const IL_CURVE = Array.from({ length: 41 }, (_, i) => {
  const priceRatio = 1 + (i / 20) // 1.0 → 3.0
  const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1
  return { change: `${Math.round((priceRatio - 1) * 100)}%`, il: Math.abs(il) * 100 }
})

const ILTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,11,18,0.96)', border: '1px solid var(--border-accent)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>Price Δ {label}</p>
      <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700 }}>IL: -{payload[0].value.toFixed(2)}%</p>
    </div>
  )
}

const LeaderTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const pool = POOLS.find(p => p.name === label)
  if (!pool) return null
  return (
    <div style={{ background: 'rgba(8,11,18,0.96)', border: '1px solid var(--border-accent)', borderRadius: 10, padding: '12px 16px', fontFamily: 'var(--font-mono)', minWidth: 180 }}>
      <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{pool.name}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: '2px 0' }}>TVL: <span style={{ color: 'var(--text-secondary)' }}>{pool.tvl}</span></p>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: '2px 0' }}>Vol 24h: <span style={{ color: 'var(--text-secondary)' }}>{pool.vol}</span></p>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: '2px 0' }}>Depth: <span style={{ color: 'var(--text-secondary)' }}>{pool.depth}</span></p>
    </div>
  )
}

// ─── POOL CARD ────────────────────────────────────────────────────────────────
function PoolCard({ pool, i }: { pool: Pool; i: number }) {
  const [hovered, setHovered] = useState(false)
  const tier = TIER_STYLE[pool.tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-4 transition-all duration-200 relative overflow-hidden cursor-pointer"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ borderColor: tier.color.replace('var', '').replace('(', '').replace(')', '') === '--cyan' ? 'rgba(0,229,255,0.3)' : tier.badge === 'amber' ? 'rgba(245,158,11,0.3)' : 'rgba(255,68,68,0.3)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pool.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-dim)' }}>{pool.version}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <StatBadge label={pool.tier} color={tier.badge} />
            {pool.arb && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                ⚡ ARB
              </motion.span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-bold" style={{ color: APR_COLOR(pool.aprRaw), fontFamily: 'var(--font-mono)' }}>{pool.apr}<br />
          <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>APR</span>
        </span>
      </div>

      {/* TVL bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TVL</span>
          <span className="text-[10px] font-bold" style={{ color: tier.color, fontFamily: 'var(--font-mono)' }}>{pool.tvl}</span>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(pool.tvlRaw / MAX_TVL) * 100}%` }} transition={{ delay: 0.3 + i * 0.07, duration: 0.8 }}
            style={{ background: tier.color, opacity: 0.7 }} />
        </div>
      </div>

      {/* 3-col metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'VOL 24H', value: pool.vol, color: 'var(--text-secondary)' },
          { label: 'DEPTH',   value: pool.depth, color: 'var(--text-secondary)' },
          { label: 'FEE APR', value: pool.apr, color: APR_COLOR(pool.aprRaw) },
        ].map(m => (
          <div key={m.label}>
            <p className="text-[8px] uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</p>
            <p className="text-[10px] font-bold" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Enter Position hover reveal */}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-x-4 bottom-4">
            <motion.button initial={{ y: 8 }} animate={{ y: 0 }} exit={{ y: 8 }}
              className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.35)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}
              whileHover={{ background: 'rgba(0,229,255,0.2)' }}
              whileTap={{ scale: 0.97 }}>
              → Enter Position
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── IL CALCULATOR ────────────────────────────────────────────────────────────
function ILCalculator() {
  const [initPrice, setInitPrice] = useState(312.4)
  const [curPrice, setCurPrice]   = useState(285.0)
  const [posSize, setPosSize]     = useState(5000)

  const priceRatio = curPrice / initPrice
  const ilPct      = Math.abs((2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100)
  const ilUSD      = -(posSize * ilPct / 100)
  const feeIncome  = posSize * 0.0015 * 7  // mock 0.15%/day * 7 days
  const netPos     = feeIncome + ilUSD
  const isProfit   = netPos >= 0

  return (
    <GlowCard delay={0.35} className="p-6">
      <SectionTitle title="IL Simulator" dotColor="var(--red)" />
      <div className="mt-5 space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Initial Price ($)', val: initPrice, set: setInitPrice },
            { label: 'Current Price ($)', val: curPrice,  set: setCurPrice  },
          ].map(inp => (
            <div key={inp.label}>
              <label className="text-[9px] uppercase tracking-[0.2em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{inp.label}</label>
              <input type="number" step="0.01" value={inp.val}
                onChange={e => inp.set(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg text-[12px] font-bold outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-dim)')}
              />
            </div>
          ))}
        </div>

        {/* Position size slider */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LP Position Size</label>
            <span className="text-[11px] font-bold" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>${posSize.toLocaleString()}</span>
          </div>
          <div className="relative h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${(posSize / 10000) * 100}%`, background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0,229,255,0.5)' }} />
            <input type="range" min={0} max={10000} step={100} value={posSize}
              onChange={e => setPosSize(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$0</span>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$10,000</span>
          </div>
        </div>

        {/* Output metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.12)' }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IL</p>
            <p className="text-[13px] font-bold" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>-{ilPct.toFixed(2)}%</p>
            <p className="text-[9px]" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>${Math.abs(ilUSD).toFixed(2)}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)' }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Fee Income</p>
            <p className="text-[13px] font-bold" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>+${feeIncome.toFixed(2)}</p>
            <p className="text-[9px]" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>7-day est.</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: isProfit ? 'rgba(0,255,136,0.05)' : 'rgba(255,68,68,0.05)', border: `1px solid ${isProfit ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)'}` }}>
            <p className="text-[8px] uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Net</p>
            <p className="text-[13px] font-bold" style={{ color: isProfit ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
              {isProfit ? '+' : ''}${netPos.toFixed(2)}
            </p>
            <p className="text-[9px]" style={{ color: isProfit ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
              {isProfit ? 'Net gain' : 'Net loss'}
            </p>
          </div>
        </div>

        {/* IL curve chart */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IL Curve (price change →)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={IL_CURVE} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="change" stroke="transparent"
                tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 8 }} tickLine={false} interval={9} />
              <YAxis stroke="transparent"
                tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 8 }} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip content={<ILTooltip />} />
              <Line type="monotone" dataKey="il" stroke="var(--red)" strokeWidth={2} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlowCard>
  )
}

// ─── POOL LEADERBOARD ─────────────────────────────────────────────────────────
function PoolLeaderboard() {
  const sorted = [...POOLS].sort((a, b) => b.aprRaw - a.aprRaw)
  const maxApr = sorted[0].aprRaw

  return (
    <GlowCard delay={0.4} className="p-6">
      <SectionTitle title="Top Pools by Fee APR" dotColor="var(--purple)" />
      <div className="mt-5 space-y-3">
        {sorted.map((pool, i) => {
          const color = APR_COLOR(pool.aprRaw)
          const tier  = TIER_STYLE[pool.tier]
          return (
            <motion.div key={pool.name}
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.07 }}
              className="flex items-center gap-3 py-2 transition-all duration-150 group cursor-pointer rounded-lg px-2"
              style={{ borderBottom: '1px solid var(--border-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

              {/* Rank */}
              <span className="w-5 text-center text-[11px] font-black flex-shrink-0" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>

              {/* Name + tier */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pool.name}</span>
                  <span className="text-[7px] font-bold px-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{pool.version}</span>
                </div>
                {/* APR bar */}
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(pool.aprRaw / maxApr) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.07, duration: 0.7 }}
                    style={{ background: color, boxShadow: `0 0 4px ${color}60` }} />
                </div>
              </div>

              {/* Vol */}
              <span className="text-[9px] flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pool.vol}</span>

              {/* APR */}
              <span className="text-[12px] font-black flex-shrink-0 w-16 text-right" style={{ color, fontFamily: 'var(--font-mono)' }}>{pool.apr}</span>
            </motion.div>
          )
        })}
      </div>
    </GlowCard>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LiquidityPage() {
  return (
    <div className="space-y-6">

      {/* ── SECTION A: Pool Map ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Active Pools — PancakeSwap V3 / V2</span>
          <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,229,255,0.2)' }}>{POOLS.length} POOLS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-2">
          {POOLS.map((pool, i) => (
            <PoolCard key={pool.name} pool={pool} i={i} />
          ))}
        </div>
      </div>

      {/* ── SECTION B + C: IL Calc + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ILCalculator />
        <PoolLeaderboard />
      </div>

    </div>
  )
}
