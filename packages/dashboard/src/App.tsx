import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NexusProvider } from './context/NexusContext'
import Navbar           from './components/Navbar'
import AgentStatusBar   from './components/shared/AgentStatusBar'
import LandingPage      from './pages/LandingPage'
import MarketPage       from './pages/MarketPage'
import StrategyPage     from './pages/StrategyPage'
import ExecutionPage    from './pages/ExecutionPage'
import RiskPage         from './pages/RiskPage'
import PortfolioPage    from './pages/PortfolioPage'
import LiquidityPage    from './pages/LiquidityPage'

// ── Page transition wrapper ───────────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ── Inner router (needs useLocation inside BrowserRouter) ─────────────────────
function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.7 }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.5 }} />
        <div className="absolute top-[40%] left-[35%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.4 }} />
      </div>

      {/* Navbar + agent bar — only shown on dashboard routes */}
      {!isLanding && (
        <>
          <Navbar />
          <div className="pt-[60px]">
            <AgentStatusBar />
          </div>
        </>
      )}

      {/* Routes with AnimatePresence for transitions */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing */}
          <Route path="/"          element={<PageWrapper><LandingPage /></PageWrapper>} />

          {/* Dashboard tabs — all wrapped in content padding */}
          <Route path="/market"    element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><MarketPage /></PageWrapper>
            </div>
          } />
          <Route path="/strategy"  element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><StrategyPage /></PageWrapper>
            </div>
          } />
          <Route path="/execution" element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><ExecutionPage /></PageWrapper>
            </div>
          } />
          <Route path="/risk"      element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><RiskPage /></PageWrapper>
            </div>
          } />
          <Route path="/portfolio" element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><PortfolioPage /></PageWrapper>
            </div>
          } />
          <Route path="/liquidity" element={
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <PageWrapper><LiquidityPage /></PageWrapper>
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </>
  )
}

// ── App root ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NexusProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </NexusProvider>
  )
}
