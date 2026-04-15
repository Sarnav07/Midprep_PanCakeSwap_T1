import React from 'react'
import StatsBar        from '../components/market/StatsBar'
import LiquidityStream from '../components/market/LiquidityStream'
import ExecutionTable  from '../components/market/ExecutionTable'
import RiskGuardian    from '../components/market/RiskGuardian'
import PoolIntelligence from '../components/market/PoolIntelligence'
import ActivityFeed    from '../components/shared/ActivityFeed'

export default function MarketPage() {
  return (
    <div className="space-y-5">
      {/* === KPI Stats Row === */}
      <StatsBar />

      {/* === Main 70/30 Grid === */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Left column — 70% */}
        <div className="space-y-5 min-w-0">
          <LiquidityStream />
          <ExecutionTable />
          <ActivityFeed maxHeight={320} />
        </div>

        {/* Right column — 30% */}
        <div className="space-y-5">
          <RiskGuardian />
          <PoolIntelligence />
        </div>

      </div>
    </div>
  )
}
