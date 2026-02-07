import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const TOP_5_TRENDING = [
  { ticker: 'SPY', name: 'SPDR S&P 500', price: 609.98, change: -5.23, pct: -0.85, sentiment: 62, sentimentLabel: 'Bullish', topTopic: 'Metals Nosedive' },
  { ticker: 'QQQ', name: 'Invesco QQQ', price: 523.41, change: -6.12, pct: -1.16, sentiment: 58, sentimentLabel: 'Bullish', topTopic: 'New Fed Chair' },
  { ticker: 'BITCOIN', name: 'Bitcoin', price: 97234.5, change: 1245.2, pct: 1.3, sentiment: 71, sentimentLabel: 'Bullish', topTopic: 'ETF Flows' },
  { ticker: 'GOLD', name: 'Gold', price: 2654.8, change: -8.4, pct: -0.32, sentiment: 48, sentimentLabel: 'Neutral', topTopic: 'Rate Cuts' },
  { ticker: 'VIX', name: 'VIX', price: 18.52, change: 1.64, pct: 9.72, sentiment: 35, sentimentLabel: 'Bearish', topTopic: 'Volatility' },
]

const TRENDING_SYMBOLS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', watchers: '1.1M+', price: 889.42, change: 21.79, pct: 2.45, sentiment: 78, sentimentLabel: 'Extremely Bullish', bullTag: 'Data Center Demand', bearTag: 'Valuation', spark: [860, 865, 870, 875, 880, 885, 888, 889] },
  { ticker: 'AAPL', name: 'Apple Inc.', watchers: '892.5K+', price: 182.51, change: -1.5, pct: -0.82, sentiment: 48, sentimentLabel: 'Neutral', bullTag: 'Services', bearTag: 'China', spark: [184, 183.5, 183, 182.8, 182.5, 182.3, 182.6, 182.51], hasEarnings: true, earningsLabel: "Q4'25 Earnings", earningsCount: 2362 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', watchers: '756', price: 201.12, change: 6.46, pct: 3.21, sentiment: 65, sentimentLabel: 'Bullish', bullTag: 'Cybertruck', bearTag: 'EV Competition', spark: [194, 195, 196, 197, 198, 199, 200, 201] },
]

const WATCHLIST_PREVIEW = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 889.42, change: 21.79 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 182.51, change: -1.5 },
]

