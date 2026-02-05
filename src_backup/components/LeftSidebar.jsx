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
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/avatars/user-avatar.png"
            className="h-10 w-10 rounded-full border border-border object-cover shrink-0"
            alt="Profile"
          />
          <span className="font-semibold truncate">Profile</span>
          <svg className="w-4 h-4 shrink-0 muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
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
      <div className="flex flex-col gap-1">
        <button className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notifications
        </button>
        <button className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Messages
        </button>
        <button className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </button>
      </div>
      <button className="btn w-full text-base font-semibold rounded-lg bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
        Post
      </button>

      <div className="mt-4 flex items-center justify-between gap-2 shrink-0">
        <span className="text-sm font-semibold text-text">Watchlist</span>
        <div className="flex items-center gap-1">
          <select className="text-xs font-medium rounded border border-border bg-surface-muted text-text px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All</option>
          </select>
          <select className="text-xs font-medium rounded border border-border bg-surface-muted text-text px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
            <option>A-Z</option>
          </select>
        </div>
      </div>
      <div className="flex-1 min-h-0 space-y-0 overflow-y-auto pr-1 mt-2">
        {watchlist.map((s) => {
          const pct = s.price !== 0 ? ((s.change / s.price) * 100) : 0
          return (
            <div key={s.ticker} className="py-2.5 border-b border-border last:border-b-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-surface-muted border border-border">
                  {getTickerLogo(s.ticker) ? (
                    <img src={getTickerLogo(s.ticker)} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-muted">{s.ticker[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{s.ticker}</div>
                  <div className="truncate text-xs muted">{s.name}</div>
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between pl-10">
                <span className="font-semibold text-sm">${s.price.toFixed(2)}</span>
                <span className={clsx('text-xs font-medium flex items-center gap-0.5', s.change >= 0 ? 'text-success' : 'text-danger')}>
                  {s.change >= 0 ? (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                  )}
                  ${Math.abs(s.change).toFixed(2)} ({pct >= 0 ? '' : '-'}{Math.abs(pct).toFixed(2)}%)
                </span>
              </div>
            </div>
          )
        })}
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
