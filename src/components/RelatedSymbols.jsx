import { getTickerLogo } from '../constants/tickerLogos'

const RELATED = [
  { name: 'Rivian Automotive Inc', ticker: 'RIVN', added: false },
  { name: 'Nio Inc', ticker: 'NIO', added: true },
  { name: 'NVIDIA', ticker: 'NVDA', added: false, ad: true },
  { name: 'Alphabet Inc - Ordinary Shares - Class C', ticker: 'GOOG', added: true },
  { name: 'Lucid Group Inc', ticker: 'LCID', added: false },
]

export default function RelatedSymbols({ title = 'Related Symbols' }) {
  return (
    <div className="pb-4">
      <h3 className="text-base font-bold text-text mb-4">{title}</h3>
      <ul className="divide-y divide-border">
        {RELATED.map((item) => (
          <li key={item.ticker} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-[#1a1a2e] border border-border">
                {getTickerLogo(item.ticker) ? (
                  <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm font-bold text-text-muted">{item.ticker[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-text">{item.ticker}</span>
                  {item.ad && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-text-muted bg-surface-muted border border-border leading-none">Ad</span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">{item.name}</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-muted flex items-center justify-center text-text-muted hover:text-text transition-colors"
              aria-label={item.added ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {item.added ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
