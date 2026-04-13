# Development Handover: Team Guide

Welcome to the **NEXUS** monorepo! This document serves as the absolute source of truth for the codebase's current state as we approach the final Hackathon submission. **Every single agent has been fully built.**

## 🚨 The Most Important Thing to Know

We are using an **Orchestrator** (`packages/core/src/orchestrator.ts`) as our communication bus. 
**No agent calls another agent directly.** We strictly use typed events.

Before you modify or debug any code, look at `packages/core/src/types.ts`. All data payloads perfectly match those 6 core interfaces.

---

## 👩‍💻 Person 1 (Data & Intelligence)
**Your work is mathematically complete.**
- You own `@pancakeswap-agent/market-intelligence` and `@pancakeswap-agent/liquidity`.
- Your system currently polls the PancakeSwap V2/V3 Subgraphs over viem.
- It beautifully constructs the `MarketState` payload and fires `market:update` onto the event bus.
- **Action Items:** Simply monitor the RPC endpoints and keep your API keys fed. The rest of the team relies blindly on your feeds.

---

## 🧑‍💻 Person 2 (Strategy & Execution)
**Your work is structurally complete.**
- You own `@pancakeswap-agent/strategy` and `@pancakeswap-agent/execution`.
- Your Arbitrage module successfully catches `market:update` and calculates cross-pool execution parameters.
- It fires a `strategy:signal` event with simulated gas fees.
- Once the Risk Firewall approves it, your Execution agent seamlessly fires the TX to the PancakeSwap V3 router using your testnet private key.
- **Action Items:** Add more complex strategies (like Yield Farming or Mean-Reverting triggers) by simply creating new signal emitters inside your module!

---

## 👨‍💻 Person 3 (Risk, Portfolio, & Dashboard)
**Your work is fully wired and complete.**
- You own `@pancakeswap-agent/risk`, `@pancakeswap-agent/portfolio`, and the `dashboard` UI.
- The **Risk Agent** successfully applies a rigid $500 hard circuit-breaker to all incoming positions. I have added rich `console.log()` feedback so you can see your approvals/denials stream in real-time on your Node server.
- The **Portfolio Agent** properly runs an Express API on `localhost:3001` that computes pure PnL, Win Rates, and Sharpe Ratios based on Person 2's `execution:trade` emissions.
- The **React Dashboard** has been fully hot-wired to the Express Server API using standard `fetch` hooks. As trades land, your WebSocket and REST API hydrate the charts automatically!

---

## 🚀 How to Run the Demo

To test the entire sequential loop end-to-end natively:

```bash
# Terminal 1: Spin up the entire Monorepo sequentially
npm run start --workspaces

# Terminal 2: Kickstart the Dashboard UI
cd packages/dashboard
npm run dev
```

Open `http://localhost:5173`. When Person 1's Market feed catches a spike, Person 2's strategy fires. Person 3's risk approves, Person 2 routes the TX, and the Portfolio server pushes the PnL strictly to the UI you are looking at. 

Enjoy the hackathon!
