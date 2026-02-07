/**
 * Vite plugin to proxy /api/quotes during dev (avoids needing vercel dev).
 * In production, Vercel serves api/quotes.js directly.
 */
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'
const SYMBOL_MAP = { BITCOIN: 'BTC-USD', BTC: 'BTC-USD', ETH: 'ETH-USD', XRP: 'XRP-USD', DOGE: 'DOGE-USD', GOLD: 'GC=F', VIX: '^VIX', SILVER: 'SI=F' }

function toYahooSymbol(ticker) {
  return SYMBOL_MAP[ticker?.toUpperCase()] ?? ticker
}

async function fetchQuote(symbol) {
  const yahooSymbol = toYahooSymbol(symbol)
  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`Yahoo returned ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error(`No data for ${symbol}`)
  const meta = result.meta
  const regularPrice = meta.regularMarketPrice ?? meta.chartPreviousClose
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? regularPrice
  const change = regularPrice != null && previousClose != null ? regularPrice - previousClose : 0
  const changePercent = previousClose ? (change / previousClose) * 100 : 0
  const quote = result.indicators?.quote?.[0]
  let spark = quote?.close?.filter((v) => v != null).slice(-20) ?? (regularPrice != null ? [regularPrice] : [])
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

export function quoteApiPlugin() {
  return {
    name: 'quote-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/quotes')) {
          try {
            const u = new URL(req.url, 'http://localhost')
            const symbols = u.searchParams.get('symbols') || u.searchParams.get('symbol') || ''
            const list = symbols.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20)
            if (!list.length) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing symbols param' }))
              return
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
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'max-age=60')
            res.end(JSON.stringify({ quotes: results, errors: errors.length ? errors : undefined }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }
        next()
      })
    },
  }
}
