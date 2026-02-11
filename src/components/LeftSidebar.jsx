import { getTickerLogo } from '../constants/tickerLogos'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [], isUp }) {
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
  const up = isUp !== undefined ? isUp : (values[values.length - 1] >= values[0])
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7">
      <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function LeftSidebar({ isOpen, onClose, watchlist, darkMode, toggleDarkMode, leftPadding = 0 }) {
  const {
    watchlists,
    currentWatchlistId,
    currentWatchlist,
    setCurrentWatchlistId,
    addWatchlist,
    removeWatchlist,
    renameWatchlist,
    removeSymbol,
    addSymbol,
  } = useWatchlist()
  const { getQuote } = useLiveQuotesContext()
  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [addingSymbol, setAddingSymbol] = useState(false)
  const [addTickerValue, setAddTickerValue] = useState('')
  const [watchlistDropdownOpen, setWatchlistDropdownOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [watchlistSort, setWatchlistSort] = useState('gain')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [dotsMenuOpen, setDotsMenuOpen] = useState(false)
  const dotsMenuRef = useRef(null)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertModalTicker, setAlertModalTicker] = useState(null)
  const [alerts, setAlerts] = useState(() => {
    try { const raw = localStorage.getItem('price_alerts'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState('above') // 'above' | 'below'
  const [newAlertNote, setNewAlertNote] = useState('')
  const [alertTab, setAlertTab] = useState('set') // 'set' | 'manage'
  const [columns, setColumns] = useState({ last: true, change: true, changePct: true, volume: false, extendedHours: false })
  const [symbolDisplay, setSymbolDisplay] = useState({ logo: true, mode: 'ticker' }) // mode: 'ticker' | 'description'
  const editInputRef = useRef(null)
  const addInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const sortMenuRef = useRef(null)

  useEffect(() => {
    if (editingName && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingName])

  useEffect(() => {
    if (addingSymbol && addInputRef.current) addInputRef.current.focus()
  }, [addingSymbol])

  useEffect(() => {
    if (!watchlistDropdownOpen) return
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setWatchlistDropdownOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [watchlistDropdownOpen])

  useEffect(() => {
    if (!sortMenuOpen) return
    const close = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setSortMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [sortMenuOpen])

  useEffect(() => {
    if (!dotsMenuOpen) return
    const close = (e) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target)) setDotsMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [dotsMenuOpen])

  const sortedWatchlist = useMemo(() => {
    const list = [...watchlist]
    if (watchlistSort === 'a-z') return list.sort((a, b) => (a.ticker || '').localeCompare(b.ticker || ''))
    if (watchlistSort === 'my-sort') return list
    const withPct = list.map((s) => {
      const q = getQuote(s.ticker)
      const price = q?.price ?? s.price
      const change = q?.change ?? s.change
      const pct = q?.changePercent ?? (price && price !== 0 ? (change / price) * 100 : 0)
      return { ...s, _pct: pct }
    })
    if (watchlistSort === 'gain') return withPct.sort((a, b) => (b._pct ?? 0) - (a._pct ?? 0))
    if (watchlistSort === 'loss') return withPct.sort((a, b) => (a._pct ?? 0) - (b._pct ?? 0))
    return list
  }, [watchlist, watchlistSort, getQuote])

  const handleSaveName = () => {
    const trimmed = editNameValue.trim()
    if (trimmed && currentWatchlistId) renameWatchlist(currentWatchlistId, trimmed)
    setEditingName(false)
    setEditNameValue('')
  }

  const handleAddSymbolSubmit = (e) => {
    e?.preventDefault()
    const t = addTickerValue.trim().toUpperCase()
    if (t) {
      addSymbol(t, t)
      setAddTickerValue('')
      setAddingSymbol(false)
    }
  }

  const saveAlerts = (next) => {
    setAlerts(next)
    try { localStorage.setItem('price_alerts', JSON.stringify(next)) } catch {}
  }

  const [alertSymbolSearch, setAlertSymbolSearch] = useState('')
  const openAlertModal = (ticker) => {
    setAlertModalTicker(ticker)
    setAlertModalOpen(true)
    setAlertTab('set')
    setNewAlertPrice('')
    setNewAlertCondition('above')
    setNewAlertNote('')
    setAlertSymbolSearch('')
    setAlertTab('set')
  }

  const handleCreateAlert = () => {
    const price = parseFloat(newAlertPrice)
    if (!price || !alertModalTicker) return
    const alert = {
      id: Date.now(),
      ticker: alertModalTicker,
      price,
      condition: newAlertCondition,
      note: newAlertNote.trim(),
      createdAt: new Date().toISOString(),
      triggered: false,
    }
    saveAlerts([...alerts, alert])
    setNewAlertPrice('')
    setNewAlertNote('')
    setAlertTab('manage')
  }

  const removeAlert = (id) => {
    saveAlerts(alerts.filter((a) => a.id !== id))
  }

  const toggleAlertTriggered = (id) => {
    saveAlerts(alerts.map((a) => a.id === id ? { ...a, triggered: !a.triggered } : a))
  }

  const alertsForTicker = alertModalTicker ? alerts.filter((a) => a.ticker === alertModalTicker) : []
  const allAlertTickers = [...new Set(alerts.map((a) => a.ticker))]

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
        <Link to="/notifications" className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notifications
        </Link>
        <button className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Chat
        </button>
        <Link to="/bookmarks" className="btn justify-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
          </svg>
          Bookmarks
        </Link>
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


      <div className="mt-3 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="relative flex-1 min-w-0 flex items-center gap-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setWatchlistDropdownOpen((v) => !v); }}
              className="flex items-center gap-1 text-sm font-semibold text-text bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer hover:opacity-80 min-w-0"
              aria-label="Watchlist options"
              aria-expanded={watchlistDropdownOpen}
            >
              <span className="truncate">{(currentWatchlist?.name?.trim()) || 'Watchlist'}</span>
              <svg className={clsx('w-4 h-4 shrink-0 text-text-muted transition-transform', watchlistDropdownOpen && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {watchlistDropdownOpen && (
              <div className="absolute left-0 top-full mt-0.5 z-50 min-w-[160px] rounded-lg border border-border bg-background shadow-lg py-1">
                {watchlists.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { setCurrentWatchlistId(w.id); setWatchlistDropdownOpen(false); }}
                    className={clsx('w-full text-left px-3 py-2 text-sm', w.id === currentWatchlistId ? 'bg-primary/10 text-primary font-medium' : 'text-text hover:bg-surface-muted')}
                  >
                    {w.name}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <button
                  type="button"
                  onClick={() => { setEditingName(true); setEditNameValue(currentWatchlist?.name ?? ''); setWatchlistDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-muted"
                >
                  Rename this list
                </button>
                <button
                  type="button"
                  onClick={() => { addWatchlist(); setWatchlistDropdownOpen(false); setEditingName(true); setEditNameValue('New list'); }}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-surface-muted"
                >
                  New list
                </button>
                {watchlists.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { setWatchlistDropdownOpen(false); setConfirmDeleteOpen(true); }}
                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-surface-muted"
                  >
                    Delete list
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="relative shrink-0" ref={dotsMenuRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDotsMenuOpen((v) => !v); }}
              className="p-1.5 rounded hover:bg-surface-muted text-text-muted hover:text-text transition-colors"
              aria-label="Watchlist display options"
              aria-expanded={dotsMenuOpen}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
            </button>
            {dotsMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-[100] w-[240px] rounded-lg border border-border bg-background shadow-xl p-3"
                onClick={(e) => e.stopPropagation()}
                role="menu"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">CUSTOMIZE COLUMNS</div>
                <div className="space-y-1.5 mb-3">
                  {[
                    { key: 'last', label: 'Last' },
                    { key: 'change', label: 'Change' },
                    { key: 'changePct', label: 'Change %' },
                    { key: 'volume', label: 'Volume' },
                    { key: 'extendedHours', label: 'Extended Hours' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!columns[key]} onChange={() => setColumns((c) => ({ ...c, [key]: !c[key] }))} className="rounded border-border text-primary focus:ring-primary" onClick={(e) => e.stopPropagation()} />
                      <span className="text-sm text-text">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">SYMBOL DISPLAY</div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={symbolDisplay.logo} onChange={() => setSymbolDisplay((s) => ({ ...s, logo: !s.logo }))} className="rounded border-border text-primary focus:ring-primary" onClick={(e) => e.stopPropagation()} />
                      <span className="text-sm text-text">Logo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="symbolMode" checked={symbolDisplay.mode === 'ticker'} onChange={() => setSymbolDisplay((s) => ({ ...s, mode: 'ticker' }))} className="border-border text-primary focus:ring-primary rounded-full" onClick={(e) => e.stopPropagation()} />
                      <span className="text-sm text-text">Ticker</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="symbolMode" checked={symbolDisplay.mode === 'description'} onChange={() => setSymbolDisplay((s) => ({ ...s, mode: 'description' }))} className="border-border text-primary focus:ring-primary rounded-full" onClick={(e) => e.stopPropagation()} />
                      <span className="text-sm text-text">Description</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {editingName && (
          <div className="flex items-center gap-2 mb-1.5">
            <input
              ref={editInputRef}
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setEditNameValue(''); } }}
              onBlur={handleSaveName}
              className="flex-1 text-sm font-medium rounded border border-border bg-background px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="List name"
            />
          </div>
        )}
        {addingSymbol && (
          <form onSubmit={handleAddSymbolSubmit} className="flex items-center gap-2 mb-1.5">
            <input
              ref={addInputRef}
              type="text"
              value={addTickerValue}
              onChange={(e) => setAddTickerValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Escape') { setAddingSymbol(false); setAddTickerValue(''); } }}
              placeholder="Ticker (e.g. AAPL)"
              className="flex-1 text-sm rounded border border-border bg-background px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
              maxLength={10}
            />
            <button type="submit" className="btn text-xs py-1.5 px-2 shrink-0">Add</button>
            <button type="button" onClick={() => { setAddingSymbol(false); setAddTickerValue(''); }} className="text-text-muted hover:text-text p-1 shrink-0" aria-label="Cancel">×</button>
          </form>
        )}
        <div className="relative flex items-center justify-between gap-2 mt-1 mb-0.5" ref={sortMenuRef}>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text">Symbol</span>
            <button
              type="button"
              onClick={() => setAddingSymbol(true)}
              className="p-1.5 rounded-full border border-border bg-surface-muted hover:bg-surface text-text font-bold text-lg leading-none flex items-center justify-center w-7 h-7 shrink-0"
              aria-label="Add symbol to watchlist"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => { setAlertModalTicker(null); setAlertModalOpen(true); setAlertTab('manage'); }}
              className="relative p-1.5 rounded-full border border-border bg-surface-muted hover:bg-surface text-text-muted hover:text-text flex items-center justify-center w-7 h-7 shrink-0 transition-colors"
              aria-label="Manage price alerts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">{alerts.length}</span>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSortMenuOpen((v) => !v); }}
            className="flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-text hover:bg-surface-muted transition-colors"
            aria-label="Sort watchlist"
            aria-expanded={sortMenuOpen}
          >
            <span>{watchlistSort === 'gain' ? 'Gain' : watchlistSort === 'loss' ? 'Loss' : watchlistSort === 'a-z' ? 'A-Z' : 'My Sort'}</span>
            <svg className={clsx('w-4 h-4 text-text-muted transition-transform', sortMenuOpen && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          {sortMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-border bg-background shadow-lg py-1">
              <button type="button" onClick={() => { setWatchlistSort('a-z'); setSortMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted text-left">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                A-Z
              </button>
              <button type="button" onClick={() => { setWatchlistSort('gain'); setSortMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted text-left">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z" /></svg>
                Last Price Gain
              </button>
              <button type="button" onClick={() => { setWatchlistSort('loss'); setSortMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted text-left">
                <svg className="w-4 h-4 text-danger" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" /></svg>
                Last Price Loss
              </button>
              <button type="button" onClick={() => { setWatchlistSort('my-sort'); setSortMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted text-left">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                My Sort
              </button>
              <div className="border-t border-border my-1" />
              <button type="button" onClick={() => { setEditingName(true); setEditNameValue(currentWatchlist?.name ?? ''); setSortMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted text-left">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Watchlist
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 space-y-0 overflow-y-auto pr-1 mt-1">
        {sortedWatchlist.map((s) => {
          const q = getQuote(s.ticker)
          const price = q?.price ?? s.price
          const change = q?.change ?? s.change
          const pct = q?.changePercent ?? (price !== 0 ? (change / price) * 100 : 0)
          return (
            <div key={s.ticker} className="group relative block py-2.5 border-b border-border last:border-b-0 hover:bg-surface-muted/50 transition-colors -mx-1 px-1 rounded">
              <Link to="/symbol" className="block pr-8">
              <div className="flex items-center gap-2 min-w-0">
                {symbolDisplay.logo && (
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-surface-muted border border-border">
                    {getTickerLogo(s.ticker) ? (
                      <img src={getTickerLogo(s.ticker)} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-muted">{s.ticker[0]}</span>
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{symbolDisplay.mode === 'ticker' ? s.ticker : s.name}</div>
                  {symbolDisplay.mode === 'ticker' && <div className="truncate text-xs muted">{s.name}</div>}
                </div>
                <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                  {columns.last && <span className="font-semibold text-sm">${typeof price === 'number' ? price.toFixed(2) : '--'}</span>}
                  {(columns.change || columns.changePct) && (
                    <span className={clsx('text-xs font-medium flex items-center gap-0.5', change >= 0 ? 'text-success' : 'text-danger')}>
                      {change >= 0 ? (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                      )}
                      {columns.change && `$${Math.abs(change ?? 0).toFixed(2)}`}
                      {columns.change && columns.changePct && ' '}
                      {columns.changePct && `(${pct >= 0 ? '' : '-'}${Math.abs(pct).toFixed(2)}%)`}
                    </span>
                  )}
                </div>
              </div>
              </Link>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openAlertModal(s.ticker)}
                  className="p-1 rounded hover:bg-surface-muted"
                  aria-label={`Set price alert for ${s.ticker}`}
                >
                  <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button type="button" onClick={() => removeSymbol(s.ticker)} className="p-1 rounded hover:bg-surface-muted" aria-label={`Remove ${s.ticker} from watchlist`}>
                  <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[300px] lg:flex overflow-hidden" style={leftPadding ? { left: `${leftPadding}px` } : undefined}>
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-[300px] bg-background shadow-xl border-r border-border">
            {content}
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="alertdialog" aria-labelledby="confirm-delete-title">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteOpen(false)} />
          <div className="relative bg-background rounded-lg border border-border shadow-lg p-4 max-w-sm w-full">
            <p id="confirm-delete-title" className="text-sm font-medium text-text mb-4">Are you sure you want to delete this list?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDeleteOpen(false)} className="px-3 py-1.5 text-sm font-medium rounded border border-border bg-surface hover:bg-surface-muted">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { if (currentWatchlistId) removeWatchlist(currentWatchlistId); setConfirmDeleteOpen(false); }}
                className="px-3 py-1.5 text-sm font-medium rounded text-white bg-danger hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-labelledby="alert-modal-title">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAlertModalOpen(false)} />
          <div className="relative bg-background rounded-xl border border-border shadow-xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h2 id="alert-modal-title" className="text-lg font-bold text-text">
                  {alertModalTicker ? `Price Alerts — ${alertModalTicker}` : 'Price Alerts'}
                </h2>
              </div>
              <button type="button" onClick={() => setAlertModalOpen(false)} className="p-1.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text" aria-label="Close">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              <button
                type="button"
                onClick={() => setAlertTab('set')}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold text-center border-b-2 -mb-px transition-colors',
                  alertTab === 'set' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
                )}
              >
                Set Alert
              </button>
              <button
                type="button"
                onClick={() => setAlertTab('manage')}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold text-center border-b-2 -mb-px transition-colors',
                  alertTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
                )}
              >
                Manage Alerts{alerts.length > 0 && ` (${alerts.length})`}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {alertTab === 'set' && (
                <div className="space-y-4">
                  {/* Symbol selector if opened from the general bell icon */}
                  {!alertModalTicker && (
                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Symbol</label>
                      <div className="relative mb-3">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
                        <input
                          type="text"
                          value={alertSymbolSearch}
                          onChange={(e) => setAlertSymbolSearch(e.target.value)}
                          placeholder="Search symbol..."
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sortedWatchlist
                          .filter((s) => !alertSymbolSearch || s.ticker.toLowerCase().includes(alertSymbolSearch.toLowerCase()))
                          .map((s) => (
                          <button
                            key={s.ticker}
                            type="button"
                            onClick={() => setAlertModalTicker(s.ticker)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-surface hover:bg-surface-muted transition-colors"
                          >
                            {getTickerLogo(s.ticker) && <img src={getTickerLogo(s.ticker)} alt="" className="w-4 h-4 rounded object-cover" />}
                            {s.ticker}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {alertModalTicker && (
                    <>
                      {/* Current price */}
                      {(() => {
                        const q = getQuote(alertModalTicker)
                        const curPrice = q?.price
                        return curPrice ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted/50 border border-border">
                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-surface border border-border">
                              {getTickerLogo(alertModalTicker) ? (
                                <img src={getTickerLogo(alertModalTicker)} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-sm font-bold text-text-muted">{alertModalTicker[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text">{alertModalTicker}</p>
                              <p className="text-xs text-text-muted">Current: <span className="font-semibold text-text">${curPrice.toFixed(2)}</span></p>
                            </div>
                          </div>
                        ) : null
                      })()}

                      {/* Condition */}
                      <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Condition</label>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setNewAlertCondition('above')}
                            className={clsx(
                              'flex-1 py-2.5 text-sm font-semibold text-center transition-colors',
                              newAlertCondition === 'above' ? 'bg-success/15 text-success' : 'bg-surface text-text-muted hover:bg-surface-muted'
                            )}
                          >
                            Price Goes Above
                          </button>
                          <div className="w-px bg-border" />
                          <button
                            type="button"
                            onClick={() => setNewAlertCondition('below')}
                            className={clsx(
                              'flex-1 py-2.5 text-sm font-semibold text-center transition-colors',
                              newAlertCondition === 'below' ? 'bg-danger/15 text-danger' : 'bg-surface text-text-muted hover:bg-surface-muted'
                            )}
                          >
                            Price Goes Below
                          </button>
                        </div>
                      </div>

                      {/* Target price */}
                      <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Target Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={newAlertPrice}
                            onChange={(e) => setNewAlertPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-3 rounded-lg bg-surface border border-border text-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Note (optional) */}
                      <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Note (optional)</label>
                        <input
                          type="text"
                          value={newAlertNote}
                          onChange={(e) => setNewAlertNote(e.target.value)}
                          placeholder="e.g. Sell half position"
                          maxLength={100}
                          className="w-full px-3 py-3 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>

                      {/* Create button */}
                      <button
                        type="button"
                        onClick={handleCreateAlert}
                        disabled={!newAlertPrice || isNaN(parseFloat(newAlertPrice))}
                        className={clsx(
                          'w-full py-3 rounded-lg text-sm font-bold transition-colors',
                          newAlertPrice && !isNaN(parseFloat(newAlertPrice))
                            ? 'bg-primary text-white hover:opacity-90'
                            : 'bg-surface-muted text-text-muted cursor-not-allowed'
                        )}
                      >
                        Create Alert
                      </button>

                      {/* Existing alerts for this ticker */}
                      {alertsForTicker.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Active Alerts for {alertModalTicker}</p>
                          <div className="space-y-2">
                            {alertsForTicker.map((a) => (
                              <div key={a.id} className={clsx('flex items-center gap-3 p-2.5 rounded-lg border', a.triggered ? 'border-success/50 bg-success/5' : 'border-border bg-surface')}>
                                <span className={clsx('shrink-0 w-2 h-2 rounded-full', a.condition === 'above' ? 'bg-success' : 'bg-danger')} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-text">
                                    {a.condition === 'above' ? '↑' : '↓'} ${a.price.toFixed(2)}
                                  </p>
                                  {a.note && <p className="text-xs text-text-muted truncate">{a.note}</p>}
                                </div>
                                <button type="button" onClick={() => removeAlert(a.id)} className="p-1 rounded hover:bg-surface-muted text-text-muted hover:text-danger shrink-0" aria-label="Delete alert">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {alertTab === 'manage' && (
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center">
                      <svg className="w-12 h-12 mx-auto text-text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm font-medium text-text-muted">No alerts set yet</p>
                      <p className="text-xs text-text-muted mt-1">Click "Set Alert" to create your first price alert.</p>
                    </div>
                  ) : (
                    <>
                      {allAlertTickers.map((ticker) => {
                        const tickerAlerts = alerts.filter((a) => a.ticker === ticker)
                        const q = getQuote(ticker)
                        const curPrice = q?.price
                        return (
                          <div key={ticker} className="rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 bg-surface-muted/30 border-b border-border">
                              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-surface border border-border">
                                {getTickerLogo(ticker) ? (
                                  <img src={getTickerLogo(ticker)} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-xs font-bold text-text-muted">{ticker[0]}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-text">{ticker}</p>
                                {curPrice && <p className="text-xs text-text-muted">Current: ${curPrice.toFixed(2)}</p>}
                              </div>
                              <span className="text-xs font-semibold text-text-muted">{tickerAlerts.length} alert{tickerAlerts.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="divide-y divide-border">
                              {tickerAlerts.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                                  <span className={clsx('shrink-0 w-2.5 h-2.5 rounded-full', a.condition === 'above' ? 'bg-success' : 'bg-danger')} />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-text flex items-center gap-1.5">
                                      {a.condition === 'above' ? (
                                        <svg className="w-3.5 h-3.5 text-success shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5 text-danger shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
                                      )}
                                      ${a.price.toFixed(2)}
                                    </p>
                                    {a.note && <p className="text-xs text-text-muted truncate mt-0.5">{a.note}</p>}
                                    <p className="text-[10px] text-text-muted mt-0.5">Created {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => { setAlertModalTicker(ticker); setAlertTab('set'); }}
                                      className="p-1.5 rounded hover:bg-surface-muted text-text-muted hover:text-primary transition-colors"
                                      aria-label="Add another alert"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeAlert(a.id)}
                                      className="p-1.5 rounded hover:bg-surface-muted text-text-muted hover:text-danger transition-colors"
                                      aria-label="Delete alert"
                                    >
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
