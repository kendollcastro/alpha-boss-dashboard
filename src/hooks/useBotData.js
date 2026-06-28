import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

function authHeaders() {
  const token = localStorage.getItem("abt_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  }
}

function handleUnauthorized(res) {
  if (res.status === 401) {
    localStorage.removeItem("abt_token")
    localStorage.removeItem("abt_name")
    window.location.href = "/login"
    return true
  }
  return false
}

export function useBotData() {
  const [botData, setBotData] = useState(null)
  const [trades, setTrades] = useState([])
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [optimisticActive, setOptimisticActive] = useState(null)
  const [botError, setBotError] = useState(false)
  const [pnlData, setPnlData] = useState(null)
  const balanceIntervalRef = useRef(null)
  const pnlIntervalRef = useRef(null)
  const mainIntervalRef = useRef(null)

  const displayActive = optimisticActive !== null ? optimisticActive : botData?.active ?? false

  const fetchBotData = useCallback(async () => {
    try {
      const res = await fetch("/api", { headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
      const json = await res.json()
      setBotData(json)
      setBotError(false)
    } catch {
      setBotError(true)
    }
  }, [])

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch("/api/trades", { headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
      const json = await res.json()
      setTrades(json.trades ?? [])
    } catch {
      toast.error("Failed to load trades")
    }
  }, [])

  const fetchPnl = useCallback(async () => {
    try {
      const res = await fetch("/api/pnl", { headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
      const json = await res.json()
      setPnlData(json)
    } catch {
      // silent
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/balance", { headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
      const json = await res.json()
      setBalance(json)
    } catch {
      // silent — card shows "—"
    }
  }, [])

  const refresh = useCallback(() => {
    fetchBotData()
    fetchTrades()
    fetchBalance()
    fetchPnl()
  }, [fetchBotData, fetchTrades, fetchBalance, fetchPnl])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchBotData(), fetchTrades(), fetchBalance(), fetchPnl()]).finally(() =>
      setLoading(false)
    )

    mainIntervalRef.current = setInterval(() => {
      fetchBotData()
      fetchTrades()
    }, 10000)

    balanceIntervalRef.current = setInterval(fetchBalance, 60000)
    pnlIntervalRef.current = setInterval(fetchPnl, 60000)

    return () => {
      clearInterval(mainIntervalRef.current)
      clearInterval(balanceIntervalRef.current)
      clearInterval(pnlIntervalRef.current)
    }
  }, [fetchBotData, fetchTrades, fetchBalance])

  useEffect(() => {
    if (botData?.active !== undefined) {
      setOptimisticActive(null)
    }
  }, [botData?.active])

  const pause = useCallback(async () => {
    setPausing(true)
    setOptimisticActive(false)
    try {
      const res = await fetch("/api/pause", { method: "POST", headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
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
      const res = await fetch("/api/resume", { method: "POST", headers: authHeaders() })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error("HTTP " + res.status)
      toast.success("Bot resumed")
      await fetchBotData()
    } catch {
      setOptimisticActive(null)
      toast.error("Failed to resume bot")
    }
    setResuming(false)
  }, [fetchBotData])

  return {
    botData, trades, balance, pnlData, loading,
    pausing, resuming,
    displayActive, botError,
    pause, resume, refresh,
  }
}
