import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ALL_TRADES = Array.from({ length: 20 }, (_, i) => {
  const pairs    = ['BNB/BUSD','CAKE/BNB','ETH/USDC','BTCB/USDT','XRP/USDT']
  const sides    = ['BUY','SELL']
  const statuses = ['CONFIRMED','CONFIRMED','CONFIRMED','FAILED']
  const pair   = pairs[i % pairs.length]
  const side   = sides[i % 2]
  const pnl    = (Math.random() * 10 - 2).toFixed(2)
  const entry  = (300 + Math.random() * 50).toFixed(2)
  const exit   = (parseFloat(entry) + parseFloat(pnl) * 0.8).toFixed(2)
  const gas    = (0.002 + Math.random() * 0.008).toFixed(4)
  const status = statuses[i % statuses.length]
  const h = String(Math.floor(i / 3)).padStart(2,'0')
  const m = String((i * 7) % 60).padStart(2,'0')
  const s = String((i * 13) % 60).padStart(2,'0')
  return { id: i+1, time: `${h}:${m}:${s}`, pair, side, size: `${(Math.random()+0.1).toFixed(3)} ${pair.split('/')[0]}`, entry, exit, gas, pnl, status }
})

const GAS_SPARK = Array.from({ length: 30 }, (_, i) => ({ v: 3 + Math.sin(i/4)*2 + Math.random()*1.5 }))

const GasTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: 11 }}>
      {payload[0].value.toFixed(1)} gwei
    </div>
  )
}

// ─── GAS TRACKER ─────────────────────────────────────────────────────────────
function GasTracker() {
  const currentGas = 4.2
  const gasColor = currentGas > 10 ? 'var(--red)' : currentGas > 5 ? 'var(--amber)' : 'var(--green)'
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
      className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }} />
        <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Gas Tracker</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Current Gas</p>
        <p className="text-[32px] font-black leading-none" style={{ color: gasColor, fontFamily: 'var(--font-mono)' }}>
          {currentGas} <span style={{ fontSize: 14, opacity: 0.6 }}>gwei</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={50}>
        <LineChart data={GAS_SPARK} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line type="monotone" dataKey="v" stroke={gasColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Tooltip content={<GasTip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between py-2 rounded-lg px-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-dim)' }}>
        <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Next Trade Est.</span>
        <span className="text-[12px] font-bold" style={{ color: gasColor, fontFamily: 'var(--font-mono)' }}>~0.0042 BNB</span>
      </div>
    </motion.div>
  )
}

// ─── MEV SHIELD ──────────────────────────────────────────────────────────────
function MevShield() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
      className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>MEV Shield</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ background: 'rgba(0,255,136,0.08)', color: 'var(--green)', border: '1px solid rgba(0,255,136,0.2)', fontFamily: 'var(--font-mono)' }}>
          ACTIVE
        </span>
      </div>
      {[
        { label: 'Private Mempool', value: 'Connected',  ok: true  },
        { label: 'Flashloan Guard',  value: 'Enabled',    ok: true  },
        { label: 'Trades Protected', value: '142',        ok: true  },
      ].map(row => (
        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
          <span className="text-[11px] font-bold" style={{ color: row.ok ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{row.value}</span>
        </div>
      ))}
    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

export default function ExecutionPage() {
  const [page, setPage]       = useState(0)
  const [pairFilter, setPair] = useState('All Pairs')
  const [sideFilter, setSide] = useState('All Sides')

  const filtered = ALL_TRADES.filter(t => {
    if (pairFilter !== 'All Pairs' && t.pair !== pairFilter) return false
    if (sideFilter !== 'All Sides' && t.side !== sideFilter) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const pairs      = ['All Pairs', ...Array.from(new Set(ALL_TRADES.map(t => t.pair)))]

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 10px', borderRadius: 8, outline: 'none', cursor: 'pointer',
  }

  const exportCSV = () => {
    const header = 'Time,Pair,Side,Size,Entry,Exit,Gas,PNL,Status\n'
    const body   = ALL_TRADES.map(t => `${t.time},${t.pair},${t.side},${t.size},${t.entry},${t.exit},${t.gas},${t.pnl},${t.status}`).join('\n')
    const blob   = new Blob([header + body], { type: 'text/csv' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a'); a.href = url; a.download = 'nexus_trades.csv'; a.click()
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">

        {/* Left: Trade log */}
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <select value={pairFilter} onChange={e => { setPair(e.target.value); setPage(0) }} style={selectStyle}>
              {pairs.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={sideFilter} onChange={e => { setSide(e.target.value); setPage(0) }} style={selectStyle}>
              {['All Sides','BUY','SELL'].map(s => <option key={s}>{s}</option>)}
            </select>
            <motion.button whileHover={{ background: 'rgba(0,229,255,0.1)' }} whileTap={{ scale: 0.96 }} onClick={exportCSV}
              className="ml-auto px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
              style={{ border: '1px solid rgba(0,229,255,0.3)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', background: 'transparent' }}>
              ↓ Export CSV
            </motion.button>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Trade Log <span style={{ color: 'var(--text-muted)' }}>— {filtered.length} records</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    {['Time','Pair','Side','Size','Entry','Exit','Gas','Net PNL','Status'].map(c => (
                      <th key={c} className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isBuy  = row.side === 'BUY'
                    const isPos  = parseFloat(row.pnl) >= 0
                    const isFail = row.status === 'FAILED'
                    return (
                      <motion.tr key={row.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ borderBottom: '1px solid var(--border-dim)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td className="px-4 py-3 text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.time}</td>
                        <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.pair}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ fontFamily: 'var(--font-mono)',
                              background: isBuy ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                              color: isBuy ? 'var(--green)' : 'var(--red)',
                              border: `1px solid ${isBuy ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}` }}>
                            {row.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{row.size}</td>
                        <td className="px-4 py-3 text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>${row.entry}</td>
                        <td className="px-4 py-3 text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>${row.exit}</td>
                        <td className="px-4 py-3 text-[10px]" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{row.gas}</td>
                        <td className="px-4 py-3 text-[11px] font-bold" style={{ color: isFail ? 'var(--text-muted)' : isPos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                          {isFail ? '—' : `${isPos ? '+' : ''}$${Math.abs(parseFloat(row.pnl)).toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                            style={{ fontFamily: 'var(--font-mono)',
                              background: isFail ? 'rgba(255,68,68,0.08)' : 'rgba(0,255,136,0.06)',
                              color: isFail ? 'var(--red)' : 'rgba(0,255,136,0.5)',
                              border: `1px solid ${isFail ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,136,0.1)'}` }}>
                            {row.status}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button key={idx} onClick={() => setPage(idx)}
                    className="w-7 h-7 rounded text-[10px] font-bold transition-all"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: idx === page ? 'rgba(0,229,255,0.15)' : 'transparent',
                      color: idx === page ? 'var(--cyan)' : 'var(--text-muted)',
                      border: idx === page ? '1px solid rgba(0,229,255,0.3)' : '1px solid var(--border-dim)',
                    }}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <GasTracker />
          <MevShield />
        </div>
      </div>
    </div>
  )
}
