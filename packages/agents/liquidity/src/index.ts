import { orchestratorBus, publishError, MarketState } from '@pancakeswap-agent/core';
import { calculateV2ImpermanentLoss, calculateV3ImpermanentLossApprox } from './il_estimator';

interface LiquidityAnalysis {
  timestamp: number;
  pools: Array<{
    address: string;
    pair: string;
    impermanentLossPct: number;
    tvlUSD: number;
    riskTier: 'blue-chip' | 'mid-cap' | 'degen';
  }>;
}

const initialPrices: Record<string, number> = {};

function classifyRiskTier(volumeUSD: number, liquidity: string): 'blue-chip' | 'mid-cap' | 'degen' {
  const liq = Number(liquidity);
  if (liq > 1_000_000 || volumeUSD > 500_000) return 'blue-chip';
  if (liq > 100_000 || volumeUSD > 50_000) return 'mid-cap';
  return 'degen';
}

export class LiquidityAgent {
  private started = false;

  start() {
    if (this.started) return;
    this.started = true;

    console.log('[Liquidity Agent] Listening for market:update...');

    orchestratorBus.on('market:update', (state: MarketState) => {
      try {
        const analysis = this.analyze(state);
        orchestratorBus.emit('agent:status', {
          agentName: 'liquidity',
          status: 'running',
          lastEventTime: Date.now(),
          eventsProcessed: Object.keys(state.pools).length,
        });

        // Emit liquidity analysis as an agent status event payload
        // The portfolio agent and dashboard can consume this
        // @ts-ignore
        orchestratorBus.emit('liquidity:analysis', analysis);
        
        console.log(
          `[Liquidity Agent] Analyzed ${analysis.pools.length} pools. ` +
          `Worst IL: ${(Math.min(...analysis.pools.map(p => p.impermanentLossPct)) * 100).toFixed(2)}%`
        );
      } catch (err) {
        publishError('LiquidityAgent', err);
      }
    });
  }

  private analyze(state: MarketState): LiquidityAnalysis {
    const poolAnalyses: LiquidityAnalysis['pools'] = [];

    for (const [address, pool] of Object.entries(state.pools)) {
      const reserve0 = Number(pool.reserve0);
      const reserve1 = Number(pool.reserve1);
      const currentPrice = reserve0 > 0 ? reserve1 / reserve0 : 0;

      if (currentPrice <= 0) continue;

      // Track initial price for IL calculation
      if (!initialPrices[address]) {
        initialPrices[address] = currentPrice;
      }

      const initialPrice = initialPrices[address];
      const il = calculateV2ImpermanentLoss(initialPrice, currentPrice);

      const volumeUSD = Number(pool.volumeUSD) || 0;
      const riskTier = classifyRiskTier(volumeUSD, pool.liquidity);

      // Estimate TVL from reserves (simplified)
      const tvlUSD = reserve0 * 2 * (currentPrice > 0 ? 1 : 0);

      poolAnalyses.push({
        address,
        pair: `${pool.token0.symbol}/${pool.token1.symbol}`,
        impermanentLossPct: il,
        tvlUSD,
        riskTier,
      });
    }

    return {
      timestamp: Date.now(),
      pools: poolAnalyses,
    };
  }
}

export function startLiquidityAgent() {
  const agent = new LiquidityAgent();
  agent.start();
  return agent;
}

if (require.main === module) {
  startLiquidityAgent();
}
