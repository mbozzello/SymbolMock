import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'symbolmock-watchlist'

const DEFAULT_WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AAPL', name: 'Apple Inc' },
  { ticker: 'ABNB', name: 'Airbnb' },
  { ticker: 'AMC', name: 'AMC Entertainment' },
  { ticker: 'BRK.A', name: 'Berkshire Hathaway' },
  { ticker: 'C', name: 'Citigroup' },
  { ticker: 'DIS', name: 'Walt Disney Co' },
  { ticker: 'ETOR', name: 'eToro' },
  { ticker: 'FIG', name: 'Fortress Investment' },
  { ticker: 'GLD', name: 'SPDR Gold Trust' },
  { ticker: 'LULU', name: 'Lululemon' },
]

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_) {}
    return DEFAULT_WATCHLIST
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    } catch (_) {}
  }, [watchlist])

  const addSymbol = useCallback((ticker, name) => {
    const t = (ticker || '').toUpperCase().trim()
    const n = name || t
    if (!t) return
    setWatchlist((prev) => {
      const without = prev.filter((s) => s.ticker !== t)
      return [{ ticker: t, name: n }, ...without]
    })
  }, [])

  const removeSymbol = useCallback((ticker) => {
    const t = (ticker || '').toUpperCase().trim()
    if (!t) return
    setWatchlist((prev) => prev.filter((s) => s.ticker !== t))
  }, [])

  const toggleWatch = useCallback((ticker, name) => {
    const t = (ticker || '').toUpperCase().trim()
    if (!t) return
    setWatchlist((prev) => {
      const idx = prev.findIndex((s) => s.ticker === t)
      if (idx >= 0) return prev.filter((s) => s.ticker !== t)
      return [{ ticker: t, name: name || t }, ...prev]
    })
  }, [])

  const isWatched = useCallback(
    (ticker) => watchlist.some((s) => s.ticker === (ticker || '').toUpperCase()),
    [watchlist]
  )

  const value = { watchlist, addSymbol, removeSymbol, toggleWatch, isWatched }
  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
