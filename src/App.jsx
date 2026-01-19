import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SentimentMeters from './components/SentimentMeters.jsx'
import CommunityPerspectives from './components/CommunityPerspectives.jsx'
import PredictionLeaderboard from './components/PredictionLeaderboard.jsx'
import NarrativeTimeline from './components/NarrativeTimeline.jsx'
import DynamicThemes from './components/DynamicThemes.jsx'
import CollapsibleStockHeader from './components/CollapsibleStockHeader.jsx'
import CreatorSpotlight from './components/CreatorSpotlight.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7">
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

function LeftSidebar({ isOpen, onClose, watchlist, darkMode, toggleDarkMode }) {
  const content = (
    <div className="flex h-full w-full flex-col gap-4 bg-surface p-4 border-r border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="https://placehold.co/40x40"
            className="h-10 w-10 rounded-full border border-border"
            alt="avatar"
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
          <div key={s.ticker} className="card-surface p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.ticker}</span>
                  <span className="badge">{s.sector}</span>
                </div>
                <div className="truncate text-sm muted">{s.name}</div>
              </div>
              <MiniSparkline values={s.spark} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="font-semibold">${s.price.toFixed(2)}</div>
              <div className={clsx('text-sm', s.change >= 0 ? 'text-success' : 'text-danger')}>
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[269px] lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-[269px] bg-surface shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

function Post({ post, isUnregistered }) {
  const themeLabels = {
    'china-tariffs': 'China Tariffs',
    'fed-decision': 'Fed Decision',
    'product-launch': 'Product Launch',
    'earnings-call': 'Earnings Call',
    'space-contracts': 'Space Contracts',
    'market-sentiment': 'Market Sentiment'
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-start gap-3">
        <img src={post.avatar} alt="avatar" className="h-10 w-10 rounded-full border border-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{post.user}</div>
            <div className="text-xs muted">{post.time}</div>
            {post.theme && (
              <span className="badge badge-sm text-xs font-semibold">
                {themeLabels[post.theme]}
              </span>
            )}
          </div>
          <div className="mt-1 whitespace-pre-wrap">{post.body}</div>
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
        <div className="card-surface flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm">
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
      <div className="card-surface flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
        <span className="uppercase tracking-wide muted">{label}</span>
        <button className="btn btn-primary">{ctaText}</button>
      </div>
    </div>
  )
}

export function Dashboard({ isUnregistered = false }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [streamTab, setStreamTab] = useState('Latest')
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [quickStartActive, setQuickStartActive] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark theme
    return true;
  });
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Apply theme to document on initial load and when theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const watchlist = useMemo(
    () => [
      { ticker: 'CELH', name: 'Celsius Holdings', sector: 'Beverages', price: 92.31, change: 2.18, spark: [12, 13, 12.6, 12.9, 13.2, 12.8, 13.6, 14] },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semis', price: 889.42, change: -1.12, spark: [30, 32, 31, 33, 35, 34, 33, 32] },
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Hardware', price: 182.51, change: 0.84, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
      { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Auto', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Software', price: 414.63, change: 1.02, spark: [25, 24, 24.5, 25.2, 25.1, 25.6, 26, 26.2] },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'E-Comm', price: 171.05, change: 0.31, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Social', price: 497.88, change: -0.23, spark: [40, 39.5, 39.8, 40.6, 40.1, 41, 41.2, 40.7] },
      { ticker: 'RKLB', name: 'Rocket Lab USA Inc.', sector: 'Aerospace', price: 44.21, change: 3.45, spark: [10, 10.5, 10.2, 10.8, 11, 11.6, 11.2, 12.5] },
    ],
    []
  )

  const quickStartBundle = useMemo(
    () => ['RKLB', 'SPCE', 'LMT', 'NOC', 'BA', 'RTX', 'AVAV', 'IRDM', 'MAXR', 'PL', 'RDW'],
    []
  )

  const headerSpark = useMemo(
    () => watchlist.find((s) => s.ticker === 'RKLB')?.spark ?? [],
    [watchlist]
  )

  const posts = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        user: ['astrotrader', 'quantqueen', 'valueviking', 'optionsowl', 'spacebull', 'rocketman'][i % 6],
        time: `${1 + i}h`,
        avatar: `https://placehold.co/40x40?text=${i + 1}`,
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
          'market-sentiment', 'market-sentiment', 'china-tariffs', 'fed-decision', 
          'product-launch', 'earnings-call', 'space-contracts', 'market-sentiment',
          'market-sentiment', 'market-sentiment', 'product-launch', 'earnings-call'
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
      { label: 'Mkt Cap', value: '$2.3B' },
      { label: 'Volume', value: '12.4M' },
      { label: '52W High', value: '$52.60' },
      { label: '52W Low', value: '$14.80' },
      { label: 'P/E Ratio', value: '—' },
      { label: 'EPS', value: '-$0.12' },
      { label: 'Sentiment', value: '72% Bullish' },
      { label: 'Msg Vol (24h)', value: '1.2K' },
      { label: 'Beta', value: '2.14' },
      { label: 'Avg Vol', value: '18.2M' },
    ],
    []
  )

  const chartValues = useMemo(
    () => [
      38.50, 39.10, 38.80, 39.40, 40.20, 39.90, 40.50, 41.10, 40.80, 41.40,
      41.80, 42.20, 41.90, 42.50, 42.10, 42.80, 43.20, 42.90, 43.50, 43.10,
      43.80, 44.20, 43.90, 44.50, 44.10, 44.80, 44.40, 43.90, 44.30, 44.21,
    ],
    []
  )

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

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">Rocket Lab USA Inc.</div>
          <div className="badge font-semibold">$RKLB</div>
        </div>
        <div className="font-semibold">$44.21</div>
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content area shifted for fixed sidebar on lg+ */}
      <main className="lg:pl-[269px]">
        <div className="mx-auto max-w-[1200px] p-4">
          <CollapsibleStockHeader
            title="Rocket Lab USA Inc."
            ticker="RKLB"
            price={44.21}
            change={1.23}
            changePct={3.45}
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
                      <div className="text-base font-semibold">RKLB + 10 peers in one click</div>
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
                    <div className="card-surface flex items-center justify-between gap-3 p-3 text-sm">
                      <div>
                        <div className="font-semibold">Watchlist created</div>
                        <div className="muted">We added RKLB and 10 related symbols to your watchlist.</div>
                      </div>
                      <button className="btn btn-primary">View watchlist</button>
                    </div>
                  )}
                </div>
              ) : null
            }
          />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
            <aside className="hidden flex-col gap-4 xl:flex">
              <HardGate isLocked={isUnregistered} label="Timeline locked" ctaText="Register">
                <NarrativeTimeline />
              </HardGate>
            </aside>

            <section className="space-y-4">
              <div className="space-y-4 xl:hidden">
                <HardGate isLocked={isUnregistered} label="Timeline locked" ctaText="Register">
                  <NarrativeTimeline variant="embedded" />
                </HardGate>
                <HardGate isLocked={isUnregistered} label="Sentiment locked" ctaText="Register">
                  <SentimentMeters />
                </HardGate>
              </div>

              <SoftGate
                isLocked={isUnregistered}
                label="Community perspectives"
                ctaText="Register to unlock"
              >
                <CommunityPerspectives />
              </SoftGate>

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
                  {visiblePosts.map((p) => (
                    <Post key={p.id} post={p} isUnregistered={isUnregistered} />
                  ))}
                </div>

                {isUnregistered && filteredPosts.length > visiblePosts.length && (
                  <div className="mt-3 card-surface flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="uppercase tracking-wide muted">More posts locked</span>
                    <button className="btn btn-primary">Register to view full feed</button>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <SoftGate isLocked={isUnregistered} label="Creator spotlight" ctaText="Join to view">
                <CreatorSpotlight featuredPost={featuredPost} />
              </SoftGate>
              <HardGate isLocked={isUnregistered} label="Leaderboard locked" ctaText="Register">
                <PredictionLeaderboard />
              </HardGate>
              <SoftGate isLocked={isUnregistered} label="More news" ctaText="Register to view">
                <div className="card-surface p-4">
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
    <Routes>
      <Route path="/" element={<Navigate to="/registered" replace />} />
      <Route path="/registered" element={<RegisteredPage />} />
      <Route path="/unreg" element={<UnregisteredPage />} />
    </Routes>
  )
}


