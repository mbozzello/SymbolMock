import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import WhatsHappening from './components/WhatsHappening.jsx'
import Community from './components/Community.jsx'
import PredictionLeaderboard from './components/PredictionLeaderboard.jsx'
import NarrativeTimeline from './components/NarrativeTimeline.jsx'
import DynamicThemes from './components/DynamicThemes.jsx'
import CollapsibleStockHeader from './components/CollapsibleStockHeader.jsx'
import TopNavigation from './components/TopNavigation.jsx'
import TickerTape from './components/TickerTape.jsx'
import Poll from './components/Poll.jsx'
import MessagePostBox from './components/MessagePostBox.jsx'
import Home from './pages/Home.jsx'
import Homepage2 from './pages/Homepage2.jsx'
import Homepage3 from './pages/Homepage3.jsx'
import Search from './pages/Search.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import Notifications from './pages/Notifications.jsx'
import News from './pages/News.jsx'
import Earnings from './pages/Earnings.jsx'
import Article from './pages/Article.jsx'
import Markets from './pages/Markets.jsx'
import Scheduled from './pages/Scheduled.jsx'
import Profile from './pages/Profile.jsx'
import Onboarding from './pages/Onboarding.jsx'
import SymbolPredict from './pages/SymbolPredict.jsx'
import SymbolPredict2 from './pages/SymbolPredict2.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import HomeIOS from './pages/HomeIOS.jsx'
import IOSTools from './pages/IOSTools.jsx'
import IOSNotifications from './pages/IOSNotifications.jsx'
import IOSExplore from './pages/IOSExplore.jsx'
import IOSSearch from './pages/IOSSearch.jsx'
import { BookmarkProvider } from './contexts/BookmarkContext.jsx'
import { TickerTapeProvider } from './contexts/TickerTapeContext.jsx'
import { LiveQuotesProvider, useLiveQuotesContext } from './contexts/LiveQuotesContext.jsx'
import { WatchlistProvider, useWatchlist } from './contexts/WatchlistContext.jsx'
import TickerLinkedText from './components/TickerLinkedText.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [], isUp }) {
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
  const up = isUp !== undefined ? isUp : (values[values.length - 1] >= values[0])
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7">
        <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeftSidebar({ isOpen, onClose, watchlist, darkMode, toggleDarkMode }) {
  const content = (
    <div className="flex h-full w-full flex-col gap-4 bg-background p-4 border-r border-border">
      <a href="/" className="block shrink-0" aria-label="Stocktwits">
        <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-[39px] w-auto object-contain" />
      </a>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/avatars/user-avatar.png"
            className="h-10 w-10 rounded-full border border-border object-cover"
            alt="Profile"
          />
          <div className="font-semibold">Profile</div>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-surface-muted transition-colors opacity-70 hover:opacity-100"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
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
      <div className="flex flex-col gap-2">
        <button className="btn"><span>🔔</span> Notifications</button>
        <button className="btn"><span>✉️</span> Messages</button>
        <button className="btn"><span>⚙️</span> Settings</button>
      </div>
      <button className="btn btn-primary w-full text-base">Post</button>

      <div className="mt-2 text-sm uppercase tracking-wide muted">Watchlist</div>
      <div className="space-y-2 overflow-y-auto pr-1">
        {watchlist.map((s) => (
          <div key={s.ticker} className="p-3 border-b border-border last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div>
                  <span className="font-semibold">{s.ticker}</span>
                </div>
                <div className="truncate text-sm muted">{s.name}</div>
              </div>
              <MiniSparkline values={s.spark} isUp={s.change >= 0} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="font-semibold">${s.price.toFixed(2)}</div>
              <div className={clsx('text-sm flex items-center gap-0', s.change >= 0 ? 'text-success' : 'text-danger')}>
                {s.change >= 0 ? (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                ) : (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                )}
                {Math.abs(s.change).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[300px] lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-[300px] bg-background shadow-xl border-r border-border">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

function Post({ post, isUnregistered }) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-start gap-3">
        <img src={post.avatar} alt="avatar" className="h-10 w-10 rounded-full border border-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{post.user}</div>
            <div className="text-xs muted">{post.time}</div>
          </div>
          <div className="mt-1 whitespace-pre-wrap">{typeof post.body === 'string' ? <TickerLinkedText text={post.body} /> : post.body}</div>
          <div
            className={clsx(
              'mt-3 flex gap-4 text-sm muted',
              isUnregistered && 'pointer-events-none opacity-60'
            )}
          >
            <button className="hover:text-text transition-colors">{isUnregistered ? '🔒 Like' : '❤️ Like'}</button>
            <button className="hover:text-text transition-colors">{isUnregistered ? '🔒 Repost' : '🔁 Repost'}</button>
            <button className="hover:text-text transition-colors">{isUnregistered ? '🔒 Comment' : '💬 Comment'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HardGate({ isLocked, label, ctaText = 'Register to unlock', children }) {
  if (!isLocked) {
    return children
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm bg-background border border-border">
          <span className="uppercase tracking-wide muted">{label}</span>
          <button className="btn btn-primary">{ctaText}</button>
        </div>
      </div>
    </div>
  )
}

function SoftGate({ isLocked, label, ctaText = 'Register to unlock more', children }) {
  if (!isLocked) {
    return children
  }

  return (
    <div className="space-y-2">
      {children}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm border-t border-border">
        <span className="uppercase tracking-wide muted">{label}</span>
        <button className="btn btn-primary">{ctaText}</button>
      </div>
    </div>
  )
}

function useDashboardData({ isUnregistered = false }) {
  const { watchlist } = useWatchlist()
  const { getSpark } = useLiveQuotesContext()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [streamTab, setStreamTab] = useState('Latest')
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [quickStartActive, setQuickStartActive] = useState(false)
  const [activeNavTab, setActiveNavTab] = useState('Feed')
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return false
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
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

  const quickStartBundle = useMemo(
    () => ['RKLB', 'SPCE', 'LMT', 'NOC', 'BA', 'RTX', 'AVAV', 'IRDM', 'MAXR', 'PL', 'RDW'],
    []
  )

  const headerSpark = useMemo(
    () => getSpark('CELH').length ? getSpark('CELH') : [12, 13, 12.6, 12.9, 13.2, 12.8, 13.6, 14],
    [watchlist, getSpark]
  )

  const posts = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        user: ['astrotrader', 'quantqueen', 'valueviking', 'optionsowl', 'spacebull', 'rocketman'][i % 6],
        time: `${1 + i}h`,
        avatar: `/avatars/top-voice-${(i % 3) + 1}.png`,
        body: [
          'Accumulating on dips. Watching volume into the close. $RKLB looks strong.',
          'Breakout setting up if it clears the recent high. Risk defined. 🚀',
          'China tariffs could impact supply chain. Watching for guidance on next earnings call.',
          'Fed decision this week could shake up the market. Positioning accordingly.',
          'New product launch rumors circulating. This could be huge for the space sector.',
          'Earnings call next week should provide clarity on growth trajectory.',
          'Space contracts with government agencies looking promising for Q4.',
          'Market sentiment shifting bullish on aerospace stocks.',
          'Technical analysis shows strong support at current levels.',
          'Institutional buying picking up. Smart money knows something.',
          'Competition heating up but RKLB has first mover advantage.',
          'Supply chain issues resolving. Production ramping up nicely.'
        ][i % 12],
        theme: [
          'rival-platforms', 'sub-30-swings', 'exec-scrutiny', 'super-bowl-hype',
          'rival-platforms', 'sub-30-swings', 'exec-scrutiny', 'super-bowl-hype',
          'rival-platforms', 'sub-30-swings', 'exec-scrutiny', 'super-bowl-hype'
        ][i % 12]
      })),
    []
  )

  const news = useMemo(
    () => [
      { title: 'Rocket Lab shares pop after successful mission', source: 'Zacks', time: '15m' },
      { title: 'Analyst upgrades RKLB to Outperform', source: 'Barron’s', time: '1h' },
      { title: 'Space sector rallies on defense contracts', source: 'Bloomberg', time: '2h' },
      { title: 'RKLB announces new launch window', source: 'MarketWatch', time: '3h' },
    ],
    []
  )

  const headerStats = useMemo(
    () => [
      { label: 'Mkt Cap', value: '$14.2B' },
      { label: 'Volume', value: '12.4M' },
      { label: '52W High', value: '$52.60' },
      { label: '52W Low', value: '$14.80' },
      { label: 'P/E Ratio', value: '—' },
      { label: 'EPS', value: '-$0.12' },
      { label: 'Sentiment', value: '72% Bullish' },
      { label: 'Msg Vol (24h)', value: 1234 },
      { label: 'Beta', value: '2.14' },
      { label: 'Avg Vol', value: '18.2M' },
    ],
    []
  )

  // CELH spark pattern scaled to GME price range (~27.5–29.96)
  const chartValues = useMemo(() => {
    const celh = getSpark('CELH').length ? getSpark('CELH') : [12, 13, 12.6, 12.9, 13.2, 12.8, 13.6, 14]
    const lo = Math.min(...celh)
    const hi = Math.max(...celh)
    const range = Math.max(1, hi - lo)
    return celh.map((v) => 27.5 + ((v - lo) / range) * (29.96 - 27.5))
  }, [getSpark])

  const featuredPosts = useMemo(
    () => [
      {
        id: 'featured-1',
        user: 'quantqueen',
        time: '45m',
        avatar: 'https://placehold.co/40x40?text=Q',
        body: 'Consensus view: demand tailwinds + contract momentum. Watching for confirmation on the next guidance update.',
        comments: 28,
        likes: 214,
        reposts: 41,
        featured: true,
      },
      {
        id: 'featured-2',
        user: 'spacebull',
        time: '2h',
        avatar: 'https://placehold.co/40x40?text=S',
        body: 'Thread recap: top 5 community catalysts into the earnings window.',
        comments: 19,
        likes: 162,
        reposts: 33,
        featured: true,
      },
      {
        id: 'featured-3',
        user: 'optionsowl',
        time: '4h',
        avatar: 'https://placehold.co/40x40?text=O',
        body: 'Volatility snapshot: bullish flows concentrated in the 45-50 strike ladder.',
        comments: 12,
        likes: 98,
        reposts: 21,
        featured: false,
      },
    ],
    []
  )

  const featuredPost = featuredPosts.find((post) => post.featured) ?? featuredPosts[0]

  const filteredPosts = posts.filter((post) => !selectedTheme || post.theme === selectedTheme)
  const visiblePosts = isUnregistered ? filteredPosts.slice(0, 3) : filteredPosts

  return {
    mobileNavOpen,
    setMobileNavOpen,
    streamTab,
    setStreamTab,
    selectedTheme,
    setSelectedTheme,
    quickStartActive,
    setQuickStartActive,
    darkMode,
    toggleDarkMode,
    watchlist,
    quickStartBundle,
    headerSpark,
    news,
    headerStats,
    chartValues,
    featuredPost,
    filteredPosts,
    visiblePosts,
    activeNavTab,
    setActiveNavTab,
  }
}

export function Dashboard({ isUnregistered = false }) {
  const {
    mobileNavOpen,
    setMobileNavOpen,
    streamTab,
    setStreamTab,
    selectedTheme,
    setSelectedTheme,
    quickStartActive,
    setQuickStartActive,
    darkMode,
    toggleDarkMode,
    watchlist,
    quickStartBundle,
    headerSpark,
    news,
    headerStats,
    chartValues,
    filteredPosts,
    visiblePosts,
    activeNavTab,
    setActiveNavTab,
  } = useDashboardData({ isUnregistered })

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">GameStop Corp.</div>
          <div className="badge font-semibold">$GME</div>
        </div>
        <div className="font-semibold">$29.96</div>
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content area shifted for fixed sidebar on lg+ */}
      <main className="lg:pl-[300px] bg-background">
        <TopNavigation />
        <TickerTape />
        <div className="mx-auto max-w-[1200px] pt-2 px-4 pb-4">
          <CollapsibleStockHeader
            title="GameStop Corp."
            ticker="GME"
            price={29.96}
            change={0.62}
            changePct={2.11}
            watchers={120456}
            stats={headerStats}
            chartValues={chartValues}
            sparkValues={headerSpark}
            isUnregistered={isUnregistered}
            headerAction={
              isUnregistered ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide muted font-semibold">Quick start watchlist</div>
                      <div className="text-base font-semibold">GME + 10 peers in one click</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-success font-semibold" onClick={() => setQuickStartActive(true)}>
                        Activate bundle
                      </button>
                      <button className="btn btn-primary font-semibold">Register to unlock full data</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickStartBundle.map((symbol) => (
                      <span key={symbol} className="badge font-semibold">
                        {symbol}
                      </span>
                    ))}
                  </div>
                  {quickStartActive && (
                    <div className="flex items-center justify-between gap-3 p-3 text-sm border border-border">
                      <div>
                        <div className="font-semibold">Watchlist created</div>
                        <div className="muted">We added GME and 10 related symbols to your watchlist.</div>
                      </div>
                      <button className="btn btn-primary">View watchlist</button>
                    </div>
                  )}
                </div>
              ) : null
            }
          />

          <div className="mt-4 grid grid-cols-1 gap-x-0 gap-y-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-4">
              <div className="flex items-center gap-1 border-b border-border">
                {['Feed', 'Fundamentals', 'News', 'Sentiment', 'Earnings', 'Info'].map((label) => (
                  <button
                    key={label}
                    onClick={() => setActiveNavTab(label)}
                    className={clsx(
                      'px-3 py-2 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[1px]',
                      activeNavTab === label ? 'border-text text-text' : 'border-transparent muted hover:text-text'
                    )}
                    aria-pressed={activeNavTab === label}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <SoftGate
                isLocked={isUnregistered}
                label="Community perspectives"
                ctaText="Register to unlock"
              >
                <WhatsHappening />
              </SoftGate>

              <MessagePostBox />

              <DynamicThemes
                onThemeSelect={setSelectedTheme}
                selectedTheme={selectedTheme}
                layout="horizontal"
              />

              <div>
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                  <div className="flex items-center gap-1">
                    {['Latest', 'Popular'].map((label) => (
                      <button
                        key={label}
                        onClick={() => setStreamTab(label)}
                        className={clsx(
                          'px-2 py-1 text-sm font-semibold transition-all duration-200',
                          streamTab === label ? 'border-b-2 border-text text-text' : 'muted hover:text-text'
                        )}
                        aria-pressed={streamTab === label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md p-1 hover:bg-surface-muted transition-colors" aria-label="Settings">⚙️</button>
                    <button className="rounded-md p-1 hover:bg-surface-muted transition-colors" aria-label="Search">🔍</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {visiblePosts.map((p, index) => (
                    <div key={p.id}>
                      <Post post={p} isUnregistered={isUnregistered} />
                      {!isUnregistered && index === 1 && (
                        <div className="mt-3">
                          <Poll />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isUnregistered && filteredPosts.length > visiblePosts.length && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm border-t border-border">
                    <span className="uppercase tracking-wide muted">More posts locked</span>
                    <button className="btn btn-primary">Register to view full feed</button>
                  </div>
                )}
              </div>
            </section>

            <aside className="relative space-y-4 before:content-[''] before:absolute before:left-0 before:top-9 before:bottom-0 before:w-0 before:bg-[var(--color-border)] lg:before:w-px">
              <div className="space-y-0.5">
                {/* Ad */}
                <div className="pt-0 px-4 pb-1">
                  <img
                    src="/images/ad-foxwoods-draftkings.png"
                    alt="Foxwoods and DraftKings - Your game plan for game day"
                    className="w-full h-64 object-cover rounded-md"
                  />
                </div>
                <Community />
              </div>
              <SoftGate isLocked={isUnregistered} label="More news" ctaText="Register to view">
                <div className="p-4">
                  <div className="mb-2 text-sm uppercase tracking-wide muted font-semibold">Latest $RKLB News</div>
                  <div className="space-y-3">
                    {(isUnregistered ? news.slice(0, 2) : news).map((n, i) => (
                      <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="font-semibold leading-snug">{n.title}</div>
                        <div className="mt-1 text-xs muted">{n.source} • {n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SoftGate>
              <HardGate isLocked={isUnregistered} label="Leaderboard locked" ctaText="Register">
                <PredictionLeaderboard />
              </HardGate>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

function NewPage() {
  const {
    mobileNavOpen,
    setMobileNavOpen,
    streamTab,
    setStreamTab,
    selectedTheme,
    setSelectedTheme,
    darkMode,
    toggleDarkMode,
    watchlist,
    headerSpark,
    news,
    headerStats,
    chartValues,
    visiblePosts,
  } = useDashboardData({ isUnregistered: false })

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">GameStop Corp.</div>
          <div className="badge font-semibold">$GME</div>
        </div>
        <div className="font-semibold">$29.96</div>
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[300px] bg-background">
        <TopNavigation />
        <TickerTape />
        <div className="mx-auto max-w-[1200px] space-y-4 pt-2 px-4 pb-4">
          <CollapsibleStockHeader
            title="GameStop Corp."
            ticker="GME"
            price={29.96}
            change={0.62}
            changePct={2.11}
            watchers={120456}
            stats={headerStats}
            chartValues={chartValues}
            sparkValues={headerSpark}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-4">
              <div className="space-y-4 p-4">
                <div className="text-xs uppercase tracking-wide muted font-semibold">What's happening</div>
                <DynamicThemes
                  onThemeSelect={setSelectedTheme}
                  selectedTheme={selectedTheme}
                  layout="horizontal"
                />
                <WhatsHappening />
              </div>
            </section>

            <aside className="space-y-4">
              {/* Ad */}
              <div className="p-4">
                <img
                  src="/images/ad-foxwoods-draftkings.png"
                  alt="Foxwoods and DraftKings - Your game plan for game day"
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
              <PredictionLeaderboard />
            </aside>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-4">
              <div className="space-y-4">
                <NarrativeTimeline />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                  <div className="flex items-center gap-1">
                    {['Latest', 'Popular'].map((label) => (
                      <button
                        key={label}
                        onClick={() => setStreamTab(label)}
                        className={clsx(
                          'px-2 py-1 text-sm font-semibold transition-all duration-200',
                          streamTab === label ? 'border-b-2 border-text text-text' : 'muted hover:text-text'
                        )}
                        aria-pressed={streamTab === label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md p-1 hover:bg-surface-muted transition-colors" aria-label="Settings">⚙️</button>
                    <button className="rounded-md p-1 hover:bg-surface-muted transition-colors" aria-label="Search">🔍</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {visiblePosts.map((p) => (
                    <Post key={p.id} post={p} />
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="p-4">
                <div className="mb-2 text-sm uppercase tracking-wide muted font-semibold">Latest $RKLB News</div>
                <div className="space-y-3">
                  {news.map((n, i) => (
                    <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="font-semibold leading-snug">{n.title}</div>
                      <div className="mt-1 text-xs muted">{n.source} • {n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

function RegisteredPage() {
  return <Dashboard />
}

function UnregisteredPage() {
  return <Dashboard isUnregistered />
}

export default function App() {
  return (
    <BookmarkProvider>
      <WatchlistProvider>
      <LiveQuotesProvider>
      <TickerTapeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Homepage3 />} />
        <Route path="/home2" element={<Homepage2 />} />
        <Route path="/home3" element={<Homepage2 />} />
        <Route path="/symbol" element={<Home />} />
        <Route path="/symbolpredict" element={<SymbolPredict />} />
        <Route path="/symbolpredict2" element={<SymbolPredict2 />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/news" element={<News />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/article/:slug" element={<Article />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/scheduled" element={<Scheduled />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/myprofile/:username" element={<Profile isOwnProfile />} />
        <Route path="/registered" element={<RegisteredPage />} />
        <Route path="/unreg" element={<UnregisteredPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/homeios" element={<HomeIOS />} />
        <Route path="/iostools" element={<IOSTools />} />
        <Route path="/iosnotifications" element={<IOSNotifications />} />
        <Route path="/exploreios" element={<IOSExplore />} />
        <Route path="/iosforyou" element={<IOSExplore />} />
        <Route path="/iossearch" element={<IOSSearch />} />
        <Route path="/newpage" element={<NewPage />} />
      </Routes>
      </TickerTapeProvider>
      </LiveQuotesProvider>
      </WatchlistProvider>
    </BookmarkProvider>
  )
}

