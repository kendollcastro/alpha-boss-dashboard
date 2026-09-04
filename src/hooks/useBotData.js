import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { apiGet, apiPost } from "@/lib/api"

export function useBotData() {
  const [botData, setBotData] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [positions, setPositions] = useState([])
  const [trades, setTrades] = useState([])
  const [balance, setBalance] = useState(null)
  const [pnlData, setPnlData] = useState(null)
  const [opsData, setOpsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [optimisticActive, setOptimisticActive] = useState(null)
  const [botError, setBotError] = useState(false)
  const marketIntervalRef = useRef(null)
  const aiIntervalRef = useRef(null)
  const positionsIntervalRef = useRef(null)
  const tradesIntervalRef = useRef(null)
  const pnlIntervalRef = useRef(null)
  const opsIntervalRef = useRef(null)

  const displayActive = optimisticActive !== null ? optimisticActive : botData?.active ?? false
  const demoMode = botData?.demo_mode ?? true

  const fetchBotData = useCallback(async () => {
    try {
      const json = await apiGet("/")
      setBotData(json)
      setBotError(false)
    } catch {
      setBotError(true)
    }
  }, [])

  const fetchMarket = useCallback(async () => {
    try {
      const json = await apiGet("/market")
      setMarketData(json)
    } catch {
      // silent — sparkline/price shows stale
    }
  }, [])

  const fetchAi = useCallback(async () => {
    try {
      const json = await apiGet("/ai")
      setAiData(json)
    } catch {
      // silent
    }
  }, [])

  const fetchPositions = useCallback(async () => {
    try {
      const json = await apiGet("/positions")
      setPositions(json.positions ?? [])
    } catch {
      // silent
    }
  }, [])

  const fetchTrades = useCallback(async () => {
    try {
      const json = await apiGet("/trades")
      setTrades(json.trades ?? [])
    } catch {
      toast.error("Failed to load trades")
    }
  }, [])

  const fetchPnl = useCallback(async () => {
    try {
      const json = await apiGet("/pnl")
      setPnlData(json)
    } catch {
      // silent
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      const json = await apiGet("/balance")
      setBalance(json)
    } catch {
      // silent — card shows "—"
    }
  }, [])

  const fetchOps = useCallback(async () => {
    try {
      const json = await apiGet("/ops")
      setOpsData(json)
    } catch {
      // silent — no brief published yet
    }
  }, [])

  const refresh = useCallback(() => {
    fetchBotData()
    fetchMarket()
    fetchAi()
    fetchPositions()
    fetchTrades()
    fetchBalance()
    fetchPnl()
    fetchOps()
  }, [fetchBotData, fetchMarket, fetchAi, fetchPositions, fetchTrades, fetchBalance, fetchPnl, fetchOps])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchBotData(),
      fetchMarket(),
      fetchAi(),
      fetchPositions(),
      fetchTrades(),
      fetchBalance(),
      fetchPnl(),
      fetchOps(),
    ]).finally(() => setLoading(false))

    // Real-time wiring — polling per backend spec
    marketIntervalRef.current = setInterval(fetchMarket, 3000)      // 2-4s
    aiIntervalRef.current = setInterval(fetchAi, 4000)              // 4s
    positionsIntervalRef.current = setInterval(fetchPositions, 5000) // 5s
    tradesIntervalRef.current = setInterval(fetchTrades, 6000)      // 5-8s
    pnlIntervalRef.current = setInterval(fetchPnl, 30000)           // 10-30s
    opsIntervalRef.current = setInterval(fetchOps, 10000)           // brief refresh

    return () => {
      clearInterval(marketIntervalRef.current)
      clearInterval(aiIntervalRef.current)
      clearInterval(positionsIntervalRef.current)
      clearInterval(tradesIntervalRef.current)
      clearInterval(pnlIntervalRef.current)
      clearInterval(opsIntervalRef.current)
    }
  }, [fetchBotData, fetchMarket, fetchAi, fetchPositions, fetchTrades, fetchPnl, fetchOps])

  useEffect(() => {
    if (botData?.active !== undefined) {
      setOptimisticActive(null)
    }
  }, [botData?.active])

  const pause = useCallback(async () => {
    setPausing(true)
    setOptimisticActive(false)
    try {
      await apiPost("/pause")
      toast.success("Bot paused")
      await fetchBotData()
    } catch {
      setOptimisticActive(null)
      toast.error("Failed to pause bot")
    }
    setPausing(false)
  }, [fetchBotData])

  const resume = useCallback(async () => {
    setResuming(true)
    setOptimisticActive(true)
    try {
      await apiPost("/resume")
      toast.success("Bot resumed")
      await fetchBotData()
    } catch {
      setOptimisticActive(null)
      toast.error("Failed to resume bot")
    }
    setResuming(false)
  }, [fetchBotData])

  return {
    botData, marketData, aiData, positions, trades, balance, pnlData, opsData, loading,
    pausing, resuming,
    displayActive, botError, demoMode,
    pause, resume, refresh,
  }
}
