import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionFeed, useNexus } from '../../context/NexusContext'
import SkeletonLoader from '../ui/SkeletonLoader'
import type { Trade } from '../../data/MockDataEngine'

// ── Trade Detail Drawer ───────────────────────────────────────────────────────
function TradeDrawer({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const isPos = trade.pnl >= 0
  const isBuy = trade.side === 'BUY'

  const rows = [
    { label: 'Trade ID',     value: trade.id },
    { label: 'Time',         value: trade.time },
    { label: 'Pair',         value: trade.pair },
    { label: 'Side',         value: trade.side },
    { label: 'Size',         value: trade.size },
    { label: 'Entry Price',  value: `$${trade.entry.toFixed(4)}` },
    { label: 'Exit Price',   value: `$${trade.exit.toFixed(4)}` },
    { label: 'Gas Cost',     value: `${trade.gas} BNB` },
    { label: 'Gross P&L',    value: `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` },
    { label: 'Net P&L',      value: `${(trade.pnl - trade.gas * 310).toFixed(2) >= '0' ? '+' : ''}$${(trade.pnl - trade.gas * 310).toFixed(2)}` },
    { label: 'Route',        value: `${trade.pair} via PancakeSwap V3` },
    { label: 'Status',       value: trade.status },
  ]

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose} />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm overflow-y-auto"
          style={{ background: 'rgba(8,11,18,0.97)', borderLeft: '1px solid var(--border-dim)', backdropFilter: 'blur(30px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] mb-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Trade Detail</p>
              <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {trade.id}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-lg leading-none transition-colors"
              style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              ×
            </button>
          </div>

          {/* P&L Hero */}
          <div className="px-6 py-6 text-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Net P&L</p>
            <p className="text-4xl font-black" style={{
              fontFamily: 'var(--font-mono)',
              color: isPos ? 'var(--green)' : 'var(--red)',
              textShadow: `0 0 20px ${isPos ? 'rgba(0,255,136,0.5)' : 'rgba(255,68,68,0.5)'}`,
            }}>
              {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: isBuy ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)',
                border: `1px solid ${isBuy ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}`,
                color: isBuy ? 'var(--green)' : 'var(--red)',
                fontFamily: 'var(--font-mono)',
              }}>
              <span className="w-1 h-1 rounded-full" style={{ background: isBuy ? 'var(--green)' : 'var(--red)' }} />
              {trade.side} · {trade.pair}
            </span>
          </div>

          {/* Rows */}
          <div className="px-6 py-4 space-y-0">
            {rows.map(r => (
              <div key={r.label} className="flex justify-between items-center py-3"
                style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <span className="text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.label}</span>
                <span className="text-[11px] font-bold"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-4" style={{ opacity: 0.2 }}>◎</div>
      <p className="text-[13px] font-semibold mb-1"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        No trades executed yet
      </p>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        The Execution Agent is scanning for opportunities...
      </p>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExecutionTable() {
  const TRADES = useExecutionFeed().slice(0, 10)
  const { isInitializing } = useNexus()
  const [selected, setSelected] = useState<Trade | null>(null)

  if (isInitializing) {
    return (
      <div className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', padding: 20 }}>
        <SkeletonLoader type="row" count={6} />
      </div>
    )
  }

  return (
    <>
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
          <span className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Execution Protocol
          </span>
          <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Tap row for details
          </span>
        </div>

        {TRADES.length === 0 ? <EmptyState /> : (
          /* Horizontal scroll wrapper for mobile */
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  {['Time', 'Pair', 'Side', 'Size', 'P&L', 'Status'].map(col => (
                    <th key={col}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRADES.map((row, i) => {
                  const isBuy = row.side === 'BUY'
                  const isPos = row.pnl >= 0
                  const pnlDisplay = `${row.pnl >= 0 ? '+' : ''}$${Math.abs(row.pnl).toFixed(2)}`
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="transition-colors duration-150 cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-dim)' }}
                      onClick={() => setSelected(row)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-3.5 text-[11px]"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {row.time}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] font-semibold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {row.pair}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            background: isBuy ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                            border: `1px solid ${isBuy ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}`,
                            color: isBuy ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)',
                          }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: isBuy ? 'var(--green)' : 'var(--red)' }} />
                          {row.side}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px]"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {row.size}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] font-bold"
                        style={{ color: isPos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                        {pnlDisplay}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            background: row.status === 'CONFIRMED' ? 'rgba(0,255,136,0.06)' : 'rgba(255,68,68,0.08)',
                            color: row.status === 'CONFIRMED' ? 'rgba(0,255,136,0.6)' : 'var(--red)',
                            fontFamily: 'var(--font-mono)',
                            border: `1px solid ${row.status === 'CONFIRMED' ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.2)'}`,
                          }}>
                          {row.status}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Trade detail drawer */}
      {selected && <TradeDrawer trade={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
