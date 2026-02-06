import { useState, useEffect } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import { useTickerTape } from '../contexts/TickerTapeContext.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
]

const parseNum = (s) => {
  if (typeof s === 'number') return s
  const m = String(s).match(/^([\d.]+)([KMBT])?$/)
  if (!m) return 0
  let n = parseFloat(m[1])
  const u = m[2]
  if (u === 'K') n *= 1e3
  else if (u === 'M') n *= 1e6
  else if (u === 'B') n *= 1e9
  else if (u === 'T') n *= 1e12
  return n
}

const SCREENER_ROWS_BASE = [
  { rank: 1, ticker: 'HOOD', name: 'Robinhood Market...', price: 90.25, pctChange: -9.24, volume: '59.74M', volumeNum: 59.74e6, watchers: '112.30K', watchersNum: 112300, followers: '94.20K', followersNum: 94200, sentiment: 'bearish', sentimentScore: -100, marketCap: '$89.45B', marketCapNum: 89.45e9, watched: false, type: 'equity', spark: [92, 91, 90.5, 91, 90.2, 89.8, 90, 90.25] },
  { rank: 2, ticker: 'XRP', name: 'Ripple', price: 2.34, pctChange: 8.33, volume: '5.60B', volumeNum: 5.6e9, watchers: '278.00K', watchersNum: 278000, followers: '456.00K', followersNum: 456000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$134.00B', marketCapNum: 134e9, watched: false, type: 'crypto', spark: [2.1, 2.15, 2.2, 2.25, 2.28, 2.32, 2.33, 2.34] },
  { rank: 3, ticker: 'PLTR', name: 'Palantir Technologi...', price: 158.06, pctChange: 7.77, volume: '72.81M', volumeNum: 72.81e6, watchers: '145.20K', watchersNum: 145200, followers: '89.50K', followersNum: 89500, sentiment: 'bullish', sentimentScore: 100, marketCap: '$349.39B', marketCapNum: 349.39e9, watched: false, type: 'equity', spark: [145, 148, 152, 154, 156, 157, 157.5, 158.06] },
  { rank: 4, ticker: 'DOGE', name: 'Dogecoin', price: 0.1842, pctChange: 7.22, volume: '2.10B', volumeNum: 2.1e9, watchers: '342.00K', watchersNum: 342000, followers: '890.00K', followersNum: 890000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$26.50B', marketCapNum: 26.5e9, watched: true, type: 'crypto', spark: [0.17, 0.171, 0.175, 0.178, 0.18, 0.182, 0.183, 0.1842] },
  { rank: 5, ticker: 'BTC', name: 'Bitcoin', price: 97842.50, pctChange: 2.25, volume: '45.20B', volumeNum: 45.2e9, watchers: '892.00K', watchersNum: 892000, followers: '1.25M', followersNum: 1.25e6, sentiment: 'bullish', sentimentScore: 100, marketCap: '$1.92T', marketCapNum: 1.92e12, watched: true, type: 'crypto', spark: [95500, 96000, 96500, 97000, 97200, 97600, 97800, 97842.5] },
  { rank: 6, ticker: 'ETH', name: 'Ethereum', price: 3245.80, pctChange: -2.67, volume: '18.90B', volumeNum: 18.9e9, watchers: '645.00K', watchersNum: 645000, followers: '890.00K', followersNum: 890000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$390.00B', marketCapNum: 390e9, watched: false, type: 'crypto', spark: [3320, 3300, 3280, 3260, 3255, 3248, 3246, 3245.8] },
  { rank: 7, ticker: 'TSLA', name: 'Tesla Inc', price: 248.92, pctChange: -4.76, volume: '92.30M', volumeNum: 92.3e6, watchers: '485.00K', watchersNum: 485000, followers: '620.00K', followersNum: 620000, sentiment: 'bearish', sentimentScore: -100, marketCap: '$792.00B', marketCapNum: 792e9, watched: true, type: 'equity', spark: [260, 255, 252, 250, 249, 248.5, 249, 248.92] },
  { rank: 8, ticker: 'AAPL', name: 'Apple Inc', price: 178.25, pctChange: 1.05, volume: '58.20M', volumeNum: 58.2e6, watchers: '425.00K', watchersNum: 425000, followers: '520.00K', followersNum: 520000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$2.78T', marketCapNum: 2.78e12, watched: true, type: 'equity', spark: [176, 176.5, 177, 177.5, 177.8, 178, 178.2, 178.25] },
]

const COLUMN_METRICS = [
  { id: 'rank', label: 'Rank', category: 'Core' },
  { id: 'symbol', label: 'Symbol', category: 'Core' },
  { id: 'chart', label: 'Chart', category: 'Charts' },
  { id: 'lastPrice', label: 'Last Price', category: 'Price' },
  { id: 'pctChange', label: '24h %', category: 'Price Change' },
  { id: 'volume', label: 'Volume(24h)', category: 'Volume' },
  { id: 'watchers', label: 'Watchers', category: 'Stocktwits Data' },
  { id: 'followers', label: 'Followers', category: 'Stocktwits Data' },
  { id: 'sentiment', label: 'Sentiment', category: 'Stocktwits Data' },
  { id: 'marketCap', label: 'Market Cap', category: 'Market Cap' },
  { id: 'watch', label: 'Watch', category: 'Core' },
  { id: 'messageVolume', label: 'Message Volume', category: 'Stocktwits Data' },
  { id: '1hPct', label: '1h %', category: 'Price Change' },
  { id: '7dPct', label: '7d %', category: 'Price Change' },
  { id: '30dPct', label: '30d %', category: 'Price Change' },
  { id: 'fullyDilutedMcap', label: 'Fully Diluted Mcap', category: 'Market Cap' },
  { id: 'volume7d', label: 'Volume(7d)', category: 'Volume' },
  { id: 'volume30d', label: 'Volume(30d)', category: 'Volume' },
]

const DEFAULT_VISIBLE_COLUMNS = ['rank', 'symbol', 'chart', 'lastPrice', 'pctChange', 'volume', 'watchers', 'followers', 'sentiment', 'marketCap', 'watch']
const MAX_COLUMNS = 12

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending', icon: 'trend' },
  { key: 'mostActive', label: 'Most Active', icon: null },
  { key: 'watchers', label: 'Watchers', icon: 'eye' },
  { key: 'mostBullish', label: 'Most Bullish', icon: 'thumbUp' },
  { key: 'mostBearish', label: 'Most Bearish', icon: 'thumbDown' },
  { key: 'topGainers', label: 'Top Gainers', icon: 'arrowUp' },
  { key: 'topLosers', label: 'Top Losers', icon: 'arrowDown' },
]

function MiniSparkline({ values = [] }) {
  const width = 72
  const height = 28
  const padding = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const lastUp = values[values.length - 1] >= values[0]
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7 shrink-0">
      <polyline
        fill="none"
        stroke={lastUp ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Markets() {
  const { applyCustomTickers, clearCustomTickers, customTickers } = useTickerTape()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeSection, setActiveSection] = useState('socialScreener')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [assetFilter, setAssetFilter] = useState('All')
  const [activeSort, setActiveSort] = useState('trending')
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    priceMin: '',
    priceMax: '',
    volumeMin: '',
    volumeMax: '',
    marketCapMin: '',
    marketCapMax: '',
    watchersMin: '',
    watchersMax: '',
    followersMin: '',
    followersMax: '',
    sentimentScore: 0,
  })
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [showColumnsModal, setShowColumnsModal] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  const [columnsDraft, setColumnsDraft] = useState(null)

  const toggleColumn = (id) => {
    setVisibleColumns((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      if (prev.length >= MAX_COLUMNS) return prev
      return [...prev, id]
    })
  }

  const toggleColumnDraft = (id) => {
    setColumnsDraft((prev) => {
      if (!prev) return prev
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      if (prev.length >= MAX_COLUMNS) return prev
      return [...prev, id]
    })
  }

  useEffect(() => {
    if (showColumnsModal) setColumnsDraft([...visibleColumns])
    else setColumnsDraft(null)
  }, [showColumnsModal, visibleColumns])

  const reorderColumns = (draggedId, dropTargetId) => {
    if (draggedId === 'rank' || draggedId === 'symbol' || dropTargetId === 'rank' || dropTargetId === 'symbol') return
    const fixed = visibleColumns.filter((c) => c === 'rank' || c === 'symbol')
    const draggable = visibleColumns.filter((c) => c !== 'rank' && c !== 'symbol')
    if (!draggable.includes(draggedId) || !draggable.includes(dropTargetId)) return
    const dragIdx = draggable.indexOf(draggedId)
    const dropIdx = draggable.indexOf(dropTargetId)
    const next = draggable.filter((c) => c !== draggedId)
    const adjustDrop = dragIdx < dropIdx ? dropIdx - 1 : dropIdx
    next.splice(adjustDrop, 0, draggedId)
    setVisibleColumns([...fixed, ...next])
  }

  const [dragOverCol, setDragOverCol] = useState(null)

  const sortedAndFilteredRows = (() => {
    let rows = [...SCREENER_ROWS_BASE]
    if (assetFilter === 'Equities') rows = rows.filter((r) => r.type === 'equity')
    else if (assetFilter === 'Crypto') rows = rows.filter((r) => r.type === 'crypto')
    if (symbolFilter.trim()) {
      const q = symbolFilter.trim().toLowerCase()
      rows = rows.filter((r) => r.ticker.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      if (rows.length === 0) {
        const ticker = symbolFilter.trim().toUpperCase()
        rows = [{
          rank: 322,
          ticker,
          name: `${ticker} — located`,
          price: 98.50,
          pctChange: 1.25,
          volume: '45.20M',
          volumeNum: 45.2e6,
          watchers: '125.00K',
          watchersNum: 125000,
          followers: '98.50K',
          followersNum: 98500,
          sentiment: 'neutral',
          sentimentScore: 0,
          marketCap: '$412.00B',
          marketCapNum: 412e9,
          watched: false,
          type: 'equity',
          spark: [97, 97.5, 98, 98.2, 98.5, 98.3, 98.4, 98.5],
        }]
        return rows
      }
    }
    if (appliedFilters) {
      const f = appliedFilters
      if (f.priceMin !== '') rows = rows.filter((r) => r.price >= parseFloat(f.priceMin))
      if (f.priceMax !== '') rows = rows.filter((r) => r.price <= parseFloat(f.priceMax))
      if (f.volumeMin !== '') rows = rows.filter((r) => r.volumeNum >= parseNum(f.volumeMin))
      if (f.volumeMax !== '') rows = rows.filter((r) => r.volumeNum <= parseNum(f.volumeMax))
      if (f.marketCapMin !== '') rows = rows.filter((r) => r.marketCapNum >= parseNum(f.marketCapMin))
      if (f.marketCapMax !== '') rows = rows.filter((r) => r.marketCapNum <= parseNum(f.marketCapMax))
      if (f.watchersMin !== '') rows = rows.filter((r) => r.watchersNum >= parseNum(f.watchersMin))
      if (f.watchersMax !== '') rows = rows.filter((r) => r.watchersNum <= parseNum(f.watchersMax))
      if (f.followersMin !== '') rows = rows.filter((r) => r.followersNum >= parseNum(f.followersMin))
      if (f.followersMax !== '') rows = rows.filter((r) => r.followersNum <= parseNum(f.followersMax))
      if (f.sentimentScore !== undefined && f.sentimentScore !== 0) {
        rows = rows.filter((r) =>
          f.sentimentScore > 0 ? r.sentimentScore >= f.sentimentScore : r.sentimentScore <= f.sentimentScore
        )
      }
    }
    if (activeSort === 'mostActive') rows.sort((a, b) => b.volumeNum - a.volumeNum)
    else if (activeSort === 'watchers') rows.sort((a, b) => b.watchersNum - a.watchersNum)
    else if (activeSort === 'mostBullish') rows.sort((a, b) => b.sentimentScore - a.sentimentScore)
    else if (activeSort === 'mostBearish') rows.sort((a, b) => a.sentimentScore - b.sentimentScore)
    else if (activeSort === 'topGainers') rows.sort((a, b) => b.pctChange - a.pctChange)
    else if (activeSort === 'topLosers') rows.sort((a, b) => a.pctChange - b.pctChange)
    else rows.sort((a, b) => a.rank - b.rank)
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  })()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    if (!showFiltersModal) return
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowFiltersModal(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showFiltersModal])

  useEffect(() => {
    if (!showColumnsModal) return
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowColumnsModal(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showColumnsModal])

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Markets</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={WATCHLIST}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode((p) => !p)}
      />

      <main className="lg:pl-[269px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />
        <TickerTape />

        <div className="max-w-[1400px] mx-auto px-4 py-4">
          {/* Section toggle: Social Screener | Research */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveSection('socialScreener')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'socialScreener' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Social Screener
            </button>
            <button
              onClick={() => setActiveSection('research')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'research' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Research
            </button>
          </div>

          {activeSection === 'socialScreener' && (
            <>
              {/* Top controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={symbolFilter}
                    onChange={(e) => setSymbolFilter(e.target.value)}
                    placeholder="Filter by symbol..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {['All', 'Equities', 'Crypto'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAssetFilter(opt)}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        assetFilter === opt ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-surface-muted text-text hover:bg-surface'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort toggles */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setActiveSort(opt.key)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                      activeSort === opt.key ? 'bg-primary/15 border-primary/50 text-primary' : 'bg-surface border-border text-text hover:bg-surface-muted'
                    )}
                  >
                    {opt.icon === 'trend' && (
                      <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      </svg>
                    )}
                    {opt.icon === 'eye' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                    {opt.icon === 'thumbUp' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    )}
                    {opt.icon === 'thumbDown' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                      </svg>
                    )}
                    {opt.icon === 'arrowUp' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                    {opt.icon === 'arrowDown' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnsModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Columns
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const tickers = sortedAndFilteredRows.map((r) => ({ symbol: r.ticker, change: r.pctChange }))
                    applyCustomTickers(tickers)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Apply to Navigation
                </button>
                {customTickers && customTickers.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCustomTickers}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                  >
                    Remove Custom
                  </button>
                )}
              </div>

              {/* Data table */}
              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {visibleColumns.map((colId) => {
                        const m = COLUMN_METRICS.find((c) => c.id === colId)
                        const isDraggable = colId !== 'rank' && colId !== 'symbol'
                        return m ? (
                          <th
                            key={colId}
                            className={clsx(
                              'text-left py-3 px-4 font-semibold text-text select-none',
                              isDraggable && 'cursor-grab active:cursor-grabbing',
                              isDraggable && dragOverCol === colId && 'bg-primary/10 ring-1 ring-primary/30 rounded'
                            )}
                            draggable={isDraggable}
                            onDragStart={(e) => {
                              if (!isDraggable) return
                              e.dataTransfer.setData('text/plain', colId)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            onDragOver={(e) => {
                              if (!isDraggable) return
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                              setDragOverCol(colId)
                            }}
                            onDragLeave={() => setDragOverCol(null)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setDragOverCol(null)
                              const draggedId = e.dataTransfer.getData('text/plain')
                              if (draggedId && draggedId !== colId) reorderColumns(draggedId, colId)
                            }}
                            onDragEnd={() => setDragOverCol(null)}
                          >
                            <span className="inline-flex items-center gap-1">
                              {colId === 'rank' && (
                                <>
                                  Rank
                                  <svg className="inline w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              )}
                              {colId !== 'rank' && m.label}
                              {isDraggable && (
                                <svg className="w-3.5 h-3.5 text-muted opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              )}
                            </span>
                          </th>
                        ) : null
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredRows.map((row) => (
                      <tr key={row.ticker} className="border-b border-border hover:bg-surface-muted/50 transition-colors">
                        {visibleColumns.map((colId) => {
                          if (colId === 'rank') return <td key={colId} className="py-3 px-4 text-muted">{row.rank}</td>
                          if (colId === 'symbol')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {getTickerLogo(row.ticker) ? (
                                    <img src={getTickerLogo(row.ticker)} alt="" className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-text">
                                      {row.ticker.slice(0, 1)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-text">{row.ticker}</div>
                                    <div className="text-xs text-muted">{row.name}</div>
                                  </div>
                                </div>
                              </td>
                            )
                          if (colId === 'chart')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <MiniSparkline values={row.spark} />
                              </td>
                            )
                          if (colId === 'lastPrice')
                            return (
                              <td key={colId} className="py-3 px-4 font-medium text-text tabular-nums">
                                ${row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            )
                          if (colId === 'pctChange' || colId === '1hPct' || colId === '7dPct' || colId === '30dPct')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <span className={clsx('font-bold tabular-nums', row.pctChange >= 0 ? 'text-success' : 'text-danger')}>
                                  {row.pctChange >= 0 ? '↑' : '↓'}
                                  {Math.abs(row.pctChange)}%
                                </span>
                              </td>
                            )
                          if (colId === 'volume' || colId === 'volume7d' || colId === 'volume30d')
                            return (
                              <td key={colId} className="py-3 px-4 text-muted tabular-nums">
                                {row.volume}
                              </td>
                            )
                          if (colId === 'watchers') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">{row.watchers}</td>
                          if (colId === 'followers') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">{row.followers}</td>
                          if (colId === 'messageVolume') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">—</td>
                          if (colId === 'sentiment')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <span
                                  className={clsx(
                                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    row.sentiment === 'bullish' && 'bg-success/15 text-success',
                                    row.sentiment === 'bearish' && 'bg-danger/15 text-danger',
                                    row.sentiment === 'neutral' && 'bg-surface-muted text-muted'
                                  )}
                                >
                                  {row.sentiment}
                                </span>
                              </td>
                            )
                          if (colId === 'marketCap' || colId === 'fullyDilutedMcap')
                            return (
                              <td key={colId} className="py-3 px-4 text-muted tabular-nums">
                                {row.marketCap}
                              </td>
                            )
                          if (colId === 'watch')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <button className="p-1.5 rounded-full border border-border hover:bg-surface-muted transition-colors">
                                  {row.watched ? (
                                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <span className="text-lg font-bold text-muted">+</span>
                                  )}
                                </button>
                              </td>
                            )
                          return null
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === 'research' && (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              <p className="text-sm">Research section — coming soon</p>
            </div>
          )}
        </div>
      </main>

      {/* Advanced Filters modal */}
      {showFiltersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowFiltersModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="advanced-filters-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 id="advanced-filters-title" className="text-lg font-bold text-text">Advanced Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdvancedFilters({
                      priceMin: '',
                      priceMax: '',
                      volumeMin: '',
                      volumeMax: '',
                      marketCapMin: '',
                      marketCapMax: '',
                      watchersMin: '',
                      watchersMax: '',
                      followersMin: '',
                      followersMax: '',
                      sentimentScore: 0,
                    })
                  }}
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted hover:text-text"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.priceMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, priceMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.priceMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, priceMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Volume Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.volumeMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, volumeMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.volumeMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, volumeMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Market Cap Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.marketCapMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, marketCapMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.marketCapMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, marketCapMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Watchers Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.watchersMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, watchersMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.watchersMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, watchersMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Followers Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.followersMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, followersMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.followersMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, followersMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-text">Sentiment Score</label>
                  <span className="text-xs text-muted">-100 to 100</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={advancedFilters.sentimentScore}
                  onChange={(e) => setAdvancedFilters((f) => ({ ...f, sentimentScore: parseInt(e.target.value, 10) }))}
                  className="w-full h-2 rounded-full appearance-none bg-surface-muted accent-success"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ ...advancedFilters })
                  setShowFiltersModal(false)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-success text-white hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose Columns modal */}
      {showColumnsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowColumnsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="columns-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h2 id="columns-modal-title" className="text-lg font-bold text-text">
                Choose up to {(columnsDraft ?? visibleColumns).length}/{MAX_COLUMNS} metrics
              </h2>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted hover:text-text"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="px-4 py-2 text-sm text-muted">Add, delete and sort metrics just how you need it.</p>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {['Core', 'Stocktwits Data', 'Price', 'Price Change', 'Volume', 'Market Cap', 'Charts'].map((category) => {
                const items = COLUMN_METRICS.filter((m) => m.category === category)
                if (items.length === 0) return null
                return (
                  <div key={category}>
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map((m) => {
                        const draft = columnsDraft ?? visibleColumns
                        const isSelected = draft.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleColumnDraft(m.id)}
                            className={clsx(
                              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                              isSelected
                                ? 'bg-primary/15 border-primary/50 text-primary'
                                : 'bg-surface-muted border-border text-text hover:bg-surface'
                            )}
                          >
                            {m.label}
                            {isSelected && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleColumnDraft(m.id)
                                }}
                                className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/30"
                                aria-label={`Remove ${m.label}`}
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const draft = columnsDraft ?? visibleColumns
                  setVisibleColumns([...draft])
                  setShowColumnsModal(false)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
