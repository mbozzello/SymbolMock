import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

// Same watchlist as Home so left rail matches
const WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
  { ticker: 'BRK.A', name: 'Berkshire Hathaway', price: 615000, change: 1200, spark: [30, 32, 31, 33, 35, 34, 33, 32] },
  { ticker: 'C', name: 'Citigroup', price: 68.90, change: -0.45, spark: [15, 14.8, 14.5, 14.7, 14.3, 14.6, 14.2, 14.7] },
  { ticker: 'DIS', name: 'Walt Disney Co', price: 112.40, change: 0.85, spark: [10, 10.2, 10.1, 10.3, 10.2, 10.4, 10.3, 10.0] },
  { ticker: 'ETOR', name: 'eToro', price: 8.75, change: 0.22, spark: [8, 8.2, 8.1, 8.3, 8.2, 8.4, 8.3, 8.75] },
  { ticker: 'FIG', name: 'Fortress Investment', price: 5.60, change: -0.10, spark: [5.5, 5.6, 5.55, 5.65, 5.6, 5.58, 5.62, 5.6] },
  { ticker: 'GLD', name: 'SPDR Gold Trust', price: 218.30, change: 1.45, spark: [216, 217, 216.5, 217.5, 218, 217.8, 218.2, 218.3] },
  { ticker: 'LULU', name: 'Lululemon', price: 385.00, change: 4.20, spark: [380, 381, 382, 383, 384, 383.5, 384.5, 385] },
]

const SEARCH_TABS = ['Top', 'Latest', 'People', 'Media']

