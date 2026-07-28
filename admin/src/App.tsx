import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar, { NavView } from './components/Sidebar'
import TopHeader from './components/TopHeader'
import AdminLoginScreen from './screens/AdminLoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import MerchantsScreen from './screens/MerchantsScreen'
import CreditScreen from './screens/CreditScreen'
import CoopScreen from './screens/CoopScreen'
import RiskScreen from './screens/RiskScreen'
import ReportsScreen from './screens/ReportsScreen'
import SettingsScreen from './screens/SettingsScreen'

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<NavView>('dashboard')

  const views: Record<NavView, React.ReactNode> = {
    dashboard:   <DashboardScreen />,
    merchants:   <MerchantsScreen />,
    credit:      <CreditScreen />,
    coop:        <CoopScreen />,
    risk:        <RiskScreen />,
    reports:     <ReportsScreen />,
    settings:    <SettingsScreen />,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#080D14]">
      <Sidebar active={activeView} onChange={setActiveView} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
        <TopHeader activeView={activeView} />
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-5 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                {views[activeView]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <AppShell onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AdminLoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </ThemeProvider>
  )
}
