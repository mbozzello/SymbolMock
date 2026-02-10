import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

const ARTICLES_BY_SLUG = {
  'tsla-breaking-out': {
    slug: 'tsla-breaking-out',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&h=600&fit=crop',
    headline: 'Is $TSLA finally breaking out?',
    description: 'Technical setup and sentiment point to a potential breakout above key resistance levels.',
    author: 'Michael Bolling',
    authorAvatar: '/avatars/who-follow-1.png',
    time: '12 days ago',
    ticker: 'TSLA',
    pctChange: 2.4,
    body: [
      'Tesla shares have been consolidating near the top of a multi-week range as traders weigh delivery trends, FSD rollout, and macro headwinds. Key resistance sits in the mid-$260s with support around $230.',
      'Community sentiment on Stocktwits has turned more bullish over the past week, with message volume and bullish percentage both ticking higher. Options flow has shown increased interest in upside calls, especially for the next two expiration cycles.',
      'From a technical perspective, a decisive close above the recent high on above-average volume could open a move toward the 52-week high. Conversely, a break below support could see a retest of the 50-day moving average.',
      'Earnings and delivery numbers in the coming weeks will likely be the next catalyst. Until then, the stock may continue to chop in the current range.',
    ],
  },
}

export default function Article() {
  const { slug } = useParams()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

  const toggleDarkMode = () => setDarkMode((prev) => !prev)
  const article = slug ? ARTICLES_BY_SLUG[slug] : null

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Article</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[300px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[720px] mx-auto px-4 py-6">
          {!article ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <h1 className="text-xl font-bold text-text">Article not found</h1>
              <p className="mt-2 text-text-muted">The article you’re looking for doesn’t exist or was removed.</p>
              <Link to="/news" className="mt-4 inline-block text-primary hover:underline font-semibold">Back to News</Link>
            </div>
          ) : (
            <article className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="relative aspect-[21/9] min-h-[200px] w-full bg-surface-muted">
                <img src={article.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{article.headline}</h1>
                  <p className="mt-2 text-sm text-white/90 max-w-2xl">{article.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
                    <img src={article.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white/30" />
                    <span className="font-medium text-white/95">{article.author}</span>
                    <span>{article.time}</span>
                    {article.ticker && (
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${(article.pctChange ?? 0) >= 0 ? 'bg-success/90 text-white' : 'bg-danger/90 text-white'}`}>
                        ${article.ticker} {(article.pctChange ?? 0) >= 0 ? '+' : ''}{(article.pctChange ?? 0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6">
                {article.body && article.body.length > 0 ? (
                  <div className="prose prose-invert max-w-none text-text">
                    {article.body.map((paragraph, i) => (
                      <p key={i} className="mt-4 first:mt-0 text-[15px] leading-relaxed text-text">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted">{article.description}</p>
                )}
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  )
}
