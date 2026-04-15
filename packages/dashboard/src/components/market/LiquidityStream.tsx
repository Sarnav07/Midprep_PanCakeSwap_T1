import React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { useLiquidityStream } from '../../context/NexusContext'

// 30-point mock: oscillating $240–$268
const DATA = [
  { t: '21:51', p: 247.2 }, { t: '21:57', p: 249.8 }, { t: '22:03', p: 252.1 },
  { t: '22:09', p: 255.4 }, { t: '22:15', p: 258.0 }, { t: '22:21', p: 261.3 },
  { t: '22:27', p: 263.7 }, { t: '22:33', p: 260.5 }, { t: '22:39', p: 256.9 },
  { t: '22:45', p: 253.2 }, { t: '22:51', p: 256.8 }, { t: '22:57', p: 259.4 },
  { t: '23:03', p: 262.7 }, { t: '23:09', p: 265.1 }, { t: '23:15', p: 268.0 },
  { t: '23:21', p: 265.6 }, { t: '23:27', p: 262.3 }, { t: '23:33', p: 258.9 },
  { t: '23:39', p: 255.7 }, { t: '23:45', p: 252.4 }, { t: '23:51', p: 248.8 },
  { t: '23:57', p: 245.1 }, { t: '0:03',  p: 241.9 }, { t: '0:09',  p: 244.3 },
  { t: '0:15',  p: 248.7 }, { t: '0:16',  p: 251.2 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(8,11,18,0.95)',
        border: '1px solid var(--border-accent)',
        borderRadius: 8,
        padding: '8px 14px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 700 }}>
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export default function LiquidityStream() {
  const rawStream = useLiquidityStream()
  const DATA = rawStream.map((p, i) => {
    const mins = (Date.now() / 60000 - (rawStream.length - 1 - i) * 0.5) % (24 * 60)
    const h = Math.floor(mins / 60) % 24
    const m = Math.floor(mins % 60)
    return { t: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, p: parseFloat(p.toFixed(2)) }
  })
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }}
          />
          <span
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
          >
            Liquidity Stream (V3)
          </span>
        </div>
        <div className="flex gap-1.5">
          {['5m', '15m', '1h', '4h', '1D'].map((tf, i) => (
            <button
              key={tf}
              className="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                background: i === 0 ? 'rgba(0,229,255,0.1)' : 'transparent',
                color: i === 0 ? 'var(--cyan)' : 'var(--text-muted)',
                border: i === 0 ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={DATA} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="lsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#00e5ff" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="t"
            stroke="transparent"
            tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            domain={[237, 270]}
            stroke="transparent"
            tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="p"
            stroke="#00e5ff"
            strokeWidth={2}
            fill="url(#lsGrad)"
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
