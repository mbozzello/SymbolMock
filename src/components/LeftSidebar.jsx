import { getTickerLogo } from '../constants/tickerLogos'

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

export default function LeftSidebar({ isOpen, onClose, watchlist, darkMode, toggleDarkMode }) {
  const content = (
    <div className="flex h-full w-full flex-col gap-4 bg-background p-4 border-r border-border">
      <a href="/" className="block shrink-0" aria-label="Stocktwits">
        <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-[39px] w-auto object-contain" />
      </a>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/avatars/user-avatar.png"
            className="h-10 w-10 rounded-full border border-border object-cover"
            alt="Profile"
          />
          <div className="font-semibold">Profile</div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-surface-muted transition-colors opacity-70 hover:opacity-100"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
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
        <button className="btn"><span>👥</span> Community</button>
      </div>
      <button className="btn btn-primary w-full text-base">Post</button>

      <div className="mt-2 text-sm uppercase tracking-wide muted shrink-0">Watchlist</div>
      <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
        {watchlist.map((s) => (
          <div key={s.ticker} className="p-3 border-b border-border last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center overflow-hidden bg-surface-muted">
                  {getTickerLogo(s.ticker) ? (
                    <img src={getTickerLogo(s.ticker)} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-muted">{s.ticker[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div>
                    <span className="font-semibold">{s.ticker}</span>
                  </div>
                  <div className="truncate text-sm muted">{s.name}</div>
                </div>
              </div>
              <MiniSparkline values={s.spark} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="font-semibold">${s.price.toFixed(2)}</div>
              <div className={clsx('text-sm flex items-center gap-0', s.change >= 0 ? 'text-success' : 'text-danger')}>
                {s.change >= 0 ? (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                ) : (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                )}
                {Math.abs(s.change).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[269px] lg:flex overflow-hidden">
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-[269px] bg-background shadow-xl border-r border-border">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
