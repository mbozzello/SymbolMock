import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import TickerLinkedText from '../components/TickerLinkedText.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
]

const HOWARD_PROFILE = {
  username: 'howardlindzon',
  displayName: 'Howard Lindzon',
  avatar: '/avatars/howard-lindzon.png',
  verified: true,
  inPredictions: true,
  followsYou: true,
  following: true,
  bio: 'Co-Founder and CEO Stocktwits, Founder of Wallstrip (Acquired by CBS); Managing Partner of Social Leverage and an angel investor in Robinhood, Etoro, Koyfin, YCharts, Alpaca. Canadian - born and raised in Toronto.',
  tags: ['Strategy', 'Equities', 'Private Companies', 'Momentum', 'Intermediate'],
  location: 'Coronado, CA',
  website: 'http://www.howardlindzon.com',
  joinedDate: 'Jul 2009',
  followingCount: '2.2k',
  followersCount: '376.2k',
  watchlistCount: 253,
  hasEdgeBadge: true,
  sentiment: {
    '30d': { pct: 75, direction: 'bullish', label: 'Extremely Bullish' },
    '90d': { pct: 45, direction: 'bearish', label: 'Bearish' },
  },
  tickerMentions: {
    '30d': [
      { ticker: 'TSLA', count: 28 },
      { ticker: 'BTC', count: 22 },
      { ticker: 'HOOD', count: 15 },
      { ticker: 'MSFT', count: 12 },
      { ticker: 'NVDA', count: 9 },
    ],
    '90d': [
      { ticker: 'BTC', count: 54 },
      { ticker: 'TSLA', count: 67 },
      { ticker: 'HOOD', count: 41 },
      { ticker: 'RKLB', count: 33 },
      { ticker: 'MSFT', count: 29 },
      { ticker: 'AMZN', count: 24 },
    ],
  },
  frequentTags: ['Momentum', 'Swing trading'],
  predictionRank: { rank: 3, total: 66000 },
  predictionStreak: 16,
  predictionWinRate: 72,
  predictionROI: 82.98,
  marketPredictionRank: { rank: 34, total: 155000 },
  marketPredictionStreak: 14,
  marketPredictionWinRate: 88,
  marketPredictionROI: 68.2,
  latestWatchlistActivity: [
    { type: 'added', ticker: 'TSLA', time: '2h ago' },
    { type: 'removed', ticker: 'NVDA', time: '1d ago' },
    { type: 'added', ticker: 'AAPL', time: '3d ago' },
    { type: 'added', ticker: 'BTC', time: '5d ago' },
    { type: 'removed', ticker: 'GME', time: '1w ago' },
  ],
  sectorFocus: [
    { name: 'Technology', pct: 32 },
    { name: 'Financials', pct: 18 },
    { name: 'Crypto', pct: 16 },
    { name: 'Communications', pct: 14 },
    { name: 'Health Care', pct: 10 },
    { name: 'Energy', pct: 8 },
    { name: 'Other', pct: 2 },
  ],
}

const HOWARD_PRIVATE_JOURNAL = [
  { id: 1, time: 'Yesterday 9:42 PM', body: 'Notes from the Robinhood board call. Valuation discussion getting interesting. Need to revisit position sizing before next earnings.' },
  { id: 2, time: 'Yesterday 2:15 PM', body: 'Had a great conversation with the Etoro team. European expansion could be a bigger catalyst than expected. Adding to watchlist.' },
  { id: 3, time: 'Jan 14, 11:20 AM', body: 'Building conviction on $TSLA short thesis. Elon distraction factor underrated. Setting alerts at $450 for stop and $369 target.' },
  { id: 4, time: 'Jan 13, 6:55 PM', body: 'Space sector deep dive. RKLB and ASTS both have interesting risk/reward. May trim one and add to the other this week.' },
  { id: 5, time: 'Jan 12, 4:30 PM', body: 'Koyfin dashboard update - their new API integrations are impressive. Could see institutional adoption pickup in Q2.' },
  { id: 6, time: 'Jan 11, 9:10 AM', body: 'Fed meeting prep. Rate cut expectations might be overdone. Positioning for a surprise hawkish hold.' },
  { id: 7, time: 'Jan 10, 8:22 PM', body: 'Re-reading some of the old Wallstrip thesis. Distribution vs content - some things never change. Good reminder for current portfolio.' },
]

