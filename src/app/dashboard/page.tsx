import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AlertTriangleIcon } from "lucide-react"

function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 bg-red-500 px-4 py-2 text-sm font-medium text-white">
      <AlertTriangleIcon className="size-4" />
      Bot Offline — unable to reach the API
    </div>
  )
}

export default function Page({
  botData, trades, balance, pnlData, loading,
  pausing, resuming, displayActive, botError,
  onPause, onResume, onRefresh,
}: {
  botData: any; trades: any; balance: any; pnlData: any; loading: any;
  pausing: any; resuming: any; displayActive: any; botError: any;
  onPause: any; onResume: any; onRefresh: any;
}) {
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
          title="Nerve Center"
          botData={botData}
          displayActive={displayActive}
          pausing={pausing}
          resuming={resuming}
          onPause={onPause}
          onResume={onResume}
          onRefresh={onRefresh}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </div>
              ) : (
                <SectionCards botData={botData} balance={balance} pnlData={pnlData} />
              )}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive trades={trades} pnlData={pnlData} />
              </div>
              <DataTable data={trades ?? []} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
