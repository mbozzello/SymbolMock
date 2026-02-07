import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchQuotes } from '../services/quoteService.js'

const CACHE_MS = 60_000 // 1 min

/**
 * Fetches and caches live quotes for given symbols.
 * @param {string[]} symbols - Ticker symbols
 * @param {{ enabled?: boolean, refetchInterval?: number }} options
 * @returns {{ quotes: Record<string,object>, loading: boolean, error: Error|null, refetch: () => void }}
 */
export function useLiveQuotes(symbols, options = {}) {
  const { enabled = true, refetchInterval = CACHE_MS } = options
  const [quotes, setQuotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})
  const lastFetchRef = useRef(0)

  const doFetch = useCallback(async () => {
    const list = [...new Set(symbols)].filter(Boolean)
    if (!list.length) {
      setQuotes({})
      setLoading(false)
      return
    }
    const cacheKey = list.sort().join(',')
    const now = Date.now()
    if (cacheRef.current[cacheKey] && now - lastFetchRef.current < CACHE_MS) {
      setQuotes(cacheRef.current[cacheKey])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = await fetchQuotes(list)
      cacheRef.current[cacheKey] = q
      lastFetchRef.current = now
      setQuotes(q)
    } catch (e) {
      setError(e)
      setQuotes({})
    } finally {
      setLoading(false)
    }
  }, [symbols?.join(',')])

  useEffect(() => {
    if (!enabled) return
    doFetch()
    const id = refetchInterval > 0 ? setInterval(doFetch, refetchInterval) : null
    return () => (id ? clearInterval(id) : undefined)
  }, [doFetch, enabled, refetchInterval])

  return { quotes, loading, error, refetch: doFetch }
}
