import { useState, useEffect, useRef, useCallback } from 'react'

/** Base prices for common symbols - TSLA matches /symbol page defaults */
const BASE_PRICES = {
  TSLA: 433.07,
  AAPL: 230.5,
  NVDA: 140.2,
  META: 585.0,
  AMZN: 195.0,
  MSFT: 420.0,
  GME: 29.96,
  SPY: 600.0,
  QQQ: 520.0,
  BTC: 98000,
  'BTC-USD': 98000,
  BITCOIN: 98000,
  ETH: 3600,
  XRP: 2.1,
  DOGE: 0.38,
  GOLD: 2650,
  VIX: 14.5,
  CELH: 52.0,
  RKLB: 28.5,
  HOOD: 45.0,
  PLTR: 58.0,
  GLD: 265.0,
  SLV: 32.0,
  AMD: 135.0,
  SNAP: 18.5,
  PZZA: 78.0,
  SPOT: 380.0,
  ABNB: 165.0,
  AMC: 4.2,
  'BRK.A': 620000,
  C: 68.0,
  DIS: 115.0,
  ETOR: 12.0,
  FIG: 2.1,
  LULU: 385.0,
}

const SPARK_LEN = 24
const TICK_INTERVAL_MS = 1500
const DRIFT_SCALE = 0.003

function hashSymbol(s) {
  return [...String(s)].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
}

function getBasePrice(symbol) {
  const s = symbol?.toUpperCase()
  if (BASE_PRICES[s] != null) return BASE_PRICES[s]
  const h = Math.abs(hashSymbol(s))
  return 50 + (h % 950)
}

/**
 * Generates fake live-updating quotes for given symbols.
 * Prices drift randomly every few seconds so the site feels alive.
 * @param {string[]} symbols
 * @returns {{ quotes: Record<string,{ symbol, price, change, changePercent, spark }> }}
 */
export function useFakeQuotes(symbols) {
  const list = [...new Set((symbols || []).map((s) => s?.toUpperCase()).filter(Boolean))]
  const [quotes, setQuotes] = useState({})
  const stateRef = useRef(null)

  useEffect(() => {
    const state = stateRef.current ?? {}
    for (const s of list) {
      if (!state[s]) {
        const base = getBasePrice(s)
        state[s] = {
          price: base,
          openPrice: base,
          spark: Array.from({ length: SPARK_LEN }, (_, i) => base * (1 + (i - SPARK_LEN / 2) * 0.001)),
        }
      }
    }
    stateRef.current = state
  }, [list.join(',')])

  useEffect(() => {
    const tick = () => {
      const state = stateRef.current ?? {}
      const next = {}
      for (const s of list) {
        const cur = state[s] ?? {
          price: getBasePrice(s),
          openPrice: getBasePrice(s),
          spark: [],
        }
        const drift = (Math.random() - 0.48) * cur.price * DRIFT_SCALE
        const newPrice = Math.max(0.01, cur.price + drift)
        const spark = [...(cur.spark || []), newPrice].slice(-SPARK_LEN)
        next[s] = {
          price: newPrice,
          openPrice: cur.openPrice,
          spark: spark.length ? spark : [newPrice],
        }
      }
      stateRef.current = next
      const out = {}
      for (const s of Object.keys(next)) {
        const q = next[s]
        const change = q.price - q.openPrice
        const changePercent = q.openPrice !== 0 ? (change / q.openPrice) * 100 : 0
        out[s] = {
          symbol: s,
          price: q.price,
          change,
          changePercent,
          spark: q.spark,
        }
      }
      setQuotes(out)
    }

    tick()
    const id = setInterval(tick, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [list.join(',')])

  return { quotes, loading: false, error: null, refetch: () => {} }
}
