import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import LiveDot from './ui/LiveDot'

const TABS = [
  { label: 'Market',    path: '/market'    },
  { label: 'Strategy',  path: '/strategy'  },
  { label: 'Execution', path: '/execution' },
  { label: 'Risk',      path: '/risk'      },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Liquidity', path: '/liquidity' },
]

export default function Navbar() {
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = time.toLocaleTimeString('en-US', { hour12: false })

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[60px]"
      style={{
        background: 'rgba(8, 11, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-dim)',
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <span
          className="text-xl font-black tracking-[0.15em] nexus-glow select-none"
          style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}
        >
          NEXUS
        </span>

        {/* Live badge */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }}
        >
          <LiveDot color="#00ff88" size="sm" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: '#00ff88', fontFamily: 'var(--font-mono)' }}
          >
            LIVE • BSC TESTNET
          </span>
        </div>
      </div>

      {/* Center: Tab navigation */}
      <nav className="hidden md:flex items-center">
        {TABS.map((tab) => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)

          return (
            <NavLink key={tab.path} to={tab.path} className="relative">
              <div
                className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  textShadow: isActive ? '0 0 12px rgba(0,229,255,0.6)' : 'none',
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}
                  />
                )}
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Right: Clock */}
      <div
        className="text-sm tabular-nums"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {fmt}
      </div>
    </motion.header>
  )
}
