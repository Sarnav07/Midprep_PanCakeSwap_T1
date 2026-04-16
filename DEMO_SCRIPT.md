# NEXUS Demo Script: 2-Minute Technical Flow

*(Speak clearly and keep the pace tight. The goal is to show the end-to-end pipeline, not every feature.)*

## What the protocol achieves

NEXUS is an event-driven PancakeSwap trading protocol that ingests live BSC testnet market data, turns it into arbitrage signals, filters those signals through a risk firewall, executes approved swaps on-chain, and writes the result into a portfolio ledger plus API.

## Conversational flow

**[0:00] Hook**
"Hello judges. NEXUS is a multi-agent trading protocol built as a TypeScript Turborepo. Its core is a typed EventEmitter orchestrator, so agents never call each other directly. They only exchange strict events like `market:update`, `strategy:signal`, `risk:decision`, and `execution:trade`."

**[0:20] Market ingestion**
"The Market Intelligence agent polls PancakeSwap subgraph data and BSC RPC through viem every 5 seconds. It builds a `MarketState` with pool reserves, gas price, and regime classification, and when subgraph data is unavailable it falls back to on-chain reserve reads."

**[0:40] Liquidity and strategy**
"The Liquidity agent measures impermanent loss and pool risk tier from that same market state. Then the Strategy agent compares pool prices, detects cross-pool arbitrage opportunities, estimates expected profit, and emits a candidate trade signal with confidence."

**[1:00] Risk firewall**
"Before anything can execute, the Risk agent acts as the firewall. It enforces the hard policy limits: $500 max position size, 5 open positions, 10% drawdown cap, $15 gas cost limit, and $2 minimum net profit after fees. If the market looks anomalous, it pauses the flow and rejects the signal."

**[1:20] On-chain execution**
"If the signal passes risk, the Execution agent uses viem to route the swap through the PancakeSwap V3 router on BSC testnet with `exactInputSingle`. It computes slippage, deadline, and token amounts, then emits a trade event with the actual transaction hash."

**[1:40] Portfolio and dashboard**
"The Portfolio agent persists that trade to a ledger, recomputes metrics, and serves REST plus WebSocket updates on port 3001. The React dashboard is the operator console: it visualizes market state, signals, risk, execution, and portfolio so you can watch the protocol behave in real time."

**[1:55] Close**
"We also have smart contract code for NexusVault and SignalRegistry for the trustless audit layer, plus a simulation package scaffolded for backtesting. So the full system is: live data in, risk-checked signal out, on-chain execution, and auditable portfolio accounting. Thank you."
