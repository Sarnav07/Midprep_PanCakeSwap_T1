import React from 'react'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  accent?: string
  delay?: number
}

export default function GlowCard({ children, className = '', accent = 'var(--cyan)', delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-dim)',
      }}
      whileHover={{ borderColor: 'var(--border-accent)', boxShadow: `0 0 20px rgba(0,229,255,0.06), 0 0 40px rgba(0,229,255,0.03)` }}
      className={`border rounded-2xl transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}
