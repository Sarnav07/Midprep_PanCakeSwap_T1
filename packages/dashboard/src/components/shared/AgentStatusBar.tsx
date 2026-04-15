import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentStatuses, useNexus } from '../../context/NexusContext'
import type { AgentName, AgentStatus } from '../../data/MockDataEngine'

// ── Agent Detail Sidebar ───────────────────────────────────────────────────────
const AGENT_DESC: Record<AgentName, string> = {
  'Market Intel': 'Scans DEX order books, detects spread arbitrage, and monitors volume spikes across PancakeSwap V2/V3 pairs.',
  'Strategy':     'Evaluates signal confidence scores and queues trades based on ARBITRAGE, TREND, and MEAN-REVERSION templates.',
  'Execution':    'Submits and monitors on-chain transactions via BSC Testnet. Manages gas estimation and retry logic.',
  'Risk':         'Enforces circuit breakers, monitors drawdown thresholds, and computes real-time anomaly scores.',
  'Portfolio':    'Tracks cumulative P&L, win rate, and capital utilization across all open and closed positions.',
  'Liquidity':    'Manages PancakeSwap V3 concentrated liquidity positions, range optimization, and fee harvesting.',
  'Simulation':   'Runs backtest iterations on historical BSC tick data to validate strategy parameters.',
}

function AgentSidebar() {
  const { sidebarAgent, setSidebarAgent, state } = useNexus()
  const agent = state.agents.find(a => a.name === sidebarAgent) ?? null

  return (
    <AnimatePresence>
      {agent && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarAgent(null)} />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 overflow-y-auto"
            style={{ background: 'rgba(8,11,18,0.97)', borderLeft: '1px solid var(--border-dim)', backdropFilter: 'blur(30px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <div className="flex items-center gap-3">
                <motion.div animate={agent.active ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: agent.color, boxShadow: `0 0 ${agent.active ? 12 : 4}px ${agent.color}` }} />
                <div>
                  <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{agent.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: agent.active ? agent.color : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {agent.active ? '● Processing' : '○ Idle'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSidebarAgent(null)}
                className="text-lg leading-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                ×
              </button>
            </div>

            {/* Description */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {AGENT_DESC[agent.name as AgentName]}
              </p>
            </div>

            {/* Live metrics */}
            <div className="px-6 py-5 space-y-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Live Metrics</p>
              {[
                { label: 'Status',     value: agent.active ? 'ACTIVE' : 'IDLE', color: agent.active ? agent.color : 'var(--text-muted)' },
                { label: 'Last Event', value: new Date().toLocaleTimeString('en-US', { hour12: false }), color: 'var(--text-secondary)' },
                { label: 'Uptime',     value: '99.8%',  color: 'var(--green)' },
                { label: 'Events/min', value: agent.active ? '~20' : '~4', color: 'var(--cyan)' },
              ].map(m => (
                <div key={m.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="px-6 py-5">
              <p className="text-[9px] uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Recent Activity</p>
              <div className="space-y-2">
                {state.activity
                  .filter(a => a.agent === agent.name)
                  .slice(0, 8)
                  .map(a => (
                    <div key={a.id} className="py-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{a.message}</p>
                        {a.value && <span className="text-[10px] font-bold flex-shrink-0" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>{a.value}</span>}
                      </div>
                      <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.ts}</p>
                    </div>
                  ))}
                {state.activity.filter(a => a.agent === agent.name).length === 0 && (
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No recent activity for this agent.</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Main Status Bar ────────────────────────────────────────────────────────────
export default function AgentStatusBar() {
  const agents = useAgentStatuses()
  const { setSidebarAgent } = useNexus()

  return (
    <>
      <div
        className="flex items-center gap-1 px-4 py-2 overflow-x-auto"
        style={{ background: 'rgba(8,11,18,0.6)', borderBottom: '1px solid var(--border-dim)', backdropFilter: 'blur(10px)' }}
      >
        <span className="text-[9px] uppercase tracking-[0.25em] mr-2 flex-shrink-0"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Agents
        </span>

        {agents.map((agent: AgentStatus) => (
          <motion.button
            key={agent.name}
            onClick={() => setSidebarAgent(agent.name as AgentName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 transition-all cursor-pointer"
            style={{
              background: agent.active ? `${agent.color}15` : 'transparent',
              border: agent.active ? `1px solid ${agent.color}40` : '1px solid transparent',
            }}
            whileHover={{ background: `${agent.color}10`, borderColor: `${agent.color}30` }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Status dot */}
            {agent.active ? (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: agent.color, boxShadow: `0 0 8px ${agent.color}` }}
              />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }} />
            )}

            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
              style={{ color: agent.active ? agent.color : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {agent.name}
            </span>
          </motion.button>
        ))}

        {/* System time */}
        <div className="ml-auto flex-shrink-0 pl-4">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            BSC TESTNET
          </span>
        </div>
      </div>

      {/* Sidebar portal */}
      <AgentSidebar />
    </>
  )
}
