import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const TRENDING_NOW = [
  { ticker: 'TSLA', name: 'Tesla', price: 242.18, pct: 3.8, comments: '12.8K', sentiment: 75, rank: 1, whyBlurb: 'Cybertruck ramp and FSD rollout fueling discussion.' },
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.32, pct: 5.2, comments: '15.2K', sentiment: 82, rank: 2, whyBlurb: 'Data center AI demand and Blackwell chip ramp driving record volume.' },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, pct: -1.2, comments: '8.9K', sentiment: 45, rank: 3, whyBlurb: 'China sales and services growth in focus.' },
  { ticker: 'AMD', name: 'AMD', price: 156.43, pct: 4.1, comments: '9.2K', sentiment: 78, rank: 4, whyBlurb: 'MI300 adoption and data center share gains.' },
  { ticker: 'AMZN', name: 'Amazon', price: 172.65, pct: 2.3, comments: '6.1K', sentiment: 68, rank: 5, whyBlurb: 'AWS reacceleration and advertising growth.' },
]

const STREAM_MESSAGES = {
  NVDA: [
    { id: 1, user: 'AIBull', avatar: '/avatars/top-voice-1.png', body: 'Data center demand is insane. $NVDA guidance will crush again.', time: '2m', comments: 24, reposts: 8, likes: 142 },
    { id: 2, user: 'TechTrader', avatar: '/avatars/top-voice-2.png', body: 'NVDA at $875 and still not expensive given the growth. Holding through earnings.', time: '5m', comments: 18, reposts: 5, likes: 89 },
    { id: 3, user: 'ChipWatcher', avatar: '/avatars/top-voice-3.png', body: 'Blackwell ramp is the real story. Anyone trimming here will regret it.', time: '8m', comments: 31, reposts: 12, likes: 203 },
    { id: 4, user: 'MomentumKing', avatar: '/avatars/howard-lindzon.png', body: '15.2K messages and 82% bullish. Crowd is right on this one.', time: '12m', comments: 9, reposts: 3, likes: 67 },
  ],
  TSLA: [
    { id: 1, user: 'EVBull', avatar: '/avatars/top-voice-1.png', body: 'Cybertruck deliveries ramping. $TSLA demand story intact.', time: '1m', comments: 45, reposts: 11, likes: 278 },
    { id: 2, user: 'ElonFan', avatar: '/avatars/top-voice-2.png', body: 'FSD rollout accelerating. This is the year Tesla becomes an AI company.', time: '4m', comments: 62, reposts: 19, likes: 391 },
    { id: 3, user: 'AutoAnalyst', avatar: '/avatars/top-voice-3.png', body: 'Margins holding up better than expected. Long $TSLA.', time: '7m', comments: 22, reposts: 6, likes: 134 },
  ],
  AAPL: [
    { id: 1, user: 'AppleLong', avatar: '/avatars/top-voice-1.png', body: 'Services growth is the real margin story. $AAPL underrated here.', time: '3m', comments: 15, reposts: 4, likes: 98 },
    { id: 2, user: 'ValueMind', avatar: '/avatars/top-voice-2.png', body: 'China weakness priced in. Buying the dip.', time: '6m', comments: 28, reposts: 7, likes: 156 },
  ],
  AMD: [
    { id: 1, user: 'ChipFan', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption ramping. $AMD taking share from NVDA in some segments.', time: '2m', comments: 19, reposts: 6, likes: 112 },
    { id: 2, user: 'DataCenterBull', avatar: '/avatars/top-voice-2.png', body: '78% bullish and for good reason. AMD execution has been stellar.', time: '5m', comments: 11, reposts: 2, likes: 74 },
  ],
  AMZN: [
    { id: 1, user: 'CloudBull', avatar: '/avatars/top-voice-1.png', body: 'AWS growth reaccelerating. $AMZN still cheap vs growth.', time: '4m', comments: 33, reposts: 9, likes: 187 },
    { id: 2, user: 'RetailWatcher', avatar: '/avatars/top-voice-2.png', body: 'Ads and cloud driving margins. This is a hold for the long term.', time: '9m', comments: 7, reposts: 1, likes: 52 },
  ],
}

const TRENDING_SYMBOLS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', watchers: '1.1M+', price: 889.42, change: 21.79, pct: 2.45, sentiment: 78, sentimentLabel: 'Extremely Bullish', bullTag: 'Data Center Demand', bearTag: 'Valuation', spark: [860, 865, 870, 875, 880, 885, 888, 889] },
  { ticker: 'AAPL', name: 'Apple Inc.', watchers: '892.5K+', price: 182.51, change: -1.5, pct: -0.82, sentiment: 48, sentimentLabel: 'Neutral', bullTag: 'Services', bearTag: 'China', spark: [184, 183.5, 183, 182.8, 182.5, 182.3, 182.6, 182.51], hasEarnings: true, earningsLabel: "Q4'25 Earnings", earningsCount: 2362 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', watchers: '756', price: 201.12, change: 6.46, pct: 3.21, sentiment: 65, sentimentLabel: 'Bullish', bullTag: 'Cybertruck', bearTag: 'EV Competition', spark: [194, 195, 196, 197, 198, 199, 200, 201] },
]

const WATCHLIST_PREVIEW = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 889.42, change: 21.79 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 182.51, change: -1.5 },
]

