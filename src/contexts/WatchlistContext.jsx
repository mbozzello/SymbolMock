import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'symbolmock-watchlists'
const CURRENT_ID_KEY = 'symbolmock-watchlist-current'

const DEFAULT_SYMBOLS = [
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

function generateId() {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const LEGACY_STORAGE_KEY = 'symbolmock-watchlist'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const currentRaw = localStorage.getItem(CURRENT_ID_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].symbols) {
        const currentId = currentRaw && parsed.some((w) => w.id === currentRaw) ? currentRaw : parsed[0].id
        return { watchlists: parsed, currentId }
      }
    }
    // Migrate legacy single watchlist
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw)
      if (Array.isArray(legacy) && legacy.length > 0) {
        const symbols = legacy.every((s) => s && s.ticker) ? legacy : []
        if (symbols.length > 0) {
          const migrated = [{ id: 'default', name: 'Watchlist', symbols }]
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
            localStorage.setItem(CURRENT_ID_KEY, 'default')
            localStorage.removeItem(LEGACY_STORAGE_KEY)
          } catch (_) {}
          return { watchlists: migrated, currentId: 'default' }
        }
      }
    }
  } catch (_) {}
  return {
    watchlists: [{ id: 'default', name: 'Watchlist', symbols: DEFAULT_SYMBOLS }],
    currentId: 'default',
  }
}

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
  const [{ watchlists, currentId }, setState] = useState(loadFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists))
      localStorage.setItem(CURRENT_ID_KEY, currentId)
    } catch (_) {}
  }, [watchlists, currentId])

  const currentWatchlist = useMemo(
    () => watchlists.find((w) => w.id === currentId) ?? watchlists[0],
    [watchlists, currentId]
  )
  const watchlist = useMemo(() => currentWatchlist?.symbols ?? [], [currentWatchlist])
  const allTickers = useMemo(
    () => [...new Set(watchlists.flatMap((w) => w.symbols.map((s) => s.ticker)))],
    [watchlists]
  )

  const setCurrentWatchlistId = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      watchlists: prev.watchlists,
      currentId: prev.watchlists.some((w) => w.id === id) ? id : prev.currentId,
    }))
  }, [])

  const addWatchlist = useCallback((name = 'New list') => {
    const id = generateId()
    setState((prev) => ({
      ...prev,
      watchlists: [...prev.watchlists, { id, name, symbols: [] }],
      currentId: id,
    }))
    return id
  }, [])

  const removeWatchlist = useCallback((id) => {
    setState((prev) => {
      const next = prev.watchlists.filter((w) => w.id !== id)
      if (next.length === 0) return prev
      const nextCurrent = prev.currentId === id ? next[0].id : prev.currentId
      return { watchlists: next, currentId: nextCurrent }
    })
  }, [])

  const renameWatchlist = useCallback((id, name) => {
    const trimmed = (name || '').trim() || 'Watchlist'
    setState((prev) => ({
      ...prev,
      watchlists: prev.watchlists.map((w) => (w.id === id ? { ...w, name: trimmed } : w)),
    }))
  }, [])

  const addSymbol = useCallback((ticker, name) => {
    const t = (ticker || '').toUpperCase().trim()
    const n = name || t
    if (!t) return
    setState((prev) => {
      const list = prev.watchlists.find((w) => w.id === prev.currentId)
      if (!list) return prev
      const without = list.symbols.filter((s) => s.ticker !== t)
      const updated = { ...list, symbols: [{ ticker: t, name: n }, ...without] }
      return {
        ...prev,
        watchlists: prev.watchlists.map((w) => (w.id === prev.currentId ? updated : w)),
      }
    })
  }, [])

  const removeSymbol = useCallback((ticker) => {
    const t = (ticker || '').toUpperCase().trim()
    if (!t) return
    setState((prev) => ({
      ...prev,
      watchlists: prev.watchlists.map((w) =>
        w.id === prev.currentId ? { ...w, symbols: w.symbols.filter((s) => s.ticker !== t) } : w
      ),
    }))
  }, [])

  const toggleWatch = useCallback((ticker, name) => {
    const t = (ticker || '').toUpperCase().trim()
    if (!t) return
    setState((prev) => {
      const list = prev.watchlists.find((w) => w.id === prev.currentId)
      if (!list) return prev
      const idx = list.symbols.findIndex((s) => s.ticker === t)
      const symbols = idx >= 0 ? list.symbols.filter((s) => s.ticker !== t) : [{ ticker: t, name: name || t }, ...list.symbols]
      const updated = { ...list, symbols }
      return {
        ...prev,
        watchlists: prev.watchlists.map((w) => (w.id === prev.currentId ? updated : w)),
      }
    })
  }, [])

  const isWatched = useCallback(
    (ticker) => watchlist.some((s) => s.ticker === (ticker || '').toUpperCase()),
    [watchlist]
  )

  const value = {
    watchlist,
    watchlists,
    currentWatchlistId: currentId,
    currentWatchlist,
    setCurrentWatchlistId,
    addWatchlist,
    removeWatchlist,
    renameWatchlist,
    addSymbol,
    removeSymbol,
    toggleWatch,
    isWatched,
    allTickers,
  }

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
