/**
 * Fetches live quotes from our API (proxies Yahoo Finance).
 * @param {string[]} symbols - Ticker symbols (e.g. ['AAPL','TSLA','NVDA'])
 * @returns {Promise<{ [symbol: string]: { symbol, name, price, change, changePercent, spark, currency } }>}
 */
export async function fetchQuotes(symbols) {
  if (!symbols?.length) return {}
  const list = [...new Set(symbols)].slice(0, 20)
  const qs = new URLSearchParams({ symbols: list.join(',') })
  const res = await fetch(`/api/quotes?${qs}`)
  if (!res.ok) {
    throw new Error(`Quotes API returned ${res.status}`)
  }
  const data = await res.json()
  return data.quotes ?? {}
}
