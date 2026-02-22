import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
const PREDICTOR_INCREMENTS = [1, 3, 4, 1, 1, 1, 3]

const CHART_RANGES = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All']
const CHART_OVERLAYS = ['Watchers', 'Sentiment', 'Message Vol']

const EXPANDED_CHART_POINTS = [
  408, 406, 410, 409, 407, 411, 413, 412, 414, 416, 415, 418, 417,
  420, 419, 421, 423, 422, 424, 421, 420, 423, 425, 427, 426, 428,
  430, 429, 431, 433, 432, 435, 434, 433.07,
]

const VOLUME_BARS = [
  3, -2, 4, -1, 2, -3, 5, -2, 1, 4, -1, 3, -2, 5, 2, -1, 4, -3, 2, 6,
  -4, 3, -2, 8, 5, -3, 7, -2, 4, 6, -1, 3, 5, 4,
]

const FUNDAMENTALS = [
  { label: 'Mkt Cap', value: '$711.19B' },
  { label: 'Volume', value: '67.11M' },
  { label: '52W High', value: '$278.98' },
  { label: '52W Low', value: '$138.80' },
  { label: 'PE Ratio', value: '58.76' },
  { label: 'Avg. Volume', value: '133.94M' },
  { label: 'EPS (Annual)', value: '$3.56' },
  { label: 'P/B', value: '10.62' },
  { label: 'Rev/Employee', value: '$678,550.33' },
  { label: 'Earnings', value: 'Jan 28', hasAlert: true },
]

