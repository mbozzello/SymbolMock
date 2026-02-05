import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
  { ticker: 'LULU', name: 'Lululemon', price: 385.00, change: 4.20, spark: [380, 381, 382, 383, 384, 383.5, 384.5, 385] },
]

const SEARCH_TABS = ['Top', 'Latest', 'People', 'Media']

const SEARCH_MESSAGES = [
  { id: '1', username: 'Elon_Musk', displayName: 'Elon Musk', avatar: '/avatars/who-follow-1.png', body: 'Next generation of autonomy will make the current FSD stack look like a toy. $TSLA', time: '2h', comments: 892, reposts: 4200, likes: 24100 },
  { id: '2', username: 'TeslaDaily', displayName: 'Tesla Daily', avatar: '/avatars/who-follow-2.png', body: 'Elon on earnings call: "We are not a car company. We are an energy and AI company."', time: '5h', comments: 312, reposts: 1800, likes: 8500 },
  { id: '3', username: 'muskempire', displayName: 'Elon Musk', avatar: '/avatars/who-follow-3.png', body: 'SpaceX and Tesla both pushing the boundary. What do you think about $TSLA at these levels?', time: '8h', comments: 445, reposts: 2100, likes: 12300 },
]

function formatEngagement(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => (localStorage.getItem('theme') === 'dark'))
  const [activeTab, setActiveTab] = useState('Top')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    if (!filterOpen) return
    const onMouseDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [filterOpen])

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
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Search box above tabs */}
            <div ref={filterRef} className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 mb-4 overflow-visible">
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className={clsx('flex items-center justify-center w-9 h-9 rounded-lg transition-colors', filterOpen ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text hover:bg-surface')}
                aria-label="Filters"
                aria-expanded={filterOpen}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" /><circle cx="16" cy="12" r="1.5" fill="currentColor" /><circle cx="8" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
              {filterOpen && (
                <div className="absolute left-4 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-white dark:bg-surface shadow-lg py-1">
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">After date</button>
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">Before date</button>
                  <div className="my-1 border-t border-border" />
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">From profile...</button>
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">With $ticker</button>
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">Tags</button>
                  <div className="my-1 border-t border-border" />
                  <button type="button" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-muted/80 text-sm font-bold text-text">Sentiment</button>
                </div>
              )}
              <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="6" /><path d="m17 17-4-4" /></svg>
              <input
                type="text"
                value={q}
                onChange={(e) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), q: e.target.value || undefined }))}
                placeholder="Search symbols, people, or phrases"
                className="flex-1 min-w-0 py-1.5 bg-transparent border-0 text-text placeholder:text-text-muted focus:outline-none text-sm"
                aria-label="Search"
              />
              {q && (
                <button type="button" onClick={() => setSearchParams((prev) => { const o = Object.fromEntries(prev); delete o.q; return o; })} className="p-1 rounded-md hover:bg-surface text-text-muted" aria-label="Clear">×</button>
              )}
            </div>

            <nav className="flex border-b border-border mb-4" aria-label="Search tabs">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx('flex-1 py-3 text-sm font-medium border-b-2 -mb-px', activeTab === tab ? 'text-text border-primary' : 'text-text-muted border-transparent hover:text-text')}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {(activeTab === 'Top' || activeTab === 'Latest') && (
              <div className="divide-y divide-border">
                {SEARCH_MESSAGES.map((msg) => (
                  <article key={msg.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text">{msg.username}</span>
                          <span className="text-xs text-text-muted">{msg.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-text leading-snug whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex gap-4 mt-3 text-sm text-text-muted">
                          <span>{formatEngagement(msg.comments)} comments</span>
                          <span>{formatEngagement(msg.reposts)} reposts</span>
                          <span>{formatEngagement(msg.likes)} likes</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'People' && <div className="py-8 text-center text-text-muted text-sm">People results for &quot;{q || '...'}&quot;</div>}
            {activeTab === 'Media' && <div className="py-8 text-center text-text-muted text-sm">Media results for &quot;{q || '...'}&quot;</div>}
          </div>

          <aside className="w-[280px] shrink-0 hidden lg:block space-y-6">
            <RelatedSymbols />
            <PredictionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  )
}
