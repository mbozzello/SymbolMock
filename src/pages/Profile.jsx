import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
]

const HOWARD_PROFILE = {
  username: 'howardlindzon',
  displayName: 'Howard Lindzon',
  avatar: '/avatars/howard-lindzon.png',
  verified: true,
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

export default function Profile() {
  const { username } = useParams()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeTab, setActiveTab] = useState('Posts')
  const [isFollowing, setIsFollowing] = useState(HOWARD_PROFILE.following)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const profile = username === 'howardlindzon' ? HOWARD_PROFILE : null
  const posts = username === 'howardlindzon' ? HOWARD_POSTS : []

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

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
        watchlist={WATCHLIST}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[269px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          {/* Middle column: Profile */}
          <div className="flex-1 min-w-0">
            {/* Profile header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border border-border"
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
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-text">{profile.displayName}</span>
                    {profile.followsYou && (
                      <span className="text-xs text-muted">Follows You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
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
                </div>
              </div>

              <p className="mt-4 text-sm text-text leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-text border border-border"
                  >
                    {tag}
                  </span>
                ))}
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
              </div>

              <div className="flex gap-6 mt-3 text-sm">
                <span><span className="font-semibold text-text">{profile.followingCount}</span> Following</span>
                <span><span className="font-semibold text-text">{profile.followersCount}</span> Followers</span>
              </div>

              {(profile.sentiment || profile.tickerMentions) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex gap-8 items-stretch">
                    {profile.sentiment && (
                      <div className="flex-1 flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Post Sentiment</div>
                        <div className="flex gap-3 flex-1 min-h-[52px] items-center">
                          <div className="flex items-center gap-3">
                            <SentimentCircle
                              pct={profile.sentiment['30d'].pct}
                              direction={profile.sentiment['30d'].direction}
                              size={48}
                            />
                            <div>
                              <div className="text-sm font-semibold text-text">30 days</div>
                              <div className={clsx(
                                'text-sm font-medium leading-tight',
                                profile.sentiment['30d'].direction === 'bullish' ? 'text-success' : 'text-danger'
                              )}>
                                {profile.sentiment['30d'].pct}% {profile.sentiment['30d'].label}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <SentimentCircle
                              pct={profile.sentiment['90d'].pct}
                              direction={profile.sentiment['90d'].direction}
                              size={48}
                            />
                            <div>
                              <div className="text-sm font-semibold text-text">90 days</div>
                              <div className={clsx(
                                'text-sm font-medium leading-tight',
                                profile.sentiment['90d'].direction === 'bullish' ? 'text-success' : 'text-danger'
                              )}>
                                {profile.sentiment['90d'].pct}% {profile.sentiment['90d'].label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.tickerMentions && (
                      <div className="flex-1 flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Most Ticker Mentions</div>
                        <div className="flex gap-3 flex-1 min-h-[52px] items-center">
                          <div className="flex flex-col gap-1.5">
                            <div className="text-sm font-semibold text-text">30 days</div>
                            {profile.tickerMentions['30d'][0] && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted border border-border w-fit leading-none">
                                {getTickerLogo(profile.tickerMentions['30d'][0].ticker) ? (
                                  <img src={getTickerLogo(profile.tickerMentions['30d'][0].ticker)} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-surface flex items-center justify-center text-[9px] font-bold text-text shrink-0">{profile.tickerMentions['30d'][0].ticker[0]}</span>
                                )}
                                <span className="text-xs font-semibold text-text">${profile.tickerMentions['30d'][0].ticker}</span>
                                <span className="text-[10px] text-muted">×{profile.tickerMentions['30d'][0].count}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="text-sm font-semibold text-text">90 days</div>
                            {profile.tickerMentions['90d'][0] && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted border border-border w-fit leading-none">
                                {getTickerLogo(profile.tickerMentions['90d'][0].ticker) ? (
                                  <img src={getTickerLogo(profile.tickerMentions['90d'][0].ticker)} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-surface flex items-center justify-center text-[9px] font-bold text-text shrink-0">{profile.tickerMentions['90d'][0].ticker[0]}</span>
                                )}
                                <span className="text-xs font-semibold text-text">${profile.tickerMentions['90d'][0].ticker}</span>
                                <span className="text-[10px] text-muted">×{profile.tickerMentions['90d'][0].count}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border flex-wrap">
              {[
                { id: 'Posts', label: 'Posts' },
                { id: 'Posts & Replies', label: 'Posts & Replies' },
                { id: 'Liked', label: 'Liked' },
                { id: 'Watchlist', label: `${profile.watchlistCount} Watchlist` },
                { id: 'Private Journal', label: 'Private Journal', lock: true },
              ].map((tab) => (
                <button
                  key={tab.id}
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
                        <p className="mt-1 text-sm text-text leading-snug whitespace-pre-wrap">{entry.body}</p>
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
                      <p className="mt-1 text-sm text-text leading-snug whitespace-pre-wrap">{post.body}</p>
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
