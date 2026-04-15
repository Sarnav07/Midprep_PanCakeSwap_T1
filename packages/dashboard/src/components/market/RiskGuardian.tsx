import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface SliderProps {
  label: string
  value: number
  max: number
  onChange: (v: number) => void
  step?: number
}

function CyberSlider({ label, value, max, onChange, step = 0.1 }: SliderProps) {
  const pct = (value / max) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
        <span
          className="text-[13px] font-bold"
          style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}
        >
          {value.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>/ {max}</span>
        </span>
      </div>

      {/* Track */}
      <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
          style={{
            width: `${pct}%`,
            background: 'var(--cyan)',
            boxShadow: '0 0 8px rgba(0,229,255,0.6), 0 0 2px rgba(0,229,255,1)',
          }}
        />
        {/* Glowing thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-75"
          style={{
            left: `calc(${pct}% - 6px)`,
            background: 'var(--bg-primary)',
            borderColor: 'var(--cyan)',
            boxShadow: '0 0 10px rgba(0,229,255,0.8), 0 0 4px rgba(0,229,255,1)',
          }}
        />
        {/* Invisible input */}
        <input
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  )
}

export default function RiskGuardian() {
  const [drawdown, setDrawdown] = useState(4.8)
  const [posSize, setPosSize]   = useState(320)
  const [anomaly, setAnomaly]   = useState(22)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-5 space-y-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
        <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Risk Guardian
        </span>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <CyberSlider label="Drawdown Limit" value={drawdown} max={15}  onChange={setDrawdown} step={0.1} />
        <CyberSlider label="Position Size"  value={posSize}  max={500} onChange={setPosSize}  step={5}   />
        <CyberSlider label="Anomaly Score"  value={anomaly}  max={100} onChange={setAnomaly}  step={1}   />
      </div>

      {/* ARMED button */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,136,0.5)' }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.35em] transition-all"
        style={{
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.3)',
          color: 'var(--green)',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 0 12px rgba(0,255,136,0.2)',
        }}
      >
        ● ARMED
      </motion.button>
    </motion.div>
  )
}
