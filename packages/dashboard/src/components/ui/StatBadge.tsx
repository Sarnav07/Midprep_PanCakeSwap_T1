import React from 'react'

const colorMap: Record<string, string> = {
  green:  'bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[rgba(0,255,136,0.25)]',
  red:    'bg-[rgba(255,68,68,0.1)] text-[#ff4444] border border-[rgba(255,68,68,0.25)]',
  cyan:   'bg-[rgba(0,229,255,0.1)] text-[#00e5ff] border border-[rgba(0,229,255,0.25)]',
  purple: 'bg-[rgba(168,85,247,0.1)] text-[#a855f7] border border-[rgba(168,85,247,0.25)]',
  amber:  'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.25)]',
}

interface StatBadgeProps {
  label: string
  color?: 'green' | 'red' | 'cyan' | 'purple' | 'amber'
}

export default function StatBadge({ label, color = 'cyan' }: StatBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] font-mono ${colorMap[color]}`}>
      {label}
    </span>
  )
}
