import { orchestratorBus, publishError, MarketState, TradeEvent } from '@pancakeswap-agent/core';
import { createPortfolioApiServer, loadPortfolioStateFromTrades, PortfolioApiState } from './api_server';
import { calculatePortfolioMetrics } from './metrics';
import { appendTrade, getAllTrades } from './trade_ledger';

let latestMarketState: MarketState | null = null;
let apiState: PortfolioApiState | null = null;

async function refreshMetrics(): Promise<void> {
  if (!apiState) {
    return;
  }

  const trades = await getAllTrades();
  apiState.trades = trades;
  apiState.metrics = calculatePortfolioMetrics(trades);
  apiState.equityCurve = apiState.metrics.equityCurve;
}

export async function startPortfolioAgent() {
  apiState = await loadPortfolioStateFromTrades();
  const server = createPortfolioApiServer(apiState);

  orchestratorBus.on('market:update', (state) => {
    latestMarketState = state;
    apiState!.marketState = state;
    server.broadcast({ type: 'market_update', data: state });
  });

  orchestratorBus.on('risk:state', (state) => {
    if (!apiState) return;
    apiState.riskStatus = {
      isPaused: state.isPaused,
      drawdownPct: state.drawdownPct,
    };
    apiState.positions = state.positions.map((position: any) => ({
      pair: position.pair,
      sizeUSD: position.sizeUSD,
      entryPrice: position.entryPrice,
      timestamp: position.timestamp,
    }));
  });

  orchestratorBus.on('risk:circuit_break', (payload) => {
    apiState!.riskStatus = { isPaused: true, drawdownPct: payload.drawdownPct };
    server.broadcast({ type: 'risk_alert', data: payload });
  });

  orchestratorBus.on('execution:trade', async (trade: TradeEvent) => {
    try {
      await appendTrade({
        txHash: trade.txHash,
        signalId: trade.signalId,
        strategyId: trade.strategyId,
        pair: trade.pair,
        direction: trade.direction,
        sizeUSD: trade.sizeUSD,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        grossProfitUSD: trade.grossProfitUSD,
        gasUsedUSD: trade.gasUsedUSD,
        feesUSD: trade.feesUSD,
        netProfitUSD: trade.netProfitUSD,
        timestamp: trade.timestamp,
        regime: trade.regime,
        poolAddress: trade.poolAddress,
      });
      await refreshMetrics();
      server.broadcast({ type: 'trade', data: trade });
      server.broadcast({ type: 'metrics', data: apiState!.metrics });
    } catch (error) {
      publishError('PortfolioAgent', error);
    }
  });

  orchestratorBus.on('agent:status', (status) => {
    apiState!.agentStatuses[status.agentName] = status;
  });

  orchestratorBus.on('portfolio:snapshot', () => {
    // Sync points handled by risk:state and metrics refresh
  });

  const port = process.env.PORTFOLIO_API_PORT || 3001;
  server.server.listen(port, () => {
    console.log(`[Portfolio Agent] API listening on port ${port}`);
  });

  return server;
}

if (require.main === module) {
  startPortfolioAgent().catch((error) => {
    console.error('[Portfolio Agent] Fatal startup error:', error);
    process.exit(1);
  });
}