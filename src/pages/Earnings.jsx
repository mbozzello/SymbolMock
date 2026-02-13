import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { WEEK_DAYS, EARNINGS_BY_DATE, DAY_PREVIEW, LIVE_EARNINGS } from '../constants/earningsCalendar.js'

export default function Earnings() {
  const { watchlist, toggleWatch, isWatched } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [selectedDate, setSelectedDate] = useState('2026-02-12') // TODAY
  const [watchersSortDesc, setWatchersSortDesc] = useState(true)

  const dayRows = useMemo(() => {
    const rows = EARNINGS_BY_DATE[selectedDate] || []
    return [...rows].sort((a, b) => (watchersSortDesc ? b.watchers - a.watchers : a.watchers - b.watchers))
  }, [selectedDate, watchersSortDesc])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const handleWatchClick = (e, ticker, name) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWatch(ticker, name)
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Earnings Calendar</div>
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

        <section className="w-full">
          <div className="max-w-[1200px] mx-auto px-4 pt-6 pb-8">
            <h1 className="text-xl font-bold text-text mb-6">Earnings Calendar</h1>

            {/* Live Earnings Calls carousel */}
            <section className="mb-6">
              <h2 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Calls
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border" style={{ scrollbarWidth: 'thin' }}>
                {LIVE_EARNINGS.map((e) => (
                  <Link
                    key={e.ticker}
                    to={`/symbol/${e.ticker}`}
                    className="shrink-0 w-[140px] rounded-xl border border-border bg-surface p-3 hover:bg-surface-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {getTickerLogo(e.ticker) && (
                        <img src={getTickerLogo(e.ticker)} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span className="text-sm font-bold text-text">{e.ticker}</span>
                    </div>
                    <div className="text-xs text-text-muted">🎧 {e.listeners} listening</div>
                    <div className="text-[11px] text-text-muted">Started {e.started}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Header: Month + Week selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-text">February 2026</span>
              <div className="flex items-center gap-2">
                <button type="button" className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted hover:text-text" aria-label="Previous week">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button type="button" className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm font-medium text-text hover:bg-surface-muted">
                  Week of 2/09/2026
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button type="button" className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted hover:text-text" aria-label="Next week">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Weekly calendar strip */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border" style={{ scrollbarWidth: 'thin' }}>
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedDate === day.dateStr
                const preview = DAY_PREVIEW[day.dateStr] || { tickers: [], total: 0 }
                const tickerText = preview.tickers.length > 0
                  ? `${preview.tickers.join(', ')}${preview.total > 3 ? ` and ${preview.total - 3} more` : ''}`
                  : 'No earnings'
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`shrink-0 w-[180px] min-w-[160px] rounded-xl border p-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                      {day.label}
                    </div>
                    <div className={`text-2xl font-bold mb-1.5 ${isSelected ? 'text-white' : 'text-text'}`}>{day.date}</div>
                    <div className={`text-[11px] leading-tight line-clamp-2 ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                      {tickerText} {preview.total > 0 && `reporting ${day.label.toLowerCase()}`}
                    </div>
                    <div className={`text-xs font-semibold mt-1.5 ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                      {preview.total} reporting
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Earnings table */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/50">
                      <th className="text-left py-3 px-4 font-semibold text-text">Symbol</th>
                      <th className="text-right py-3 px-4 font-semibold text-text">Last Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-text">%Change</th>
                      <th className="text-right py-3 px-4 font-semibold text-text">Volume</th>
                      <th className="text-right py-3 px-4 font-semibold text-text">
                        <button type="button" onClick={() => setWatchersSortDesc((d) => !d)} className="inline-flex items-center gap-0.5 hover:text-primary">
                          Watchers
                          <svg className={`w-3.5 h-3.5 transition-transform ${!watchersSortDesc ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Reporting</th>
                      <th className="text-center py-3 px-4 font-semibold text-text w-14">Watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayRows.map((row) => {
                      const watched = isWatched(row.ticker)
                      return (
                        <tr key={row.ticker} className="border-b border-border last:border-0 hover:bg-surface-muted/30">
                          <td className="py-3 px-4">
                            <Link to={`/symbol/${row.ticker}`} className="flex items-center gap-2 hover:text-primary">
                              {getTickerLogo(row.ticker) ? (
                                <img src={getTickerLogo(row.ticker)} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold">{row.ticker[0]}</div>
                              )}
                              <span className="font-semibold">{row.ticker}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">${row.price.toFixed(2)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${row.pctChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {row.pctChange >= 0 ? '↑' : '↓'}{Math.abs(row.pctChange).toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-right text-text-muted">{row.volume}</td>
                          <td className="py-3 px-4 text-right text-text-muted">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              {row.watchers.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-muted">{row.reporting}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => handleWatchClick(e, row.ticker, row.name)}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                watched ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted hover:bg-surface hover:text-text'
                              }`}
                              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                              {watched ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