function ExpandedChart({ values, volumeBars, isUp }) {
  const w = 600
  const h = 200
  const pad = { left: 10, right: 10, top: 10, bottom: 10 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const cW = w - pad.left - pad.right
  const cH = h - pad.top - pad.bottom
  const pts = values.map((v, i) => ({
    x: pad.left + (i / (values.length - 1)) * cW,
    y: pad.top + (1 - (v - min) / range) * cH,
  }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const baseY = pad.top + (1 - (values[0] - min) / range) * cH
  const last = pts[pts.length - 1]
  const color = isUp ? '#22c55e' : '#ef4444'

  const volH = 40
  const volTop = h + 8
  const maxVol = Math.max(...volumeBars.map(Math.abs))
  const barW = cW / volumeBars.length

  const timeLabels = ['12:00', '6:00', '12:00', '6:00', '12:00']

  return (
    <svg viewBox={`0 0 ${w} ${volTop + volH + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <line x1={pad.left} y1={baseY} x2={w - pad.right} y2={baseY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="5" fill="#86efac" />
      <circle cx={last.x} cy={last.y} r="8" fill={color} opacity="0.2" />

      {volumeBars.map((v, i) => {
        const bh = Math.max(2, (Math.abs(v) / maxVol) * (volH - 4))
        return (
          <rect
            key={i}
            x={pad.left + i * barW + 1}
            y={volTop + (volH - 4) - bh}
            width={Math.max(1, barW - 2)}
            height={bh}
            rx="1"
            fill={v >= 0 ? '#86efac' : '#fca5a5'}
            opacity="0.8"
          />
        )
      })}

      {timeLabels.map((label, i) => (
        <text
          key={i}
          x={pad.left + (i / (timeLabels.length - 1)) * cW}
          y={volTop + volH + 16}
          textAnchor="middle"
          fontSize="11"
          fill="#94a3b8"
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

function PredictionGauge({ value = 54, size = 36, strokeWidth = 3.5, showLabel = false }) {
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference
  const color = value >= 50 ? '#22c55e' : value >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - filled} transform={`rotate(-90 ${cx} ${cy})`} />
      {showLabel ? (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.28} fontWeight="700" fill={color}>
            {value}%
          </text>
          <text x={cx} y={cy + size * 0.2} textAnchor="middle" fontSize={size * 0.16} fontWeight="600" fill="#9ca3af">
            chance
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
          {value}%
        </text>
      )}
    </svg>
  )
}

const DEFAULT_PREDICTION = {
  question: 'Will 2 Fed Rate Cuts Happen in 2026?',
  chancePct: 26,
  expandedQuestion: 'How many Fed rate cuts in 2026?',
  options: [
    { label: '0 (0 bps)', pct: 3 },
    { label: '1 (25 bps)', pct: 8 },
    { label: '2 (50 bps)', pct: 26 },
    { label: '3 (75 bps)', pct: 55 },
    { label: '4 (100 bps)', pct: 6 },
    { label: '>5 (+125 bps)', pct: 2 },
  ],
}

export default function SymbolHeaderAbovePostBox({ symbol = DEFAULT_SYMBOL, activeTab: controlledTab, onTabChange, variant = 'sentiment', prediction = DEFAULT_PREDICTION, hideNo = false, hidePills = false, enableBetting = false, showContentPill = false, predictionLink = null, combineCarousel = false }) {
  const navigate = useNavigate()
  const { isWatched, toggleWatch } = useWatchlist()
  const [selectedSentiment, setSelectedSentiment] = useState(null)
  const [sentimentMode, setSentimentMode] = useState(variant === 'predict' ? 'prediction' : 'sentiment')
  const [predictionExpanded, setPredictionExpanded] = useState(false)
  const [predictionVotes, setPredictionVotes] = useState({})
  const [rulesModalOpen, setRulesModalOpen] = useState(false)
  const [betModal, setBetModal] = useState(null)
  const [betAmount, setBetAmount] = useState(50)
  const [betSuccess, setBetSuccess] = useState(null)
  const [placedBets, setPlacedBets] = useState(() => {
    if (predictionLink) {
      try {
        const saved = localStorage.getItem('stpred-bets-m-fed')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {}
  })

  useEffect(() => {
    if (!predictionLink) return
    const sync = () => {
      try {
        const saved = localStorage.getItem('stpred-bets-m-fed')
        if (saved) setPlacedBets(JSON.parse(saved))
        else setPlacedBets({})
      } catch {}
    }
    const onVisChange = () => { if (document.visibilityState === 'visible') sync() }
    sync()
    window.addEventListener('focus', sync)
    window.addEventListener('popstate', sync)
    window.addEventListener('storage', sync)
    document.addEventListener('visibilitychange', onVisChange)
    const interval = setInterval(sync, 1000)
    return () => { window.removeEventListener('focus', sync); window.removeEventListener('popstate', sync); window.removeEventListener('storage', sync); document.removeEventListener('visibilitychange', onVisChange); clearInterval(interval) }
  }, [predictionLink])
  const [internalTab, setInternalTab] = useState('Feed')
  const [watchersCount, setWatchersCount] = useState(() => parseWatchers(symbol.followers))
  const [floatingWatchers, setFloatingWatchers] = useState(null)
  const [predictorsCount, setPredictorsCount] = useState(10200)
  const predictorIndexRef = useRef(0)
  const [chartExpanded, setChartExpanded] = useState(false)
  const [chartRange, setChartRange] = useState('1D')
  const [chartType, setChartType] = useState('line')
  const [activeOverlays, setActiveOverlays] = useState([])
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

  useEffect(() => {
    const id = setInterval(() => {
      const increment = PREDICTOR_INCREMENTS[predictorIndexRef.current % PREDICTOR_INCREMENTS.length]
      predictorIndexRef.current += 1
      setPredictorsCount((prev) => prev + increment)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mb-1 px-4">
      {/* Row 1: Logo + Ticker/Name + Price/Change + Mini Chart */}
      <div className="flex items-start gap-4 pb-3">
        <div className="relative shrink-0">
          <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden bg-red-600 flex items-center justify-center shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{symbol.ticker.slice(0, 1)}</span>
            )}
          </div>
          {!hidePills && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-600 border-2 border-white dark:border-surface" />
            </span>
          )}
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
      {!hidePills && !combineCarousel && <div className="flex items-center gap-2 mb-2 flex-wrap">
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
      </div>}

      {/* Combined carousel: Earnings + Trending + Content pills on one line */}
      {combineCarousel && (
        <div className="flex gap-2 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full py-2 px-4 text-white text-sm font-semibold shadow-sm shrink-0"
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
            className="inline-flex items-center gap-2 rounded-full py-2 px-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors shrink-0"
          >
            <span>🔥</span>
            <span className="text-text">Trending #1</span>
            <span className="text-orange-500 font-semibold">See Why</span>
          </button>
          {/* Top Debate pill — sized to match */}
          <button
            type="button"
            onClick={() => navigate('/conversation/BearCaseKing/debate-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch shrink-0 rounded-l-full" style={{ background: 'linear-gradient(135deg,#16a34a,#dc2626)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11h2V6H3a1 1 0 00-1 1v3a1 1 0 001 1z" stroke="white" /><path d="M5 6l2.5-3a1 1 0 011.8.6V6h2.2a1 1 0 011 1.2l-.8 3.8H5V6z" stroke="white" /><path d="M21 13h-2v5h2a1 1 0 001-1v-3a1 1 0 00-1-1z" stroke="white" /><path d="M19 18l-2.5 3a1 1 0 01-1.8-.6V18h-2.2a1 1 0 01-1-1.2l.8-3.8H19v5z" stroke="white" />
              </svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/michael-bolling.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">I might just invest in a state-of-the-art AI assistant from their amazing robotics team!</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">2,312 votes</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>
          {/* Top Comment pill — sized to match */}
          <button
            type="button"
            onClick={() => navigate('/conversation/OptionsFlow/toppost-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch bg-primary shrink-0 rounded-l-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/top-voice-2.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">TESLA boasts a massive, rapidly growing cash position, with approximately $60.6 billion in total cash and cash equivalents as of late 2025, driven by immense AI data center demand. The company is experiencing a &quot;CASH GUSHER&quot; effect, with free cash flow (ttm) exceeding $53 billion. Consequently, NVIDIA is aggressively returning capital, utilizing over $37 billion in the first nine months of fiscal 2026 for share repurchases and dividends.</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">❤️ 43</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>
          {/* Poll pill — sized to match */}
          <button
            type="button"
            onClick={() => navigate('/conversation/TeslaWatcher/poll-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch shrink-0 rounded-l-full" style={{ background: '#7c3aed' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/leader-4.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">Will TSLA hit $500 by year end?</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">3,424 votes</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>
        </div>
      )}

      {/* Row 2b: Content pills — shown only on Discover (standalone, not combined) */}
      {showContentPill && !combineCarousel && (
        <div className="flex gap-2 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Top Debate pill */}
          <button
            type="button"
            onClick={() => navigate('/conversation/BearCaseKing/debate-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch shrink-0 rounded-l-full" style={{ background: 'linear-gradient(135deg,#16a34a,#dc2626)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11h2V6H3a1 1 0 00-1 1v3a1 1 0 001 1z" stroke="white" /><path d="M5 6l2.5-3a1 1 0 011.8.6V6h2.2a1 1 0 011 1.2l-.8 3.8H5V6z" stroke="white" /><path d="M21 13h-2v5h2a1 1 0 001-1v-3a1 1 0 00-1-1z" stroke="white" /><path d="M19 18l-2.5 3a1 1 0 01-1.8-.6V18h-2.2a1 1 0 01-1-1.2l.8-3.8H19v5z" stroke="white" />
              </svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/michael-bolling.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">I might just invest in a state-of-the-art AI assistant from their amazing robotics team!</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">2,312 votes</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>

          {/* Top Comment pill */}
          <button
            type="button"
            onClick={() => navigate('/conversation/OptionsFlow/toppost-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch bg-primary shrink-0 rounded-l-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/top-voice-2.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">TESLA boasts a massive, rapidly growing cash position, with approximately $60.6 billion in total cash and cash equivalents as of late 2025, driven by immense AI data center demand. The company is experiencing a &quot;CASH GUSHER&quot; effect, with free cash flow (ttm) exceeding $53 billion. Consequently, NVIDIA is aggressively returning capital, utilizing over $37 billion in the first nine months of fiscal 2026 for share repurchases and dividends.</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">❤️ 43</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>

          {/* Poll pill */}
          <button
            type="button"
            onClick={() => navigate('/conversation/TeslaWatcher/poll-1')}
            className="inline-flex items-center gap-0 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors overflow-hidden shrink-0 text-left"
            style={{ maxWidth: 420 }}
          >
            <span className="inline-flex items-center justify-center px-2.5 self-stretch shrink-0 rounded-l-full" style={{ background: '#7c3aed' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <img src="/avatars/leader-4.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ml-2.5" />
            <span className="text-sm font-medium text-text truncate px-2.5 py-2">Will TSLA hit $500 by year end?</span>
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap pr-2">3,424 votes</span>
            <span className="w-px self-stretch bg-border shrink-0" />
            <span className="px-2.5 shrink-0 text-text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          </button>
        </div>
      )}

      {/* Row 3: Watchers pill, Earnings, Mkt Cap, Vol */}
      <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border relative">
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

      {/* Row 3: Chart toggle / Expanded chart */}
      <div className="relative -mt-[14px] z-10">
        {!chartExpanded ? (
          <div className="flex items-center justify-center py-0">
            <button type="button" onClick={() => setChartExpanded(true)} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-surface text-sm font-medium text-text hover:bg-surface-muted transition-colors">
              Chart
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        ) : (
          <div className="pb-4">
            {/* Hide button */}
            <div className="flex items-center justify-center py-0 mb-2">
              <button type="button" onClick={() => setChartExpanded(false)} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-surface text-sm font-medium text-text hover:bg-surface-muted transition-colors">
                Hide
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* Overlay pills + gear */}
            <div className="flex items-center justify-between px-1 py-2">
              <div className="flex items-center gap-2">
                {CHART_OVERLAYS.map((ov) => {
                  const active = activeOverlays.includes(ov)
                  return (
                    <button
                      key={ov}
                      type="button"
                      onClick={() => setActiveOverlays((prev) => active ? prev.filter((o) => o !== ov) : [...prev, ov])}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                        active ? 'bg-text text-surface border-text' : 'bg-surface border-border text-text hover:bg-surface-muted'
                      )}
                    >
                      {ov}
                    </button>
                  )
                })}
              </div>
              <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>

            {/* Main chart + volume */}
            <div className="px-1">
              <ExpandedChart values={EXPANDED_CHART_POINTS} volumeBars={VOLUME_BARS} isUp={isUp} />
            </div>

            {/* Chart type + time range selectors */}
            <div className="flex items-center gap-3 px-1 pt-3">
              <div className="flex items-center gap-1 border border-border rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={clsx('w-8 h-8 rounded-full flex items-center justify-center transition-colors', chartType === 'line' ? 'bg-surface-muted text-text' : 'text-text-muted hover:text-text')}
                  aria-label="Line chart"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('candle')}
                  className={clsx('w-8 h-8 rounded-full flex items-center justify-center transition-colors', chartType === 'candle' ? 'bg-surface-muted text-text' : 'text-text-muted hover:text-text')}
                  aria-label="Candlestick chart"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="2" x2="8" y2="6" /><rect x="5" y="6" width="6" height="8" rx="1" /><line x1="8" y1="14" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="10" /><rect x="13" y="10" width="6" height="6" rx="1" /><line x1="16" y1="16" x2="16" y2="22" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-0.5">
                {CHART_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={clsx(
                      'px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
                      chartRange === r ? 'bg-text text-surface' : 'text-text-muted hover:text-text hover:bg-surface-muted'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Fundamentals */}
            <div className="mt-5 border-t border-border pt-4 px-1">
              <h3 className="text-base font-bold text-text mb-3">Fundamentals</h3>
              <div className="grid grid-cols-5 gap-x-4 gap-y-4">
                {FUNDAMENTALS.map((f) => (
                  <div key={f.label} className="min-w-0">
                    <p className="text-xs text-text-muted mb-0.5">{f.label}</p>
                    <p className="text-sm font-bold text-text flex items-center gap-1">
                      {f.value}
                      {f.hasAlert && (
                        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Sentiment / Prediction content */}
      <div className="border-b border-border">
        {variant === 'predict' && (
          <div className="w-full flex items-center pt-0 pb-2">
            <div
              className="relative grid w-fit grid-cols-2 items-center rounded-full bg-gray-300/95 p-0.5 overflow-hidden border border-gray-400/50"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  'absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%_-_0.125rem)] rounded-[999px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out',
                  sentimentMode === 'sentiment' ? 'translate-x-0' : 'translate-x-full'
                )}
              />
              <button
                type="button"
                onClick={() => setSentimentMode('sentiment')}
                className={clsx(
                  'relative z-10 px-3.5 py-1 text-[13px] font-semibold transition-colors duration-200',
                  sentimentMode === 'sentiment' ? 'text-black' : 'text-gray-600 hover:text-gray-800'
                )}
              >
                Sentiment
              </button>
              <button
                type="button"
                onClick={() => setSentimentMode('prediction')}
                className={clsx(
                  'relative z-10 px-3.5 py-1 text-[13px] font-semibold transition-colors duration-200',
                  sentimentMode === 'prediction' ? 'text-black' : 'text-gray-600 hover:text-gray-800'
                )}
              >
                Prediction
              </button>
            </div>
            <button
              type="button"
              className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
              aria-label="Share"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        {sentimentMode === 'sentiment' ? (
          <div className="flex flex-wrap items-center gap-3 pt-2 pb-3">
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
        ) : (
          <div className="pt-2 pb-3">
            {/* Header row: image + gauge + question + predictors + chevron */}
            <button
              type="button"
              onClick={() => predictionLink ? navigate(predictionLink) : setPredictionExpanded((v) => !v)}
              className="w-full flex items-center gap-3"
            >
              <img
                src="/images/powell-streaming.png"
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
              />
              {!predictionExpanded && <PredictionGauge value={prediction.chancePct ?? 26} size={48} strokeWidth={4} showLabel />}
              <p className="min-w-0 flex-1 text-sm font-semibold text-text leading-snug text-left">{predictionExpanded ? (prediction.expandedQuestion ?? prediction.question) : prediction.question}</p>
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <span className="text-xs font-medium text-text-muted whitespace-nowrap">{predictorsCount.toLocaleString()} predictors</span>
                {(enableBetting || predictionLink) && Object.keys(placedBets).length > 0 && !predictionExpanded && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    {Object.keys(placedBets).length} active · {Object.values(placedBets).reduce((s, b) => s + b.amount, 0).toLocaleString()} wagered · {Object.values(placedBets).reduce((s, b) => s + Number(b.potentialReturn), 0).toLocaleString()} to win
                  </span>
                )}
                {predictionExpanded && (
                  <span className="flex items-center gap-1 text-xs text-text-muted whitespace-nowrap">
                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                    Dec 31, 2026
                  </span>
                )}
              </div>
              <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-text-muted">
                {predictionLink ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg className={clsx('w-4 h-4 transition-transform', predictionExpanded && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </span>
            </button>

            {predictionExpanded && (
              <button
                type="button"
                onClick={() => setRulesModalOpen(true)}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/></svg>
                Rules
              </button>
            )}

            {/* Expanded: option rows */}
            {predictionExpanded && (
              <div className="mt-3 space-y-3">
                {(prediction.options ?? []).map((opt, i) => {
                  const vote = predictionVotes[i]
                  // Prediction market math:
                  // YES share costs P, pays $1 → return = 1/P
                  // NO share costs (1-P), pays $1 → return = 1/(1-P)
                  const p = Math.max(0.01, Math.min(0.99, opt.pct / 100))
                  const yesReturn = (1 / p).toFixed(2)
                  const noReturn = (1 / (1 - p)).toFixed(2)
                  const yesBet = placedBets[`${i}-yes`]
                  const noBet = placedBets[`${i}-no`]
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-4">
                      {enableBetting && (yesBet || noBet) ? (
                        <div className="relative">
                          <PredictionGauge value={opt.pct} size={52} strokeWidth={4.5} showLabel />
                          <img src="/avatars/howard-lindzon.png" alt="" className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-surface object-cover" />
                        </div>
                      ) : (
                        <PredictionGauge value={opt.pct} size={52} strokeWidth={4.5} showLabel />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-base font-semibold text-text block">{opt.label}</span>
                        {enableBetting && yesBet && (
                          <span className="text-[11px] text-green-600 font-medium">You Wagered {Number(yesBet.amount).toLocaleString()} To Win {Number(yesBet.potentialReturn).toLocaleString()}</span>
                        )}
                        {enableBetting && noBet && (
                          <span className="text-[11px] text-red-600 font-medium">You Wagered {Number(noBet.amount).toLocaleString()} To Win {Number(noBet.potentialReturn).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (enableBetting) {
                              setBetAmount(50)
                              setBetModal({ optionIndex: i, side: 'yes', label: opt.label, multiplier: yesReturn, pct: opt.pct })
                            } else {
                              setPredictionVotes((v) => ({ ...v, [i]: v[i] === 'yes' ? null : 'yes' }))
                            }
                          }}
                          className={clsx(
                            'flex items-center justify-center gap-2 w-[130px] py-2.5 rounded-full text-base font-bold border transition-colors',
                            (vote === 'yes' || placedBets[`${i}-yes`])
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-surface border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                          )}
                        >
                          <span>Yes</span>
                          <span className={clsx('text-xs font-medium', (vote === 'yes' || placedBets[`${i}-yes`]) ? 'text-green-100' : 'text-green-500')}>{yesReturn}x</span>
                        </button>
                        {!hideNo && (
                          <button
                            type="button"
                            onClick={() => {
                              if (enableBetting) {
                                setBetAmount(50)
                                setBetModal({ optionIndex: i, side: 'no', label: opt.label, multiplier: noReturn, pct: opt.pct })
                              } else {
                                setPredictionVotes((v) => ({ ...v, [i]: v[i] === 'no' ? null : 'no' }))
                              }
                            }}
                            className={clsx(
                              'flex items-center justify-center gap-2 w-[130px] py-2.5 rounded-full text-base font-bold border transition-colors',
                              (vote === 'no' || placedBets[`${i}-no`])
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-surface border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                            )}
                          >
                            <span>No</span>
                            <span className={clsx('text-xs font-medium', (vote === 'no' || placedBets[`${i}-no`]) ? 'text-red-100' : 'text-red-400')}>{noReturn}x</span>
                          </button>
                        )}
                      </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bet modal */}
      {betModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setBetModal(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-sm bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {!betSuccess ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-lg font-bold text-text">Place Your Prediction</h3>
                  <button type="button" onClick={() => setBetModal(null)} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <div className="px-5 py-5 space-y-5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted/50 border border-border">
                    <PredictionGauge value={betModal.pct} size={48} strokeWidth={4} showLabel />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text">{betModal.label}</div>
                      <div className={clsx('text-xs font-medium', betModal.side === 'yes' ? 'text-green-600' : 'text-red-600')}>
                        {betModal.side === 'yes' ? 'Yes' : 'No'} · {betModal.multiplier}x return
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-text">Wager Amount</label>
                      <span className="text-xs text-text-muted">Balance: {1000 - Object.values(placedBets).reduce((sum, b) => sum + b.amount, 0)} coins</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={Math.max(1, 1000 - Object.values(placedBets).reduce((sum, b) => sum + b.amount, 0))}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none bg-border accent-primary cursor-pointer"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted"></span>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, 1000 - Object.values(placedBets).reduce((sum, b) => sum + b.amount, 0))}
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.min(Math.max(1, Number(e.target.value) || 0), 1000 - Object.values(placedBets).reduce((sum, b) => sum + b.amount, 0)))}
                          className="w-24 pl-8 pr-3 py-2 text-sm font-semibold text-text rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {[10, 25, 50, 100].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setBetAmount(Math.min(q, 1000 - Object.values(placedBets).reduce((sum, b) => sum + b.amount, 0)))}
                          className={clsx(
                            'flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                            betAmount === q ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text hover:bg-surface-muted'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">Your wager</span>
                      <span className="text-sm font-bold text-text">{betAmount}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-text-muted">Potential return</span>
                      <span className="text-lg font-bold text-green-600">{(betAmount * parseFloat(betModal.multiplier)).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-muted">Profit</span>
                      <span className="text-sm font-semibold text-green-600">+{(betAmount * parseFloat(betModal.multiplier) - betAmount).toFixed(0)} coins</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const key = `${betModal.optionIndex}-${betModal.side}`
                      const existing = placedBets[key]
                      const newAmount = existing ? existing.amount + betAmount : betAmount
                      const potentialReturn = (newAmount * parseFloat(betModal.multiplier)).toFixed(0)
                      setPlacedBets((prev) => ({
                        ...prev,
                        [key]: { amount: newAmount, multiplier: betModal.multiplier, potentialReturn, side: betModal.side },
                      }))
                      setPredictionVotes((v) => ({ ...v, [betModal.optionIndex]: betModal.side }))
                      setBetSuccess({ amount: betAmount, potentialReturn, label: betModal.label, side: betModal.side, multiplier: betModal.multiplier })
                    }}
                    className={clsx(
                      'w-full py-3 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90',
                      betModal.side === 'yes' ? 'bg-green-600' : 'bg-red-600'
                    )}
                  >
                    Confirm {betModal.side === 'yes' ? 'Yes' : 'No'} · {betAmount}
                  </button>
                </div>
              </>
            ) : (
              <div className="px-5 py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 className="text-lg font-bold text-text">Prediction Placed!</h3>
                <div className="space-y-1">
                  <p className="text-sm text-text-muted">
                    You wagered <span className="font-bold text-text">{betSuccess.amount}</span> on <span className={clsx('font-bold', betSuccess.side === 'yes' ? 'text-green-600' : 'text-red-600')}>{betSuccess.side === 'yes' ? 'Yes' : 'No'}</span>
                  </p>
                  <p className="text-sm text-text-muted">
                    "{betSuccess.label}" at <span className="font-bold text-text">{betSuccess.multiplier}x</span>
                  </p>
                  <p className="text-base font-bold text-green-600 mt-2">
                    Potential return: {betSuccess.potentialReturn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setBetSuccess(null); setBetModal(null) }}
                  className="mt-2 px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules modal */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setRulesModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-lg bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-text">Rules</h2>
              <button type="button" onClick={() => setRulesModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 text-sm text-text leading-relaxed max-h-[70vh] overflow-y-auto">
              <p>This market will resolve according to the exact amount of cuts of 25 basis points in 2026 by the Fed (including any cuts made during the December meeting).</p>
              <p>Emergency rate cuts outside of scheduled FOMC meetings will also count toward the total number of cuts in 2026. This market will remain open until December 31, 2026, 11:59 PM ET, to account for any such emergency actions.</p>
              <p>For example, if the Fed cuts rates by 50 bps after a meeting, it would be considered 2 cuts (of 25 bps each).</p>
              <p>This market will resolve early to "No" if the specified number of cuts becomes impossible — i.e., if more cuts have already occurred than the strike in question.</p>
              <p>Note that cuts between 1–24 bps (inclusive) will also be considered 1 rate cut.</p>
              <p className="text-text-muted">The resolution source for this market will be FOMC statements after meetings scheduled in 2026 according to the official calendar: <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" className="text-blue-500 underline break-all" target="_blank" rel="noreferrer">federalreserve.gov/monetarypolicy/fomccalendars.htm</a>. The level and change of the target federal funds rate is also published at the official website of the Federal Reserve at <a href="https://www.federalreserve.gov/monetarypolicy/openmarket.htm" className="text-blue-500 underline break-all" target="_blank" rel="noreferrer">federalreserve.gov/monetarypolicy/openmarket.htm</a>.</p>
            </div>
          </div>
        </div>
      )}

      {/* Row 5: Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2 pt-0.5" aria-label="Symbol tabs">
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
