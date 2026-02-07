import { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MessagePostBox from '../components/MessagePostBox.jsx'
import SymbolHeaderAbovePostBox from '../components/SymbolHeaderAbovePostBox.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import DebateBox from '../components/DebateBox.jsx'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const FEED_FILTERS = ['All', 'Political Tailwind', 'Permit Surge', 'Short Sting', 'Dip The Gift']

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

  const symbol = useMemo(() => {
    const q = getQuote('TSLA')
    if (!q) return DEFAULT_SYMBOL
    return {
      ...DEFAULT_SYMBOL,
      price: q.price ?? DEFAULT_SYMBOL.price,
      change: q.change ?? DEFAULT_SYMBOL.change,
      changePct: q.changePercent ?? DEFAULT_SYMBOL.changePct,
      chartValues: q.spark?.length ? q.spark : DEFAULT_SYMBOL.chartValues,
    }
  }, [getQuote])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPosts, setUserPosts] = useState([])
  const postIdRef = useRef(0)
  const [howardDebate, setHowardDebate] = useState({
    thumbsUp: 87,
    thumbsDown: 34,
    upVoters: SEED_AGREE_VOTERS.slice(0, 3),
    downVoters: SEED_DISAGREE_VOTERS.slice(0, 2),
  })

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
      />

      <main className="lg:pl-[269px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          {/* Main feed column */}
          <div className="flex-1 min-w-0">
            <SymbolHeaderAbovePostBox symbol={symbol} />
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
                    <p className="mt-1 text-sm text-text leading-snug">{post.body}</p>
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

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 py-3">
              {FEED_FILTERS.map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    activeFilter === label
                      ? 'bg-black text-white'
                      : 'bg-surface-muted text-text hover:bg-border border border-border'
                  )}
                >
                  {label}
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
                    {FIRST_FEED_MESSAGE.body}
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
                  <p className="mt-1 text-sm text-text leading-snug">{HOWARD_LINDZON_MESSAGE.body}</p>
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
