import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUpIcon, TrendingDownIcon, BrainCircuitIcon, LayersIcon, WalletIcon, AlertTriangleIcon } from "lucide-react"

function fmtPrice(val: any) {
  if (val == null) return "—"
  return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtSigned(val: any) {
  if (val == null) return "—"
  const num = Number(val)
  const sign = num >= 0 ? "+" : ""
  return `${sign}$${Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Band({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="font-mono text-sm tabular-nums" style={{ color }}>{fmtPrice(value)}</span>
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const values = data ?? []
  if (values.length < 2) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        No market data yet
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const first = values[0]
  const up = values[values.length - 1] >= first
  const color = up ? "#22c55e" : "#ef4444"
  const step = 100 / (values.length - 1)
  const pad = 5
  const points = values
    .map((v, i) => `${i * step},${(pad + (1 - (v - min) / range) * (24 - pad * 2)).toFixed(3)}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-16 w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function LiveMarket({ marketData, aiData, positions }: { marketData: any; aiData: any; positions: any }) {
  const ms = marketData?.market_state ?? {}
  const lastPrice = ms.last_price
  const vwap = ms.vwap
  const upper = ms.upper_band
  const lower = ms.lower_band
  const upper2 = ms.upper_band2
  const lower2 = ms.lower_band2
  const atr = ms.atr
  const priceAboveVwap = lastPrice != null && vwap != null && lastPrice >= vwap
  const priceColor = priceAboveVwap ? "var(--color-green-500, #22c55e)" : "var(--color-red-500, #ef4444)"

  const verdict = aiData?.last_verdict
  const action = (verdict?.action || "").toUpperCase()
  const confidence = verdict?.confidence
  const reasoning = verdict?.reasoning

  const actionColor =
    action === "BUY" ? "var(--color-green-500, #22c55e)"
    : action === "SELL" ? "var(--color-red-500, #ef4444)"
    : "var(--muted-foreground)"

  const srLevels = (marketData?.sr?.levels ?? []).slice(0, 6)
  const openPos = (positions ?? [])[0]

  return (
    <div className="grid gap-4 @5xl/main:grid-cols-3">
      {/* Price vs VWAP with bands */}
      <Card className="@container/card @5xl/main:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LayersIcon className="size-4" />
            NQ Market
          </CardTitle>
          <CardDescription>
            {ms.bars_count != null ? `${ms.bars_count} bars` : "Live"} · {ms.session_date || ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground">NQ LAST</div>
              <div className="text-3xl font-semibold tabular-nums" style={{ color: priceColor }}>
                {fmtPrice(lastPrice)}
              </div>
            </div>
            <Badge variant="outline" style={{ color: priceColor, borderColor: "currentColor" }}>
              {priceAboveVwap ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {priceAboveVwap ? "ABOVE VWAP" : "BELOW VWAP"}
            </Badge>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <Band label="2σ U" value={upper2} color="var(--color-rose-400, #fb7185)" />
            <Band label="1σ U" value={upper} color="var(--color-amber-500, #f59e0b)" />
            <Band label="VWAP" value={vwap} color="var(--color-sky-400, #38bdf8)" />
            <Band label="1σ L" value={lower} color="var(--color-amber-500, #f59e0b)" />
            <Band label="2σ L" value={lower2} color="var(--color-rose-400, #fb7185)" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ATR</span>
            <span className="font-mono tabular-nums">{fmtPrice(atr)}</span>
          </div>
          <Separator />
          <Sparkline data={marketData?.recent_closes ?? []} />
        </CardContent>
      </Card>

      {/* AI Verdict */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuitIcon className="size-4" />
            AI Decisor
          </CardTitle>
          <CardDescription>
            {aiData?.model || "model"} · {aiData?.enabled ? "enabled" : "disabled"}
            {aiData?.paused ? " · paused" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {verdict ? (
            <>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    color: actionColor,
                    borderColor: "currentColor",
                    ...(action === "BUY" || action === "SELL" ? { background: `${actionColor}1a` } : {}),
                  }}
                >
                  {action === "BUY" ? <TrendingUpIcon /> : action === "SELL" ? <TrendingDownIcon /> : null}
                  {action || "HOLD"}
                </Badge>
                {confidence != null && (
                  <span className="text-sm font-medium tabular-nums">
                    {Math.round(Number(confidence) * 100)}% confidence
                  </span>
                )}
              </div>
              {reasoning && (
                <p className="text-sm text-muted-foreground">{reasoning}</p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry</span>
                  <span className="font-mono tabular-nums">{fmtPrice(verdict.entry)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop</span>
                  <span className="font-mono tabular-nums">{fmtPrice(verdict.stop_loss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-mono tabular-nums">{fmtPrice(verdict.take_profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support</span>
                  <span className="font-mono tabular-nums">{fmtPrice(verdict.support)}</span>
                </div>
              </div>
              {verdict.risk_reward != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk : Reward</span>
                  <span className="font-mono tabular-nums">{verdict.risk_reward}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-4" />
                No verdict yet — waiting for scan
              </div>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trades today</span>
            <span className="font-medium tabular-nums">
              {aiData?.trades_today ?? 0} / {aiData?.trades_max_today ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cooldown until</span>
            <span className="font-mono tabular-nums text-xs">
              {aiData?.cooldown_until ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ready to act</span>
            <Badge variant="outline" className={aiData?.ready_to_act ? "border-green-500 text-green-600 dark:text-green-400" : "border-muted text-muted-foreground"}>
              {aiData?.ready_to_act ? "YES" : "NO"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* S/R Liquidity + Open Position */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <WalletIcon className="size-4" />
            Liquidity & Position
          </CardTitle>
          <CardDescription>
            S/R depth · swing levels · open exposure
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">Support / Resistance (liquidity)</div>
            {srLevels.length > 0 ? (
              <div className="flex flex-col gap-1">
                {srLevels.map((lv: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-mono tabular-nums">
                      <span className={`size-1.5 rounded-full ${(lv.type || "").toUpperCase() === "S" ? "bg-green-500" : "bg-red-500"}`} />
                      {fmtPrice(lv.level)}
                    </span>
                    <span className="text-muted-foreground">
                      vol {lv.volume_at ?? 0 ? `${Math.round(lv.volume_at)}` : "—"}
                      {lv.touches != null ? ` · ${lv.touches}x` : ""}
                      {lv.bounces != null ? ` · ${lv.bounces}b` : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
          <Separator />
          {openPos ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open position</span>
                <Badge variant="outline" className="border-sky-500 text-sky-600 dark:text-sky-400">
                  {openPos.exchSym || openPos.symbol}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Qty</span>
                <span className="font-mono tabular-nums">{openPos.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg fill</span>
                <span className="font-mono tabular-nums">{fmtPrice(openPos.avgFillPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unrealized P&L</span>
                <span className="font-mono tabular-nums" style={{ color: (Number(openPos.unrealizedPL) || 0) >= 0 ? "var(--color-green-500, #22c55e)" : "var(--color-red-500, #ef4444)" }}>
                  {fmtSigned(openPos.unrealizedPL)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No open position</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
