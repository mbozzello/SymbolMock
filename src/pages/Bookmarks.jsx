import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'

function formatEngagement(n) {
  if (n == null) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
  { ticker: 'BRK.A', name: 'Berkshire Hathaway', price: 615000, change: 1200, spark: [30, 32, 31, 33, 35, 34, 33, 32] },
  { ticker: 'C', name: 'Citigroup', price: 68.90, change: -0.45, spark: [15, 14.8, 14.5, 14.7, 14.3, 14.6, 14.2, 14.7] },
  { ticker: 'DIS', name: 'Walt Disney Co', price: 112.40, change: 0.85, spark: [10, 10.2, 10.1, 10.3, 10.2, 10.4, 10.3, 10.0] },
  { ticker: 'ETOR', name: 'eToro', price: 8.75, change: 0.22, spark: [8, 8.2, 8.1, 8.3, 8.2, 8.4, 8.3, 8.75] },
  { ticker: 'FIG', name: 'Fortress Investment', price: 5.60, change: -0.10, spark: [5.5, 5.6, 5.55, 5.65, 5.6, 5.58, 5.62, 5.6] },
  { ticker: 'GLD', name: 'SPDR Gold Trust', price: 218.30, change: 1.45, spark: [216, 217, 216.5, 217.5, 218, 217.8, 218.2, 218.3] },
  { ticker: 'LULU', name: 'Lululemon', price: 385.00, change: 4.20, spark: [380, 381, 382, 383, 384, 383.5, 384.5, 385] },
]

export default function Bookmarks() {
  const { bookmarks, toggleBookmark } = useBookmarks()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

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
        <div className="font-semibold">Bookmarks</div>
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
            <h1 className="text-xl font-bold text-text mb-4">Bookmarked messages</h1>
            {bookmarks.length === 0 ? (
              <p className="text-text-muted text-sm py-8">No bookmarks yet. Click the bookmark icon on any message to save it here.</p>
            ) : (
              <div className="divide-y divide-border">
                {bookmarks.map((msg) => (
                  <article key={msg.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={msg.avatar || '/avatars/user-avatar.png'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text">{msg.username}</span>
                          <span className="text-xs text-text-muted">{msg.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-text leading-snug whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {formatEngagement(msg.comments)}
                          </button>
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {formatEngagement(msg.reposts)}
                          </button>
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {formatEngagement(msg.likes)}
                          </button>
                          <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(msg)}
                            className="p-1 hover:text-text transition-colors text-primary"
                            aria-label="Remove bookmark"
                          >
                            <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
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
          <aside className="w-[280px] shrink-0 hidden lg:block space-y-6">
            <RelatedSymbols />
            <PredictionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  )
}
