// SkeletonLoader.tsx — Shimmer loading placeholders for all data-dependent panels
import React from 'react'

// ── CSS shimmer injected once ──────────────────────────────────────────────────
const SHIMMER_STYLE = `
@keyframes nexus-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.nexus-skeleton {
  background: linear-gradient(90deg, #1a2035 25%, #252f4a 50%, #1a2035 75%);
  background-size: 200% 100%;
  animation: nexus-shimmer 1.5s ease-in-out infinite;
}
`

let injected = false
function injectShimmer() {
  if (injected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = SHIMMER_STYLE
  document.head.appendChild(style)
  injected = true
}

interface SkeletonProps {
  type: 'card' | 'row' | 'chart' | 'stat' | 'text'
  count?: number
  className?: string
}

function StatSkeleton() {
  return (
    <div className="nexus-skeleton rounded-xl" style={{ width: 120, height: 60 }} />
  )
}

function RowSkeleton() {
  return (
    <div className="nexus-skeleton rounded-lg w-full" style={{ height: 44 }} />
  )
}

function ChartSkeleton() {
  return (
    <div className="nexus-skeleton rounded-xl w-full" style={{ height: 200 }} />
  )
}

function CardSkeleton() {
  return (
    <div className="nexus-skeleton rounded-xl w-full" style={{ height: 120 }} />
  )
}

function TextSkeleton() {
  return (
    <div className="space-y-2">
      <div className="nexus-skeleton rounded" style={{ width: '100%', height: 16 }} />
      <div className="nexus-skeleton rounded" style={{ width: '80%',  height: 16 }} />
      <div className="nexus-skeleton rounded" style={{ width: '60%',  height: 16 }} />
    </div>
  )
}

export default function SkeletonLoader({ type, count = 1, className = '' }: SkeletonProps) {
  injectShimmer()
  const n = Math.max(1, count)

  if (type === 'stat') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {Array.from({ length: n }, (_, i) => <StatSkeleton key={i} />)}
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: n }, (_, i) => <ChartSkeleton key={i} />)}
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: n }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: n }, (_, i) => <TextSkeleton key={i} />)}
      </div>
    )
  }

  // type === 'row' (default)
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: n }, (_, i) => <RowSkeleton key={i} />)}
    </div>
  )
}

// Named variants for convenience
export { StatSkeleton, RowSkeleton, ChartSkeleton, CardSkeleton, TextSkeleton }
