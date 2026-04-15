import React from 'react'

const sizeMap: Record<string, string> = {
  sm:  'text-sm',
  md:  'text-base',
  lg:  'text-xl',
  xl:  'text-3xl',
  '2xl': 'text-4xl',
}

interface MonoValueProps {
  value: string | number
  color?: string
  size?: string
  className?: string
}

export default function MonoValue({ value, color = 'var(--text-primary)', size = 'md', className = '' }: MonoValueProps) {
  return (
    <span
      className={`font-bold tabular-nums ${sizeMap[size] ?? 'text-base'} ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color }}
    >
      {value}
    </span>
  )
}
