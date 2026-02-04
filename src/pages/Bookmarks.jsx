import { useState, useEffect } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'

const WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'LULU', name: 'Lululemon', price: 385.00, change: 4.20, spark: [380, 381, 382, 383, 384, 383.5, 384.5, 385] },
]

export default function Bookmarks() {
  const { bookmarks, toggleBookmark } = useBookmarks()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => (localStorage.getItem('theme') === 'dark'))

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

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
        toggleDarkMode={() => setDarkMode((p) => !p)}
      />

      <main className="lg:pl-[269px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />
        <TickerTape />

        <div className="max-w-[1200px] mx-auto px-4 py-4 flex gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text mb-4">Bookmarked messages</h1>
            {bookmarks.length === 0 ? (
              <p className="text-text-muted text-sm py-8">No bookmarks yet. Bookmark messages from Home or Search to see them here.</p>
            ) : (
              <div className="divide-y divide-border">
                {bookmarks.map((msg) => (
                  <article key={msg.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <img src={msg.avatar || '/avatars/user-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text">{msg.username}</span>
                          <span className="text-xs text-text-muted">{msg.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-text leading-snug whitespace-pre-wrap">{msg.body}</p>
                        <button type="button" onClick={() => toggleBookmark(msg)} className="mt-2 text-sm text-primary hover:underline">Remove bookmark</button>
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
