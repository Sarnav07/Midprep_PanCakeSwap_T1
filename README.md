# NEXUS — Autonomous Multi-Agent Trading System

> **Technical General Championship 2026 — PancakeSwap × IIT Roorkee**

NEXUS is a cyberpunk-aesthetic, multi-agent AI trading dashboard built for PancakeSwap on BNB Chain (BSC Testnet). It implements cross-pool arbitrage detection, real-time risk management, and autonomous trade execution across a 7-agent event-driven architecture — all visualised through a high-fidelity React dashboard.

---

## 🖥️ Live Demo

| Platform | URL |
|---|---|
| **Vercel** | *(deploy from this repo to get your link)* |
| **GitHub Pages** | `https://sarnav07.github.io/cake-sentinel/` *(after Pages setup)* |
| **Local** | `http://localhost:5173` |

---

## 🏗️ Architecture

All agents communicate over the **NEXUS Orchestrator Bus** — a typed Node.js `EventEmitter`. No agent imports another directly. Every message is a typed event.

```
Market Intelligence Agent (P1)
    └─ market:update →
            ├─ Strategy Agent (P2)   → strategy:signal →
            │       └─ Risk Agent (P3)  → risk:decision →
            │               └─ Execution Agent (P2) → execution:trade →
            └─ Portfolio Agent (P3)  ← reads execution:trade
                    └─ Dashboard WebSocket → React UI (live)
```

---

## 📦 Monorepo Structure

```
packages/
├── core/                    # Typed EventEmitter orchestrator + event types
├── agents/
│   ├── market-intelligence/ # (P1) Subgraph polling, regime detection, pool analysis
│   ├── liquidity/           # (P1) V3 IL estimation, pool mapping
│   ├── strategy/            # (P2) Arbitrage detection, signal generation
│   ├── execution/           # (P2) viem routing, gas estimation, on-chain swap
│   ├── risk/                # (P3) Circuit breakers, drawdown limits, firewall
│   ├── portfolio/           # (P3) Trade ledger, P&L computation, API server
│   └── simulation/          # Backtest engine (in progress)
├── dashboard/               # React 18 + Vite + Tailwind — NEXUS UI
│   └── src/
│       ├── pages/           # LandingPage, Market, Strategy, Execution, Risk, Portfolio, Liquidity
│       ├── components/
│       │   ├── market/      # StatsBar, LiquidityStream, ExecutionTable, RiskGuardian, PoolIntelligence
│       │   ├── shared/      # ActivityFeed, AgentStatusBar, SkeletonLoader
│       │   └── ui/          # GlowCard, StatBadge, SectionTitle, LiveDot, MonoValue
│       ├── context/         # NexusContext — global state + all live data hooks
│       └── data/            # MockDataEngine (random-walk price sim), constants
├── contracts/               # Foundry smart contracts (BSC Testnet)
docs/
└── final_audit_report.md    # Full system audit: what's built, what's wired, demo guide
```

---

## 🤖 Team

| Member | Role | Owns |
|---|---|---|
| **Person 1** | Data & Intelligence | `market-intelligence`, `liquidity` |
| **Person 2** | Strategy & Execution | `strategy`, `execution` |
| **Person 3** | Risk & Portfolio | `risk`, `portfolio`, `dashboard` |

---

## 🔁 The 5-Step Execution Loop

1. **Market Intelligence** polls PancakeSwap V2/V3 subgraph + viem RPC every 5s → emits `market:update`
2. **Strategy Agent** detects arbitrage opportunities (price discrepancy > gas cost + slippage) → emits `strategy:signal`
3. **Risk Firewall** validates signal against `$500 position cap`, `4.8% max drawdown`, anomaly score → emits `risk:decision`
4. **Execution Agent** routes approved swap via `viem.writeContract` to PancakeSwap V3 Router on BSC Testnet
5. **Portfolio Agent** captures `execution:trade` receipt → computes P&L, Sharpe ratio → streams to dashboard

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- Copy `.env.example` → `.env` and fill in your BSC Testnet private key + RPC

```bash
# Install all dependencies
npm install

# Start all agents + dashboard
bash ./start.sh

# Dashboard only
cd packages/dashboard && npm run dev
```

Dashboard opens at **http://localhost:5173**

---

## 🌐 Dashboard Features

| Tab | Features |
|---|---|
| **Landing** | Canvas particle network, staggered NEXUS reveal, live stat counters |
| **Market** | Live price stream, execution log, Risk Guardian sliders, Pool Intelligence |
| **Strategy** | Signal feed (confidence-sorted), Regime Detector, Strategy Performance |
| **Execution** | 20-row trade log, CSV export, Gas Tracker, MEV Shield status |
| **Risk** | Circuit Breaker toggles, Drawdown history chart, Position Exposure |
| **Portfolio** | Equity Curve (1D/7D/30D), PNL distribution histogram, Holdings breakdown |
| **Liquidity** | V3 pool grid with TVL bars + ARB badges, IL Simulator, APR Leaderboard |

All data powered by **MockDataEngine** — a Gaussian random-walk simulator that emits live price ticks, trade events, and agent activity every 2–8 seconds.

---

## 📡 Deployment

### Vercel (Recommended)
1. Import `Sarnav07/cake-sentinel` at [vercel.com/new](https://vercel.com/new)
2. `vercel.json` is pre-configured — zero setup needed
3. Click Deploy

### GitHub Pages
1. Repo Settings → Pages → Source: **GitHub Actions**
2. Push to `main` — the workflow in `.github/workflows/deploy-dashboard.yml` auto-builds and deploys

---

## 🔑 Environment Variables

```env
# BSC Testnet
PRIVATE_KEY=               # Wallet private key (never commit!)
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
PANCAKESWAP_V3_ROUTER=0x...
PANCAKESWAP_V2_ROUTER=0x...
GRAPH_API_KEY=             # The Graph API key for subgraph access
PORT=3001                  # Portfolio Agent API port
```

---

## 🛡️ Risk Parameters (Defaults)

| Parameter | Value |
|---|---|
| Max Position Size | $500 |
| Max Drawdown | 15% |
| Stop Loss | -$25 per trade |
| Anomaly Score Threshold | 75 / 100 |
| Min Profit After Gas | $0.50 |

---

## 📄 Docs

See [`docs/final_audit_report.md`](./docs/final_audit_report.md) for the full engineering audit: what's built, what's wired, known gaps, demo script, and judge Q&A guide.

---

*Built at IIT Roorkee — Technical General Championship 2026*
