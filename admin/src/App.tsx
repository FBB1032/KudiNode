import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminProvider, useAdmin, NavView } from "./context/AdminContext";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MerchantsScreen from "./screens/MerchantsScreen";
import CreditScreen from "./screens/CreditScreen";
import CoopScreen from "./screens/CoopScreen";
import RiskScreen from "./screens/RiskScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AdminUsersScreen from "./screens/AdminUsersScreen";
import AuditLogScreen from "./screens/AuditLogScreen";
import ForbiddenState from "./components/ForbiddenState";
import { adminToken, adminLogout } from "./services/api";
import { useState, useCallback } from "react";

function AppShell() {
  const { admin, can } = useAdmin();
  const [activeView, setActiveView] = useState<NavView>("dashboard");

  const handleLogout = useCallback(() => {
    adminLogout();
    window.location.reload();
  }, []);

  const views: Record<NavView, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    merchants: can("merchants") ? <MerchantsScreen /> : <ForbiddenState resource="Merchants" />,
    credit: can("credit") ? <CreditScreen /> : <ForbiddenState resource="Credit" />,
    coop: can("coop") ? <CoopScreen /> : <ForbiddenState resource="Co-op" />,
    risk: can("risk") ? <RiskScreen /> : <ForbiddenState resource="Risk" />,
    reports: can("reports") ? <ReportsScreen /> : <ForbiddenState resource="Reports" />,
    settings: can("settings") ? <SettingsScreen /> : <ForbiddenState resource="Settings" />,
    admin_users: can("admin_users") ? <AdminUsersScreen /> : <ForbiddenState resource="Admin Management" />,
    audit_log: can("audit_log") ? <AuditLogScreen /> : <ForbiddenState resource="Audit Log" />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#080D14]">
      <Sidebar
        active={activeView}
        onChange={setActiveView}
        onLogout={handleLogout}
      />
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
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {views[activeView]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!adminToken.get(),
  );

  if (!isAuthenticated) {
    return (
      <AdminLoginScreen
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <AdminProvider>
      <AppShell />
    </AdminProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthenticatedApp />
    </ThemeProvider>
  );
}
