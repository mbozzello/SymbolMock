import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const StocktwitsLogo = () => (
  <Link to="/" className="block shrink-0" aria-label="Stocktwits">
    <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-[39px] w-auto object-contain" />
  </Link>
)
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

// Mock search results — stocks, crypto, people
const SEARCH_STOCKS = [
  { ticker: 'TSLA', name: 'Tesla Inc', pctChange: 3.64, inWatchlist: true },
  { ticker: 'AAPL', name: 'Apple Inc', pctChange: 0.29, inWatchlist: true },
  { ticker: 'NVDA', name: 'NVIDIA Corp', pctChange: 2.45, inWatchlist: false },
  { ticker: 'GME', name: 'GameStop Corp', pctChange: -1.2, inWatchlist: false },
  { ticker: 'AA', name: 'Alcoa Corp', pctChange: 1.06, inWatchlist: false },
  { ticker: 'AABB', name: 'Asia Broadband Inc', pctChange: -9.91, inWatchlist: false },
  { ticker: 'AAL', name: 'American Airlines Group Inc', pctChange: 0.5, inWatchlist: false },
]
const SEARCH_CRYPTO = [
  { ticker: 'AABBG', name: 'AABG Token', pctChange: null },
  { ticker: 'AAVE', name: 'AAVE', pctChange: -1.18 },
  { ticker: 'GHST', name: 'Aavegotchi', pctChange: -2.91 },
  { ticker: 'AAA', name: 'Moon Rabbit', pctChange: -2.38 },
]
// TSLA-related crypto (shown when user types "tsla")
const TSLA_CRYPTO = [
  { ticker: 'TSLA', name: 'TSLA6900', pctChange: null, inWatchlist: true },
  { ticker: 'TSLAX', name: 'Tesla xStock', pctChange: 5.69, inWatchlist: false },
  { ticker: 'TSLAON', name: 'Tesla (Ondo Tokenized Stock)', pctChange: 5.89, inWatchlist: false },
  { ticker: 'TSLA.D', name: 'Dinari TSLA', pctChange: null, inWatchlist: false },
]
const SEARCH_PEOPLE = [
  { handle: '0xkolten', displayName: 'Kolten', avatar: '/avatars/who-follow-1.png' },
  { handle: 'AAAple', displayName: 'This My Only Account', avatar: '/avatars/who-follow-2.png' },
]
// TSLA-related people (shown when user types "tsla")
const TSLA_PEOPLE = [
  { handle: 'TSLA_S3XY', displayName: 'J', avatar: '/avatars/top-voice-3.png' },
  { handle: 'TSLAfangirl', displayName: 'Mrs. Santos', avatar: '/avatars/who-follow-2.png' },
  { handle: 'tsla2chng', displayName: 'Trader', avatar: '/avatars/who-follow-1.png' },
]

// Mock results when user types "elon musk"
const ELON_MUSK_CRYPTO = [
  { ticker: 'MUSK', name: 'Elon Musk', pctChange: -2.29 },
  { ticker: 'FIRSTELONONSOL', name: 'ELON MUSK', pctChange: null },
]
const ELON_MUSK_PEOPLE = [
  { handle: 'Elon_Musk', displayName: 'Elon Musk', avatar: '/avatars/who-follow-1.png' },
  { handle: 'muskempire', displayName: 'Elon Musk', avatar: '/avatars/top-voice-3.png' },
  { handle: 'TheofficialElonMusk', displayName: 'Elon Musk', avatar: '/avatars/who-follow-3.png' },
  { handle: 'ElonnMusk', displayName: 'Elon Musk', avatar: '/avatars/who-follow-4.png' },
]