function LockIcon({ className = 'w-4 h-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function EyeOpenIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeClosedIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

function ActivityCardWrapper({ cardId, children, isOwnProfile, isHidden, onToggle }) {
  return (
    <div className="relative flex-shrink-0">
      {isOwnProfile && (
        <button
          type="button"
          onClick={() => onToggle(cardId)}
          className="absolute top-2 right-2 z-10 p-1 rounded text-text-muted hover:text-text hover:bg-black/5 transition-colors"
          aria-label={isHidden ? 'Show on profile' : 'Hide from profile'}
          title={isHidden ? 'Show on profile' : 'Hide from profile'}
        >
          {isHidden ? <EyeClosedIcon className="w-4 h-4" /> : <EyeOpenIcon className="w-4 h-4" />}
        </button>
      )}
      {children}
    </div>
  )
}

function InfoIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ConsolidatedPredictionBox({ price, market, username, isOwnProfile, isHidden, onToggleVisibility }) {
  const canToggle = isOwnProfile && username === 'howardlindzon'

  const headerRow = (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 17l5-5 5 5M12 17l5-5 5 5" />
          <path d="M12 2v8M9 6l3-3 3 3" />
        </svg>
        <span className="text-sm font-semibold text-white">Elite Trader</span>
      </div>
      <div className="flex items-center gap-1.5">
        {canToggle && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isHidden ? 'Show prediction stats' : 'Hide prediction stats'}
          >
            {isHidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        )}
        <span className="p-1 text-white/80" aria-hidden><InfoIcon /></span>
      </div>
    </div>
  )

  if (isHidden) {
    if (!canToggle) return null
    return (
      <div className="mt-3 rounded-xl px-3 py-2.5 w-[76%] flex items-center justify-between" style={{ backgroundColor: '#31274F' }}>
        <span className="text-xs text-white/70">Prediction stats hidden</span>
        <button
          type="button"
          onClick={onToggleVisibility}
          className="flex items-center gap-1.5 p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Show prediction stats"
        >
          <EyeClosedIcon />
          <InfoIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl px-3 py-2.5 w-[76%]" style={{ backgroundColor: '#31274F' }}>
      {headerRow}
      <div className="space-y-2 text-[11px] text-white/90">
        {price && (
          <div className="flex items-center justify-between">
            <span className="text-white/70">Price Targets</span>
            <span>#{price.rank}/{price.total?.toLocaleString() ?? '—'} · <span className="text-green-500 font-medium">+{price.roi}%</span> · {price.winRate}% win · 🔥{price.streak}</span>
          </div>
        )}
        {market && (
          <div className="flex items-center justify-between">
            <span className="text-white/70">Market Events</span>
            <span>#{market.rank}/{market.total?.toLocaleString() ?? '—'} · <span className="text-green-500 font-medium">+{market.roi}%</span> · {market.winRate}% win · 🔥{market.streak}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SentimentCircle({ pct, direction, size = 36 }) {
  const isBullish = direction === 'bullish'
  const strokeColor = isBullish ? 'var(--color-success)' : 'var(--color-danger)'
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference
  const textColor = isBullish ? 'text-success' : 'text-danger'
  const textSize = size >= 48 ? 'text-xs' : 'text-[10px]'
  return (
    <div className="relative shrink-0 inline-flex items-center justify-center">
      <svg width={size} height={size} className="shrink-0" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className={clsx('absolute font-bold tabular-nums', textSize, textColor)}
      >
        {pct}%
      </span>
    </div>
  )
}

const HOWARD_POSTS = [
  { id: 1, time: '7:29 PM', body: 'Big day for $BTC and the crew. The infrastructure narrative is back.', comments: 9, reposts: 1, likes: 36 },
  { id: 2, time: '6:18 PM', body: 'Watching $MSFT and $HOOD closely. Earnings season is always interesting.', comments: 1, reposts: 1, likes: 6 },
  { id: 3, time: '4:45 PM', body: 'The $IGV and $RBLX combo continues to impress. Momentum play.', comments: 1, reposts: 0, likes: 11 },
  { id: 4, time: '3:22 PM', body: '$BMNR making moves. Keep an eye on volume.', comments: 0, reposts: 0, likes: 5 },
  { id: 5, time: '1:15 PM', body: '$AMZN and the retail sector. What a quarter.', comments: 2, reposts: 1, likes: 10 },
  {
    id: 6,
    time: '11:42 AM',
    body: 'Claude Code is the Inflection Point',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
    linkLabel: 'Claude.ai',
    comments: 4,
    reposts: 2,
    likes: 24,
  },
]

const RANKS_VISIBILITY_KEY = (u) => `profile_ranks_visibility_${u}`
const PREDICTION_STATS_HIDDEN_KEY = (u) => `profile_prediction_stats_hidden_${u}`
const ACTIVITY_CARDS_HIDDEN_KEY = (u) => `profile_activity_cards_hidden_${u}`

const ACTIVITY_CARD_IDS = {
  AI_SUMMARY: 'ai-summary',
  WATCHLIST_ACTIVITY: 'watchlist-activity',
  TOP_MENTIONS: 'top-mentions',
  SECTOR_FOCUS: 'sector-focus',
  POST_SENTIMENT: 'post-sentiment',
}

const AI_SUMMARY_FULL = "Howard's been posting like an active trader in \"risk-off, rotation\" mode: he's watching broad market action ($SPY/$QQQ) while calling out rising volatility and a shaky tape, then selectively nibbling at beaten-down software/SaaS names (especially $SHOP, plus $IGV/$ADBE) as they get \"thrown out with the bathwater.\" At the same time, he's treating crypto as a harsher, late-cycle shakeout (\"crypto winter,\" riff raff leaving) and taking quicker swings/partials in things like $BTC/$MSTR and $HOOD, while keeping an eye on hard assets/hedges (gold/silver/energy, $GLD/$SLV/$XLE) as uncertainty picks up. He's also clearly focused on AI's real impact—sharing reads on Anthropic/Claude and how AI is shifting data/software moats—mixed with his usual irreverent humor and sharp takes on market narratives, promoters, and the current political noise."

function AISummaryCard() {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const cardRef = useRef(null)
  const timeoutRef = useRef(null)
  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setCoords({ top: rect.top - 4, left: rect.left, width: rect.width })
    }
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])
  const popup = open && createPortal(
    <div
      className="fixed z-[100] min-w-[320px] max-w-[420px] max-h-[min(80vh,520px)] rounded-xl border border-border bg-white dark:bg-surface shadow-xl overflow-hidden"
      style={{ top: coords.top, left: coords.left, transform: 'translateY(-100%)' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="p-4 overflow-y-auto max-h-[min(80vh,520px)]">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">AI Summary — Last 30 Days</div>
        <p className="text-sm text-text leading-relaxed">
          {AI_SUMMARY_FULL}
        </p>
      </div>
    </div>,
    document.body
  )
  return (
    <>
      <div
        ref={cardRef}
        className="relative inline-block flex-shrink-0"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="w-[200px] min-w-[200px] rounded-xl border border-border bg-surface-muted/30 p-2.5 flex flex-col aspect-[10/9] cursor-pointer">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">AI Summary</div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <p className="text-[11px] text-text leading-[1.4] line-clamp-8">
              {AI_SUMMARY_FULL}
            </p>
          </div>
        </div>
      </div>
      {popup}
    </>
  )
}

function getRanksVisibleToOthers(username) {
  if (typeof window === 'undefined') return true
  return (localStorage.getItem(RANKS_VISIBILITY_KEY(username)) || 'public') !== 'private'
}

export default function Profile({ isOwnProfile = false }) {
  const { watchlist } = useWatchlist()
  const { username } = useParams()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeTab, setActiveTab] = useState('Posts')
  const [postSortFilter, setPostSortFilter] = useState('recent') // 'recent' | 'mostLiked' | 'mostReplies'
  const [showPostFilterDropdown, setShowPostFilterDropdown] = useState(false)
  const postFilterRef = useRef(null)
  const [isFollowing, setIsFollowing] = useState(HOWARD_PROFILE.following)
  const [ranksVisibility, setRanksVisibility] = useState('public')
  const [predictionStatsHidden, setPredictionStatsHidden] = useState(() => {
    if (typeof window === 'undefined' || !username) return false
    return localStorage.getItem(PREDICTION_STATS_HIDDEN_KEY(username)) === 'true'
  })
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [activityInfoModalOpen, setActivityInfoModalOpen] = useState(false)
  const [activityCardsHidden, setActivityCardsHidden] = useState(() => {
    if (typeof window === 'undefined' || !username) return []
    try {
      const raw = localStorage.getItem(ACTIVITY_CARDS_HIDDEN_KEY(username))
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const profile = username === 'howardlindzon' ? HOWARD_PROFILE : null
  const rawPosts = username === 'howardlindzon' ? HOWARD_POSTS : []
  const posts = [...rawPosts].sort((a, b) => {
    if (postSortFilter === 'mostLiked') return b.likes - a.likes
    if (postSortFilter === 'mostReplies') return b.comments - a.comments
    return 0 // 'recent' keeps original order
  })

  useEffect(() => {
    if (!showPostFilterDropdown) return
    const onClickOutside = (e) => {
      if (postFilterRef.current && !postFilterRef.current.contains(e.target)) setShowPostFilterDropdown(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showPostFilterDropdown])

  useEffect(() => {
    if (username && typeof window !== 'undefined') {
      setRanksVisibility(localStorage.getItem(RANKS_VISIBILITY_KEY(username)) || 'public')
      setPredictionStatsHidden(localStorage.getItem(PREDICTION_STATS_HIDDEN_KEY(username)) === 'true')
      try {
        const raw = localStorage.getItem(ACTIVITY_CARDS_HIDDEN_KEY(username))
        setActivityCardsHidden(raw ? JSON.parse(raw) : [])
      } catch { setActivityCardsHidden([]) }
    }
  }, [username])

  const setRanksVisibilityAndStore = (value) => {
    setRanksVisibility(value)
    if (username && typeof window !== 'undefined') {
      localStorage.setItem(RANKS_VISIBILITY_KEY(username), value)
    }
  }

  const toggleActivityCardVisibility = (cardId) => {
    setActivityCardsHidden((prev) => {
      const next = prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      if (username && typeof window !== 'undefined') {
        localStorage.setItem(ACTIVITY_CARDS_HIDDEN_KEY(username), JSON.stringify(next))
      }
      return next
    })
  }

  const togglePredictionStatsVisibility = () => {
    setPredictionStatsHidden((prev) => {
      const next = !prev
      if (username && typeof window !== 'undefined') {
        localStorage.setItem(PREDICTION_STATS_HIDDEN_KEY(username), String(next))
      }
      return next
    })
  }

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

  const goToSearchWithProfileFilters = () => {
    const tickers = []
    if (profile.tickerMentions?.['30d']?.[0]) tickers.push(profile.tickerMentions['30d'][0].ticker)
    if (profile.tickerMentions?.['90d']?.[0]) tickers.push(profile.tickerMentions['90d'][0].ticker)
    const tags = (profile.frequentTags || []).slice(0, 2)
    const params = new URLSearchParams()
    params.set('from', profile.username)
    if (tickers[0]) params.set('q', tickers[0])
    if (tickers.length) params.set('ticker', [...new Set(tickers)].join(','))
    if (tags.length) params.set('tags', tags.map((t) => t.replace(/\s/g, '+')).join(','))
    navigate(`/search?${params.toString()}`)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-muted">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">{profile.displayName}</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[300px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          {/* Middle column: Profile */}
          <div className="flex-1 min-w-0">
            {/* Profile header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-40 h-40 rounded-full object-cover border border-border"
                  />
                  {profile.hasEdgeBadge && (
                    <span
                      className="absolute -bottom-0.5 -left-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-amber-500 text-black"
                      title="EDGE"
                    >
                      EDGE
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-text">{profile.username}</span>
                    {profile.verified && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 shrink-0"
                        aria-label="Verified"
                      >
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    {profile.inPredictions && (isOwnProfile || !predictionStatsHidden) && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 shrink-0"
                        aria-label="Participates in predictions"
                        title="Participates in predictions"
                      >
                        <svg className="w-3 h-3 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 21h8M12 17v4M7 4h10v4c0 3.5-2.5 6-6 6s-4-2.5-4-6V4z" />
                          <path d="M7 4V2h10v2" />
                          <path d="M12 17c-3 0-5-2-5-5v-2h10v2c0 3-2 5-5 5z" />
                          <path d="M5 10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
                          <path d="M19 10h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-text">{profile.displayName}</span>
                    {profile.followsYou && (
                      <span className="text-xs text-muted">Follows You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsFollowing((v) => !v)}
                      className={clsx(
                        'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                        isFollowing
                          ? 'border border-border bg-surface text-text hover:bg-danger/10 hover:border-danger hover:text-danger'
                          : 'bg-primary text-white hover:opacity-90'
                      )}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      type="button"
                      className="relative p-2 rounded-full border border-border hover:bg-surface-muted transition-colors"
                      aria-label="Alerts"
                    >
                      <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-3 h-3 rounded-full bg-surface-muted border border-border">
                        <svg className="w-2 h-2 text-text" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path d="M12 4v16m8-8H4" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full border border-border hover:bg-surface-muted transition-colors"
                      aria-label="Message"
                    >
                      <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/search?from=${encodeURIComponent(profile.username)}`)}
                      className="p-2 rounded-full border border-border hover:bg-surface-muted transition-colors"
                      aria-label="Search posts from this user"
                    >
                      <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full border border-border hover:bg-surface-muted transition-colors"
                      aria-label="Share"
                    >
                      <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full border border-border hover:bg-surface-muted transition-colors"
                      aria-label="More options"
                    >
                      <svg className="w-5 h-5 text-text" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </button>
                  </div>
                  {profile.inPredictions && (profile.predictionRank || profile.marketPredictionRank) && (
                    <ConsolidatedPredictionBox
                      price={profile.predictionRank ? {
                        rank: profile.predictionRank.rank,
                        total: profile.predictionRank.total,
                        roi: profile.predictionROI ?? 0,
                        winRate: profile.predictionWinRate ?? 0,
                        streak: profile.predictionStreak ?? 0,
                      } : null}
                      market={profile.marketPredictionRank ? {
                        rank: profile.marketPredictionRank.rank,
                        total: profile.marketPredictionRank.total,
                        roi: profile.marketPredictionROI ?? 0,
                        winRate: profile.marketPredictionWinRate ?? 0,
                        streak: profile.marketPredictionStreak ?? 0,
                      } : null}
                      username={username}
                      isOwnProfile={isOwnProfile}
                      isHidden={predictionStatsHidden}
                      onToggleVisibility={togglePredictionStatsVisibility}
                    />
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm text-text leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {profile.tags[0] === 'Strategy' ? (
                  <>
                    <span className="text-xs font-medium text-text-muted">Strategy:</span>
                    {profile.tags.slice(1).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-text border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                ) : (
                  profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-text border border-border"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location}
                </span>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {profile.website}
                </a>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {profile.joinedDate}
                </span>
                <span className="flex items-center gap-2">
                  <a href="#" className="text-text-muted hover:text-text transition-colors" aria-label="YouTube" title="YouTube">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a href="#" className="text-text-muted hover:text-text transition-colors" aria-label="Instagram" title="Instagram">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" className="text-text-muted hover:text-text transition-colors" aria-label="X" title="X">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </span>
              </div>

              <div className="flex gap-6 mt-3 text-sm">
                <span><span className="font-semibold text-text">{profile.followingCount}</span> Following</span>
                <span><span className="font-semibold text-text">{profile.followersCount}</span> Followers</span>
              </div>

              {(() => {
                const cardConfigs = [
                  { id: ACTIVITY_CARD_IDS.AI_SUMMARY, hasData: true, render: () => <AISummaryCard /> },
                  { id: ACTIVITY_CARD_IDS.WATCHLIST_ACTIVITY, hasData: profile.latestWatchlistActivity?.length > 0, render: () => (
                    <div className="w-[200px] min-w-[200px] rounded-xl border border-border bg-surface-muted/30 p-2.5 flex flex-col aspect-[10/9] flex-1 min-h-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Watchlist Activity</div>
                      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                        {profile.latestWatchlistActivity.slice(0, 6).map((entry, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs min-w-0">
                            {getTickerLogo(entry.ticker) ? (
                              <img src={getTickerLogo(entry.ticker)} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            ) : (
                              <span className="w-6 h-6 rounded bg-surface flex items-center justify-center text-[10px] font-bold text-text shrink-0">{entry.ticker[0]}</span>
                            )}
                            <span className="font-semibold text-text truncate text-sm">${entry.ticker}</span>
                            <span className={clsx('shrink-0 text-xs font-medium', entry.type === 'added' ? 'text-success' : 'text-danger')} title={entry.type === 'added' ? 'Added' : 'Removed'}>{entry.type === 'added' ? '+' : '−'}</span>
                            <span className="text-text-muted shrink-0 ml-auto text-xs">{entry.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )},
                  { id: ACTIVITY_CARD_IDS.TOP_MENTIONS, hasData: !!profile.tickerMentions, render: () => (
                    <div className="w-[200px] min-w-[200px] rounded-xl border border-border bg-surface-muted/30 p-2.5 flex flex-col aspect-[10/9] flex-1 min-h-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Top Mentions</div>
                      <div className="flex-1 min-h-0 flex flex-col gap-2">
                        <div>
                          <div className="text-[9px] font-medium text-text-muted mb-0.5">30 days</div>
                          <div className="flex flex-wrap gap-1">
                            {profile.tickerMentions['30d'].slice(0, 3).map((item) => (
                              <button key={item.ticker} type="button" onClick={goToSearchWithProfileFilters} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border border-border hover:bg-surface-muted text-left">
                                {getTickerLogo(item.ticker) ? <img src={getTickerLogo(item.ticker)} alt="" className="w-3.5 h-3.5 rounded object-cover shrink-0" /> : <span className="w-3.5 h-3.5 rounded bg-surface flex items-center justify-center text-[8px] font-bold text-text shrink-0">{item.ticker[0]}</span>}
                                <span className="text-[10px] font-semibold text-text">${item.ticker}</span>
                                <span className="text-[9px] text-muted">×{item.count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-medium text-text-muted mb-0.5">90 days</div>
                          <div className="flex flex-wrap gap-1">
                            {profile.tickerMentions['90d'].slice(0, 3).map((item) => (
                              <button key={item.ticker} type="button" onClick={goToSearchWithProfileFilters} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border border-border hover:bg-surface-muted text-left">
                                {getTickerLogo(item.ticker) ? <img src={getTickerLogo(item.ticker)} alt="" className="w-3.5 h-3.5 rounded object-cover shrink-0" /> : <span className="w-3.5 h-3.5 rounded bg-surface flex items-center justify-center text-[8px] font-bold text-text shrink-0">{item.ticker[0]}</span>}
                                <span className="text-[10px] font-semibold text-text">${item.ticker}</span>
                                <span className="text-[9px] text-muted">×{item.count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )},
                  { id: ACTIVITY_CARD_IDS.SECTOR_FOCUS, hasData: (profile.sectorFocus?.length ?? 0) > 0, render: () => (
                    <div className="w-[200px] min-w-[200px] rounded-xl border border-border bg-surface-muted/30 p-2.5 flex flex-col aspect-[10/9] flex-1 min-h-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Sector Focus</div>
                      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto">
                        {profile.sectorFocus.map((row) => (
                          <div key={row.name} className="flex items-center justify-between gap-2 text-[10px] min-w-0">
                            <span className="text-text truncate">{row.name}</span>
                            <span className="font-semibold text-text tabular-nums shrink-0">{row.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )},
                  { id: ACTIVITY_CARD_IDS.POST_SENTIMENT, hasData: !!profile.sentiment, render: () => (
                    <div className="w-[200px] min-w-[200px] rounded-xl border border-border bg-surface-muted/30 p-2.5 flex flex-col aspect-[10/9] flex-1 min-h-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Post Sentiment</div>
                      <div className="flex-1 min-h-0 flex flex-col gap-2">
                        <div className={clsx('rounded-lg border p-1.5 flex flex-col gap-0.5', profile.sentiment['30d'].direction === 'bullish' ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30')}>
                          <div className="text-[9px] font-medium text-text-muted">30 days</div>
                          <div className={clsx('text-base font-bold', profile.sentiment['30d'].direction === 'bullish' ? 'text-success' : 'text-danger')}>{profile.sentiment['30d'].pct}%</div>
                          <span className={clsx('text-[9px] font-medium', profile.sentiment['30d'].direction === 'bullish' ? 'text-success' : 'text-danger')}>{profile.sentiment['30d'].label}</span>
                        </div>
                        <div className={clsx('rounded-lg border p-1.5 flex flex-col gap-0.5', profile.sentiment['90d'].direction === 'bullish' ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30')}>
                          <div className="text-[9px] font-medium text-text-muted">90 days</div>
                          <div className={clsx('text-base font-bold', profile.sentiment['90d'].direction === 'bullish' ? 'text-success' : 'text-danger')}>{profile.sentiment['90d'].pct}%</div>
                          <span className={clsx('text-[9px] font-medium', profile.sentiment['90d'].direction === 'bullish' ? 'text-success' : 'text-danger')}>{profile.sentiment['90d'].label}</span>
                        </div>
                      </div>
                    </div>
                  )},
                ]
                const visibleCards = cardConfigs.filter((c) => c.hasData && (isOwnProfile ? true : !activityCardsHidden.includes(c.id)))
                if (visibleCards.length === 0) return null
                return (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between w-full py-0.5 -my-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-text">Activity</span>
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => setActivityInfoModalOpen(true)}
                            className="p-0.5 rounded text-text-muted hover:text-text hover:bg-surface-muted/50 transition-colors"
                            aria-label="Activity privacy info"
                          >
                            <InfoIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStatsExpanded((e) => !e)}
                        className="p-1 rounded-lg hover:bg-surface-muted/50 transition-colors"
                        aria-expanded={statsExpanded}
                        aria-label={statsExpanded ? 'Collapse stats' : 'Expand stats'}
                      >
                        <span className="text-text-muted shrink-0 transition-transform block" style={{ transform: statsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                        </span>
                      </button>
                    </div>
                    {statsExpanded && (
                      <div className="mt-2 flex gap-3 overflow-x-auto overflow-y-hidden pb-1 flex-nowrap scroll-smooth">
                        {visibleCards.map((cfg) => (
                          <ActivityCardWrapper
                            key={cfg.id}
                            cardId={cfg.id}
                            isOwnProfile={isOwnProfile}
                            isHidden={activityCardsHidden.includes(cfg.id)}
                            onToggle={toggleActivityCardVisibility}
                          >
                            {cfg.render()}
                          </ActivityCardWrapper>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {activityInfoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setActivityInfoModalOpen(false)} aria-hidden />
                  <div className="relative rounded-xl border border-border bg-background p-6 shadow-xl max-w-sm">
                    <p className="text-sm text-text leading-relaxed">
                      You may hide any of the activity below by tapping the privacy eye{' '}
                      <span className="inline-flex align-middle">
                        <EyeOpenIcon className="w-4 h-4 text-text-muted" />
                      </span>{' '}
                      at any time. This will remove the activity when others view your profile.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActivityInfoModalOpen(false)}
                      className="mt-4 w-full btn btn-primary text-sm"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Tabs */}
            <div className="flex border-b border-border flex-wrap">
              {[
                { id: 'Posts', label: 'Posts', hasFilter: true },
                { id: 'Posts & Replies', label: 'Posts & Replies' },
                { id: 'Liked', label: 'Liked' },
                { id: 'Watchlist', label: `${profile.watchlistCount} Watchlist` },
                { id: 'Private Journal', label: 'Private Journal', lock: true },
              ].map((tab) => (
                <div key={tab.id} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2',
                      activeTab === tab.id ? 'border-text text-text' : 'border-transparent text-muted hover:text-text'
                    )}
                  >
                    {tab.lock && <LockIcon className="w-4 h-4" />}
                    {tab.label}
                  </button>
                  {tab.hasFilter && activeTab === 'Posts' && (
                    <div className="relative -ml-2" ref={postFilterRef}>
                      <button
                        type="button"
                        onClick={() => setShowPostFilterDropdown((v) => !v)}
                        className={clsx(
                          'p-1 rounded transition-colors -mb-px',
                          showPostFilterDropdown ? 'text-text bg-surface-muted' : 'text-muted hover:text-text hover:bg-surface-muted'
                        )}
                        aria-label="Filter posts"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      {showPostFilterDropdown && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-surface border border-border rounded-lg shadow-xl py-1 min-w-[160px]">
                          {[
                            { key: 'recent', label: 'Recent' },
                            { key: 'mostLiked', label: 'Most Liked' },
                            { key: 'mostReplies', label: 'Most Replies' },
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => { setPostSortFilter(opt.key); setShowPostFilterDropdown(false) }}
                              className={clsx(
                                'w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between',
                                postSortFilter === opt.key ? 'text-primary font-semibold bg-primary/10' : 'text-text hover:bg-surface-muted'
                              )}
                            >
                              {opt.label}
                              {postSortFilter === opt.key && (
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Posts feed */}
            {activeTab === 'Private Journal' ? (
              <div className="divide-y divide-border">
                {HOWARD_PRIVATE_JOURNAL.map((entry) => (
                  <article key={entry.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={profile.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-text">{profile.username}</span>
                          <span className="text-xs text-muted flex items-center gap-1.5">
                            <LockIcon className="w-3.5 h-3.5 text-muted" />
                            {entry.time}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text leading-snug whitespace-pre-wrap"><TickerLinkedText text={entry.body} /></p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <article key={post.id} className="py-4">
                  <div className="flex items-start gap-3">
                    <Link to={`/profile/${profile.username}`} className="relative shrink-0">
                      <img
                        src={profile.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      {profile.hasEdgeBadge && (
                        <span className="absolute -bottom-0.5 -left-0.5 px-1 py-0.5 text-[8px] font-bold uppercase rounded bg-amber-500 text-black">EDGE</span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link to={`/profile/${profile.username}`} className="font-semibold text-sm text-text hover:underline">
                            {profile.username}
                          </Link>
                          <span className="text-xs text-muted">{post.time}</span>
                        </div>
                        <button type="button" className="p-1 rounded hover:bg-surface-muted text-muted" aria-label="More">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-text leading-snug whitespace-pre-wrap"><TickerLinkedText text={post.body} /></p>
                      {post.hasImage && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-border bg-surface-muted">
                          <img src={post.imageUrl} alt="" className="w-full aspect-video object-cover" />
                          {post.linkLabel && (
                            <a href="#" className="block px-3 py-2 text-sm text-primary hover:underline">{post.linkLabel}</a>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                        <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {post.reposts}
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likes}
                        </button>
                        <button className="p-1 hover:text-text transition-colors" aria-label="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button className="p-1 hover:text-text transition-colors" aria-label="Search">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="w-[280px] shrink-0 hidden lg:block space-y-6">
            <RelatedSymbols />
            <PredictionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  )
}
