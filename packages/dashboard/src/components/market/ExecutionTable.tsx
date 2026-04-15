import React from 'react'
import { motion } from 'framer-motion'
import { useExecutionFeed } from '../../context/NexusContext'

export default function ExecutionTable() {
  const TRADES = useExecutionFeed().slice(0, 10)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
    >
      {/* Table header */}
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
        <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Execution Protocol
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
              {['Time', 'Pair', 'Side', 'Size', 'P&L', 'Status'].map(col => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRADES.map((row, i) => {
              const isBuy = row.side === 'BUY'
              const isPos = (typeof row.pnl === 'number') ? row.pnl >= 0 : String(row.pnl).startsWith('+')
              const pnlDisplay = (typeof row.pnl === 'number')
                ? `${row.pnl >= 0 ? '+' : ''}$${Math.abs(row.pnl).toFixed(2)}`
                : String(row.pnl)
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="transition-colors duration-150 cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-dim)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Time */}
                  <td className="px-5 py-3.5 text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {row.time}
                  </td>
                  {/* Pair */}
                  <td className="px-5 py-3.5 text-[12px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {row.pair}
                  </td>
                  {/* Side */}
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        background: isBuy ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                        border: `1px solid ${isBuy ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}`,
                        color: isBuy ? 'var(--green)' : 'var(--red)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: isBuy ? 'var(--green)' : 'var(--red)' }}
                      />
                      {row.side}
                    </span>
                  </td>
                  {/* Size */}
                  <td className="px-5 py-3.5 text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {row.size}
                  </td>
                  {/* P&L */}
                  <td className="px-5 py-3.5 text-[12px] font-bold" style={{ color: isPos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                    {pnlDisplay}
                  </td>
                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        background: 'rgba(0,255,136,0.06)',
                        color: 'rgba(0,255,136,0.5)',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid rgba(0,255,136,0.1)',
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
