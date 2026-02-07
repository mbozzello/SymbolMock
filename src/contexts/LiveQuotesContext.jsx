import { createContext, useContext, useMemo } from 'react'
import { useFakeQuotes } from '../hooks/useFakeQuotes.js'
import { useWatchlist } from './WatchlistContext.jsx'

const LiveQuotesContext = createContext(null)

// Base symbols used across the app (ticker tape, markets, etc.)
const BASE_SYMBOLS = [
  'SPY', 'QQQ', 'BTC', 'BTC-USD', 'BITCOIN', 'ETH', 'XRP', 'DOGE', 'GOLD', 'VIX', 'NVDA', 'AAPL', 'TSLA', 'META', 'AMZN', 'MSFT',
  'GME', 'CELH', 'RKLB', 'HOOD', 'PLTR', 'GLD', 'SLV', 'AMD', 'SNAP', 'PZZA', 'SPOT', 'ABNB', 'AMC', 'BRK.A',
  'C', 'DIS', 'ETOR', 'FIG', 'LULU',
]

export function LiveQuotesProvider({ children }) {
  const { watchlist } = useWatchlist()
  const watchlistTickers = watchlist.map((s) => s.ticker)
  const allSymbols = [...new Set([...BASE_SYMBOLS, ...watchlistTickers])]
  const { quotes, loading, error, refetch } = useFakeQuotes(allSymbols)

  const value = useMemo(() => ({
    quotes,
    loading,
    error,
    refetch,
    getQuote: (symbol) => {
      const s = symbol?.toUpperCase()
      return quotes[s] ?? null
    },
    getPrice: (symbol) => quotes[symbol?.toUpperCase()]?.price ?? null,
    getChange: (symbol) => quotes[symbol?.toUpperCase()]?.change ?? null,
    getChangePercent: (symbol) => quotes[symbol?.toUpperCase()]?.changePercent ?? null,
    getSpark: (symbol) => quotes[symbol?.toUpperCase()]?.spark ?? [],
  }), [quotes, loading, error, refetch])

  return (
    <LiveQuotesContext.Provider value={value}>
      {children}
    </LiveQuotesContext.Provider>
  )
}

export function useLiveQuotesContext() {
  const ctx = useContext(LiveQuotesContext)
  return ctx ?? { quotes: {}, loading: false, error: null, getQuote: () => null, getPrice: () => null, getChange: () => null, getChangePercent: () => null, getSpark: () => [] }
}