function MiniSparkline({ values = [], isUp }) {
  if (!values?.length) return null
  const width = 64
  const height = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 2)
    return `${x},${y}`
  }).join(' ')
  const color = isUp !== false && values[values.length - 1] >= values[0] ? 'var(--color-success)' : 'var(--color-danger)'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-6 shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Homepage() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const { getQuote } = useLiveQuotesContext()

  const mergeQuote = (staticItem) => {
    const q = getQuote(staticItem.ticker)
    if (!q) return staticItem
    return { ...staticItem, price: q.price, change: q.change, pct: q.changePercent ?? staticItem.pct, spark: q.spark?.length ? q.spark : staticItem.spark }
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />

      <div className="flex max-w-[1400px] mx-auto">
        {/* Column 1: New to Stocktwits + Unlock Watchlist */}
        <aside className="hidden lg:flex w-[269px] shrink-0 flex-col border-r border-border p-4 gap-6">
          <section className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <h2 className="text-sm font-bold text-text mb-2">New to Stocktwits?</h2>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Get access to real-time conversations, investor sentiment, price predictions and customized watchlists.
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-surface hover:bg-surface-muted transition-colors text-left">
                <img src="/avatars/user-avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text">Continue as Michael</div>
                  <div className="text-xs text-text-muted truncate">mbozzello@stocktwits...</div>
                </div>
                <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </button>
              <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-surface hover:bg-surface-muted transition-colors text-left">
                <span className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-text" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c3.08-.2 4.85 1.5 6 3.2 1.15-1.7 2.92-3.4 6-3.2 5.54.28 6.26 7.94 1.67 12.87-.86.79-1.62.97-3.06.35-1.15-.48-2.15-.46-3.24 0-1.03.45-2.1.6-3.08-.35zM12.03 7.25c-.87 0-1.57-.7-1.57-1.57s.7-1.57 1.57-1.57 1.57.7 1.57 1.57-.7 1.57-1.57 1.57z"/></svg>
                </span>
                <span className="text-sm font-semibold text-text">Continue with Apple</span>
              </button>
              <button type="button" className="w-full py-2.5 rounded-lg border border-border bg-black text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Create Account
              </button>
              <Link to="/symbol" className="text-xs text-primary hover:underline text-center py-1">
                Log in to existing account
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <h2 className="text-sm font-bold text-text mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Unlock Watchlist
            </h2>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Customize your watchlist - add symbols to see reactions and insights on your feed.
            </p>
            <div className="flex gap-2 mb-3">
              <button type="button" className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-muted">Quick add</button>
              <button type="button" className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-muted">Customize</button>
            </div>
            <p className="text-[11px] text-text-muted mb-3">
              Add preset lists like Top 5 Trending or Mag 7 in one tap from the feed.
            </p>
            <button type="button" className="w-full py-2.5 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20">
              Sign in to add symbols
            </button>
            <div className="mt-3 space-y-2">
              {WATCHLIST_PREVIEW.map((s) => {
                const item = mergeQuote(s)
                return (
                <div key={item.ticker} className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border">
                  {getTickerLogo(item.ticker) ? (
                    <img src={getTickerLogo(item.ticker)} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded bg-surface flex items-center justify-center text-xs font-bold shrink-0">{item.ticker[0]}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-text truncate">{item.ticker} {item.name}</div>
                    <div className="text-xs text-text-muted">${typeof item.price === 'number' ? item.price.toFixed(2) : '--'} <span className={item.change >= 0 ? 'text-success' : 'text-danger'}>{item.change >= 0 ? '+' : ''}{(item.pct ?? item.change ?? 0).toFixed(2)}%</span></div>
                  </div>
                </div>
                )
              })}
            </div>
          </section>
        </aside>

        {/* Column 2: Streaming Live + Top 5 Trending */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
          {/* Streaming Live */}
          <div className="rounded-xl border border-border bg-surface-muted/30 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img src="/avatars/top-voice-1.png" alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase text-text-muted">Streaming Live</div>
                <div className="text-sm font-bold text-text truncate">Powell Delivers Fed Interest Rate</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full overflow-hidden flex bg-surface">
                  <div className="h-full bg-success" style={{ width: '63.1%' }} />
                  <div className="h-full bg-danger" style={{ width: '36.9%' }} />
                </div>
                <span className="text-xs font-semibold text-text-muted whitespace-nowrap">63.1% / 36.9%</span>
              </div>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                1,419 watchers
              </span>
              <button type="button" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90">
                JOIN LIVE
              </button>
            </div>
          </div>

          {/* Top 5 Trending */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {TOP_5_TRENDING.map((s) => {
              const item = mergeQuote(s)
              return (
              <div key={item.ticker} className="rounded-xl border border-border bg-white dark:bg-surface p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text">{item.ticker}</span>
                  <span className={clsx('text-xs font-bold', item.sentiment >= 55 ? 'text-success' : item.sentiment >= 45 ? 'text-text-muted' : 'text-danger')}>{item.sentimentLabel}</span>
                </div>
                <div className="text-lg font-bold text-text">${typeof item.price === 'number' && item.price >= 1000 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : (typeof item.price === 'number' ? item.price.toFixed(2) : '--')}</div>
                <div className="text-xs">
                  <span className={item.change >= 0 ? 'text-success' : 'text-danger'}>
                    {item.change >= 0 ? '+' : ''}{(typeof item.change === 'number' ? item.change : 0).toFixed(2)} ({(item.pct ?? 0) >= 0 ? '+' : ''}{(item.pct ?? 0).toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-text">{item.sentiment}</span>
                  <span className="text-[10px] text-text-muted truncate">Top Topic {item.topTopic}</span>
                </div>
              </div>
            )
            })}
          </div>
        </main>

        {/* Column 3: Trending Symbols */}
        <aside className="hidden xl:flex w-[320px] shrink-0 flex-col border-l border-border p-4 gap-4">
          <Link to="/markets" className="text-sm font-bold text-text hover:text-primary flex items-center gap-1">
            Trending Symbols
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
          <div className="space-y-4">
            {TRENDING_SYMBOLS.map((s) => {
              const item = mergeQuote(s)
              return (
              <div key={item.ticker} className="rounded-xl border border-border bg-white dark:bg-surface overflow-hidden relative">
                {item.hasEarnings && (
                  <div className="absolute inset-0 bg-primary/20 z-10 flex items-center justify-center">
                    <div className="bg-primary text-white px-4 py-2 rounded-lg text-center">
                    <div className="text-xs font-bold">{item.earningsLabel}</div>
                        <div className="text-lg font-bold">{item.earningsCount.toLocaleString()}</div>
                      <button type="button" className="mt-2 px-3 py-1 rounded bg-white text-primary text-xs font-semibold">Join Call</button>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getTickerLogo(item.ticker) ? (
                      <img src={getTickerLogo(item.ticker)} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    ) : (
                      <span className="w-10 h-10 rounded bg-surface flex items-center justify-center text-sm font-bold shrink-0">{item.ticker[0]}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-text">{item.ticker}</div>
                      <div className="text-xs text-text-muted truncate">{item.name}</div>
                    </div>
                    <span className="text-xs text-text-muted flex items-center gap-0.5">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11v7a2 2 0 002 2h.14a2 2 0 001.72-.91l2.42-4.35 2.42 4.35a2 2 0 001.72.91h1.72a2 2 0 002-2v-7a6.981 6.981 0 00-2.05-4.95z" clipRule="evenodd" /></svg>
                      {item.watchers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-text">${typeof item.price === 'number' ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}</span>
                    <MiniSparkline values={item.spark} isUp={item.change >= 0} />
                  </div>
                  <div className={clsx('text-xs font-semibold', item.change >= 0 ? 'text-success' : 'text-danger')}>
                    {item.change >= 0 ? '↑' : '↓'} ${Math.abs(item.change ?? 0).toFixed(2)} ({(item.pct ?? 0) >= 0 ? '+' : ''}{(item.pct ?? 0).toFixed(2)}%) Today
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded', item.sentiment >= 75 ? 'bg-success/20 text-success' : item.sentiment >= 55 ? 'bg-success/10 text-success' : item.sentiment >= 45 ? 'bg-surface-muted text-text-muted' : 'bg-danger/10 text-danger')}>
                      {item.sentimentLabel.toUpperCase()} ({item.sentiment})
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">{item.bullTag}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger">{item.bearTag}</span>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
