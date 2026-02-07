/**
 * Vercel serverless function to fetch Yahoo Finance quotes.
 * Proxies requests to avoid CORS (Yahoo blocks direct browser requests).
 * GET /api/quotes?symbols=AAPL,TSLA,NVDA
 */

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

// Map app ticker names to Yahoo Finance symbols
const SYMBOL_MAP = {
  BITCOIN: 'BTC-USD',
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  XRP: 'XRP-USD',
  DOGE: 'DOGE-USD',
  GOLD: 'GC=F',
  VIX: '^VIX',
  SILVER: 'SI=F',
}

function toYahooSymbol(ticker) {
  return SYMBOL_MAP[ticker?.toUpperCase()] ?? ticker
}

async function fetchQuote(symbol) {
  const yahooSymbol = toYahooSymbol(symbol)
  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })
  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`)
  }
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) {
    throw new Error(`No data for ${symbol}`)
  }
  const meta = result.meta
  const regularPrice = meta.regularMarketPrice ?? meta.chartPreviousClose
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? regularPrice
  const change = regularPrice != null && previousClose != null ? regularPrice - previousClose : 0
  const changePercent = previousClose ? (change / previousClose) * 100 : 0
  const quote = result.indicators?.quote?.[0]
  let spark = []
  if (quote?.close?.length) {
    spark = quote.close.filter((v) => v != null).slice(-20)
  } else if (regularPrice != null) {
    spark = [regularPrice]
  }
  return {
    symbol: symbol?.toUpperCase(),
    name: meta.shortName ?? symbol,
    price: regularPrice ?? previousClose ?? 0,
    change,
    changePercent,
    spark,
    currency: meta.currency,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const symbols = req.query.symbols || req.query.symbol
  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols query param (e.g. ?symbols=AAPL,TSLA)' })
  }
  const list = Array.isArray(symbols) ? symbols : String(symbols).split(',').map((s) => s.trim()).filter(Boolean)
  if (list.length > 20) {
    return res.status(400).json({ error: 'Max 20 symbols per request' })
  }
  const results = {}
  const errors = []
  await Promise.all(
    list.map(async (sym) => {
      try {
        const q = await fetchQuote(sym)
        results[q.symbol] = q
      } catch (e) {
        errors.push({ symbol: sym, error: e.message })
      }
    })
  )
  return res.status(200).json({ quotes: results, errors: errors.length ? errors : undefined })
}
