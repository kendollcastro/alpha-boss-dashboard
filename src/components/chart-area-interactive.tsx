"use client"

import * as React from "react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  Cell,
} from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"


function formatPnl(val: any) {
  if (val == null) return "$0.00"
  const num = Number(val)
  const sign = num >= 0 ? "+" : ""
  return `${sign}$${Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function groupByDate(trades: any) {
  const map: Record<string, any> = {}
  for (const t of trades) {
    const key = t.date ? t.date.slice(0, 10) : (t.timestamp ? t.timestamp.slice(0, 10) : "unknown")
    if (!map[key]) map[key] = { date: key, total: 0, wins: 0, losses: 0, count: 0 }
    const pnl = Number(t.pnl) || 0
    map[key].total += pnl
    map[key].count += 1
    if (pnl > 0) map[key].wins += 1
    else map[key].losses += 1
  }
  return Object.values(map).sort((a: any, b: any) => a.date.localeCompare(b.date))
}

function groupByHour(trades: any) {
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, trades: 0 }))
  for (const t of trades) {
    if (!t.timestamp) continue
    const h = new Date(t.timestamp).getHours()
    hours[h].trades += 1
  }
  return hours
}

function getStreak(trades: any) {
  if (!trades.length) return { type: "neutral", count: 0 }
  let count = 1
  const last = Number(trades[trades.length - 1].pnl) || 0
  const isWin = last > 0
  for (let i = trades.length - 2; i >= 0; i--) {
    const p = Number(trades[i].pnl) || 0
    if ((p > 0) === isWin) count++
    else break
  }
  return { type: isWin ? "win" : "loss", count }
}

export function ChartAreaInteractive({ trades = [], pnlData }: { trades?: any; pnlData: any }) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 180 : 250

  const pnlTrades = pnlData?.trades ?? []
  const hasPnlData = pnlTrades.length > 0

  const sortedTrades = React.useMemo(
    () => [...trades].sort((a: any, b: any) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()),
    [trades]
  )

  const last10 = sortedTrades.slice(-10)

  const bestTrade = React.useMemo(
    () => pnlTrades.reduce((best: any, t: any) => (Number(t.pnl) || 0) > (Number(best.pnl) || 0) ? t : best, pnlTrades[0] || null),
    [pnlTrades]
  )
  const worstTrade = React.useMemo(
    () => pnlTrades.reduce((worst: any, t: any) => (Number(t.pnl) || 0) < (Number(worst.pnl) || 0) ? t : worst, pnlTrades[0] || null),
    [pnlTrades]
  )

  const streak = React.useMemo(() => getStreak(pnlTrades), [pnlTrades])

  const pnlTradesSorted = React.useMemo(
    () => [...pnlTrades].sort((a: any, b: any) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()),
    [pnlTrades]
  )

  const cumPnlData = React.useMemo(() => {
    let running = 0
    return pnlTradesSorted.map((t, i) => {
      running += Number(t.pnl) || 0
      return { label: `T${i + 1}`, pnl: running }
    })
  }, [pnlTradesSorted])

  const dailyData = React.useMemo(() => groupByDate(pnlTradesSorted), [pnlTradesSorted])
  const hourlyData = React.useMemo(() => groupByHour(sortedTrades), [sortedTrades])
  const winLossData = React.useMemo(() => groupByDate(pnlTradesSorted), [pnlTradesSorted])

  const cumPnlConfig = {
    pnl: { label: "Cumulative P&L", color: "var(--color-emerald-500, #10b981)" },
  } satisfies ChartConfig

  const bestPnl = bestTrade ? Number(bestTrade.pnl) || 0 : 0
  const worstPnl = worstTrade ? Number(worstTrade.pnl) || 0 : 0

  if (!hasPnlData && !trades.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>No trade data yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No trade data available to display
          </div>
        </CardContent>
      </Card>
    )
  }

  const lastPnl10 = hasPnlData ? pnlTrades.slice(-10).map((t: any) => ({ v: Number(t.pnl) || 0 })) : []
  const streakDots = hasPnlData ? pnlTrades.slice(-10) : []

  return (
    <div className="flex flex-col gap-4">
      {/* SECTION 1: Mini Stat Cards */}
      <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Card 1 — Best Trade */}
        <Card size="sm">
          <CardHeader>
            <CardDescription>Best single trade</CardDescription>
            <CardTitle className="text-lg" style={{ color: "var(--color-emerald-500, #22c55e)" }}>
              {formatPnl(bestPnl)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastPnl10}>
                  <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Worst Trade */}
        <Card size="sm">
          <CardHeader>
            <CardDescription>Worst single trade</CardDescription>
            <CardTitle className="text-lg" style={{ color: "var(--color-rose-500, #ef4444)" }}>
              {formatPnl(worstPnl)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastPnl10}>
                  <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Avg Trade Duration */}
        <Card size="sm">
          <CardHeader>
            <CardDescription>Average hold time</CardDescription>
            <CardTitle className="text-lg">~5m</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData.filter(h => h.trades > 0).slice(-8)}>
                  <Bar dataKey="trades" fill="#94a3b8" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 — Active Streak */}
        <Card size="sm">
          <CardHeader>
            <CardDescription>Current streak</CardDescription>
            <CardTitle className="text-lg" style={{ color: streak.type === "win" ? "var(--color-emerald-500, #22c55e)" : streak.type === "loss" ? "var(--color-rose-500, #ef4444)" : undefined }}>
              {streak.count > 0 ? `${streak.count}${streak.type === "win" ? "W" : "L"}` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakDots.map((t: any) => ({ v: 1, pnl: Number(t.pnl) || 0 }))}>
                  <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                    {streakDots.map((t: any, i: any) => (
                      <Cell key={i} fill={(Number(t.pnl) || 0) > 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Main Chart Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Analytics</CardTitle>
          <CardDescription>Comprehensive trade performance breakdown</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Tabs defaultValue="cumulative" className="w-full">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="cumulative">P&L Cumulative</TabsTrigger>
              <TabsTrigger value="daily">Daily P&L</TabsTrigger>
              <TabsTrigger value="volume">Trade Volume</TabsTrigger>
              <TabsTrigger value="winloss">Win/Loss</TabsTrigger>
            </TabsList>

            {/* Tab 1 — P&L Cumulative */}
            <TabsContent value="cumulative">
              <div style={{ height: chartHeight }}>
                <ChartContainer config={cumPnlConfig} className="h-full w-full">
                  <AreaChart data={cumPnlData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillCumPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-emerald-500, #10b981)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-emerald-500, #10b981)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} interval="preserveStartEnd" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="var(--color-emerald-500, #10b981)" fill="url(#fillCumPnl)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </TabsContent>

            {/* Tab 2 — Daily P&L */}
            <TabsContent value="daily">
              <div style={{ height: chartHeight }}>
                <ChartContainer
                  config={{ pnl: { label: "Daily P&L", color: "var(--color-emerald-500, #10b981)" } } satisfies ChartConfig}
                  className="h-full w-full"
                >
                  <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}
                      tickFormatter={(v) => { const d = new Date(v + "T00:00:00"); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {dailyData.map((d: any, i: any) => (
                        <Cell key={i} fill={d.total >= 0 ? "var(--color-emerald-500, #22c55e)" : "var(--color-rose-500, #ef4444)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>

            {/* Tab 3 — Trade Volume */}
            <TabsContent value="volume">
              <div style={{ height: chartHeight }}>
                <ChartContainer
                  config={{ trades: { label: "Trades", color: "var(--color-sky-400, #38bdf8)" } } satisfies ChartConfig}
                  className="h-full w-full"
                >
                  <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}
                      tickFormatter={(v) => `${String(v).padStart(2, "0")}:00`}
                      interval={2}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="trades" fill="var(--color-sky-400, #38bdf8)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>

            {/* Tab 4 — Win/Loss */}
            <TabsContent value="winloss">
              <div style={{ height: chartHeight }}>
                <ChartContainer
                  config={{ wins: { label: "Wins", color: "var(--color-emerald-500, #22c55e)" }, losses: { label: "Losses", color: "var(--color-rose-500, #ef4444)" } } satisfies ChartConfig}
                  className="h-full w-full"
                >
                  <BarChart data={winLossData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barCategoryGap="20%">
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}
                      tickFormatter={(v) => { const d = new Date(v + "T00:00:00"); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="wins" stackId="a" fill="var(--color-emerald-500, #22c55e)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="losses" stackId="a" fill="var(--color-rose-500, #ef4444)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
