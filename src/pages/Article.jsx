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

const ARTICLE_COMMENTS = [
  { id: 'ac1', user: 'MomentumKing', avatar: '/avatars/top-voice-1.png', body: 'Great breakdown. The options flow confirms what I\'m seeing — upside calls stacking heavy at $270. Breakout is coming.', time: '2h ago', likes: 84, replies: 12 },
  { id: 'ac2', user: 'ChartWizard', avatar: '/avatars/top-voice-3.png', body: 'The $250 level is the key. A daily close above on volume and I\'m adding. Below $230 and I\'m out.', time: '5h ago', likes: 67, replies: 15 },
  { id: 'ac3', user: 'RobotaxiHopeful', avatar: '/avatars/howard-lindzon.png', body: 'FSD V12 is the real catalyst everyone is sleeping on. Once the data shows improvement in safety metrics, this stock re-rates hard.', time: '7h ago', likes: 112, replies: 24 },
]

export default function Article() {
  const { slug } = useParams()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState([])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)
  const article = slug ? ARTICLES_BY_SLUG[slug] : null

  const allComments = [...localComments, ...ARTICLE_COMMENTS]

  const handlePostComment = () => {
    if (!commentText.trim()) return
    setLocalComments((prev) => [
      { id: `user-${Date.now()}`, user: 'You', avatar: '/avatars/user-avatar.png', body: commentText.trim(), time: 'Just now', likes: 0, replies: 0, isNew: true },
      ...prev,
    ])
    setCommentText('')
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Article</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} watchlist={watchlist} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="lg:pl-[300px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[720px] mx-auto px-4 py-6">
          {!article ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <h1 className="text-xl font-bold text-text">Article not found</h1>
              <p className="mt-2 text-text-muted">The article you're looking for doesn't exist or was removed.</p>
              <Link to="/news" className="mt-4 inline-block text-primary hover:underline font-semibold">Back to News</Link>
            </div>
          ) : (
            <>
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
                  {article.body?.map((p, i) => (
                    <p key={i} className="mt-4 first:mt-0 text-[15px] leading-relaxed text-text">{p}</p>
                  ))}
                </div>
              </article>

              {/* Comment Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {allComments.length} Comments
                  </h2>
                </div>

                {/* Bold comment input */}
                <div className="rounded-xl border-2 border-primary/40 bg-surface p-4 mb-6 focus-within:border-primary transition-colors">
                  <div className="flex items-start gap-3">
                    <img src="/avatars/user-avatar.png" alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-primary/30" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-primary font-semibold mb-1.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        Commenting on: {article.headline}
                      </div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your take on this article..."
                        rows={2}
                        className="w-full bg-transparent text-sm text-text placeholder:text-text-muted resize-none outline-none leading-relaxed"
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostComment() }}
                      />
                      <div className="flex items-center justify-end mt-2 pt-2 border-t border-border/50">
                        <button onClick={handlePostComment} disabled={!commentText.trim()} className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-0 divide-y divide-border">
                  {allComments.map((c) => (
                    <div key={c.id} className={`flex gap-3 py-4 ${c.isNew ? 'bg-primary/5 -mx-4 px-4 rounded-lg border border-primary/20' : ''}`}>
                      <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-text">{c.user}</span>
                          {c.isNew && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-primary bg-primary/10">NEW</span>}
                          <span className="text-xs text-text-muted">{c.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 mb-1">
                          <svg className="w-3 h-3 text-text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                          <span className="text-[11px] text-text-muted">Commented on <Link to={`/article/${article.slug}`} className="text-primary hover:underline font-medium">{article.headline}</Link></span>
                        </div>
                        <p className="text-sm text-text leading-snug">{c.body}</p>
                        <div className="flex items-center gap-5 mt-2.5 text-xs text-text-muted">
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {c.likes}
                          </button>
                          <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {c.replies} replies
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
