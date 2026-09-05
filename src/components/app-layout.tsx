import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AlertTriangleIcon } from "lucide-react"

const TITLES: Record<string, string> = {
  "/dashboard": "Nerve Center",
  "/trades": "Trade History",
  "/settings": "Settings",
}

function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 bg-red-500 px-4 py-2 text-sm font-medium text-white">
      <AlertTriangleIcon className="size-4" />
      Bot Offline — unable to reach the API
    </div>
  )
}

export function AppLayout({
  botError,
  displayActive,
  demoMode,
  pausing,
  resuming,
  onPause,
  onResume,
  onRefresh,
}: {
  botError: any
  displayActive: any
  demoMode: any
  pausing: any
  resuming: any
  onPause: any
  onResume: any
  onRefresh: any
}) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? "Alpha Boss Trader"

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {botError && <OfflineBanner />}
        <SiteHeader
          title={title}
          displayActive={displayActive}
          demoMode={demoMode}
          pausing={pausing}
          resuming={resuming}
          onPause={onPause}
          onResume={onResume}
          onRefresh={onRefresh}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}