const MARKET_CARDS = [
  { symbol: 'SPY', price: 609.98, change: -5.23, pct: -0.85, sentiment: 62, sentimentLabel: 'BULLISH', topTopic: 'Metals Nosedive', topTopicIcon: 'medal' },
  { symbol: 'QQQ', price: 523.41, change: -6.12, pct: -1.16, sentiment: 58, sentimentLabel: 'BULLISH', topTopic: 'New Fed Chair', topTopicIcon: 'chair' },
  { symbol: 'BITCOIN', price: 97234.5, change: 1245.2, pct: 1.3, sentiment: 71, sentimentLabel: 'BULLISH', topTopic: 'ETF Flows', topTopicIcon: 'chart' },
  { symbol: 'GOLD', price: 2654.8, change: -8.4, pct: -0.32, sentiment: 48, sentimentLabel: 'NEUTRAL', topTopic: 'Rate Cuts', topTopicIcon: 'scissors' },
  { symbol: 'VIX', price: 18.52, change: 1.64, pct: 9.72, sentiment: 35, sentimentLabel: 'BEARISH', topTopic: 'Volatility', topTopicIcon: 'bolt' },
]

function SentimentGauge({ value, label }) {
  const isBullish = label === 'BULLISH'
  const isBearish = label === 'BEARISH'
  const strokeColor = isBullish ? 'var(--color-success)' : isBearish ? 'var(--color-danger)' : '#f59e0b'
  const size = 40
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="3" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </svg>
        <span className="absolute text-xs font-bold text-text">{value}</span>
      </div>
      <span className="text-[10px] font-bold mt-0.5 uppercase" style={{ color: strokeColor }}>{label}</span>
    </div>
  )
}

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
  const navigate = useNavigate()
  const [selectedTicker, setSelectedTicker] = useState(TRENDING_NOW[0].ticker)
  const [newPostCount, setNewPostCount] = useState(0)
  const incrementIndexRef = useRef(0)
  const { getQuote } = useLiveQuotesContext()

  const NEW_POST_INCREMENTS = [10, 8, 3, 9, 12]
  useEffect(() => {
    const interval = setInterval(() => {
      const next = NEW_POST_INCREMENTS[incrementIndexRef.current % NEW_POST_INCREMENTS.length]
      incrementIndexRef.current += 1
      setNewPostCount((c) => c + next)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const mergeQuote = (staticItem) => {
    const q = getQuote(staticItem.ticker)
    if (!q) return staticItem
    return { ...staticItem, price: q.price, pct: q.changePercent ?? staticItem.pct }
  }

  const selectedItem = TRENDING_NOW.find((s) => s.ticker === selectedTicker) ?? TRENDING_NOW[0]
  const messages = (STREAM_MESSAGES[selectedTicker] ?? STREAM_MESSAGES.NVDA).slice(0, 4)

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

        {/* Middle: Market cards (full width) + Trending Now | Stream */}
        <main className="flex-1 min-w-0 flex flex-col p-4 lg:p-6 gap-4">
          {/* Header: Market Overview (selected) + Following / Watchlist (locked, sign-up to unlock) */}
          <div className="flex items-center gap-6 border-b-2 border-border pb-2 shrink-0">
            <span className="text-base font-bold text-black border-b-2 border-black pb-0.5 -mb-0.5" style={{ borderBottomWidth: 2 }}>
              Market Overview
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted" title="Sign up to unlock">
              Following
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted" title="Sign up to unlock">
              Watchlist
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
          </div>
          {/* Market cards — full width row */}
          <div className="w-full flex gap-3 overflow-x-auto pb-1 shrink-0">
            {MARKET_CARDS.map((card) => (
              <div
                key={card.symbol}
                className="flex-1 min-w-[140px] rounded-xl border border-border bg-white dark:bg-surface p-3 flex flex-col"
              >
                <div className="text-sm font-bold text-text">{card.symbol}</div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="text-lg font-bold text-text min-w-0">
                    {card.price >= 1000 ? card.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : card.price.toFixed(2)}
                  </div>
                  <SentimentGauge value={card.sentiment} label={card.sentimentLabel} />
                </div>
                <div className={clsx('text-xs font-semibold', card.pct >= 0 ? 'text-success' : 'text-danger')}>
                  ({card.change >= 0 ? '+' : ''}{card.change.toFixed(2)}) {card.pct >= 0 ? '+' : ''}{card.pct.toFixed(2)}%
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-text-muted mb-1">Top Topic</div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-muted text-xs font-medium text-text">
                    {card.topTopicIcon === 'medal' && <span aria-hidden>🏅</span>}
                    {card.topTopicIcon === 'chair' && <span aria-hidden>🪑</span>}
                    {card.topTopicIcon === 'chart' && <span aria-hidden>📈</span>}
                    {card.topTopicIcon === 'scissors' && <span aria-hidden>✂️</span>}
                    {card.topTopicIcon === 'bolt' && <span aria-hidden>⚡</span>}
                    {card.topTopic}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Two columns: equal height so Popular Messages bottom matches Trending Now ($AMZN) bottom; messages scroll inside */}
          <div className="flex flex-1 min-h-[440px] gap-0 items-stretch">
          {/* Left: Trending Now — top 5 list */}
          <aside className="w-[280px] shrink-0 border-r border-border pr-4 flex flex-col min-h-0">
            <h2 className="text-base font-bold text-text flex items-center gap-2 mb-3 shrink-0">
              <span className="text-orange-500" aria-hidden>🔥</span>
              Trending Now
            </h2>
            <ul className="flex-1 min-h-0 space-y-0 border-t border-border flex flex-col">
              {TRENDING_NOW.map((s) => {
                const item = mergeQuote(s)
                const isSelected = selectedTicker === item.ticker
                const isLive = item.ticker === 'AAPL'
                const pctNum = typeof item.pct === 'number' ? item.pct : 0
                return (
                  <li key={item.ticker}>
                    <button
                      type="button"
                      onClick={() => { setSelectedTicker(item.ticker); setNewPostCount(0); }}
                      className={clsx(
                        'w-full text-left py-3 px-3 -mb-px border-b border-l-4 transition-colors rounded-r-lg',
                        isLive && 'ring-1 ring-inset ring-purple-300',
                        isSelected && !isLive && 'bg-amber-50 dark:bg-amber-950/30 border-l-amber-500 border-border',
                        isSelected && isLive && 'bg-[rgba(221,214,254,0.25)] border-l-[#7c3aed] border-border',
                        !isSelected && isLive && 'border-l-[#c4b5fd] hover:bg-[rgba(221,214,254,0.15)] border-border',
                        !isSelected && !isLive && 'border-l-transparent hover:bg-surface-muted/30 border-border'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-text">${item.ticker}</span>
                            {isLive && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white shrink-0" style={{ backgroundColor: '#7c3aed' }}>Live</span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted truncate">{item.name}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              {item.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 shrink-0 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              {item.sentiment}% bullish
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-text">${typeof item.price === 'number' ? item.price.toFixed(2) : '--'}</div>
                          <div className={clsx('text-xs font-semibold', pctNum >= 0 ? 'text-success' : 'text-danger')}>
                            {pctNum >= 0 ? '+' : ''}{pctNum.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Right: Why trending blurb + Popular Messages — fills to match left column height */}
          <div className="flex-1 min-w-0 pl-4 flex flex-col min-h-0">
            {/* AAPL: Live earnings call card; others: Why it's trending */}
            {selectedTicker === 'AAPL' ? (
              <div
                className="w-full mb-3 flex items-center justify-between gap-4 rounded-2xl p-4 min-h-[72px] shrink-0"
                style={{ backgroundColor: 'rgba(221, 214, 254, 0.5)' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-text">Q1 &apos;26 Earnings Call</h3>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#7c3aed' }}>Live</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-text-muted">
                    <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span>2.1K Listeners</span>
                    <span className="text-border">|</span>
                    <span>Started 21m ago</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#7c3aed' }}
                  aria-label="Join live earnings call"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Join
                </button>
              </div>
            ) : (
              <div
                className="w-full mb-3 flex items-center gap-4 rounded-2xl p-4 min-h-[72px] shrink-0"
                style={{
                  background: 'linear-gradient(to right, rgba(254, 215, 170, 0.6), rgba(250, 204, 211, 0.5), rgba(221, 214, 254, 0.5))',
                }}
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-white/90 flex items-center justify-center overflow-hidden shadow-sm">
                  {getTickerLogo(selectedTicker) ? (
                    <img src={getTickerLogo(selectedTicker)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-text">{selectedTicker[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-text">Trending #{selectedItem.rank ?? 1}</div>
                  <p className="text-sm text-text mt-0.5 truncate pr-2">
                    {selectedItem.name} ({selectedItem.ticker}) is trending as {selectedItem.whyBlurb?.toLowerCase() ?? 'conversation heats up.'}
                  </p>
                </div>
                <button type="button" onClick={() => navigate('/symbol')} className="shrink-0 text-sm font-semibold text-primary hover:underline" aria-label="View full summary">
                  View Full Summary&gt;
                </button>
              </div>
            )}

            <h3 className="text-sm font-semibold text-text mb-2 shrink-0">Popular Messages</h3>
            <div className="relative flex-1 min-h-0 flex flex-col rounded-xl border border-border overflow-hidden bg-surface-muted/20">
              {newPostCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setNewPostCount(0); navigate('/symbol'); }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#4285F4' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {newPostCount} New Post{newPostCount === 1 ? '' : 's'}
                </button>
              )}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-0">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
                  <img src={msg.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-text">{msg.user}</span>
                      <span className="text-xs text-text-muted">{msg.time}</span>
                    </div>
                    <p className="text-sm text-text mt-0.5 leading-snug">{msg.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {msg.comments ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {msg.reposts ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {msg.likes ?? 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}
