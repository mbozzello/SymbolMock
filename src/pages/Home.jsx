import { useEffect, useState, useRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MessagePostBox from '../components/MessagePostBox.jsx'
import SymbolHeaderAbovePostBox from '../components/SymbolHeaderAbovePostBox.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import LatestNews from '../components/LatestNews.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import DebateBox from '../components/DebateBox.jsx'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import TickerLinkedText from '../components/TickerLinkedText.jsx'
function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

/** TSLA topic filters (match /home Popular Topics); slug used for ?topic= on URL */
const SYMBOL_TOPICS = [
  { label: 'All', slug: 'all' },
  { label: 'Merging Ambitions', slug: 'merging-ambitions', emoji: '🚀' },
  { label: 'Robotaxi Dreams', slug: 'robotaxi-dreams', emoji: '🤖' },
  { label: 'Semi Truck Boost', slug: 'semi-truck-boost', emoji: '🚚' },
  { label: 'Volatile Range', slug: 'volatile-range', emoji: '📊' },
]

const FIRST_FEED_MESSAGE = {
  id: 'home-feed-1',
  username: 'TeslaFanatic',
  avatar: '/avatars/top-voice-1.png',
  body: 'If $TSLA continues to soar, I might just invest in a state-of-the-art AI assistant from their amazing robotics team!',
  time: '3m',
  comments: 140,
  reposts: 14,
  likes: 203,
}

const HOWARD_LINDZON_MESSAGE = {
  id: 'home-feed-howard',
  username: 'howardlindzon',
  avatar: '/avatars/howard-lindzon.png',
  body: '$TSLA is going to tank with Elon Musk leading it',
  time: '5m',
  symbol: 'TSLA',
  sentiment: 'bearish',
  prediction: {
    priceTarget: 369,
    stopLoss: 450,
    targetDate: 'April 20, 2026',
    currentPrice: 248.92,
    startingPrice: 265.00,
    sincePrediction: -16.08,
    sincePredictionPct: -6.07,
  },
  comments: 42,
  reposts: 8,
  likes: 156,
}


const CURRENT_USER = { id: 'current', username: 'You', avatar: '/avatars/user-avatar.png' }
const SEED_AGREE_VOTERS = [
  { id: 'a1', username: 'TraderJoe', avatar: '/avatars/top-voice-1.png' },
  { id: 'a2', username: 'MarketWatcher', avatar: '/avatars/top-voice-2.png' },
  { id: 'a3', username: 'StockTwitsUser', avatar: '/avatars/howard-lindzon.png' },
  { id: 'a4', username: 'CryptoBull', avatar: '/avatars/michele-steele.png' },
]
const SEED_DISAGREE_VOTERS = [
  { id: 'd1', username: 'BearMarket', avatar: '/avatars/top-voice-3.png' },
  { id: 'd2', username: 'Skeptic', avatar: '/avatars/howard-lindzon.png' },
  { id: 'd3', username: 'Contrarian', avatar: '/avatars/michele-steele.png' },
]

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

export default function Home() {
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const { watchlist } = useWatchlist()
  const { getQuote } = useLiveQuotesContext()
  const [searchParams] = useSearchParams()
  const tickerFromUrl = (searchParams.get('ticker') || 'TSLA').toUpperCase().trim()
  const topicSlug = searchParams.get('topic')

  const symbol = useMemo(() => {
    const q = getQuote(tickerFromUrl)
    if (!q) return { ...DEFAULT_SYMBOL, ticker: tickerFromUrl, name: `${tickerFromUrl} Inc` }
    return {
      ...DEFAULT_SYMBOL,
      ticker: tickerFromUrl,
      name: `${tickerFromUrl} Inc`,
      price: q.price ?? DEFAULT_SYMBOL.price,
      change: q.change ?? DEFAULT_SYMBOL.change,
      changePct: q.changePercent ?? DEFAULT_SYMBOL.changePct,
      chartValues: q.spark?.length ? q.spark : DEFAULT_SYMBOL.chartValues,
    }
  }, [getQuote, tickerFromUrl])

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeFilter, setActiveFilter] = useState(() => {
    const t = SYMBOL_TOPICS.find((x) => x.slug === topicSlug)
    return t ? t.label : 'All'
  })

  useEffect(() => {
    const slug = searchParams.get('topic')
    const t = SYMBOL_TOPICS.find((x) => x.slug === slug)
    if (t) setActiveFilter(t.label)
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('expandSummary') === '1' || searchParams.get('expandSummary') === 'true') {
      setTrendingSummaryExpanded(true)
    }
  }, [searchParams])

  const topicsSectionRef = useRef(null)
  useEffect(() => {
    if (!topicSlug) return
    const timer = setTimeout(() => {
      const el = topicsSectionRef.current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [topicSlug])

  const [userPosts, setUserPosts] = useState([])
  const postIdRef = useRef(0)
  const [howardDebate, setHowardDebate] = useState({
    thumbsUp: 87,
    thumbsDown: 34,
    upVoters: SEED_AGREE_VOTERS.slice(0, 3),
    downVoters: SEED_DISAGREE_VOTERS.slice(0, 2),
  })
  const [trendingSummaryExpanded, setTrendingSummaryExpanded] = useState(() => searchParams.get('expandSummary') === '1' || searchParams.get('expandSummary') === 'true')

  const handlePost = (payload) => {
    const id = `user-post-${++postIdRef.current}`
    const post = {
      id,
      body: payload.body,
      username: CURRENT_USER.username,
      avatar: CURRENT_USER.avatar,
      time: 'now',
      hasReaction: payload.hasReaction ?? false,
      debate: payload.hasReaction
        ? {
            thumbsUp: 223,
            thumbsDown: 92,
            upVoters: SEED_AGREE_VOTERS,
            downVoters: SEED_DISAGREE_VOTERS,
          }
        : undefined,
    }
    setUserPosts((prev) => [post, ...prev])
  }

  const handleDebateVote = (postId, vote) => {
    setUserPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.debate) return p
        const { thumbsUp = 0, thumbsDown = 0, upVoters = [], downVoters = [] } = p.debate
        const up = upVoters.filter((v) => v.id !== 'current')
        const down = downVoters.filter((v) => v.id !== 'current')
        const wasUp = upVoters.some((v) => v.id === 'current')
        const wasDown = downVoters.some((v) => v.id === 'current')
        let newThumbsUp = thumbsUp
        let newThumbsDown = thumbsDown
        if (vote === 'up') {
          if (wasDown) newThumbsDown--
          if (!wasUp) newThumbsUp++
          return {
            ...p,
            debate: {
              thumbsUp: newThumbsUp,
              thumbsDown: newThumbsDown,
              upVoters: [...up, CURRENT_USER],
              downVoters: down,
            },
          }
        }
        if (vote === 'down') {
          if (wasUp) newThumbsUp--
          newThumbsDown++
          return {
            ...p,
            debate: {
              thumbsUp: newThumbsUp,
              thumbsDown: newThumbsDown,
              upVoters: up,
              downVoters: [...down, CURRENT_USER],
            },
          }
        }
        if (wasUp) newThumbsUp--
        if (wasDown) newThumbsDown--
        return {
          ...p,
          debate: {
            thumbsUp: newThumbsUp,
            thumbsDown: newThumbsDown,
            upVoters: up,
            downVoters: down,
          },
        }
      })
    )
  }

  const handleHowardDebateVote = (vote) => {
    setHowardDebate((prev) => {
      const { thumbsUp = 0, thumbsDown = 0, upVoters = [], downVoters = [] } = prev
      const up = upVoters.filter((v) => v.id !== 'current')
      const down = downVoters.filter((v) => v.id !== 'current')
      const wasUp = upVoters.some((v) => v.id === 'current')
      const wasDown = downVoters.some((v) => v.id === 'current')
      let newThumbsUp = thumbsUp
      let newThumbsDown = thumbsDown
      if (vote === 'up') {
        if (wasDown) newThumbsDown--
        if (!wasUp) newThumbsUp++
        return { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown, upVoters: [...up, CURRENT_USER], downVoters: down }
      }
      if (vote === 'down') {
        if (wasUp) newThumbsUp--
        if (!wasDown) newThumbsDown++
        return { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown, upVoters: up, downVoters: [...down, CURRENT_USER] }
      }
      if (wasUp) newThumbsUp--
      if (wasDown) newThumbsDown--
      return { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown, upVoters: up, downVoters: down }
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

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Home</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        leftPadding={50}
      />

      <main className="lg:pl-[350px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto pl-0 pr-0 py-4 flex gap-0">
          {/* Main feed column */}
          <div className="flex-1 min-w-0 max-w-[660px] pl-0 pr-0">
            <SymbolHeaderAbovePostBox symbol={symbol} />
            {/* Trending box — expandable summary above post box */}
            <button
              type="button"
              onClick={() => setTrendingSummaryExpanded((e) => !e)}
              className="w-full text-left rounded-2xl p-4 mb-3 flex items-start gap-4 transition-colors hover:opacity-95"
              style={{
                background: 'linear-gradient(to right, rgba(254, 215, 170, 0.6), rgba(250, 204, 211, 0.5), rgba(221, 214, 254, 0.5))',
              }}
              aria-expanded={trendingSummaryExpanded}
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-white/90 flex items-center justify-center text-2xl shadow-sm">
                🔥
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-text">Trending #1</span>
                  <span className="shrink-0 text-text-muted" aria-hidden>
                    {trendingSummaryExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </span>
                </div>
                {trendingSummaryExpanded ? (
                  <p className="text-sm text-text mt-2 leading-relaxed">
                    Tesla (TSLA) is trending as investors debate the stock&apos;s near-term outlook following mixed signals around AI monetization, rising capital expenditures, and competitive pressure in EVs and energy. Community discussion is focused on whether Tesla&apos;s heavy investment in FSD and robotics will translate into durable revenue growth, alongside concerns about margin compression and regulatory overhang. While some express frustration with perceived execution risk versus peers, others view recent consolidation as an opportunity given Tesla&apos;s scale, cash flow, and entrenched position in EVs and storage.
                  </p>
                ) : (
                  <p className="text-sm text-text mt-0.5 truncate pr-6">
                    Tesla (TSLA) is trending as investors debate the stock&apos;s near-term outlook following mixed si...
                  </p>
                )}
              </div>
            </button>
            <MessagePostBox placeholder="What're your thoughts on $TSLA?" onPost={handlePost} />

            {/* Feed controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm font-semibold text-text">
                  Latest
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  75% High Msg Vol
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-md hover:bg-surface-muted transition-colors" aria-label="Search">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                <button className="p-2 rounded-md hover:bg-surface-muted transition-colors" aria-label="Settings">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User posts (debate-enabled) */}
            {userPosts.map((post) => (
              <article key={post.id} className="border-b border-border pb-4">
                <div className="flex items-start gap-3 pt-4">
                  <img
                    src={post.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{post.username}</span>
                      <span className="text-xs muted">{post.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-text leading-snug"><TickerLinkedText text={post.body} /></p>
                    {post.hasReaction && post.debate && (
                      <DebateBox
                        postId={post.id}
                        debate={post.debate}
                        onVote={handleDebateVote}
                      />
                    )}
                    <div className="flex items-center justify-between w-full mt-3 text-sm muted">
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        0
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        0
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        0
                      </button>
                      <button className="p-1 hover:text-text transition-colors" aria-label="Share">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(post)}
                        className={clsx('p-1 transition-colors', isBookmarked(post.id) ? 'text-primary' : 'hover:text-text')}
                        aria-label={isBookmarked(post.id) ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <svg className="w-4 h-4" fill={isBookmarked(post.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Filter pills: All + TSLA topics (match /home Popular Topics) */}
            <div ref={topicsSectionRef} className="flex gap-2 py-3 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollMarginTop: '5rem', scrollbarWidth: 'thin' }}>
              {SYMBOL_TOPICS.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => setActiveFilter(t.label)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap',
                    activeFilter === t.label
                      ? 'bg-black text-white'
                      : 'bg-surface-muted text-text hover:bg-border border border-border'
                  )}
                >
                  {t.emoji && <span aria-hidden>{t.emoji}</span>}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Feed: first post */}
            <article className="border-b border-border pb-4">
              <div className="flex items-start gap-3 pt-4">
                <img
                  src={FIRST_FEED_MESSAGE.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{FIRST_FEED_MESSAGE.username}</span>
                    <span className="text-xs muted">{FIRST_FEED_MESSAGE.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-text leading-snug">
                    <TickerLinkedText text={FIRST_FEED_MESSAGE.body} />
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="aspect-video rounded-lg overflow-hidden bg-surface-muted border border-border">
                      <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-surface-muted border border-border">
                      <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-surface-muted border border-border">
                      <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full mt-3 text-sm muted">
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {FIRST_FEED_MESSAGE.comments}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {FIRST_FEED_MESSAGE.reposts}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {FIRST_FEED_MESSAGE.likes}
                    </button>
                    <button className="p-1 hover:text-text transition-colors" aria-label="Share">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(FIRST_FEED_MESSAGE)}
                      className={clsx('p-1 transition-colors', isBookmarked(FIRST_FEED_MESSAGE.id) ? 'text-primary' : 'hover:text-text')}
                      aria-label={isBookmarked(FIRST_FEED_MESSAGE.id) ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <svg className="w-4 h-4" fill={isBookmarked(FIRST_FEED_MESSAGE.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Feed: howardlindzon price prediction */}
            <article className="border-b border-border pb-4">
              <div className="flex items-start gap-3 pt-4">
                <Link to={`/profile/${HOWARD_LINDZON_MESSAGE.username}`} className="shrink-0">
                  <img
                    src={HOWARD_LINDZON_MESSAGE.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${HOWARD_LINDZON_MESSAGE.username}`} className="font-semibold text-sm text-text hover:underline">
                      {HOWARD_LINDZON_MESSAGE.username}
                    </Link>
                    <span className="text-xs muted">{HOWARD_LINDZON_MESSAGE.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-text leading-snug"><TickerLinkedText text={HOWARD_LINDZON_MESSAGE.body} /></p>
                  <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-sm">
                    <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop" alt="" className="w-full aspect-video object-cover" />
                  </div>
                  <div className="mt-3 rounded-xl border border-border bg-surface overflow-hidden max-w-md">
                    {/* Top section: symbol + sentiment */}
                    <div className="flex items-start justify-between gap-4 p-4 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {getTickerLogo(HOWARD_LINDZON_MESSAGE.symbol) ? (
                              <img src={getTickerLogo(HOWARD_LINDZON_MESSAGE.symbol)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-text">{HOWARD_LINDZON_MESSAGE.symbol.slice(0, 1)}</span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-text">{HOWARD_LINDZON_MESSAGE.symbol}</span>
                        </div>
                        <p className="text-sm text-muted mt-1">Price Prediction</p>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0',
                          HOWARD_LINDZON_MESSAGE.sentiment === 'bearish'
                            ? 'bg-danger/15 text-danger'
                            : 'bg-success/15 text-success'
                        )}
                      >
                        {HOWARD_LINDZON_MESSAGE.sentiment === 'bearish' ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        )}
                        {HOWARD_LINDZON_MESSAGE.sentiment === 'bearish' ? 'Bearish' : 'Bullish'}
                      </span>
                    </div>
                    {/* Core prediction: Target Date | Target Price in blue box */}
                    <div className="mx-4 mb-4 rounded-lg bg-primary/20 border border-primary/30 p-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs text-muted mb-0.5">Target Date</div>
                          <div className="text-base font-bold text-text">{HOWARD_LINDZON_MESSAGE.prediction.targetDate}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-0.5">Target Price</div>
                          <div className="text-base font-bold text-danger">${HOWARD_LINDZON_MESSAGE.prediction.priceTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>
                    {/* Financial metrics */}
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Current Price</span>
                        <span className="font-medium text-text">${HOWARD_LINDZON_MESSAGE.prediction.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Starting Price</span>
                        <span className="font-medium text-text">${HOWARD_LINDZON_MESSAGE.prediction.startingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Stop Loss</span>
                        <span className="font-medium text-text">${HOWARD_LINDZON_MESSAGE.prediction.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Since Prediction</span>
                        <span className="font-medium text-danger">↓ ${Math.abs(HOWARD_LINDZON_MESSAGE.prediction.sincePrediction).toFixed(2)} ({HOWARD_LINDZON_MESSAGE.prediction.sincePredictionPct}%)</span>
                      </div>
                    </div>
                    {/* Details button */}
                    <button type="button" className="w-full py-2.5 px-4 bg-surface-muted/80 hover:bg-surface-muted border-t border-border flex items-center justify-center gap-2 text-sm font-medium text-text transition-colors">
                      Details
                      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <DebateBox
                    postId={HOWARD_LINDZON_MESSAGE.id}
                    debate={howardDebate}
                    onVote={(_, vote) => handleHowardDebateVote(vote)}
                  />
                  <div className="flex items-center justify-between w-full mt-3 text-sm muted">
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {HOWARD_LINDZON_MESSAGE.comments}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {HOWARD_LINDZON_MESSAGE.reposts}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {HOWARD_LINDZON_MESSAGE.likes}
                    </button>
                    <button className="p-1 hover:text-text transition-colors" aria-label="Share">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(HOWARD_LINDZON_MESSAGE)}
                      className={clsx('p-1 transition-colors', isBookmarked(HOWARD_LINDZON_MESSAGE.id) ? 'text-primary' : 'hover:text-text')}
                      aria-label={isBookmarked(HOWARD_LINDZON_MESSAGE.id) ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <svg className="w-4 h-4" fill={isBookmarked(HOWARD_LINDZON_MESSAGE.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Feed: poll */}
            <article className="border-b border-border py-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">StocktwitsPolls</span>
                    <span className="text-xs muted">3m</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-text leading-snug">
                    Do you think $TSLA&apos;s current price and business model are sustainable, or are we heading towards a significant correction?
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Sustainable with continued growth', pct: 37, active: true },
                      { label: 'Overvalued, expect a correction', pct: 51, active: false },
                      { label: 'Long-term hold despite volatility', pct: 12, active: false },
                    ].map((opt) => (
                      <div key={opt.label} className="relative">
                        <div className="h-8 rounded-full bg-surface-muted border border-border overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full transition-all', opt.active ? 'bg-blue-500' : 'bg-surface')}
                            style={{ width: `${opt.pct}%` }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-xs font-medium text-text truncate pr-2">{opt.label}</span>
                          <span className="text-xs font-semibold tabular-nums shrink-0">({opt.pct}%)</span>
                        </div>
                        {opt.active && (
                          <img
                            src="/avatars/user-avatar.png"
                            alt=""
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-white object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Additional feed messages */}
            {[
              { id: 'feed-extra-1', username: 'ChartMaster', avatar: '/avatars/top-voice-1.png', time: '5m', body: 'The $TSLA weekly chart is forming a massive cup and handle. If we break above 320 with volume, next stop is 380. Loading calls.', sentiment: 'bullish', comments: 42, reposts: 15, likes: 187 },
              { id: 'feed-extra-2', username: 'OptionsFlow', avatar: '/avatars/top-voice-2.png', time: '8m', body: 'Massive unusual options activity on $TSLA — 50K call contracts swept at the 350 strike expiring next Friday. Someone knows something.', sentiment: 'bullish', comments: 67, reposts: 31, likes: 312 },
              { id: 'feed-extra-3', username: 'BearishTruth', avatar: '/avatars/top-voice-3.png', time: '12m', body: '$TSLA margins are compressing and competition is accelerating. The EV market is getting crowded. I\'m short here with a stop at 330.', sentiment: 'bearish', comments: 89, reposts: 12, likes: 76 },
              { id: 'feed-extra-4', username: 'TechAnalysis', avatar: '/avatars/who-follow-1.png', time: '15m', body: 'RSI divergence on the 4H for $TSLA. Price making higher highs but RSI making lower highs. Classic warning sign. Tread carefully.', comments: 28, reposts: 9, likes: 134 },
              { id: 'feed-extra-5', username: 'MomentumKing', avatar: '/avatars/who-follow-2.png', time: '18m', body: 'Just added more $TSLA on this dip. The robotaxi narrative is still intact and FSD v13 numbers are incredible. This is a 500+ stock by year end.', sentiment: 'bullish', comments: 53, reposts: 22, likes: 245 },
              { id: 'feed-extra-6', username: 'ValueHunter', avatar: '/avatars/who-follow-3.png', time: '22m', body: 'At current multiples $TSLA is priced for perfection. Any miss on deliveries and this drops 15% overnight. Risk/reward doesn\'t make sense here.', sentiment: 'bearish', comments: 34, reposts: 7, likes: 98 },
              { id: 'feed-extra-7', username: 'EarningsWatch', avatar: '/avatars/who-follow-4.png', time: '28m', body: 'Reminder: $TSLA reports next week. Whisper numbers are above consensus. If energy storage revenue surprises, watch for a gap up.', comments: 19, reposts: 11, likes: 156 },
              { id: 'feed-extra-8', username: 'SwingTraderPro', avatar: '/avatars/top-voice-1.png', time: '32m', body: 'Closed my $TSLA swing trade from last week. Entered at 285, out at 312. +9.5% in 4 days. Now waiting for a pullback to re-enter.', sentiment: 'bullish', comments: 45, reposts: 18, likes: 267 },
              { id: 'feed-extra-9', username: 'MacroView', avatar: '/avatars/top-voice-2.png', time: '38m', body: 'Fed pause is bullish for growth names like $TSLA. If rates stay steady through Q2, tech rallies hard. Position accordingly.', comments: 31, reposts: 14, likes: 189 },
              { id: 'feed-extra-10', username: 'RetailTrader42', avatar: '/avatars/top-voice-3.png', time: '41m', body: 'Been holding $TSLA since 180. Not selling a single share until we see robotaxi revenue. This is a generational hold.', sentiment: 'bullish', comments: 72, reposts: 25, likes: 341 },
              { id: 'feed-extra-11', username: 'ShortSqueeze', avatar: '/avatars/who-follow-1.png', time: '45m', body: '$TSLA short interest is creeping back up to 4.2%. Not GME levels but enough to fuel a squeeze if we get a catalyst.', comments: 26, reposts: 8, likes: 112 },
              { id: 'feed-extra-12', username: 'DividendKing', avatar: '/avatars/who-follow-2.png', time: '52m', body: 'I know $TSLA doesn\'t pay dividends but if Elon ever announces a buyback program this stock goes to the moon instantly.', comments: 38, reposts: 6, likes: 87 },
              { id: 'feed-extra-13', username: 'CatalystAlert', avatar: '/avatars/who-follow-3.png', time: '58m', body: 'The $TSLA Cybertruck ramp is ahead of schedule per supplier checks. Q2 deliveries could surprise to the upside.', sentiment: 'bullish', comments: 51, reposts: 20, likes: 223 },
              { id: 'feed-extra-14', username: 'QuantTrader', avatar: '/avatars/who-follow-4.png', time: '1h', body: 'My model shows $TSLA fair value at 295 based on DCF with 25% revenue growth. At 312 it\'s slightly overvalued. Neutral here.', comments: 15, reposts: 4, likes: 67 },
              { id: 'feed-extra-15', username: 'EnergyBull', avatar: '/avatars/top-voice-1.png', time: '1h 5m', body: 'People sleep on $TSLA energy storage. Megapack deployments doubled YoY and margins are 30%+. This segment alone is worth 100B.', sentiment: 'bullish', comments: 44, reposts: 16, likes: 198 },
              { id: 'feed-extra-16', username: 'SentimentPro', avatar: '/avatars/top-voice-2.png', time: '1h 12m', body: '$TSLA community sentiment just hit 88% bullish — highest in 3 months. Historically this level precedes a 5-8% move within 2 weeks.', comments: 23, reposts: 10, likes: 145 },
              { id: 'feed-extra-17', username: 'GammaSqueeze', avatar: '/avatars/top-voice-3.png', time: '1h 20m', body: 'Dealers are short gamma on $TSLA above 315. If we push through, market makers have to buy to hedge. Could accelerate quickly.', comments: 37, reposts: 13, likes: 176 },
              { id: 'feed-extra-18', username: 'FundTracker', avatar: '/avatars/who-follow-1.png', time: '1h 28m', body: 'Cathie Wood bought another 200K shares of $TSLA yesterday through ARKK. She\'s been consistently adding on weakness.', comments: 61, reposts: 28, likes: 289 },
            ].map((msg) => (
              <article key={msg.id} className="border-b border-border pb-4">
                <div className="flex items-start gap-3 pt-4">
                  <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-text">{msg.username}</span>
                      <span className="text-xs muted">{msg.time}</span>
                      {msg.sentiment && (
                        <span className={clsx(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                          msg.sentiment === 'bullish' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                        )}>
                          {msg.sentiment === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text leading-snug"><TickerLinkedText text={msg.body} /></p>
                    <div className="flex items-center justify-between w-full mt-3 text-sm muted">
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {msg.comments}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {msg.reposts}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {msg.likes}
                      </button>
                      <button className="p-1 hover:text-text transition-colors" aria-label="Share">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(msg)}
                        className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')}
                        aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right sidebar */}
          <aside className="w-[300px] max-w-[300px] shrink-0 hidden lg:block space-y-6 pl-4 pr-4 pt-4 border-l border-border">
            <LatestNews />

            {/* Video Ad Unit */}
            <div className="rounded-xl overflow-hidden border border-border bg-surface">
              <div className="relative">
                <img src="/images/ad-bloomberg-video.png" alt="Bloomberg video" className="w-full aspect-video object-cover" />
                {/* Play button overlay */}
                <button type="button" className="absolute inset-0 flex items-center justify-center group" aria-label="Play video">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-center gap-3 py-2 text-xs text-text-muted">
                <span>Advertisement</span>
                <span className="text-border">|</span>
                <button type="button" className="hover:text-text transition-colors">Remove Ads</button>
              </div>
            </div>

            <RelatedSymbols />

            {/* Display Ad Unit */}
            <div className="rounded-xl overflow-hidden border border-border bg-surface">
              <img src="/images/ad-fidelity-schwab.png" alt="Fidelity advertisement" className="w-full object-cover" />
              <div className="flex items-center justify-center gap-3 py-2 text-xs text-text-muted">
                <span>Advertisement</span>
                <span className="text-border">|</span>
                <button type="button" className="hover:text-text transition-colors">Remove Ads</button>
              </div>
            </div>

            <PredictionLeaderboard />

            {/* Who To Follow */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text">Who To Follow</h3>
                <button type="button" className="text-text-muted hover:text-text transition-colors" aria-label="See more">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <ul className="divide-y divide-border">
                {[
                  { name: 'BullishBanana', handle: 'Bullishbanana', avatar: '/avatars/who-follow-1.png' },
                  { name: 'Fidelity', handle: 'FidelityInvestments', avatar: '/avatars/who-follow-2.png', ad: true },
                  { name: 'StonkWizard', handle: 'StonkWizard', avatar: '/avatars/who-follow-3.png' },
                  { name: 'DiamondDegen', handle: 'DiamondDegend', avatar: '/avatars/who-follow-4.png' },
                ].map((person) => (
                  <li key={person.handle} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={person.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 bg-surface-muted" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-text truncate">{person.name}</span>
                          {person.ad && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-text-muted bg-surface-muted border border-border leading-none">Ad</span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate">@{person.handle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        person.ad
                          ? 'border-border bg-surface hover:bg-surface-muted text-text'
                          : 'border-border bg-surface hover:bg-surface-muted text-text'
                      }`}
                    >
                      {person.ad ? 'Learn More' : 'Follow'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t border-border space-y-5">
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-text hover:text-text-muted transition-colors" aria-label="X (Twitter)">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="text-text hover:text-text-muted transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="text-text hover:text-text-muted transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-text hover:text-text-muted transition-colors" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="text-text hover:text-text-muted transition-colors" aria-label="RSS">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-8.18v4.819c12.951.115 23.418 10.636 23.497 23.581h4.503c-.115-15.616-12.798-28.282-28-28.4z"/></svg>
                </a>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-3 gap-y-2 text-xs">
                <a href="#" className="text-text-muted hover:text-text transition-colors">About</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Help</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Enterprise</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Best Practices</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Privacy</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Advertise</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Careers</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Rules</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">APIs</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Disclaimer</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Terms</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Widgets</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Shop</a>
                <a href="#" className="text-text-muted hover:text-text transition-colors">Disclosures</a>
              </div>

              <a href="#" className="block text-xs text-text-muted hover:text-text transition-colors">About Newsroom</a>

              {/* App Store Badges */}
              <div className="flex items-center gap-2">
                <a href="#" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white text-[10px]" aria-label="Download on the App Store">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div className="leading-tight"><div className="text-[8px] opacity-70">Download on the</div><div className="font-semibold text-xs -mt-0.5">App Store</div></div>
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white text-[10px]" aria-label="Get it on Google Play">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"/><path fill="#34A853" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.04.427.112.619l11.14-11.087z"/><path fill="#FBBC04" d="M14.584 12.023l3.515 3.493-15.74 8.912a1.49 1.49 0 0 1-1.022.052l13.247-12.457z"/><path fill="#EA4335" d="M14.584 12.023L1.337.924A1.49 1.49 0 0 1 2.359.876l15.74 8.854z"/></svg>
                  <div className="leading-tight"><div className="text-[8px] opacity-70">GET IT ON</div><div className="font-semibold text-xs -mt-0.5">Google Play</div></div>
                </a>
              </div>

              {/* Legal Text */}
              <div className="space-y-3 text-[10px] text-text-muted leading-relaxed">
                <p>&copy;2025 StockTwits, Inc. All rights reserved.<br />Market Data by Xignite and BATS BZX Real-Time Price Earnings<br />Call Data by Quartr. Crypto data provided by Coingecko.</p>
                <p>Stocktwits, Inc. (&ldquo;Stocktwits&rdquo;) is not a securities broker-dealer, investment adviser, or any other type of financial professional. No content on the Stocktwits platform should be considered an offer, solicitation of an offer, or advice to buy or sell securities or any other type of investment or financial product.</p>
                <p>By using the Stocktwits platform, you understand and agree that Stocktwits does not provide investment advice.</p>
              </div>
            </footer>
          </aside>
        </div>
      </main>
    </div>
  )
}
