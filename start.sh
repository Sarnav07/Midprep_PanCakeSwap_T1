#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 NEXUS — Booting Agent Network (BSC Testnet)"
echo "================================================"

# Boot order matters: data producers first, consumers second.
# 500ms delay between each agent for clean initialization.

echo "[1/8] Starting Market Intelligence Agent..."
npm run start --workspace=@pancakeswap-agent/market-intelligence &
sleep 0.5

echo "[2/8] Starting Liquidity Agent..."
npm run start --workspace=@pancakeswap-agent/liquidity &
sleep 0.5

echo "[3/8] Starting Strategy Agent..."
npm run start --workspace=@pancakeswap-agent/strategy &
sleep 0.5

echo "[4/8] Starting Risk Agent..."
npm run dev --workspace=@pancakeswap-agent/risk &
sleep 0.5

echo "[5/8] Starting Execution Agent..."
npm run start --workspace=@pancakeswap-agent/execution &
sleep 0.5

echo "[6/8] Starting Portfolio Agent..."
npm run dev --workspace=@pancakeswap-agent/portfolio &
sleep 0.5

echo "[7/8] Starting Simulation Agent..."
npm run start --workspace=@pancakeswap-agent/simulation &
sleep 0.5

echo "[8/8] Starting Dashboard..."
npm run dev --workspace=@pancakeswap-agent/dashboard &

echo ""
echo "================================================"
echo "✅ All agents launched. Dashboard: http://localhost:5173"
echo "   Portfolio API: http://localhost:3001"
echo "================================================"

wait