// Profile typeahead (same as TopNavigation)
const PROFILE_SUGGESTIONS = [
  { handle: 'howardlindzon', displayName: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', verified: true, following: true },
  { handle: 'HenryTrades', displayName: 'Henry Chen', avatar: '/avatars/who-follow-1.png', verified: false, following: false },
  { handle: 'HollyInvestor', displayName: 'Holly Smith', avatar: '/avatars/who-follow-3.png', verified: false, following: false },
  { handle: 'HedgeFundMike', displayName: 'Mike Roberts', avatar: '/avatars/who-follow-4.png', verified: true, following: false },
  { handle: 'HayesTrader', displayName: 'Hayes Wilson', avatar: '/avatars/who-follow-1.png', verified: false, following: false },
  { handle: 'Steeletwits', displayName: 'Michele Steele', avatar: '/avatars/michele-steele.png', verified: false, following: true },
  { handle: 'MomoTrader', displayName: 'Momo Trader', avatar: '/avatars/who-follow-2.png', verified: false, following: false },
  { handle: 'TechAnalyst', displayName: 'Tech Analyst', avatar: '/avatars/who-follow-3.png', verified: false, following: false },
]

// Symbol typeahead for With $ticker (same as TopNavigation)
const TICKER_STOCKS = [
  { ticker: 'AA', name: 'Alcoa Corp', pctChange: 1.06 },
  { ticker: 'AAPL', name: 'Apple Inc', pctChange: 0.29 },
  { ticker: 'AABB', name: 'Asia Broadband Inc', pctChange: -9.91 },
  { ticker: 'AAL', name: 'American Airlines Group Inc', pctChange: 0.5 },
]
const TICKER_CRYPTO = [
  { ticker: 'AABBG', name: 'AABG Token', pctChange: null },
  { ticker: 'AAVE', name: 'AAVE', pctChange: -1.18 },
  { ticker: 'GHST', name: 'Aavegotchi', pctChange: -2.91 },
  { ticker: 'AAA', name: 'Moon Rabbit', pctChange: -2.38 },
]

// Same tags as onboarding: Top topics on symbol cards + Recent topics from people
const SEARCH_TAGS = [
  'AI',
  'Earnings',
  'Options flow',
  'Technical setup',
  'Momentum',
  'Breakouts',
  'Volume',
  'Technical',
  'Support & Resistance',
  'Options',
  'Strike Selection',
  'IV',
  'Value',
  'DCF',
  '10-K',
]

// Mock high-engagement stream messages for "elon musk" search
const SEARCH_MESSAGES = [
  { id: '1', username: 'Elon_Musk', displayName: 'Elon Musk', avatar: '/avatars/who-follow-1.png', body: 'Next generation of autonomy will make the current FSD stack look like a toy. $TSLA', time: '2h', comments: 892, reposts: 4200, likes: 24100 },
  { id: '2', username: 'TeslaDaily', displayName: 'Tesla Daily', avatar: '/avatars/who-follow-2.png', body: 'Elon on earnings call: "We are not a car company. We are an energy and AI company." The narrative shift is real.', time: '5h', comments: 312, reposts: 1800, likes: 8500 },
  { id: '3', username: 'muskempire', displayName: 'Elon Musk', avatar: '/avatars/who-follow-3.png', body: 'SpaceX and Tesla both pushing the boundary. What do you think about $TSLA at these levels?', time: '8h', comments: 445, reposts: 2100, likes: 12300 },
  { id: '4', username: 'TechInvestor', displayName: 'Tech Investor', avatar: '/avatars/who-follow-4.png', body: 'Elon Musk just tweeted about AI and robotics. $TSLA and $NVDA both moving. The man moves markets.', time: '12h', comments: 1200, reposts: 800, likes: 5600 },
  { id: '5', username: 'TheofficialElonMusk', displayName: 'Elon Musk', avatar: '/avatars/top-voice-1.png', body: 'Optimus in production next year. This will be bigger than the car business.', time: '1d', comments: 2100, reposts: 3400, likes: 18900 },
]

// Mock messages from Howard for "from profile + ticker/tag" search (all from Howard, contain symbol or tag)
const HOWARD_AVATAR = '/avatars/howard-lindzon.png'
const HOWARD_SEARCH_MESSAGES = [
  { id: 'h1', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: '$TSLA is going to tank. Target $369, stop $450. April 20, 2026.', time: '1h', comments: 124, reposts: 89, likes: 512, tags: ['Momentum'] },
  { id: 'h2', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Building conviction on $TSLA short thesis. Elon distraction factor underrated.', time: '3h', comments: 67, reposts: 42, likes: 289, tags: ['Momentum', 'Swing trading'] },
  { id: 'h3', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Watching $TSLA at these levels. Momentum fading into the close.', time: '5h', comments: 31, reposts: 18, likes: 156, tags: ['Momentum'] },
  { id: 'h4', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Bitcoin breaking out. $BTC above key level and I like the setup for a swing.', time: '8h', comments: 203, reposts: 112, likes: 890, tags: ['Swing trading'] },
  { id: 'h5', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: '$BTC and macro — Fed narrative still driving the tape. Momentum play here.', time: '12h', comments: 88, reposts: 54, likes: 421, tags: ['Momentum'] },
  { id: 'h6', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Swing trading $BTC on this dip. Risk/reward looks good.', time: '1d', comments: 45, reposts: 29, likes: 234, tags: ['Swing trading'] },
  { id: 'h7', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Momentum names getting hit. Staying patient for better entries.', time: '2d', comments: 22, reposts: 11, likes: 98, tags: ['Momentum'] },
  { id: 'h8', username: 'howardlindzon', displayName: 'Howard Lindzon', avatar: HOWARD_AVATAR, body: 'Swing trading setup on a few names. Will share when they trigger.', time: '3d', comments: 19, reposts: 8, likes: 76, tags: ['Swing trading'] },
]

function formatEngagement(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function parseTickersFromUrl(tickerParam) {
  if (!tickerParam || typeof tickerParam !== 'string') return []
  return tickerParam.split(',').map((t) => t.trim()).filter(Boolean)
}
function parseTagsFromUrl(tagsParam) {
  if (!tagsParam || typeof tagsParam !== 'string') return []
  return tagsParam.split(',').map((t) => t.trim().replace(/\+/g, ' ')).filter(Boolean)
}

export default function Search() {
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const urlFrom = searchParams.get('from') || ''
  const urlTickers = parseTickersFromUrl(searchParams.get('ticker'))
  const urlTags = parseTagsFromUrl(searchParams.get('tags'))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeTab, setActiveTab] = useState('Top')
  const [filterOpen, setFilterOpen] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [fromProfileFilter, setFromProfileFilter] = useState(!!urlFrom)
  const [withTickerFilter, setWithTickerFilter] = useState(urlTickers.length > 0)
  const [fromProfileQuery, setFromProfileQuery] = useState(urlFrom)
  const [fromProfileDropdownOpen, setFromProfileDropdownOpen] = useState(false)
  const [withTickerQuery, setWithTickerQuery] = useState(urlTickers.length ? urlTickers[0] : '')
  const [withTickerDropdownOpen, setWithTickerDropdownOpen] = useState(false)
  const [priceSincePostOpen, setPriceSincePostOpen] = useState(false)
  const [priceSincePostPct, setPriceSincePostPct] = useState('') // e.g. "5", "-10", ""
  const [selectedTags, setSelectedTags] = useState(() => (urlTags[0] ? [urlTags[0]] : []))
  const filterRef = useRef(null)
  const fromProfileRef = useRef(null)
  const withTickerRef = useRef(null)

  // Sync URL (from profile navigation) into filter UI
  useEffect(() => {
    if (urlFrom) {
      setFromProfileFilter(true)
      setFromProfileQuery(urlFrom)
    } else {
      setFromProfileFilter(false)
      setFromProfileQuery('')
    }
  }, [urlFrom])
  useEffect(() => {
    if (urlTickers.length) {
      setWithTickerFilter(true)
      setWithTickerQuery(urlTickers[0])
    } else {
      setWithTickerFilter(false)
      setWithTickerQuery('')
    }
  }, [urlTickers.join(',')])
  useEffect(() => {
    setSelectedTags(urlTags[0] ? [urlTags[0]] : [])
  }, [urlTags.join(',')])

  const clearFromProfile = () => {
    setFromProfileFilter(false)
    setFromProfileQuery('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('from')
      return next
    })
  }
  const clearWithTicker = () => {
    setWithTickerFilter(false)
    setWithTickerQuery('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('ticker')
      return next
    })
  }
  const clearWithTag = () => {
    setSelectedTags([])
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('tags')
      return next
    })
  }

  const fromProfileSuggestions = useMemo(() => {
    const pq = fromProfileQuery.trim().toLowerCase()
    if (!pq) return []
    const matched = PROFILE_SUGGESTIONS.filter(
      (p) => p.handle.toLowerCase().includes(pq) || p.displayName.toLowerCase().includes(pq)
    )
    const howard = matched.find((p) => p.handle === 'howardlindzon')
    const rest = matched.filter((p) => p.handle !== 'howardlindzon')
    return (howard ? [howard, ...rest] : rest).slice(0, 5)
  }, [fromProfileQuery])

  const isFromHoward = fromProfileQuery?.toLowerCase() === 'howardlindzon'
  const streamMessages = useMemo(() => {
    if (!isFromHoward) return SEARCH_MESSAGES
    const ticker = withTickerQuery.trim().toUpperCase()
    const tag = selectedTags[0]
    // When no ticker/tag filter, show all Howard messages; otherwise filter by ticker and/or tag
    if (!ticker && !tag) return HOWARD_SEARCH_MESSAGES
    return HOWARD_SEARCH_MESSAGES.filter((msg) => {
      const hasTicker = ticker && (msg.body.includes(`$${ticker}`) || msg.body.toUpperCase().includes(ticker))
      const hasTag = tag && (msg.tags && msg.tags.includes(tag))
      if (ticker && tag) return hasTicker || hasTag
      if (ticker) return hasTicker
      if (tag) return hasTag
      return true
    })
  }, [isFromHoward, withTickerQuery, selectedTags])

  const tq = withTickerQuery.trim().toLowerCase()
  const tickerStocksFiltered = useMemo(() => {
    if (!tq) return []
    if (tq === 'aa') return TICKER_STOCKS
    return TICKER_STOCKS.filter((s) => s.ticker.toLowerCase().includes(tq) || s.name.toLowerCase().includes(tq))
  }, [tq])
  const tickerCryptoFiltered = useMemo(() => {
    if (!tq) return []
    if (tq === 'aa') return TICKER_CRYPTO
    return TICKER_CRYPTO.filter((c) => c.ticker.toLowerCase().includes(tq) || c.name.toLowerCase().includes(tq))
  }, [tq])

  useEffect(() => {
    if (!fromProfileFilter) {
      setFromProfileQuery('')
      setFromProfileDropdownOpen(false)
    }
  }, [fromProfileFilter])
  useEffect(() => {
    if (!withTickerFilter) {
      setWithTickerQuery('')
      setWithTickerDropdownOpen(false)
    }
  }, [withTickerFilter])

  useEffect(() => {
    if (!filterOpen) return
    const onMouseDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [filterOpen])
  useEffect(() => {
    if (!fromProfileDropdownOpen) return
    const onMouseDown = (e) => {
      if (fromProfileRef.current && !fromProfileRef.current.contains(e.target)) {
        setFromProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [fromProfileDropdownOpen])
  useEffect(() => {
    if (!withTickerDropdownOpen) return
    const onMouseDown = (e) => {
      if (withTickerRef.current && !withTickerRef.current.contains(e.target)) {
        setWithTickerDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [withTickerDropdownOpen])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Search</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={WATCHLIST}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[269px]">
        <TopNavigation
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          searchQueryFromUrl={q}
          fromProfileFilter={fromProfileFilter}
          onClearFromProfile={clearFromProfile}
          withTickerFilter={withTickerFilter}
          onClearWithTicker={clearWithTicker}
        />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          {/* Middle column: search box (with filters + chips) + tabs + message stream */}
          <div className="flex-1 min-w-0">
            {/* Single search bar: filter button + filter dropdown, From Profile chip, With $ticker chip, main input */}
            <div
              ref={filterRef}
              className={clsx(
                'flex items-center gap-2 rounded-lg border border-border bg-surface-muted mb-4 overflow-visible',
                (fromProfileFilter || withTickerFilter || selectedTags.length > 0) ? 'pl-2 pr-2 py-1.5' : 'px-3 py-2'
              )}
            >
              {/* Filter button + dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  className={clsx(
                    'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                    filterOpen ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text hover:bg-surface'
                  )}
                  aria-label="Advanced search filters"
                  aria-expanded={filterOpen}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                </button>
                {filterOpen && (
                  <div className="absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-white dark:bg-surface shadow-lg py-1">
                    <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">After date</span>
                      <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
                    </button>
                    <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">Before date</span>
                      <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button type="button" onClick={() => { setFromProfileFilter(true); setFilterOpen(false) }} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">From profile...</span>
                      <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </button>
                    <button type="button" onClick={() => { setWithTickerFilter(true); setFilterOpen(false) }} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">With $ticker</span>
                      <span className="text-sm font-semibold text-text-muted shrink-0">$</span>
                    </button>
                    <button type="button" onClick={() => setPriceSincePostOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">Price Since Post</span>
                      <span className="text-sm font-semibold text-text-muted shrink-0" aria-hidden>%</span>
                    </button>
                    {priceSincePostOpen && (
                      <div className="my-1 border-t border-border pt-2 px-3 pb-2">
                        <label className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5 block">% change since post</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={priceSincePostPct}
                          onChange={(e) => setPriceSincePostPct(e.target.value.replace(/[^0-9.-]/g, ''))}
                          placeholder="e.g. 5 or -10"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Price since post % change"
                        />
                        {priceSincePostPct.trim() !== '' && (() => {
                          const num = parseFloat(priceSincePostPct)
                          if (Number.isNaN(num)) return null
                          const isPositive = num >= 0
                          const display = (num > 0 ? '+' : '') + num + '%'
                          return (
                            <div className={clsx('mt-1.5 text-sm font-semibold', isPositive ? 'text-success' : 'text-danger')}>
                              {display}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                    <button type="button" onClick={() => setTagsExpanded((e) => !e)} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80">
                      <span className="text-sm font-bold text-text">Tags</span>
                      <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                    </button>
                    {tagsExpanded && (
                      <div className="my-1 border-t border-border pt-2 px-2 pb-2 max-h-48 overflow-y-auto">
                        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Select tag</div>
                        <div className="flex flex-wrap gap-1.5">
                          {SEARCH_TAGS.map((tag) => (
                            <button key={tag} type="button" className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-muted hover:bg-surface-muted/80 text-text">{tag}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* From profile @Username chip */}
              {fromProfileFilter && (
                <div ref={fromProfileRef} className="relative shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm min-w-0">
                    <span className="font-bold text-text shrink-0">From profile</span>
                    <span className="text-text shrink-0">@</span>
                    <input
                      type="text"
                      value={fromProfileQuery}
                      onChange={(e) => { setFromProfileQuery(e.target.value); setFromProfileDropdownOpen(true) }}
                      onFocus={() => setFromProfileDropdownOpen(true)}
                      placeholder="username"
                      className="min-w-[80px] w-24 max-w-[140px] py-0.5 px-0 bg-transparent border-0 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
                      aria-label="Search profile"
                    />
                    <button type="button" onClick={clearFromProfile} className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text shrink-0" aria-label="Remove From Profile filter">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="15" y1="5" x2="5" y2="15" /><line x1="5" y1="5" x2="15" y2="15" /></svg>
                    </button>
                  </span>
                  {fromProfileDropdownOpen && fromProfileQuery.trim().length > 0 && (
                    <div className="absolute left-0 top-full mt-1 z-[60] min-w-[200px] max-w-[280px] rounded-lg border border-border bg-white dark:bg-surface shadow-lg py-1 overflow-hidden">
                      {fromProfileSuggestions.length > 0 ? (
                        fromProfileSuggestions.map((p) => (
                          <button key={p.handle} type="button" onClick={() => { setFromProfileQuery(p.handle); setFromProfileDropdownOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-muted/80 text-left">
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-text flex items-center gap-1">
                                @{p.handle}
                                {p.verified && <span className="inline-flex w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" aria-label="Verified"><svg className="w-full h-full p-0.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
                              </div>
                              <div className="text-xs text-text-muted truncate">{p.displayName}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-text-muted">No profiles match</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* With $ticker chip */}
              {withTickerFilter && (
                <div ref={withTickerRef} className="relative shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm min-w-0">
                    <span className="font-bold text-text shrink-0">With $ticker</span>
                    <input
                      type="text"
                      value={withTickerQuery}
                      onChange={(e) => {
                      const raw = e.target.value.toUpperCase()
                      const single = raw.includes(',') ? raw.split(',')[0].trim() : raw
                      setWithTickerQuery(single)
                      setWithTickerDropdownOpen(true)
                    }}
                      onFocus={() => setWithTickerDropdownOpen(true)}
                      placeholder="ticker"
                      className="min-w-[72px] w-20 max-w-[120px] py-0.5 px-0 bg-transparent border-0 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0 uppercase"
                      aria-label="Search symbol"
                    />
                    <button type="button" onClick={clearWithTicker} className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text shrink-0" aria-label="Remove With $ticker filter">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="15" y1="5" x2="5" y2="15" /><line x1="5" y1="5" x2="15" y2="15" /></svg>
                    </button>
                  </span>
                  {withTickerDropdownOpen && withTickerQuery.trim().length > 0 && (tickerStocksFiltered.length > 0 || tickerCryptoFiltered.length > 0) && (
                    <div className="absolute left-0 top-full mt-1 z-[60] min-w-[240px] max-w-[320px] rounded-lg border border-border bg-white dark:bg-surface shadow-lg py-1 overflow-hidden max-h-[min(50vh,320px)] overflow-y-auto">
                      {tickerStocksFiltered.length > 0 && (
                        <section className="py-0.5">
                          <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Stocks & ETFs</h3>
                          {tickerStocksFiltered.map((item) => {
                            const logo = getTickerLogo(item.ticker)
                            const isUp = item.pctChange != null && item.pctChange >= 0
                            return (
                              <button key={item.ticker} type="button" onClick={() => { setWithTickerQuery(item.ticker); setWithTickerDropdownOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-muted/80 text-left">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                                  {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-sm text-text">{item.ticker}</div>
                                  <div className="text-xs text-text-muted truncate">{item.name}</div>
                                </div>
                                {item.pctChange != null && <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>{isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%</span>}
                              </button>
                            )
                          })}
                        </section>
                      )}
                      {tickerCryptoFiltered.length > 0 && (
                        <section className="py-0.5 border-t border-border">
                          <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Crypto</h3>
                          {tickerCryptoFiltered.map((item) => {
                            const logo = getTickerLogo(item.ticker)
                            const isUp = item.pctChange != null && item.pctChange >= 0
                            return (
                              <button key={item.ticker} type="button" onClick={() => { setWithTickerQuery(item.ticker); setWithTickerDropdownOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-muted/80 text-left">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                                  {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-sm text-text">{item.ticker}</div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400 truncate">{item.name}</div>
                                </div>
                                {item.pctChange != null && <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>{isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%</span>}
                              </button>
                            )
                          })}
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* With tag chip */}
              {selectedTags.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm shrink-0">
                  <span className="font-bold text-text shrink-0">With tag</span>
                  <span className="text-text">{selectedTags[0]}</span>
                  <button type="button" onClick={clearWithTag} className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text shrink-0" aria-label="Remove With tag filter">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="15" y1="5" x2="5" y2="15" /><line x1="5" y1="5" x2="15" y2="15" /></svg>
                  </button>
                </span>
              )}

              {/* Price since post chip (when value is set) */}
              {priceSincePostPct.trim() !== '' && !Number.isNaN(parseFloat(priceSincePostPct)) && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm shrink-0">
                  <span className="font-bold text-text shrink-0">Price since post</span>
                  <span className={clsx('font-semibold shrink-0', parseFloat(priceSincePostPct) >= 0 ? 'text-success' : 'text-danger')}>
                    {(parseFloat(priceSincePostPct) >= 0 ? '+' : '') + parseFloat(priceSincePostPct) + '%'}
                  </span>
                  <button type="button" onClick={() => setPriceSincePostPct('')} className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text shrink-0" aria-label="Remove Price since post filter">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="15" y1="5" x2="5" y2="15" /><line x1="5" y1="5" x2="15" y2="15" /></svg>
                  </button>
                </span>
              )}

              {/* Main search input */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6" />
                  <path d="m17 17-4-4" />
                </svg>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), q: e.target.value || undefined }))}
                  placeholder="Search symbols, people, or phrases"
                  className="flex-1 min-w-0 py-1.5 bg-transparent border-0 text-text placeholder:text-text-muted focus:outline-none focus:ring-0 text-sm"
                  aria-label="Search"
                />
                {q && (
                  <button type="button" onClick={() => setSearchParams((prev) => { const o = Object.fromEntries(prev); delete o.q; return o; })} className="p-1 rounded-md hover:bg-surface text-text-muted" aria-label="Clear search">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="15" y1="5" x2="5" y2="15" /><line x1="5" y1="5" x2="15" y2="15" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs only: Top | Latest | People | Media */}
            <nav className="flex border-b border-border mb-4" aria-label="Search results tabs">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab ? 'text-text border-primary' : 'text-text-muted border-transparent hover:text-text'
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* Message stream (Top / Latest show messages; People/Media could show different content later) */}
            {(activeTab === 'Top' || activeTab === 'Latest') && (
              <div className="divide-y divide-border">
                {streamMessages.map((msg) => (
                  <article key={msg.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={msg.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text">{msg.username}</span>
                          <span className="text-xs text-text-muted">{msg.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-text leading-snug whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {formatEngagement(msg.comments)}
                          </button>
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {formatEngagement(msg.reposts)}
                          </button>
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {formatEngagement(msg.likes)}
                          </button>
                          <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(msg)}
                            className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')}
                            aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}
                          >
                            <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'People' && (
              <div className="py-8 text-center text-text-muted text-sm">
                People results for &quot;{q}&quot;
              </div>
            )}

            {activeTab === 'Media' && (
              <div className="py-8 text-center text-text-muted text-sm">
                Media results for &quot;{q}&quot;
              </div>
            )}
          </div>

          {/* Right rail: same as Home */}
          <aside className="w-[280px] shrink-0 hidden lg:block space-y-6">
            <RelatedSymbols />
            <PredictionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  )
}
