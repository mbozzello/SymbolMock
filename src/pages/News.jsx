import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'

const _LEGACY_WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 889.42, change: -1.12, spark: [30, 32, 31, 33, 35, 34, 33, 32] },
]

function CommunityIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function SectorIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function PlayIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function MicIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

function ChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function VideoPlayOverlay({ size = 'md' }) {
  const isLarge = size === 'lg'
  const isSmall = size === 'sm'
  const circleClass = isLarge ? 'w-16 h-16' : isSmall ? 'w-8 h-8' : 'w-10 h-10'
  const iconClass = isLarge ? 'w-7 h-7 text-text ml-1' : isSmall ? 'w-4 h-4 text-text ml-0.5' : 'w-5 h-5 text-text ml-0.5'
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none" aria-hidden>
      <div className={`rounded-full bg-white/90 flex items-center justify-center ${circleClass}`}>
        <PlayIcon className={iconClass} />
      </div>
    </div>
  )
}

const COMMUNITY_FOCUS_ARTICLES = [
  {
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=600&fit=crop',
    headline: 'Tesla Stock Surges 12% After Record Q4 Deliveries Beat Expectations',
    description: 'Electric vehicle maker Tesla reported record deliveries, sending shares higher in pre-market',
    author: 'Michael Bolling',
    authorAvatar: '/avatars/who-follow-1.png',
    time: '11 days ago',
    ticker: 'TSLA',
    pctChange: 12.0,
    video: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop',
    headline: 'Market Open: Tech Stocks Rally After Fed Comments',
    description: "Major indices climbed at the open as investors cheered the Federal Reserve's latest guidance on rates and inflation.",
    author: 'Jon Morgan',
    authorAvatar: '/avatars/top-voice-1.png',
    time: '5 days ago',
    ticker: null,
    pctChange: null,
  },
  {
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&h=600&fit=crop',
    headline: 'Is $TSLA finally breaking out?',
    description: 'Technical setup and sentiment point to a potential breakout above key resistance levels.',
    author: 'Michael Bolling',
    authorAvatar: '/avatars/who-follow-1.png',
    time: '12 days ago',
    ticker: 'TSLA',
    pctChange: 2.4,
    slug: 'tsla-breaking-out',
  },
  {
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&h=600&fit=crop',
    headline: 'Options Flow: What Smart Money Is Buying This Week',
    description: 'Unusual options activity and institutional positioning ahead of key earnings.',
    author: 'Tom Bruni',
    authorAvatar: '/avatars/top-voice-1.png',
    time: '1 day ago',
    ticker: null,
    pctChange: null,
    video: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=600&fit=crop',
    headline: 'Bitcoin Approaches $35,000 as ETF Flows Surge',
    description: 'Crypto markets extend gains on strong inflows into spot Bitcoin ETFs.',
    author: 'Cryptotwits',
    authorAvatar: '/avatars/top-voice-2.png',
    time: '2 days ago',
    ticker: 'BTC',
    pctChange: 5.8,
  },
  {
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop',
    headline: 'Federal Reserve Signals Further Rate Cuts in Q2',
    description: 'Fed chair hints at continued easing if inflation stays on track.',
    author: 'Michele Steele',
    authorAvatar: '/avatars/top-voice-1.png',
    time: '1 day ago',
    ticker: null,
    pctChange: null,
  },
]

const COMMUNITY_FOCUS_COUNT = COMMUNITY_FOCUS_ARTICLES.length
const ROW_SIZE = 3

const SECTOR_CATEGORIES = ['Technology', 'Healthcare', 'Predictive', 'Finance', 'Energy']

