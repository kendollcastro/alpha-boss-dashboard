"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon, TrophyIcon, SkullIcon, ZapIcon } from "lucide-react"

function formatCurrency(value) {
  if (value == null) return "$0.00"
  const num = Number(value)
  const sign = num >= 0 ? "+" : ""
  return `${sign}$${Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCurrencyAbsolute(value) {
  if (value == null) return "$0.00"
  const num = Number(value)
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SectionCards({ botData, balance, pnlData }) {
  const todayTrades = botData?.stats?.today ?? 0
  const totalTrades = botData?.stats?.total ?? 0
  const todayPnl = Number(botData?.stats?.today_pnl ?? 0)
  const winRate = botData?.stats?.win_rate
  const accountEquity = balance?.balances?.[0]?.totalEquity

  const pnlTotalPnl = Number(pnlData?.total_pnl ?? 0)
  const pnlWinRate = pnlData?.win_rate
  const pnlTrades = pnlData?.trades ?? []

  const bestPnlTrade = pnlTrades.length ? pnlTrades.reduce((b, t) => Number(t.pnl) > Number(b.pnl) ? t : b) : null
  const worstPnlTrade = pnlTrades.length ? pnlTrades.reduce((w, t) => Number(t.pnl) < Number(w.pnl) ? t : w) : null

  let streak = { type: "neutral", count: 0 }
  if (pnlTrades.length) {
    let count = 1
    const last = Number(pnlTrades[pnlTrades.length - 1].pnl) || 0
    const isWin = last > 0
    for (let i = pnlTrades.length - 2; i >= 0; i--) {
      const p = Number(pnlTrades[i].pnl) || 0
      if ((p > 0) === isWin) count++
      else break
    }
    streak = { type: isWin ? "win" : "loss", count }
  }

  const trendPercent = totalTrades > 0 ? ((todayTrades / totalTrades) * 100).toFixed(1) : "0.0"
  const trendUp = todayTrades / totalTrades >= 0.5

  const pnlUp = pnlTotalPnl >= 0
  const winRateNum = pnlWinRate != null ? Number(pnlWinRate) : null

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's Trades</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {todayTrades}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {trendPercent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {todayTrades} trade{todayTrades !== 1 ? "s" : ""} today{" "}
            {trendUp ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {totalTrades} total trades all time
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total P&L</CardDescription>
          <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl`}
            style={{ color: pnlUp ? "var(--color-green-500, #22c55e)" : "var(--color-red-500, #ef4444)" }}
          >
            {formatCurrency(pnlTotalPnl)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" style={{ color: pnlUp ? "var(--color-green-500, #22c55e)" : "var(--color-red-500, #ef4444)", borderColor: "currentColor" }}>
              {pnlUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {pnlUp ? "Profitable" : "Loss"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {pnlUp ? "Positive" : "Negative"} overall{" "}
            {pnlUp ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {pnlData?.wins ?? 0} wins / {pnlData?.losses ?? 0} losses
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Win Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {winRateNum != null ? `${winRateNum.toFixed(1)}%` : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {winRateNum != null && winRateNum >= 50 ? "Strong" : "Neutral"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {winRateNum != null && winRateNum >= 50 ? "Above average" : "Below average"}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{pnlData?.total_completed_trades ?? 0} completed trades</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Account Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {accountEquity != null ? formatCurrencyAbsolute(accountEquity) : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total account equity{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Available trading capital</div>
        </CardFooter>
      </Card>
    </div>
  )
}
