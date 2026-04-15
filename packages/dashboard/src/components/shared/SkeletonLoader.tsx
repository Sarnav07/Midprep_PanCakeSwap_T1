import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  rounded?: string
}

// Single skeleton bar
export function SkeletonBar({ width = '100%', height = '16px', className = '', rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <motion.div
      animate={{ opacity: [0.04, 0.1, 0.04] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className={`${rounded} ${className}`}
      style={{ width, height, background: 'rgba(0,229,255,0.07)' }}
    />
  )
}

// Skeleton card (mimics a GlowCard)
export function SkeletonCard({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 space-y-3 ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      <SkeletonBar width="40%" height="10px" />
      <SkeletonBar width="70%" height="28px" />
      {Array.from({ length: rows - 1 }, (_, i) => (
        <SkeletonBar key={i} width={`${60 + Math.random() * 30}%`} height="12px" />
      ))}
    </div>
  )
}

// Skeleton table row
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex gap-4 px-5 py-3.5 items-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
      {Array.from({ length: cols }, (_, i) => (
        <SkeletonBar key={i} height="12px" width={i === 0 ? '15%' : i === cols - 1 ? '10%' : '20%'} />
      ))}
    </div>
  )
}

// Full skeleton page wrapper
export default function SkeletonLoader({ cards = 3, rows = 5 }: { cards?: number; rows?: number }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} rows={2} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <SkeletonCard rows={8} className="h-[280px]" />
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
            {Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonCard rows={5} />
          <SkeletonCard rows={4} />
        </div>
      </div>
    </div>
  )
}
