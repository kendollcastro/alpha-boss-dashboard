import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { LiveMarket } from "@/components/live-market"
import { OpsCenter } from "@/components/ops-center"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page({
  botData, marketData, aiData, positions, trades, balance, pnlData, opsData, loading,
  demoMode,
}: {
  botData: any; marketData: any; aiData: any; positions: any;
  trades: any; balance: any; pnlData: any; opsData: any; loading: any;
  demoMode: any;
}) {
  return (
    <>
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
        <SectionCards botData={botData} balance={balance} pnlData={pnlData} demoMode={demoMode} />
      )}
      <div className="px-4 lg:px-6">
        <OpsCenter opsData={opsData} />
      </div>
      <div className="px-4 lg:px-6">
        <LiveMarket marketData={marketData} aiData={aiData} positions={positions} />
      </div>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive trades={trades} pnlData={pnlData} />
      </div>
      <DataTable data={trades ?? []} />
    </>
  )
}