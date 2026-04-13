# NEXUS: Agentic DeFi Intelligence Layer
> Technical General Championship 2026 — PancakeSwap × IIT Roorkee

NEXUS is a multi-agent AI system that autonomously identifies and executes trading opportunities on PancakeSwap across BNB Chain, Ethereum, and Arbitrum. The system delegates responsibilities across a 7-agent network for polling data, validating risk limits, generating signals, calculating live PnL, and routing native transactions on testnet.

## Team Members

| Person | Role | Owns |
|--------|------|------|
| **Person 1** | Data & Intelligence | `@pancakeswap-agent/market-intelligence`, `@pancakeswap-agent/liquidity` |
| **Person 2** | Strategy & Execution | `@pancakeswap-agent/strategy`, `@pancakeswap-agent/execution` |
| **Person 3** | Risk & Portfolio | `@pancakeswap-agent/risk`, `@pancakeswap-agent/portfolio`, `dashboard` |

## Architecture Overview

The system strictly avoids hard coupling. All agents communicate blindly over the **NEXUS Orchestrator Base** (a native TypeScript `EventEmitter` messaging bus) to enforce separation of concerns and robust async error isolation.

```text
Market Intelligence Agent (P1)
    └─ publishes market_state → Orchestrator
            ├─ Strategy Agent (P2) reads market_state, emits trade signals
            ├─ Execution Agent (P2) executes approved trades on-chain
            ├─ Portfolio Agent (P3) logs all trades, computes P&L
            └─ Risk Agent (P3) approves / vetoes every trade
```

## Working Mechanics (The 5-Step Loop)

1. The **Market Intelligence** module actively pulls subgraphs over viem to construct a pristine `MarketState` payload detailing all pool configurations, reserves, and real-time gas prices.
2. The **Strategy Agent** natively listens to `market:update`. If an Arbitrage condition evaluates positive (Accounting for Slippage + Gas cost thresholds), it fires a `strategy:signal` into the Orchestrator.
3. The **Risk Circuit-Breaker** catches the signal, verifying that total position size < $500, expected drawdowns are safe, and the macro-market conditions aren't inherently anomalous.
4. Upon receiving `risk:decision { approved: true }`, the **Execution Agent** routes a live Swap signature to PancakeSwap V3 on testnet.
5. Finally, the **Portfolio & Dashboard Layer** captures the EVM Receipt `execution:trade` payload to compute Sharpe Ratios and broadcast real-time metrics over WebSockets to the React User Interface.

## Deployment Address

**Environment**: `BSC Testnet`
*Smart Contracts are currently localized into `packages/contracts` via Foundry and will be natively mapped and deployed (TBD) prior to hackathon mainnet presentation.*

## Repository Layout

```text
packages/
   core/                 # Typed definitions and Orchestrator Base
   agents/
      market-intelligence/ # P1 Graph Polling
      liquidity/           # P1 Impermanent Loss estimations
      strategy/            # P2 Arbitrage Conditionals
      execution/           # P2 Viem Routing
      risk/                # P3 Firewall Circuit Breakers
      portfolio/           # P3 Trade Ledgers and API
   dashboard/            # P3 Vite + React Front-end UI
contracts/               # Forge Foundry Smart Contracts
docs/                    # Project guidelines and audit matrices
```

## Quick Start

1. Install root dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
# Ensure RPC_URL_BSC, PRIVATE_KEY, and PANCAKESWAP_SUBGRAPH_URL are populated
```

3. Boot all workspace packages concurrently OR natively isolate agents:

```bash
npm run start --workspaces
```

5. Open dashboard to view the Real-Time live PnL UI terminal:

```text
http://localhost:5173
```
