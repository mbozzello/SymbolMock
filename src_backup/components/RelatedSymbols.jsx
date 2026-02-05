import { getTickerLogo } from '../constants/tickerLogos'

const RELATED = [
  { name: 'Apple', ticker: 'AAPL', added: false },
  { name: 'Coca-Cola', ticker: 'KO', added: false },
  { name: 'NVIDIA', ticker: 'NVDA', added: true, ad: true },
  { name: 'Ford', ticker: 'F', added: false },
  { name: 'Spotify', ticker: 'SPOT', added: true },
]

export default function RelatedSymbols() {
  return (
    <div className="border-b border-border pb-4">
      <h3 className="text-sm font-semibold text-text mb-3">Related Symbols</h3>
      <ul className="space-y-2">
        {RELATED.map((item) => (
          <li key={item.ticker} className="flex items-center justify-between gap-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-surface-muted border border-border">
                {getTickerLogo(item.ticker) ? (
                  <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-muted">{item.ticker[0]}</span>
                )}
              </div>
              <span className="text-sm font-medium truncate">{item.name}</span>
              {item.ad && (
                <span className="text-[10px] font-semibold uppercase text-muted shrink-0">Ad</span>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 w-7 h-7 rounded-full border border-border bg-surface-muted hover:bg-surface flex items-center justify-center text-muted hover:text-text transition-colors"
              aria-label={item.added ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {item.added ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
