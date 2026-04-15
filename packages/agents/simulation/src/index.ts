// TODO: Replace stub with real historical data replay against PancakeSwap subgraph

import { orchestratorBus, publishError } from '@pancakeswap-agent/core';

export interface BacktestParams {
  strategy: string;
  historicalData: Array<{ timestamp: number; price: number; volume: number }>;
  initialCapitalUSD?: number;
}

export interface BacktestResult {
  winRate: number;
  avgProfit: number;
  maxDrawdown: number;
  totalTrades: number;
  sharpeRatio: number;
  strategy: string;
  simulatedAt: number;
}

export class SimulationAgent {
  private started = false;

  start() {
    if (this.started) return;
    this.started = true;

    console.log('[Simulation Agent] Standing by for backtest requests...');

    orchestratorBus.emit('agent:status', {
      agentName: 'simulation',
      status: 'idle',
      lastEventTime: Date.now(),
      eventsProcessed: 0,
    });
  }

  /**
   * Run a backtest simulation against historical price data.
   * Currently returns mock results — will be replaced with real
   * historical data replay against PancakeSwap subgraph snapshots.
   */
  async runBacktest(params: BacktestParams): Promise<BacktestResult> {
    console.log(
      `[Simulation Agent] Backtest requested for strategy="${params.strategy}" ` +
      `with ${params.historicalData.length} data points`
    );

    orchestratorBus.emit('agent:status', {
      agentName: 'simulation',
      status: 'running',
      lastEventTime: Date.now(),
      eventsProcessed: params.historicalData.length,
    });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result: BacktestResult = {
      winRate: 0.62,
      avgProfit: 0.8,
      maxDrawdown: 0.12,
      totalTrades: Math.max(params.historicalData.length, 42),
      sharpeRatio: 1.34,
      strategy: params.strategy,
      simulatedAt: Date.now(),
    };

    console.log(
      `[Simulation Agent] Backtest complete: WinRate=${(result.winRate * 100).toFixed(1)}% ` +
      `AvgProfit=$${result.avgProfit.toFixed(2)} MaxDD=${(result.maxDrawdown * 100).toFixed(1)}%`
    );

    orchestratorBus.emit('agent:status', {
      agentName: 'simulation',
      status: 'idle',
      lastEventTime: Date.now(),
      eventsProcessed: params.historicalData.length,
    });

    return result;
  }
}

export function startSimulationAgent() {
  const agent = new SimulationAgent();
  agent.start();
  return agent;
}

if (require.main === module) {
  startSimulationAgent();
}