// Recently viewed when user taps into search without typing
const RECENTLY_VIEWED = [
  { type: 'stock', ticker: 'SLV', name: 'iShares Silver Trust', pctChange: 6.58, inWatchlist: false },
  { type: 'person', handle: 'howardlindzon', displayName: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', verified: true, following: true },
  { type: 'person', handle: 'Steeletwits', displayName: 'Michele Steele', avatar: '/avatars/michele-steele.png', verified: false, following: true },
]

const TRENDING_SEARCHES = [
  { type: 'symbol', label: '$AAPL', pctChange: -2.3, query: 'AAPL' },
  { type: 'symbol', label: '$BTC', pctChange: 2.1, query: 'BTC' },
  { type: 'symbol', label: '$TSLA', pctChange: 1.8, query: 'TSLA' },
  { type: 'symbol', label: '$NVDA', pctChange: 4.2, query: 'NVDA' },
  { type: 'person', label: '@Steeletwits', query: 'Steeletwits', avatar: '/avatars/michele-steele.png' },
  { type: 'person', label: '@howardlindzon', query: 'howardlindzon', avatar: '/avatars/howard-lindzon.png' },
  { type: 'term', label: 'elon musk', query: 'elon musk' },
  { type: 'term', label: 'tsla earnings', query: 'tsla earnings' },
  { type: 'term', label: 'fed rate cut', query: 'fed rate cut' },
]

// Profiles for "From profile" filter typeahead (e.g. typing "H" shows @howardlindzon + others)
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

export default function TopNavigation({ onSearch, darkMode, toggleDarkMode, searchQueryFromUrl, fromProfileFilter, onClearFromProfile, withTickerFilter, onClearWithTicker }) {
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl ?? '')
  const [fromProfileQuery, setFromProfileQuery] = useState('')
  const [fromProfileDropdownOpen, setFromProfileDropdownOpen] = useState(false)
  const [withTickerQuery, setWithTickerQuery] = useState('')
  const [withTickerDropdownOpen, setWithTickerDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const searchContainerRef = useRef(null)
  const fromProfileRef = useRef(null)
  const withTickerRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isNewsPage = location.pathname === '/news'
  const isEarningsPage = location.pathname === '/earnings'
  const isMarketsPage = location.pathname === '/markets'
  const isLeaderboardPage = location.pathname === '/leaderboard'
  const isHomePage = location.pathname === '/home'

  // Keep search input in sync with URL when on search page (e.g. "elon musk" stays in box)
  useEffect(() => {
    if (searchQueryFromUrl !== undefined && searchQueryFromUrl !== null) {
      setSearchQuery(searchQueryFromUrl)
    }
  }, [searchQueryFromUrl])

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

  const q = searchQuery.trim().toLowerCase()
  const isElonMuskQuery = q === 'elon musk'
  const isTslaQuery = q === 'tsla'
  const stocksFiltered = useMemo(() => {
    if (!q.length) return []
    if (q === 'aa') return SEARCH_STOCKS
    if (isElonMuskQuery) return []
    const matched = SEARCH_STOCKS.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    // Put exact ticker match first
    const exact = matched.find((s) => s.ticker.toLowerCase() === q)
    if (exact) {
      return [exact, ...matched.filter((s) => s.ticker.toLowerCase() !== q)]
    }
    return matched
  }, [q, isElonMuskQuery])
  const cryptoFiltered = useMemo(() => {
    if (!q.length) return []
    if (q === 'aa') return SEARCH_CRYPTO
    if (isTslaQuery) return TSLA_CRYPTO
    if (isElonMuskQuery) return ELON_MUSK_CRYPTO
    return SEARCH_CRYPTO.filter((c) => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
  }, [q, isElonMuskQuery, isTslaQuery])
  const peopleFiltered = useMemo(() => {
    if (!q.length) return []
    if (q === 'aa') return SEARCH_PEOPLE
    if (isTslaQuery) return TSLA_PEOPLE
    if (isElonMuskQuery) return ELON_MUSK_PEOPLE
    return SEARCH_PEOPLE.filter((p) => p.handle.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q))
  }, [q, isElonMuskQuery, isTslaQuery])
  const profileSuggestionsFiltered = useMemo(() => {
    if (!fromProfileFilter || !q.length) return []
    return PROFILE_SUGGESTIONS.filter(
      (p) =>
        p.handle.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q)
    )
  }, [fromProfileFilter, q])
  const fromProfileSuggestions = useMemo(() => {
    const pq = fromProfileQuery.trim().toLowerCase()
    if (!pq) return []
    const matched = PROFILE_SUGGESTIONS.filter(
      (p) =>
        p.handle.toLowerCase().includes(pq) ||
        p.displayName.toLowerCase().includes(pq)
    )
    const howard = matched.find((p) => p.handle === 'howardlindzon')
    const rest = matched.filter((p) => p.handle !== 'howardlindzon')
    const sorted = howard ? [howard, ...rest] : rest
    return sorted.slice(0, 5)
  }, [fromProfileQuery])
  const tq = withTickerQuery.trim().toLowerCase()
  const tickerStocksFiltered = useMemo(() => {
    if (!tq) return []
    if (tq === 'aa') return SEARCH_STOCKS
    return SEARCH_STOCKS.filter((s) => s.ticker.toLowerCase().includes(tq) || s.name.toLowerCase().includes(tq))
  }, [tq])
  const tickerCryptoFiltered = useMemo(() => {
    if (!tq) return []
    if (tq === 'aa') return SEARCH_CRYPTO
    return SEARCH_CRYPTO.filter((c) => c.ticker.toLowerCase().includes(tq) || c.name.toLowerCase().includes(tq))
  }, [tq])
  const hasResults = stocksFiltered.length > 0 || cryptoFiltered.length > 0 || peopleFiltered.length > 0
  const showDropdown = searchDropdownOpen
  const showRecentlyViewed = searchDropdownOpen && q.length === 0 && !fromProfileFilter
  const showSearchResults = searchDropdownOpen && q.length > 0 && !fromProfileFilter
  const showProfileSuggestions = searchDropdownOpen && fromProfileFilter

  useEffect(() => {
    if (!searchDropdownOpen) return
    const onMouseDown = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [searchDropdownOpen])

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

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      if (onSearch) {
        onSearch(query)
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`)
        setSearchDropdownOpen(false)
      }
    }
  }

  const navItems = ['Earnings', 'News', 'Leaderboards', 'Social Tools']

  const isSearchPage = location.pathname === '/search'
  const handleTrendingClick = (item) => {
    if (!item?.query) return
    if (item.type === 'symbol') {
      navigate('/symbol')
      setSearchDropdownOpen(false)
      return
    }
    navigate(`/search?q=${encodeURIComponent(item.query)}`)
    setSearchDropdownOpen(false)
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="flex items-center gap-4 px-4 py-2.5">
        {isHomePage && <StocktwitsLogo />}
        {/* Search + dropdown (never shown on search page; all search UI is in the page content) */}
        {isSearchPage ? (
          <div className="flex-1" />
        ) : (
        <div ref={searchContainerRef} className="flex-1 flex justify-center max-w-xl mx-auto relative">
          <form onSubmit={handleSearch} className="w-full">
            <div
              className={clsx(
                'flex items-center gap-2 rounded-lg border border-border bg-surface-muted',
                (fromProfileFilter || withTickerFilter) ? 'pl-2 pr-2 py-1 overflow-visible' : 'relative overflow-hidden'
              )}
            >
              {fromProfileFilter && (
                <div ref={fromProfileRef} className="relative flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm min-w-0">
                    <span className="font-bold text-text shrink-0">From</span>
                    <input
                      type="text"
                      value={fromProfileQuery}
                      onChange={(e) => {
                        setFromProfileQuery(e.target.value)
                        setFromProfileDropdownOpen(true)
                      }}
                      onFocus={() => setFromProfileDropdownOpen(true)}
                      placeholder="Profile"
                      className="min-w-[80px] w-24 max-w-[140px] py-0.5 px-0 bg-transparent border-0 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
                      aria-label="Search profile"
                    />
                    {onClearFromProfile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          onClearFromProfile()
                        }}
                        className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors shrink-0"
                        aria-label="Remove From Profile filter"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="15" y1="5" x2="5" y2="15" />
                          <line x1="5" y1="5" x2="15" y2="15" />
                        </svg>
                      </button>
                    )}
                  </span>
                  {fromProfileDropdownOpen && fromProfileQuery.trim().length > 0 && (
                    <div className="absolute left-0 top-full mt-1 z-[60] min-w-[200px] max-w-[280px] rounded-lg border border-border bg-white dark:bg-surface shadow-lg py-1 overflow-hidden">
                      {fromProfileSuggestions.length > 0 ? (
                        fromProfileSuggestions.map((p) => (
                          <button
                            key={p.handle}
                            type="button"
                            onClick={() => {
                              setFromProfileQuery(p.handle)
                              setFromProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-muted/80 text-left"
                          >
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-text flex items-center gap-1">
                                @{p.handle}
                                {p.verified && (
                                  <span className="inline-flex w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" aria-label="Verified">
                                    <svg className="w-full h-full p-0.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </span>
                                )}
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

              {withTickerFilter && (
                <div ref={withTickerRef} className="relative flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-surface border border-border text-sm min-w-0">
                    <span className="font-bold text-text shrink-0">With $</span>
                    <input
                      type="text"
                      value={withTickerQuery}
                      onChange={(e) => {
                        setWithTickerQuery(e.target.value.toUpperCase())
                        setWithTickerDropdownOpen(true)
                      }}
                      onFocus={() => setWithTickerDropdownOpen(true)}
                      placeholder="ticker"
                      className="min-w-[72px] w-20 max-w-[120px] py-0.5 px-0 bg-transparent border-0 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0 uppercase"
                      aria-label="Search symbol"
                    />
                    {onClearWithTicker && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          onClearWithTicker()
                        }}
                        className="p-0.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors shrink-0"
                        aria-label="Remove With $ticker filter"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="15" y1="5" x2="5" y2="15" />
                          <line x1="5" y1="5" x2="15" y2="15" />
                        </svg>
                      </button>
                    )}
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
                              <button
                                key={item.ticker}
                                type="button"
                                onClick={() => {
                                  setWithTickerQuery(item.ticker)
                                  setWithTickerDropdownOpen(false)
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-muted/80 text-left"
                              >
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                                  {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-sm text-text">{item.ticker}</div>
                                  <div className="text-xs text-text-muted truncate">{item.name}</div>
                                </div>
                                {item.pctChange != null && (
                                  <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>
                                    {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%
                                  </span>
                                )}
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
                              <button
                                key={item.ticker}
                                type="button"
                                onClick={() => {
                                  setWithTickerQuery(item.ticker)
                                  setWithTickerDropdownOpen(false)
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-muted/80 text-left"
                              >
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                                  {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-sm text-text">{item.ticker}</div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400 truncate">{item.name}</div>
                                </div>
                                {item.pctChange != null && (
                                  <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>
                                    {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="relative flex-1 min-w-0 flex items-center">
                {!fromProfileFilter && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="9" r="6" />
                      <path d="m17 17-4-4" />
                    </svg>
                  </div>
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchDropdownOpen(true)}
                  placeholder={fromProfileFilter ? 'Search' : 'Search symbols, people, or phrases'}
                  className={clsx(
                    'w-full py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-0 border-0 bg-transparent text-sm',
                    fromProfileFilter ? 'px-2' : 'pl-9 pr-4 focus:ring-2 focus:ring-primary/30 rounded-lg'
                  )}
                />
                {searchQuery && !fromProfileFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface transition-colors text-text-muted"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="15" y1="5" x2="5" y2="15" />
                      <line x1="5" y1="5" x2="15" y2="15" />
                    </svg>
                  </button>
                )}
                {fromProfileFilter && searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-md hover:bg-surface transition-colors text-text-muted shrink-0"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="15" y1="5" x2="5" y2="15" />
                      <line x1="5" y1="5" x2="15" y2="15" />
                    </svg>
                  </button>
                )}
              </div>
              {(fromProfileFilter || withTickerFilter) && (
                <div className="shrink-0 p-1.5 rounded-md text-text-muted" aria-hidden>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          </form>

          {/* Search dropdown: recently viewed (empty query) or search results */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-white dark:bg-surface shadow-lg overflow-hidden z-50 max-h-[min(70vh,420px)] overflow-y-auto">
              {showProfileSuggestions && (
                <section className="py-1">
                  {q.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-text-muted text-center">Type to search for a profile</div>
                  ) : (
                    <>
                      <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">People</h3>
                      {profileSuggestionsFiltered.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-text-muted">No profiles match</div>
                      ) : (
                        profileSuggestionsFiltered.map((p) => (
                          <button
                            key={p.handle}
                            type="button"
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left"
                          >
                            <img src={p.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-text flex items-center gap-1">
                                @{p.handle}
                                {p.verified && (
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 shrink-0" aria-label="Verified">
                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted truncate">{p.displayName}</div>
                            </div>
                            <span className={clsx('px-3 py-1.5 text-xs font-medium rounded-md border shrink-0', p.following ? 'border-border bg-surface-muted/50 text-text-muted' : 'border-border bg-white dark:bg-surface text-text')}>
                              {p.following ? 'Following' : 'Follow'}
                            </span>
                          </button>
                        ))
                      )}
                    </>
                  )}
                </section>
              )}

              {showRecentlyViewed && !showProfileSuggestions && (
                <section className="py-1">
                  <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Recently Viewed</h3>
                  {RECENTLY_VIEWED.map((item, index) => {
                    if (item.type === 'stock') {
                      const logo = getTickerLogo(item.ticker)
                      const isUp = item.pctChange != null && item.pctChange >= 0
                      return (
                        <button key={`stock-${item.ticker}`} type="button" onClick={() => { navigate('/symbol'); setSearchDropdownOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                            {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-text">{item.ticker}</div>
                            <div className="text-xs text-text-muted truncate">{item.name}</div>
                          </div>
                          {item.pctChange != null && (
                            <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>
                              ↑ +{item.pctChange.toFixed(2)}%
                            </span>
                          )}
                          <div className="w-8 h-8 rounded-full border border-border bg-surface-muted/50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-text-muted">+</span>
                          </div>
                        </button>
                      )
                    }
                    return (
                      <button key={`person-${item.handle}`} type="button" onClick={() => { navigate(`/profile/${item.handle}`); setSearchDropdownOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left">
                        <img src={item.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-text flex items-center gap-1">
                            {item.handle}
                            {item.verified && (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 shrink-0" aria-label="Verified">
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </span>
                            )}
                            {!item.verified && (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-500 shrink-0" aria-hidden>
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted truncate">{item.displayName}</div>
                        </div>
                        <span className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-surface-muted/50 text-text-muted shrink-0">Following</span>
                      </button>
                    )
                  })}
                  <div className="border-t border-border my-2" />
                  <div className="px-3 pb-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">TOP SEARCHES</div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((item) => {
                        const isSymbol = item.type === 'symbol'
                        const isUp = isSymbol && item.pctChange >= 0
                        return (
                          <button
                            key={`${item.type}-${item.label}`}
                            type="button"
                            onClick={() => handleTrendingClick(item)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted/60 px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
                          >
                            {item.type === 'person' && item.avatar ? (
                              <img src={item.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                            ) : item.type === 'symbol' && getTickerLogo(item.query) ? (
                              <img src={getTickerLogo(item.query)} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                            ) : null}
                            <span>{item.label}</span>
                            {isSymbol && item.pctChange != null && (
                              <span className={clsx('text-[11px] font-semibold', isUp ? 'text-green-600' : 'text-red-600')}>
                                {isUp ? '+' : ''}{item.pctChange.toFixed(1)}%
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}

              {showSearchResults && (
                <>
                  {/* Top row: magnifying glass + query — click to go to search results (Twitter-style) */}
                  <button
                    type="button"
                    onClick={() => {
                      const query = searchQuery.trim()
                      if (query) {
                        navigate(`/search?q=${encodeURIComponent(query)}`)
                        setSearchDropdownOpen(false)
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left border-b border-border"
                  >
                    <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="6" />
                        <path d="m17 17-4-4" />
                      </svg>
                    </div>
                    <span className="text-sm text-text">
                      {searchQuery.trim() || '...'}
                    </span>
                  </button>
                  {stocksFiltered.length > 0 && (
                <section className="py-1">
                  <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Stocks & ETFs</h3>
                  {stocksFiltered.map((item) => {
                    const logo = getTickerLogo(item.ticker)
                    const isUp = item.pctChange != null && item.pctChange >= 0
                    return (
                      <button
                        key={item.ticker}
                        type="button"
                        onClick={() => { navigate('/symbol'); setSearchDropdownOpen(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                          {logo ? (
                            <img src={logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-text">{item.ticker}</div>
                          <div className="text-xs text-text-muted truncate">{item.name}</div>
                        </div>
                        {item.pctChange != null && (
                          <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>
                            {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-full border border-border bg-transparent flex items-center justify-center shrink-0">
                          {item.inWatchlist ? (
                            <svg className="w-4 h-4 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          ) : (
                            <span className="text-sm font-medium text-text-muted">+</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </section>
              )}
              {cryptoFiltered.length > 0 && (
                <section className="py-1 border-t border-border">
                  <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Crypto</h3>
                  {cryptoFiltered.map((item) => {
                    const logo = getTickerLogo(item.ticker)
                    const isUp = item.pctChange != null && item.pctChange >= 0
                    return (
                      <button
                        key={item.ticker}
                        type="button"
                        onClick={() => { navigate('/symbol'); setSearchDropdownOpen(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center shrink-0">
                          {logo ? (
                            <img src={logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-text">{item.ticker.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-text">{item.ticker}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 truncate">{item.name}</div>
                        </div>
                        {item.pctChange != null && (
                          <span className={clsx('text-xs font-medium shrink-0', isUp ? 'text-green-600' : 'text-red-600')}>
                            {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-full border border-border bg-transparent flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-text-muted">+</span>
                        </div>
                      </button>
                    )
                  })}
                </section>
              )}
              {peopleFiltered.length > 0 && (
                <section className="py-1 border-t border-border">
                  <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">People</h3>
                  {peopleFiltered.map((item) => (
                    <button
                      key={item.handle}
                      type="button"
                      onClick={() => { navigate(`/profile/${item.handle}`); setSearchDropdownOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted/80 text-left"
                    >
                      <img src={item.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-text">{item.handle}</div>
                        <div className="text-xs text-text-muted truncate">{item.displayName}</div>
                      </div>
                      <span className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-white dark:bg-surface text-text shrink-0">
                        Follow
                      </span>
                    </button>
                  ))}
                </section>
              )}
                </>
              )}
            </div>
          )}
        </div>
        )}

        {/* Right: Nav links + moon */}
        <div className="flex items-center gap-2 shrink-0">
          {navItems.map((item) => {
            const isNews = item === 'News'
            const isEarnings = item === 'Earnings'
            const isMarkets = item === 'Social Tools'
            const isLeaderboards = item === 'Leaderboards'
            const isActive = isNews ? isNewsPage : isEarnings ? isEarningsPage : isMarkets ? isMarketsPage : isLeaderboards ? isLeaderboardPage : activeTab === item
            const content = (
              <span
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors block',
                  isActive ? 'bg-primary text-white' : 'text-text-muted hover:text-text hover:bg-surface-muted'
                )}
              >
                {item}
              </span>
            )
            if (isNews) {
              return (
                <Link key={item} to="/news" onClick={() => setActiveTab(null)}>
                  {content}
                </Link>
              )
            }
            if (isEarnings) {
              return (
                <Link key={item} to="/earnings" onClick={() => setActiveTab(null)}>
                  {content}
                </Link>
              )
            }
            if (isMarkets) {
              return (
                <Link key={item} to="/markets" onClick={() => setActiveTab(null)}>
                  {content}
                </Link>
              )
            }
            if (isLeaderboards) {
              return (
                <Link key={item} to="/leaderboard" onClick={() => setActiveTab(null)}>
                  {content}
                </Link>
              )
            }
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
              >
                {content}
              </button>
            )
          })}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-muted transition-colors text-text"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
