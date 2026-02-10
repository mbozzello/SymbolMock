import { Link } from 'react-router-dom'

const LATEST_ARTICLES = [
  {
    id: 1,
    title: 'Why Did RGNX Shares Plummet 19% After-Hours Today?',
    source: 'Stocktwits',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop',
  },
  {
    id: 2,
    title: "Upwork Stock Plummets 23% After-Hours Today - Here's Why",
    source: 'Stocktwits',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=120&h=120&fit=crop',
  },
  {
    id: 3,
    title: "CLARITY Bill On Crypto Seems To Be 'Stalled' In The Congress, Crypto Hype Fading, Fed's Waller Says",
    source: 'Stocktwits',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=120&h=120&fit=crop',
  },
]

export default function LatestNews() {
  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-bold text-text">Latest News</h3>
        <Link to="/news" className="text-sm font-normal text-text hover:underline flex items-center gap-0.5">
          View
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <ul className="space-y-5">
        {LATEST_ARTICLES.map((article) => (
          <li key={article.id} className="flex gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-text leading-snug line-clamp-2 mb-1.5">
                {article.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/images/stocktwits-logo.png" alt="" className="w-3 h-3 object-contain" />
                </span>
                <span className="font-medium text-text">{article.source}</span>
                <span className="text-text-muted" aria-hidden>·</span>
                <span className="text-text-muted">{article.time}</span>
              </div>
              <Link
                to="/news"
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-surface text-sm font-medium text-text-muted hover:border-border-strong hover:text-text transition-colors"
              >
                Full Article
              </Link>
            </div>
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-surface-muted border border-border">
              <img
                src={article.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
