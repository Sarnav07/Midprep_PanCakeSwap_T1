import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLivePnL } from '../context/NexusContext'

// ── Canvas Particle Network ───────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = window.innerWidth, H = window.innerHeight

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mouse.current = { x: e.clientX, y: e.clientY } })

    type Node = { x: number; y: number; vx: number; vy: number; r: number }
    const nodes: Node[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
    }))

    const tick = () => {
      ctx.clearRect(0, 0, W, H)

      // Move nodes + mouse parallax
      for (const n of nodes) {
        const dx = mouse.current.x - n.x
        const dy = mouse.current.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          n.vx += dx / dist * 0.04
          n.vy += dy / dist * 0.04
        }
        n.vx *= 0.995; n.vy *= 0.995
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      }

      // Draw lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 150) {
            const alpha = (1 - d / 150) * 0.15
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0,229,255,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw dots
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = '#00e5ff'
        ctx.globalAlpha = 0.6
        ctx.fill()
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ── Counting Number ─────────────────────────────────────────────────────────
function CountUp({ target, prefix = '', suffix = '', duration = 1500 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>
}

// ── "NEXUS" letter stagger ───────────────────────────────────────────────────
const NEXUS_LETTERS = 'NEXUS'.split('')

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const pnl = useLivePnL()

  const STATS = [
    { label: 'Active Agents',   value: 7,                   prefix: '',   suffix: ''        },
    { label: 'Trades Today',    value: pnl.tradeCount,      prefix: '',   suffix: ''        },
    { label: 'Net PNL',         value: Math.abs(pnl.total), prefix: '+$', suffix: ''        },
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Canvas background */}
      <ParticleCanvas />

      {/* Radial glow spotlight */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)'
      }} />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">

        {/* LIVE badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff88' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]"
            style={{ color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
            Live • BSC Testnet
          </span>
        </motion.div>

        {/* NEXUS letters */}
        <div className="flex items-center" style={{ gap: '0.04em' }}>
          {NEXUS_LETTERS.map((char, i) => (
            <motion.span key={i}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(72px, 12vw, 120px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                textShadow: '0 0 40px rgba(0,229,255,0.8), 0 0 80px rgba(0,229,255,0.3)',
                lineHeight: 1,
              }}>
              {char}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-sm md:text-base tracking-[0.2em] uppercase"
          style={{ color: 'var(--cyan-dim)', fontFamily: 'var(--font-mono)', maxWidth: 480 }}>
          Autonomous Multi-Agent Trading System
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          onClick={() => navigate('/market')}
          whileHover={{ backgroundColor: 'rgba(0,229,255,1)', color: '#080b12', scale: 1.02, boxShadow: '0 0 30px rgba(0,229,255,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-[0.3em] transition-all duration-200"
          style={{
            border: '1px solid var(--cyan)',
            color: 'var(--cyan)',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
          }}>
          Enter Dashboard →
        </motion.button>
      </div>

      {/* Bottom stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
        style={{ borderTop: '1px solid var(--border-dim)' }}>
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center px-10 py-5"
            style={{ borderRight: i < STATS.length - 1 ? '1px solid var(--border-dim)' : 'none' }}>
            <span className="text-[11px] uppercase tracking-[0.25em] mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {stat.label}
            </span>
            <span className="text-xl font-bold"
              style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
              <CountUp target={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={1200 + i * 200} />
            </span>
          </div>
        ))}
      </motion.div>

    </div>
  )
}
