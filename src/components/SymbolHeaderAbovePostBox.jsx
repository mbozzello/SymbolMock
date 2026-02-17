import { useState, useRef, useEffect } from 'react'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function parseWatchers(w) {
  if (typeof w === 'number' && !isNaN(w)) return w
  const s = String(w || '0').replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*[KkMm]?$/i)
  if (m) {
    const n = parseFloat(m[1])
    if (/[Kk]$/.test(s)) return Math.round(n * 1000)
    if (/[Mm]$/.test(s)) return Math.round(n * 1000000)
    return Math.round(n)
  }
  return parseInt(s, 10) || 0
}

function formatNum(n) {
  return Number(n).toLocaleString()
}

function MiniChart({ values = [], isUp = true, width = 200, height = 56 }) {
  const padding = { left: 4, right: 4, top: 6, bottom: 6 }
  if (values.length < 2) {
    return (
      <div className="rounded border border-border bg-surface-muted/30 flex items-center justify-center" style={{ width, height }}>
        <span className="text-xs text-text-muted">—</span>
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * chartW
    const y = padding.top + (1 - (v - min) / range) * chartH
    return { x, y }
  })
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const priorCloseY = padding.top + (1 - (values[0] - min) / range) * chartH
  const last = points[points.length - 1]
  const strokeColor = isUp ? '#22c55e' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="shrink-0" style={{ width, height }}>
      <line x1={padding.left} y1={priorCloseY} x2={width - padding.right} y2={priorCloseY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4" fill="#86efac" />
      <circle cx={last.x} cy={last.y} r="6" fill={strokeColor} opacity="0.25" />
    </svg>
  )
}

function SentimentGauge({ value = 88, size = 52, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#22c55e" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - filled} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 1} textAnchor="middle" fontSize="16" fontWeight="700" fill="#22c55e">
        {value}
      </text>
    </svg>
  )
}

const WATCHERS_HOVER_DEFAULTS = {
  change7d: { watchers: 273, percent: 7.8 },
  dailyChanges: [23, 47, 89, 83, -17, 31, 17],
  rank: { position: 1, total: 17, category: 'Motor Vehicles' },
  underTheRadar: '#3 least followed symbol at a 52W high',
}

