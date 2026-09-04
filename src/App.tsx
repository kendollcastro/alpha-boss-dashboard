import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { useBotData } from "@/hooks/useBotData"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import DashboardPage from "@/app/dashboard/page"
import TradesPage from "@/app/trades/page"
import SettingsPage from "@/app/settings/page"
import LoginPage from "@/app/login/page"

export default function App() {
  const {
    botData, marketData, aiData, positions, trades, balance, pnlData, loading,
    pausing, resuming, displayActive, botError, demoMode,
    pause, resume, refresh,
  } = useBotData()

  const sharedProps = {
    botData, marketData, aiData, positions, trades, balance, pnlData, loading,
    pausing, resuming, displayActive, botError, demoMode,
    onPause: pause,
    onResume: resume,
    onRefresh: refresh,
  }

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage {...sharedProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trades"
            element={
              <ProtectedRoute>
                <TradesPage {...sharedProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage {...sharedProps} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}
