import { useState, useRef, useEffect } from 'react'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniChart({ values = [], isUp = true, width = 180, height = 64 }) {
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
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`
  const priorCloseY = padding.top + (1 - (values[0] - min) / range) * chartH
  const last = points[points.length - 1]
  const strokeColor = isUp ? '#22c55e' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="shrink-0" style={{ width, height }}>
      <defs>
        <linearGradient id="symbolHeaderChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#symbolHeaderChartFill)" />
      <line x1={padding.left} y1={priorCloseY} x2={width - padding.right} y2={priorCloseY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4" fill="#86efac" />
      <circle cx={last.x} cy={last.y} r="6" fill={strokeColor} opacity="0.25" />
    </svg>
  )
}

function SentimentGauge({ value = 88, size = 56, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#22c55e" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - filled} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 1} textAnchor="middle" fontSize="18" fontWeight="700" fill="#22c55e">
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
            {/* 7D CHANGE */}
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
            {/* WATCHERS RANK */}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">Watchers Rank</div>
              <p className="text-sm text-text font-medium">#{r.position} of {r.total} in {r.category}</p>
            </div>
            {/* UNDER THE RADAR */}
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
  range52w: { low: 214.25, high: 498.83 },
  earningsDate: 'Jan 28',
  sentimentPct: 88,
  sentimentLabel: 'bullish',
  chartValues: [410, 412, 418, 422, 425, 428, 430, 433.07],
}

const TABS = ['Feed', 'News', 'Sentiment', 'Earnings', 'Fundamentals', 'Info']

export default function SymbolHeaderAbovePostBox({ symbol = DEFAULT_SYMBOL, activeTab: controlledTab, onTabChange }) {
  const { isWatched, toggleWatch } = useWatchlist()
  const [selectedSentiment, setSelectedSentiment] = useState(null)
  const [internalTab, setInternalTab] = useState('Feed')
  const activeTab = controlledTab ?? internalTab
  const setTab = onTabChange || ((tab) => setInternalTab(tab))
  const logoUrl = getTickerLogo(symbol.ticker)
  const isUp = (symbol.change ?? 0) >= 0
  const values = symbol.chartValues && symbol.chartValues.length >= 2 ? symbol.chartValues : DEFAULT_SYMBOL.chartValues

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden mb-4">
      {/* Section 1: Ticker, price, chart */}
      <div className="p-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-red-600 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{symbol.ticker.slice(0, 1)}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center" aria-hidden>
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-3.38-1.21-6.49-3.3-8.79-.24 2.58-2.34 4.58-5 4.58s-4.76-2-5-4.58C5.61 7.51 4 4.92 4 2.5 4 1.12 5.12 0 6.5 0c1.38 0 2.5 1.12 2.5 2.5 0 .82-.4 1.55-1.02 2.01.63.46 1.02 1.19 1.02 2.01 0 1.38-1.12 2.5-2.5 2.5-.46 0-.89-.12-1.26-.34.37.22.8.34 1.26.34 2.21 0 4-1.79 4-4 0-1.63-.97-3-2.37-3.64.4-.64.63-1.39.63-2.21 0-2.21-1.79-4-4-4z" /></svg>
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{symbol.ticker}</h1>
              <p className="text-sm text-text-muted">{symbol.name}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-text">${Number(symbol.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={clsx('text-sm font-medium flex items-center gap-1 mt-0.5', isUp ? 'text-green-600' : 'text-red-600')}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isUp ? <path d="M18 15l-6-6-6 6" /> : <path d="M6 9l6 6 6-6" />}
              </svg>
              {isUp ? '+' : ''}${Math.abs(symbol.change).toFixed(2)} ({isUp ? '+' : ''}{symbol.changePct.toFixed(2)}%) Today
            </p>
            <p className="text-xs text-text-muted mt-0.5">Updated: {symbol.updated}</p>
          </div>
        </div>
        <MiniChart values={values} isUp={isUp} width={180} height={64} />
      </div>
      {/* Section 2: Watchers/Followers, Mkt Cap, 52W, Earnings */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-4 sm:gap-6">
        <WatchersHoverPanel ticker={symbol.ticker}>
          <div className="flex items-center gap-2 cursor-pointer">
            <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-sm font-medium text-text">{symbol.followers}</span>
            <span className="relative top-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 block" aria-hidden />
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleWatch(symbol.ticker, symbol.name); }} className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center text-text hover:bg-surface-muted transition-colors shrink-0" aria-label={isWatched(symbol.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}>
              {isWatched(symbol.ticker) ? (
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <span className="text-lg font-bold leading-none">+</span>
              )}
            </button>
          </div>
        </WatchersHoverPanel>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-muted">
          <span><span className="font-medium text-text">Mkt Cap</span> {symbol.mktCap}</span>
          <span><span className="font-medium text-text">52W Range</span> ${symbol.range52w.low.toFixed(2)} - ${symbol.range52w.high.toFixed(2)}</span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-text">Earnings</span> {symbol.earningsDate}
            <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h18s-3-2-3-9" />
              <path d="M13 21a1 1 0 0 1-2 0" />
            </svg>
          </span>
        </div>
      </div>
      {/* Section 3: Sentiment */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-4">
        <SentimentGauge value={symbol.sentimentPct ?? 88} size={56} strokeWidth={5} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-text">{symbol.ticker} community is {symbol.sentimentLabel ?? 'bullish'}.</p>
          <p className="text-sm text-text-muted mt-0.5">How do you feel about {symbol.ticker} today?</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={() => setSelectedSentiment('bullish')} className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors',
            selectedSentiment === 'bullish' ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400' : 'bg-surface-muted/50 border-border text-text hover:bg-surface-muted'
          )}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            I&apos;m Bullish
          </button>
          <button type="button" onClick={() => setSelectedSentiment('bearish')} className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors',
            selectedSentiment === 'bearish' ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400' : 'bg-surface-muted/50 border-border text-text hover:bg-surface-muted'
          )}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            I&apos;m Bearish
          </button>
        </div>
      </div>
      {/* Section 4: Tabs */}
      <div className="border-t border-border">
        <div className="flex items-center justify-center pt-1">
          <button type="button" className="w-7 h-7 rounded-full bg-surface-muted border border-border flex items-center justify-center text-text-muted hover:bg-surface hover:text-text transition-colors" aria-label="Expand">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-4 pb-3 pt-1" aria-label="Symbol tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button key={tab} type="button" onClick={() => setTab(tab)} className={clsx(
                'px-2 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text'
              )}>
                {tab}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
