import { useEffect, useMemo, useState } from 'react'
import SentimentMeters from './components/SentimentMeters.jsx'
import EarningsRecap from './components/EarningsRecap.jsx'
import CommunityPerspectives from './components/CommunityPerspectives.jsx'
import PredictionLeaderboard from './components/PredictionLeaderboard.jsx'
import NarrativeTimeline from './components/NarrativeTimeline.jsx'

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
        stroke={lastUp ? '#17c964' : '#f31260'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeftSidebar({ isOpen, onClose, onToggleDark, isDark, watchlist }) {
  const content = (
    <div className="flex h-full w-full flex-col gap-4 bg-surface p-4">
      <div className="flex items-center gap-3">
        <img
          src="https://placehold.co/40x40"
          className="h-10 w-10 rounded-full border border-white/10"
          alt="avatar"
        />
        <div className="font-semibold">Profile</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn"><span>🔔</span> Notifications</button>
        <button className="btn"><span>✉️</span> Messages</button>
        <button className="btn"><span>⚙️</span> Settings</button>
        <button onClick={onToggleDark} className="btn">
          <span>{isDark ? '🌞' : '🌙'}</span> {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-96 lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-96 bg-surface shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="card-surface p-3">
      <div className="text-xs uppercase tracking-wide muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function Post({ post }) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-start gap-3">
        <img src={post.avatar} alt="avatar" className="h-10 w-10 rounded-full border border-white/10" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{post.user}</div>
            <div className="text-xs muted">{post.time}</div>
          </div>
          <div className="mt-1 whitespace-pre-wrap">{post.body}</div>
          <div className="mt-3 flex gap-3 text-sm muted">
            <button className="hover:text-text">❤️ Like</button>
            <button className="hover:text-text">🔁 Repost</button>
            <button className="hover:text-text">💬 Comment</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') return true
      if (stored === 'light') return false
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })
  const [activeTab, setActiveTab] = useState('Feed')
  const [streamTab, setStreamTab] = useState('Latest')

  useEffect(() => {
    const root = document.documentElement
    if (!root) return
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {}
  }, [dark])

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

  const posts = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i + 1,
        user: ['astrotrader', 'quantqueen', 'valueviking', 'optionsowl'][i % 4],
        time: `${1 + i}h`,
        avatar: `https://placehold.co/40x40?text=${i + 1}`,
        body:
          i % 2 === 0
            ? 'Accumulating on dips. Watching volume into the close. $RKLB looks strong.'
            : 'Breakout setting up if it clears the recent high. Risk defined. 🚀',
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

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-white/5 bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">Rocket Lab USA Inc.</div>
          <div className="badge">$RKLB</div>
        </div>
        <div className="font-semibold">$44.21</div>
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onToggleDark={() => setDark((d) => !d)}
        isDark={dark}
        watchlist={watchlist}
      />

      {/* Main content area shifted for fixed sidebar on lg+ */}
      <main className="lg:pl-96">
        <div className="mx-auto max-w-[1200px] p-4">
          {/* Header Section */}
          <div className="card-surface p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold md:text-2xl">Rocket Lab USA Inc.</h1>
                  <span className="badge">$RKLB</span>
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="text-3xl font-bold">$44.21</div>
                  <div className="text-success">+1.23 (3.45%)</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn">👀 Watching</button>
                <button className="btn">⏰ Alerts</button>
                <button className="btn btn-success">💹 Trade</button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatItem label="Mkt Cap" value="$2.3B" />
            <StatItem label="Volume" value="12.4M" />
            <StatItem label="52W High" value="$52.60" />
            <StatItem label="52W Low" value="$14.80" />
          </div>

          {/* Content Columns: Middle + Right */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
            {/* Middle Column */}
            <section className="space-y-4">
              {/* Tabs header at top */}
              <div className="card-surface">
                <div className="flex items-center gap-2 border-b border-white/5 px-3 pt-2">
                  {['About', 'Feed', 'News', 'Sentiment', 'Earnings', 'Fundamentals'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={clsx(
                        'px-3 py-2 text-sm',
                        activeTab === tab ? 'border-b-2 border-primary text-primary' : 'muted'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              {activeTab === 'Feed' ? (
                <>
                  {/* Chart Section (Feed only) */}
                  <div className="card-surface p-4">
                    <img
                      src="https://placehold.co/1200x400/0f141a/9aa9b2?text=Stock+Chart"
                      alt="Chart placeholder"
                      className="h-64 w-full rounded-md object-cover md:h-80"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((t) => (
                        <button key={t} className="btn px-2 py-1 text-xs">{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment + Volume meters below chart */}
                  <SentimentMeters />

                  {/* Community Perspectives above earnings recap */}
                  <CommunityPerspectives />

                  {/* Earnings Recap below meters */}
                  <EarningsRecap />

                  {/* Embedded Narrative Timeline below Earnings Recap */}
                  <NarrativeTimeline variant="embedded" />

                  {/* Posts (Feed only) */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 px-2 py-1">
                    <div className="flex items-center gap-1">
                      {['Latest', 'Popular'].map((label) => (
                        <button
                          key={label}
                          onClick={() => setStreamTab(label)}
                          className={clsx(
                            'px-2 py-1 text-sm',
                            streamTab === label ? 'border-b-2 border-primary text-primary' : 'muted hover:text-text'
                          )}
                          aria-pressed={streamTab === label}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-1 hover:bg-white/5" aria-label="Settings">⚙️</button>
                      <button className="rounded-md p-1 hover:bg-white/5" aria-label="Search">🔍</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {posts.map((p) => <Post key={p.id} post={p} />)}
                  </div>
                </>
              ) : (
                <div className="card-surface p-6 text-center muted">No content yet for {activeTab}</div>
              )}
            </section>

            {/* Right Column */}
            <aside className="space-y-4">
              <div className="card-surface p-4">
                <div className="mb-2 text-sm uppercase tracking-wide muted">Latest $RKLB News</div>
                <div className="space-y-3">
                  {news.map((n, i) => (
                    <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="font-medium leading-snug">{n.title}</div>
                      <div className="mt-1 text-xs muted">{n.source} • {n.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-surface p-4">
                <div className="muted mb-2 text-sm">Ad Slot</div>
                <img src="https://placehold.co/400x200/0f141a/9aa9b2?text=Ad" className="w-full rounded-md" alt="Ad" />
              </div>

              <PredictionLeaderboard />

            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

