import * as React from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PauseIcon, PlayIcon, LoaderIcon, RefreshCwIcon } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

export default function Page({
  botData, loading, demoMode,
  pausing, resuming, displayActive, botError,
  onPause, onResume, onRefresh,
}: {
  botData: any; loading: any; demoMode: any;
  pausing: any; resuming: any; displayActive: any; botError: any;
  onPause: any; onResume: any; onRefresh: any;
}) {
  const [positions, setPositions] = React.useState(1)
  const [useTP1, setUseTP1] = React.useState(true)
  const [useTP2, setUseTP2] = React.useState(false)
  const [useTP3, setUseTP3] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    apiGet("/config")
      .then((config) => {
        setPositions(config.max_positions ?? 1)
        setUseTP1(config.tp1 ?? true)
        setUseTP2(config.tp2 ?? false)
        setUseTP3(config.tp3 ?? false)
      })
      .catch(() => {
        // fallback to botData defaults
        setPositions(botData?.max_positions ?? 1)
        setUseTP1(botData?.tp1 ?? true)
        setUseTP2(botData?.tp2 ?? false)
        setUseTP3(botData?.tp3 ?? false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await apiPost("/config", {
        max_positions: positions,
        tp1: useTP1,
        tp2: useTP2,
        tp3: useTP3,
      })
      toast.success("Settings saved!")
    } catch {
      toast.error("Failed to save settings")
    }
    setSaving(false)
  }

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
        <SiteHeader
          title="Settings"
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
              <div className="px-4 lg:px-6">
                <h2 className="text-2xl font-semibold">Settings</h2>
              </div>
              <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Bot Control</CardTitle>
                    <CardDescription>Pause or resume the trading bot</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge
                        variant="outline"
                        className={displayActive ? "border-green-500 text-green-600 dark:text-green-400" : "border-red-500 text-red-600 dark:text-red-400"}
                      >
                        <span className={`mr-1 inline-block size-1.5 rounded-full ${displayActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        {displayActive ? "ACTIVE" : "PAUSED"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mode</span>
                      <Badge
                        variant="outline"
                        className={demoMode ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-green-500 text-green-600 dark:text-green-400"}
                      >
                        {demoMode ? "DEMO" : "LIVE"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bot Name</span>
                      <span className="text-sm text-muted-foreground">{botData?.bot ?? "—"}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {displayActive ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={pausing}>
                              {pausing ? <LoaderIcon className="size-4 animate-spin" /> : <PauseIcon className="size-4" />}
                              {pausing ? "Pausing..." : "Pause Bot"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Pause Bot</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to pause the trading bot? No new positions will be opened while paused.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={onPause}>Pause</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={resuming}>
                              {resuming ? <LoaderIcon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
                              {resuming ? "Resuming..." : "Resume Bot"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Resume Bot</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to resume the trading bot? It will start opening new positions again.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={onResume}>Resume</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button variant="outline" onClick={onRefresh}>
                        <RefreshCwIcon className="size-4" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trading Configuration</CardTitle>
                    <CardDescription>Max positions and take-profit levels</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="positions" className="text-sm font-medium">Max Positions</Label>
                      <Input
                        id="positions"
                        type="number"
                        min={1}
                        max={10}
                        className="w-20 text-right"
                        value={positions}
                        onChange={(e) => setPositions(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tp1" className="text-sm font-medium">Take Profit 1</Label>
                      <Switch id="tp1" checked={useTP1} onCheckedChange={setUseTP1} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tp2" className="text-sm font-medium">Take Profit 2</Label>
                      <Switch id="tp2" checked={useTP2} onCheckedChange={setUseTP2} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tp3" className="text-sm font-medium">Take Profit 3</Label>
                      <Switch id="tp3" checked={useTP3} onCheckedChange={setUseTP3} />
                    </div>
                    <Button
                      variant="default"
                      className="mt-2 w-full"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <LoaderIcon className="size-4 animate-spin" /> : null}
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics Summary</CardTitle>
                    <CardDescription>Key bot performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Trades</span>
                        <span className="text-sm tabular-nums">{botData?.stats?.total ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Today's Trades</span>
                        <span className="text-sm tabular-nums">{botData?.stats?.today ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Win Rate</span>
                        <span className="text-sm tabular-nums">{botData?.stats?.win_rate != null ? `${botData.stats.win_rate}%` : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total P&L</span>
                        <span className="text-sm tabular-nums font-mono"
                          style={{ color: (botData?.stats?.total_pnl ?? 0) >= 0 ? "var(--color-green-500, #22c55e)" : "var(--color-red-500, #ef4444)" }}
                        >
                          {botData?.stats?.total_pnl != null
                            ? `${Number(botData.stats.total_pnl) >= 0 ? "+" : ""}$${Math.abs(Number(botData.stats.total_pnl)).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Status</CardTitle>
                    <CardDescription>Signal source & trading mode</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Signal source</span>
                        <Badge variant="outline" className="border-sky-500 text-sky-600 dark:text-sky-400">
                          AI-only
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">OCS strategy</span>
                        <Badge variant="outline" className="border-muted text-muted-foreground">
                          Inactive
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-only mode / OCS signal inactive — the backend operates in
                        AI-only mode and rejects external (webhook) signals.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