function WatchersHoverPanel({ ticker, change7d, dailyChanges, rank, underTheRadar, children }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)
  const c7d = change7d ?? WATCHERS_HOVER_DEFAULTS.change7d
  const days = dailyChanges ?? WATCHERS_HOVER_DEFAULTS.dailyChanges
  const r = rank ?? WATCHERS_HOVER_DEFAULTS.rank
  const utr = underTheRadar ?? WATCHERS_HOVER_DEFAULTS.underTheRadar

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const maxBar = Math.max(...days.map(Math.abs))

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-[300px] max-w-[360px] rounded-xl border border-border bg-white dark:bg-surface shadow-xl overflow-hidden"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="p-4 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">7D Change</div>
              <p className="text-sm text-text font-medium mb-3">
                +{c7d.watchers} Watchers <span className="text-green-600 font-semibold">(+{c7d.percent}%)</span>
              </p>
              <div className="flex items-end gap-1.5 h-16 mb-3">
                {days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center min-h-0">
                    <span className={`text-[10px] font-semibold shrink-0 mb-1 ${d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {d >= 0 ? `+${d}` : d}
                    </span>
                    <div className="flex-1 flex flex-col justify-end w-full min-h-[24px]">
                      <div
                        className="w-full rounded-t flex-shrink-0"
                        style={{
                          height: `${Math.max(4, (Math.abs(d) / (maxBar || 1)) * 32)}px`,
                          backgroundColor: d >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="w-full py-2 rounded-lg bg-surface-muted text-text font-medium text-sm hover:bg-surface-muted/80 transition-colors">
                Full Watchers Chart
              </button>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">Watchers Rank</div>
              <p className="text-sm text-text font-medium">#{r.position} of {r.total} in {r.category}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">
                Under the Radar
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-hidden />
              </div>
              <p className="text-sm text-text font-medium">{utr}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_SYMBOL = {
  ticker: 'TSLA',
  name: 'Tesla Inc',
  price: 433.07,
  change: 11.46,
  changePct: 2.72,
  updated: '5:00 PM EST',
  followers: '1,050,370',
  mktCap: '$1.45T',
  volume: '$47.78M',
  range52w: { low: 214.25, high: 498.83 },
  earningsDate: 'Jan 28',
  sentimentPct: 88,
  sentimentLabel: 'Extremely Bullish',
  chartValues: [410, 412, 418, 422, 425, 428, 430, 433.07],
}

const TABS = ['Feed', 'News', 'Sentiment', 'Earnings', 'Fundamentals', 'Info']

const WATCHER_CHUNKS = [2, 5, 10, 3, 5, 8]

export default function SymbolHeaderAbovePostBox({ symbol = DEFAULT_SYMBOL, activeTab: controlledTab, onTabChange }) {
  const { isWatched, toggleWatch } = useWatchlist()
  const [selectedSentiment, setSelectedSentiment] = useState(null)
  const [internalTab, setInternalTab] = useState('Feed')
  const [watchersCount, setWatchersCount] = useState(() => parseWatchers(symbol.followers))
  const [floatingWatchers, setFloatingWatchers] = useState(null)
  const activeTab = controlledTab ?? internalTab
  const setTab = onTabChange || ((tab) => setInternalTab(tab))
  const logoUrl = getTickerLogo(symbol.ticker)
  const isUp = (symbol.change ?? 0) >= 0
  const values = symbol.chartValues && symbol.chartValues.length >= 2 ? symbol.chartValues : DEFAULT_SYMBOL.chartValues

  useEffect(() => {
    const id = setInterval(() => {
      const chunk = WATCHER_CHUNKS[Math.floor(Math.random() * WATCHER_CHUNKS.length)]
      setWatchersCount((prev) => prev + chunk)
      setFloatingWatchers({ value: chunk, key: Date.now() })
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mb-4 px-4">
      {/* Row 1: Logo + Ticker/Name + Price/Change + Mini Chart */}
      <div className="flex items-start gap-4 pb-4">
        <div className="relative shrink-0">
          <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden bg-red-600 flex items-center justify-center shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{symbol.ticker.slice(0, 1)}</span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-600 border-2 border-white dark:border-surface" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-bold text-text">{symbol.ticker}</h1>
                <span className="text-sm text-text-muted">{symbol.name}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-text">${Number(symbol.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={clsx('text-sm font-medium', isUp ? 'text-green-600' : 'text-red-600')}>
                  {isUp ? '↑' : '↓'} ${Math.abs(symbol.change).toFixed(2)} ({isUp ? '' : '-'}{Math.abs(symbol.changePct).toFixed(2)}%)
                </span>
                <span className="text-sm text-text-muted">Today</span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">Updated: {symbol.updated}</p>
            </div>
            <div className="shrink-0 ml-auto">
              <MiniChart values={values} isUp={isUp} width={200} height={56} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Earnings Call + Trending pills */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full py-2 px-4 text-white text-sm font-semibold shadow-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <div className="flex -space-x-1.5">
            <img src="/avatars/top-voice-1.png" alt="" className="w-6 h-6 rounded-full border-2 border-[#7c3aed] object-cover" />
            <img src="/avatars/top-voice-2.png" alt="" className="w-6 h-6 rounded-full border-2 border-[#7c3aed] object-cover" />
            <img src="/avatars/top-voice-3.png" alt="" className="w-6 h-6 rounded-full border-2 border-[#7c3aed] object-cover" />
          </div>
          <span>Earnings Call · Started 21m</span>
          <span className="flex items-center gap-1 opacity-90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
            2.1K+
          </span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full py-2 px-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
        >
          <span>🔥</span>
          <span className="text-text">Trending #1</span>
          <span className="text-orange-500 font-semibold">See Why</span>
        </button>
      </div>

      {/* Row 3: Watchers pill, Earnings, Mkt Cap, Vol */}
      <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border">
        <WatchersHoverPanel ticker={symbol.ticker}>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 cursor-pointer hover:bg-surface-muted transition-colors">
            <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="relative inline-flex items-baseline">
              <span className="text-sm font-semibold text-text">{formatNum(watchersCount)}</span>
              {floatingWatchers && (
                <span
                  key={floatingWatchers.key}
                  className="absolute left-full ml-1 bottom-0 text-green-600 dark:text-green-400 text-xs font-bold animate-watchers-float-wiggle whitespace-nowrap"
                  onAnimationEnd={() => setFloatingWatchers(null)}
                >
                  +{floatingWatchers.value}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleWatch(symbol.ticker, symbol.name) }}
              className="w-6 h-6 rounded-full border border-border bg-surface flex items-center justify-center text-text hover:bg-surface-muted transition-colors shrink-0 ml-0.5"
              aria-label={isWatched(symbol.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isWatched(symbol.ticker) ? (
                <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <span className="text-sm font-bold leading-none">+</span>
              )}
            </button>
          </div>
        </WatchersHoverPanel>
        <div className="flex items-center gap-1 text-sm text-text-muted">
          <span className="font-medium text-text">Earnings</span>
          <span>{symbol.earningsDate}</span>
          <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <span className="text-sm text-text-muted"><span className="font-medium text-text">Mkt Cap</span> {symbol.mktCap}</span>
        <span className="text-sm text-text-muted"><span className="font-medium text-text">Vol</span> {symbol.volume ?? '$47.78M'}</span>
      </div>

      {/* Row 3: Chart button */}
      <div className="flex items-center justify-center py-2 border-b border-border">
        <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-surface text-sm font-medium text-text hover:bg-surface-muted transition-colors">
          Chart
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Row 4: Sentiment */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-b border-border">
        <SentimentGauge value={symbol.sentimentPct ?? 88} size={52} strokeWidth={5} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-text">{symbol.sentimentLabel ?? 'Extremely Bullish'}</p>
          <p className="text-sm text-text-muted">How do you feel about {symbol.ticker}?</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedSentiment('bullish')}
            className={clsx(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
              selectedSentiment === 'bullish'
                ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400'
                : 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/30'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bullish
          </button>
          <button
            type="button"
            onClick={() => setSelectedSentiment('bearish')}
            className={clsx(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
              selectedSentiment === 'bearish'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400'
                : 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bearish
          </button>
        </div>
      </div>

      {/* Row 5: Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2 pt-1" aria-label="Symbol tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button key={tab} type="button" onClick={() => setTab(tab)} className={clsx(
              'px-3 py-2.5 text-sm font-medium transition-colors border-b-2',
              isActive ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text'
            )}>
              {tab}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