const SECTOR_ARTICLES_BY_CATEGORY = {
  Technology: [
    { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=280&h=160&fit=crop', ticker: 'AAPL', pctChange: 1.8, title: 'Apple Unveils New AI Features at WWDC', source: 'Alex Rivera', time: '2h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=280&h=160&fit=crop', ticker: 'NVDA', pctChange: 4.2, title: 'NVIDIA Data Center Revenue Beats Estimates', source: 'Jon Morgan', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'MSFT', pctChange: 0.9, title: 'Microsoft Cloud Growth Accelerates', source: 'Tom Bruni', time: '5h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'GOOGL', pctChange: -0.5, title: 'Alphabet Ad Revenue In Line With Views', source: 'Michele Steele', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&h=160&fit=crop', ticker: 'TSLA', pctChange: 2.1, title: 'Tesla FSD Update Rollout Expands', source: 'Michael Bolling', time: '3h ago' },
  ],
  Healthcare: [
    { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=280&h=160&fit=crop', ticker: 'JNJ', pctChange: 0.7, title: 'Johnson & Johnson Raises Full-Year Guidance', source: 'Alex Rivera', time: '4h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=280&h=160&fit=crop', ticker: 'UNH', pctChange: -0.3, title: 'UnitedHealth Earnings Top Street Views', source: 'Jon Morgan', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=280&h=160&fit=crop', ticker: 'PFE', pctChange: 1.2, title: 'Pfizer Vaccine Sales Beat in Q2', source: 'Tom Bruni', time: '6h ago' },
    { image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=280&h=160&fit=crop', ticker: 'ABBV', pctChange: 2.4, title: 'AbbVie Lifts Outlook on Immunology Strength', source: 'Michele Steele', time: '2 days ago' },
    { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=280&h=160&fit=crop', ticker: 'LLY', pctChange: 3.1, title: 'Eli Lilly GLP-1 Demand Drives Upgrade', source: 'Alex Rivera', time: '5h ago' },
  ],
  Predictive: [
    { image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=280&h=160&fit=crop', ticker: 'PLTR', pctChange: 11.5, title: 'Palantir Beats on Revenue, Lifts Forecast', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', ticker: 'AI', pctChange: -2.8, title: 'C3.ai Stock Volatile After Earnings', source: 'Jon Morgan', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'PATH', pctChange: 5.2, title: 'UiPath Automation Demand Strong', source: 'Tom Bruni', time: '4h ago' },
    { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', ticker: 'CRWD', pctChange: 1.9, title: 'CrowdStrike Subscriber Growth Beats', source: 'Michele Steele', time: '2 days ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'SNOW', pctChange: -1.4, title: 'Snowflake Guidance Underwhelms Street', source: 'Alex Rivera', time: '6h ago' },
  ],
  Finance: [
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'JPM', pctChange: 0.6, title: 'JPMorgan Net Interest Income Rises', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'BAC', pctChange: -0.2, title: 'Bank of America Loan Growth Steady', source: 'Jon Morgan', time: '5h ago' },
    { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', ticker: 'GS', pctChange: 2.1, title: 'Goldman Trading Revenue Beats', source: 'Tom Bruni', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'MS', pctChange: 1.3, title: 'Morgan Stanley Wealth Management Strong', source: 'Michele Steele', time: '4h ago' },
    { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', ticker: 'V', pctChange: 0.4, title: 'Visa Volume Growth In Line', source: 'Alex Rivera', time: '2 days ago' },
  ],
  Energy: [
    { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=280&h=160&fit=crop', ticker: 'XOM', pctChange: -0.8, title: 'Exxon Reports Lower Refining Margins', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=280&h=160&fit=crop', ticker: 'CVX', pctChange: 1.2, title: 'Chevron Raises Buyback Guidance', source: 'Jon Morgan', time: '5h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=280&h=160&fit=crop', ticker: 'OXY', pctChange: 3.4, title: 'Occidental Permian Output Beats', source: 'Tom Bruni', time: '6h ago' },
    { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=280&h=160&fit=crop', ticker: 'COP', pctChange: -0.5, title: 'ConocoPhillips Production Update', source: 'Michele Steele', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=280&h=160&fit=crop', ticker: 'SLB', pctChange: 2.0, title: 'Schlumberger International Growth', source: 'Alex Rivera', time: '2 days ago' },
  ],
}

const SHOWS = [
  { image: '/images/big-tech-podcast.png', title: 'BIGTECH PODCAST', desc: 'Weekly deep dives into big tech' },
  { image: '/images/howard-lindzon-show.png', title: 'The Howard Lindzon Show', desc: 'Markets and startup investing' },
  { image: '/images/philosophical-quant.png', title: 'The Philosophical Quant', desc: 'Quantitative strategies explained' },
  { image: '/images/cryptotwits-podcast.png', title: 'Cryptotwits Podcast', desc: 'Crypto and macro' },
  { image: '/images/retail-edge.png', title: 'RetailEDG Show', desc: 'Retail and options flow' },
  { image: '/images/board-room.png', title: 'Board Room Exclusives', desc: 'Premium stocktwits content' },
]

const NEWSLETTERS = [
  { logo: '/images/daily-rip.png', title: 'The Daily Rip', frequency: 'Every weekday', desc: 'Market open recap and top stories', subscribers: '57.9K subscribers' },
  { logo: '/images/cryptotwits.png', title: 'Cryptotwits', frequency: 'Every Saturday', desc: 'Weekly crypto and macro analysis', subscribers: '42.1K subscribers' },
  { logo: '/images/chart-art.png', title: 'Chart Art', frequency: 'Twice weekly', desc: 'Technical setups and levels', subscribers: '28.3K subscribers' },
]

const VOICES = [
  { name: 'Howard Lindzon', username: '@howardlindzon', avatar: '/avatars/howard-lindzon.png', url: 'https://stocktwits.com/howardlindzon' },
  { name: 'Michael Bolling', username: '@MickeyMarkets', avatar: '/avatars/michael-bolling.png' },
  { name: 'Michele Steele', username: '@steeletwits', avatar: '/avatars/michele-steele.png' },
  { name: 'Ross Cameron', username: '@Warrior_0719', avatar: '/avatars/ross-cameron.png' },
  { name: 'Tim Sykes', username: '@timothysykes', avatar: '/avatars/top-voice-1.png' },
  { name: 'Danielle Shay', username: '@DanielleShay_', avatar: '/avatars/top-voice-2.png' },
]

const TRENDING = [
  { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=280&h=160&fit=crop', title: 'Palantir Jumps 15% After Major Defense Contract', meta: 'Alex Rivera • 2h ago', ticker: 'PLTR', pctChange: 15.0, video: true },
  { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&h=160&fit=crop', title: "Breaking Down Tesla's Q4 Numbers", meta: 'Michael Bolling • 5h ago', ticker: 'TSLA', pctChange: 2.4 },
  { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', title: 'Nicola ETF Inflows Are Insane', meta: 'Jon Morgan • 3h ago', ticker: 'BTC', pctChange: 5.8 },
  { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=280&h=160&fit=crop', title: 'AMD Gains on Data Center Market Share Wins', meta: 'Tom Bruni • 1 day ago', ticker: 'AMD', pctChange: 17.9 },
]

const WEEKEND_RIP = [
  { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', title: 'Weekend Market Wrap: Key Takeaways for Next Week', meta: 'Michele Steele • 2 days ago', video: true },
  { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', title: 'Portfolio Review: How Retail Traders Performed in 2023', meta: 'Alex Rivera • 3 days ago' },
  { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', title: 'Week Ahead: Earnings Preview & Market Outlook', meta: 'Jon Morgan • 1 day ago' },
  { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', title: 'Top 10 Stocks to Watch This Week', meta: 'Tom Bruni • 4h ago' },
]

function HorizontalScroll({ children, className = '' }) {
  return (
    <div className={`flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${className}`} style={{ scrollbarWidth: 'thin' }}>
      {children}
    </div>
  )
}

const HERO_DURATION_MS = 5000
const PROGRESS_TICK_MS = 50

export default function News() {
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [sectorFilter, setSectorFilter] = useState('Technology')
  const [heroIndex, setHeroIndex] = useState(0)
  const [progressRemaining, setProgressRemaining] = useState(100)
  const progressIntervalRef = useRef(null)

  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgressRemaining((p) => {
        const step = 100 / (HERO_DURATION_MS / PROGRESS_TICK_MS)
        const next = Math.max(0, p - step)
        if (next <= 0) {
          setHeroIndex((i) => (i + 1) % COMMUNITY_FOCUS_COUNT)
          return 100
        }
        return next
      })
    }, PROGRESS_TICK_MS)
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const currentHero = COMMUNITY_FOCUS_ARTICLES[heroIndex]
  const nextThreeArticles = Array.from({ length: ROW_SIZE }, (_, i) => COMMUNITY_FOCUS_ARTICLES[(heroIndex + 1 + i) % COMMUNITY_FOCUS_COUNT])

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">News</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[269px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <section className="w-full">
          <div className="max-w-[1200px] mx-auto px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <CommunityIcon className="w-5 h-5 text-success" />
              <h2 className="text-lg font-bold text-text">Community Focus</h2>
            </div>
          </div>
          {currentHero.slug ? (
          <Link to={`/article/${currentHero.slug}`} className="relative block aspect-[21/9] min-h-[240px] max-h-[420px] w-full bg-surface-muted cursor-pointer">
            <img src={currentHero.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {currentHero.video && <VideoPlayOverlay size="lg" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-success" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10" aria-hidden>
              <div
                className="h-full bg-success transition-none duration-[50ms] ease-linear"
                style={{ width: `${progressRemaining}%` }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-[1]">
              <div className="max-w-[1200px] mx-auto">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">{currentHero.headline}</h3>
                <p className="mt-2 text-sm text-white/90 leading-snug max-w-2xl drop-shadow-sm">{currentHero.description}</p>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <img src={currentHero.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white/30" />
                  <span className="font-medium text-white/95">{currentHero.author}</span>
                  <span>{currentHero.time}</span>
                  {currentHero.ticker && (
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${(currentHero.pctChange ?? 0) >= 0 ? 'bg-success/90 text-white' : 'bg-danger/90 text-white'}`}>
                      ${currentHero.ticker} {(currentHero.pctChange ?? 0) >= 0 ? '+' : ''}{(currentHero.pctChange ?? 0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
          ) : (
          <div className="relative aspect-[21/9] min-h-[240px] max-h-[420px] w-full bg-surface-muted">
            <img src={currentHero.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {currentHero.video && <VideoPlayOverlay size="lg" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-success" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10" aria-hidden>
              <div className="h-full bg-success transition-none duration-[50ms] ease-linear" style={{ width: `${progressRemaining}%` }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-[1]">
              <div className="max-w-[1200px] mx-auto">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">{currentHero.headline}</h3>
                <p className="mt-2 text-sm text-white/90 leading-snug max-w-2xl drop-shadow-sm">{currentHero.description}</p>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <img src={currentHero.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white/30" />
                  <span className="font-medium text-white/95">{currentHero.author}</span>
                  <span>{currentHero.time}</span>
                  {currentHero.ticker && (
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${(currentHero.pctChange ?? 0) >= 0 ? 'bg-success/90 text-white' : 'bg-danger/90 text-white'}`}>
                      ${currentHero.ticker} {(currentHero.pctChange ?? 0) >= 0 ? '+' : ''}{(currentHero.pctChange ?? 0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
          <div className="max-w-[1200px] mx-auto px-4 pt-4 pb-2">
            <HorizontalScroll className="mt-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {nextThreeArticles.map((art, i) => (
                art.slug ? (
                  <Link key={`${heroIndex}-${i}-${art.headline}`} to={`/article/${art.slug}`} className="flex shrink-0 w-[280px] gap-3 p-3 rounded-lg border border-border bg-surface hover:border-border-strong transition-colors">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img src={art.image.replace('1200&h=600', '200&h=120')} alt="" className="w-full h-full object-cover" />
                      {art.video && <VideoPlayOverlay size="sm" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-text line-clamp-2 leading-snug">{art.headline}</h4>
                      <p className="mt-1 text-xs text-text-muted">{art.author} • {art.time}</p>
                    </div>
                  </Link>
                ) : (
                  <a key={`${heroIndex}-${i}-${art.headline}`} href="#" className="flex shrink-0 w-[280px] gap-3 p-3 rounded-lg border border-border bg-surface hover:border-border-strong transition-colors">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img src={art.image.replace('1200&h=600', '200&h=120')} alt="" className="w-full h-full object-cover" />
                      {art.video && <VideoPlayOverlay size="sm" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-text line-clamp-2 leading-snug">{art.headline}</h4>
                      <p className="mt-1 text-xs text-text-muted">{art.author} • {art.time}</p>
                    </div>
                  </a>
                )
              ))}
            </HorizontalScroll>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <SectorIcon className="w-5 h-5 text-success" />
              <h2 className="text-lg font-bold text-text">Sector Focus</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {SECTOR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSectorFilter(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sectorFilter === cat ? 'bg-success text-white' : 'bg-surface-muted text-text hover:bg-border border border-border'
                  }`}
                >
                  {cat === 'Technology' ? <span className="text-base">🤖</span> : cat === 'Healthcare' ? <span className="text-base">🏥</span> : cat === 'Predictive' ? <span className="text-base">🔮</span> : cat === 'Finance' ? <span className="text-base">💰</span> : cat === 'Energy' ? <span className="text-base">⚡</span> : <SectorIcon className="w-4 h-4" />}
                  {cat}
                </button>
              ))}
            </div>
            <HorizontalScroll>
              {(SECTOR_ARTICLES_BY_CATEGORY[sectorFilter] ?? SECTOR_ARTICLES_BY_CATEGORY.Technology).map((art, i) => {
                const up = (art.pctChange ?? 0) >= 0
                return (
                  <a key={`${sectorFilter}-${i}`} href="#" className="shrink-0 w-[240px] sm:w-[260px] rounded-lg overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors block">
                    <div className="relative aspect-video bg-surface-muted">
                      <img src={art.image} alt="" className="w-full h-full object-cover" />
                      {art.video && <VideoPlayOverlay />}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold ${up ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                        ${art.ticker} {up ? '+' : ''}{art.pctChange}%
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-text line-clamp-2">{art.title}</h4>
                      <p className="mt-1 text-xs text-text-muted">{art.source} • {art.time}</p>
                    </div>
                  </a>
                )
              })}
            </HorizontalScroll>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-1">
              <PlayIcon className="w-5 h-5 text-success" />
              <h2 className="text-lg font-bold text-text">Stocktwits Shows</h2>
            </div>
            <p className="text-sm text-text-muted mb-4">Watch our original shows and podcasts</p>
            <HorizontalScroll>
              {SHOWS.map((show, i) => (
                <a key={i} href="#" className="shrink-0 w-[200px] sm:w-[220px] rounded-lg overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors block group">
                  <div className="aspect-video bg-surface-muted">
                    <img src={show.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-text">{show.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{show.desc}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-success">
                      Watch Now
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </HorizontalScroll>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text mb-1">Newsletters</h2>
            <p className="text-sm text-text-muted mb-4">Get market insights delivered to your inbox</p>
            <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
              {NEWSLETTERS.map((nl, i) => (
                <div key={i} className="shrink-0 w-[320px] sm:w-[360px] flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface hover:border-success/50 transition-colors">
                  <div className="flex gap-3 min-w-0">
                    <img src={nl.logo} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-text">{nl.title}</h4>
                      <p className="text-xs text-text-muted">{nl.frequency}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{nl.desc}</p>
                      <p className="text-xs text-text-muted mt-2">{nl.subscribers}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-auto pt-1">
                    <a href="#" className="px-4 py-2 rounded-full text-sm font-medium bg-surface-muted text-text hover:bg-border border border-border transition-colors">
                      Learn more
                    </a>
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-success text-white hover:opacity-90 transition-opacity shrink-0">
                      Subscribe
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="shrink-0 flex items-center">
                <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-success text-success font-semibold text-sm hover:bg-success/10 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
                  Subscribe
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MicIcon className="w-5 h-5 text-success" />
                <h2 className="text-lg font-bold text-text">Stocktwits Voices</h2>
              </div>
              <Link to="/symbol" className="text-sm font-medium text-success hover:underline flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <HorizontalScroll>
              {VOICES.map((v, i) => {
                const cardClass = 'shrink-0 w-[130px] sm:w-[150px] flex flex-col rounded-xl overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors shadow-sm'
                const cardContent = (
                  <>
                    <div className="relative w-full aspect-[4/5] min-h-[170px] bg-gradient-to-b from-sky-100 to-white overflow-hidden">
                      <img src={v.avatar} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                    </div>
                    <div className="p-3 text-center bg-surface border-t border-border">
                      <span className="block font-semibold text-text truncate text-sm">{v.name}</span>
                      <span className="block text-xs text-text-muted truncate mt-0.5">{v.username}</span>
                    </div>
                  </>
                )
                return v.url ? (
                  <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {cardContent}
                  </a>
                ) : (
                  <Link key={i} to="/symbol" className={cardClass}>
                    {cardContent}
                  </Link>
                )
              })}
            </HorizontalScroll>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-text">Trending Now</h2>
                <p className="text-sm text-text-muted">What&apos;s hot in the market right now</p>
              </div>
              <Link to="/symbol" className="text-sm font-medium text-success hover:underline flex items-center gap-1 shrink-0">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <HorizontalScroll>
              {TRENDING.map((art, i) => {
                const up = (art.pctChange ?? 0) >= 0
                return (
                  <a key={i} href="#" className="shrink-0 w-[240px] sm:w-[260px] rounded-lg overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors block">
                    <div className="relative aspect-video bg-surface-muted">
                      <img src={art.image} alt="" className="w-full h-full object-cover" />
                      {art.video && <VideoPlayOverlay />}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold ${up ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                        ${art.ticker} {up ? '+' : ''}{art.pctChange}%
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-text line-clamp-2">{art.title}</h4>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-text-muted">{art.meta}</span>
                        {art.ticker && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${up ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                            ${art.ticker} {up ? '+' : ''}{art.pctChange}%
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                )
              })}
            </HorizontalScroll>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-text">Weekend Rip</h2>
                <p className="text-sm text-text-muted">Weekend market wrap and week ahead preview</p>
              </div>
              <Link to="/symbol" className="text-sm font-medium text-success hover:underline flex items-center gap-1 shrink-0">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <HorizontalScroll>
              {WEEKEND_RIP.map((art, i) => (
                <a key={i} href="#" className="shrink-0 w-[240px] sm:w-[260px] rounded-lg overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors block">
                  <div className="relative aspect-video bg-surface-muted">
                    <img src={art.image} alt="" className="w-full h-full object-cover" />
                    {art.video && <VideoPlayOverlay />}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-text line-clamp-2">{art.title}</h4>
                    <p className="mt-1 text-xs text-text-muted">{art.meta}</p>
                  </div>
                </a>
              ))}
            </HorizontalScroll>
          </section>
        </div>
      </main>
    </div>
  )
}
