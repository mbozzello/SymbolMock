import { useState, useMemo, useRef, useEffect } from 'react'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import IOSBottomNav from '../components/IOSBottomNav.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

/* ── Ticker Tape data ── */
const TAPE = [
  { ticker: 'DIA', pct: -0.10, down: true },
  { ticker: 'SPY', pct: 0.05, down: false },
  { ticker: 'QQQ', pct: 0.27, down: false },
]

/* ── Trending cards ── */
const TRENDING = [
  { ticker: 'APP', name: 'AppLovin Corp', price: 439.96, pct: -7.10, spark: [42, 44, 43, 41, 39, 38, 40, 37] },
  { ticker: 'VKTX', name: 'Viking Therapeutics', price: 31.17, pct: 8.48, spark: [24, 25, 26, 27, 28, 29, 30, 31] },
  { ticker: 'QS', name: 'QuantumScape', price: 8.23, pct: -8.03, spark: [10, 9.5, 9, 8.8, 8.5, 8.2, 8.4, 8.2] },
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 128.34, pct: 3.42, spark: [120, 121, 123, 125, 124, 126, 127, 128] },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 381.12, pct: -1.87, spark: [390, 388, 385, 383, 380, 382, 379, 381] },
  { ticker: 'PLTR', name: 'Palantir Tech', price: 98.45, pct: 5.21, spark: [90, 92, 94, 93, 95, 96, 97, 98] },
]

/* ── Sort options ── */
const SORT_OPTIONS = [
  { key: 'gain', label: 'Gain' },
  { key: 'loss', label: 'Loss' },
  { key: 'a-z', label: 'A-Z' },
  { key: 'my-sort', label: 'My Sort' },
]

/* ── Mini sparkline for trending cards ── */
function MiniSpark({ values, isUp }) {
  const w = 100, h = 40, pad = 4
  const min = Math.min(...values), max = Math.max(...values)
  const range = Math.max(1, max - min)
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <polyline fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="2" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ── Following Feed ── */
const FOLLOWING_FEED = [
  { id: 'f1', user: 'AIBull', avatar: '/avatars/top-voice-1.png', body: 'Data center demand is insane. $NVDA guidance will crush again.', time: '2m', ts: 2, comments: 24, reposts: 8, likes: 142 },
  { id: 'f2', user: 'TechTrader', avatar: '/avatars/top-voice-2.png', body: 'NVDA at $875 and still not expensive given the growth. Holding through earnings.', time: '5m', ts: 5, comments: 18, reposts: 5, likes: 89 },
  { id: 'f3', user: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', body: '15.2K messages and 82% bullish. Crowd is right on this one.', time: '12m', ts: 12, comments: 9, reposts: 3, likes: 67 },
  { id: 'f4', user: 'ChipWatcher', avatar: '/avatars/top-voice-3.png', body: 'Blackwell ramp is the real story. Anyone trimming here will regret it.', time: '8m', ts: 8, comments: 31, reposts: 12, likes: 203 },
  { id: 'f5', user: 'MomentumKing', avatar: '/avatars/howard-lindzon.png', body: '$TSLA breaking out. FSD v12.5 rolling out to more users.', time: '3m', ts: 3, comments: 45, reposts: 12, likes: 312 },
  { id: 'f6', user: 'CloudBuilder', avatar: '/avatars/michele-steele.png', body: 'Every hyperscaler is doubling down. $NVDA is the only game in town for training.', time: '52m', ts: 52, comments: 21, reposts: 7, likes: 156 },
  { id: 'f7', user: 'AppleLong', avatar: '/avatars/top-voice-1.png', body: 'Services growth accelerating. Margin story intact for $AAPL.', time: '1h', ts: 60, comments: 14, reposts: 4, likes: 98 },
  { id: 'f8', user: 'DataCenterBull', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption accelerating. $NVDA and $AMD both benefiting from AI build-out.', time: '15m', ts: 15, comments: 14, reposts: 4, likes: 98 },
  { id: 'f9', user: 'GrowthInvestor', avatar: '/avatars/top-voice-2.png', body: 'Earnings beat coming. Supply constraints are easing and demand is still strong.', time: '22m', ts: 22, comments: 7, reposts: 2, likes: 45 },
  { id: 'f10', user: 'QuantMind', avatar: '/avatars/ross-cameron.png', body: 'Inference demand is the next wave. $NVDA well positioned.', time: '1h', ts: 60, comments: 13, reposts: 4, likes: 88 },
  { id: 'f11', user: 'ChinaWatcher', avatar: '/avatars/top-voice-2.png', body: 'China data points improving. Stimulus working. $AAPL undervalued here.', time: '35m', ts: 35, comments: 19, reposts: 5, likes: 124 },
  { id: 'f12', user: 'EcosystemBull', avatar: '/avatars/top-voice-3.png', body: 'Capital return story is strong. Buyback pace accelerating for $AAPL.', time: '48m', ts: 48, comments: 8, reposts: 2, likes: 54 },
]
const FOLLOWING_RECOMMENDED = [...FOLLOWING_FEED].sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2))
const FOLLOWING_LATEST = [...FOLLOWING_FEED].sort((a, b) => a.ts - b.ts)

export default function HomeIOS() {
  const {
    watchlist,
    watchlists,
    currentWatchlistId,
    currentWatchlist,
    setCurrentWatchlistId,
    addWatchlist,
    removeWatchlist,
    removeSymbol,
    addSymbol,
    renameWatchlist,
  } = useWatchlist()
  const { getQuote } = useLiveQuotesContext()

  const [mainTab, setMainTab] = useState('watchlist') // 'watchlist' | 'following'
  const [followingSort, setFollowingSort] = useState('recommended') // 'recommended' | 'latest'
  const [watchlistSortKey, setWatchlistSortKey] = useState('gain')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [watchlistPickerOpen, setWatchlistPickerOpen] = useState(false)
  const [addingSymbol, setAddingSymbol] = useState(false)
  const [addTickerValue, setAddTickerValue] = useState('')
  const addInputRef = useRef(null)
  const sortMenuRef = useRef(null)
  const pickerRef = useRef(null)

  // Rename watchlist
  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const editInputRef = useRef(null)

  // Delete watchlist
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Price alerts
  const [alerts, setAlerts] = useState(() => {
    try { const s = localStorage.getItem('price_alerts'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertTab, setAlertTab] = useState('set')
  const [alertModalTicker, setAlertModalTicker] = useState(null)
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState('above')
  const [newAlertNote, setNewAlertNote] = useState('')
  const [alertSymbolSearch, setAlertSymbolSearch] = useState('')

  const saveAlerts = (next) => { setAlerts(next); try { localStorage.setItem('price_alerts', JSON.stringify(next)) } catch {} }
  const openAlertModal = (ticker) => {
    setAlertModalTicker(ticker); setAlertModalOpen(true); setAlertTab('set')
    setNewAlertPrice(''); setNewAlertCondition('above'); setNewAlertNote(''); setAlertSymbolSearch('')
  }
  const handleCreateAlert = () => {
    const price = parseFloat(newAlertPrice)
    if (!price || !alertModalTicker) return
    saveAlerts([...alerts, { id: Date.now(), ticker: alertModalTicker, price, condition: newAlertCondition, note: newAlertNote.trim(), createdAt: new Date().toISOString(), triggered: false }])
    setNewAlertPrice(''); setNewAlertNote(''); setAlertTab('manage')
  }
  const removeAlert = (id) => saveAlerts(alerts.filter((a) => a.id !== id))

  const handleSaveName = () => {
    const trimmed = editNameValue.trim()
    if (trimmed && currentWatchlistId) renameWatchlist(currentWatchlistId, trimmed)
    setEditingName(false); setEditNameValue('')
  }

  // Close menus on outside tap
  useEffect(() => {
    if (!sortMenuOpen && !watchlistPickerOpen) return
    const close = (e) => {
      if (sortMenuOpen && sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setSortMenuOpen(false)
      if (watchlistPickerOpen && pickerRef.current && !pickerRef.current.contains(e.target)) setWatchlistPickerOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [sortMenuOpen, watchlistPickerOpen])

  useEffect(() => { if (addingSymbol && addInputRef.current) addInputRef.current.focus() }, [addingSymbol])
  useEffect(() => { if (editingName && editInputRef.current) editInputRef.current.focus() }, [editingName])

  const handleAddSymbol = (e) => {
    e?.preventDefault()
    const t = addTickerValue.trim().toUpperCase()
    if (t) { addSymbol(t, t); setAddTickerValue(''); setAddingSymbol(false) }
  }

  const sortedWatchlist = useMemo(() => {
    const list = [...watchlist]
    if (watchlistSortKey === 'a-z') return list.sort((a, b) => (a.ticker || '').localeCompare(b.ticker || ''))
    if (watchlistSortKey === 'my-sort') return list
    const withPct = list.map((s) => {
      const q = getQuote(s.ticker)
      const price = q?.price ?? s.price
      const change = q?.change ?? s.change
      const pct = q?.changePercent ?? (price && price !== 0 ? (change / price) * 100 : 0)
      return { ...s, _pct: pct }
    })
    if (watchlistSortKey === 'gain') return withPct.sort((a, b) => (b._pct ?? 0) - (a._pct ?? 0))
    if (watchlistSortKey === 'loss') return withPct.sort((a, b) => (a._pct ?? 0) - (b._pct ?? 0))
    return list
  }, [watchlist, watchlistSortKey, getQuote])

  return (
    <div className="mx-auto max-w-[430px] h-screen bg-black text-white flex flex-col overflow-hidden relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>

      {/* ── iOS Status Bar ── */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 shrink-0">
        <span className="text-sm font-semibold">5:13</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-3" viewBox="0 0 20 14" fill="white"><rect x="0" y="8" width="3" height="6" rx="0.5" opacity="0.4"/><rect x="5" y="5" width="3" height="9" rx="0.5" opacity="0.4"/><rect x="10" y="2" width="3" height="12" rx="0.5" opacity="0.7"/><rect x="15" y="0" width="3" height="14" rx="0.5"/></svg>
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="white"><path d="M8 2.4C10.8 2.4 13.2 3.6 14.8 5.6L16 4.4C14 2 11.2 0.4 8 0.4S2 2 0 4.4L1.2 5.6C2.8 3.6 5.2 2.4 8 2.4ZM8 6.4C9.6 6.4 11 7.2 12 8.4L13.2 7.2C11.8 5.6 10 4.4 8 4.4S4.2 5.6 2.8 7.2L4 8.4C5 7.2 6.4 6.4 8 6.4ZM8 10.4C8.8 10.4 9.4 10.8 9.8 11.4L8 13.6L6.2 11.4C6.6 10.8 7.2 10.4 8 10.4Z"/></svg>
          <div className="flex items-center gap-0.5">
            <div className="w-7 h-3.5 rounded-sm border border-white/30 flex items-center p-px">
              <div className="h-full rounded-[1px] bg-green-400" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
        <button type="button" className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold italic tracking-tight">stocktwits</span>
          <svg className="w-3.5 h-3.5 opacity-60" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
        </div>
        <button type="button" className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
        </button>
      </div>

      {/* ── Ticker Tape (part of header) ── */}
      <div className="flex items-center justify-around px-4 py-2 border-t border-white/10 shrink-0">
        {TAPE.map((t) => (
          <div key={t.ticker} className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white/90">{t.ticker}</span>
            <span className={clsx('text-xs font-medium', t.down ? 'text-red-400' : 'text-green-400')}>
              {t.down ? '↓' : '↑'} {Math.abs(t.pct).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* ── Watchlist / Following Tabs ── */}
      <div className="flex shrink-0 border-b border-white/10">
        <button
          type="button"
          onClick={() => setMainTab('watchlist')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
            mainTab === 'watchlist' ? 'text-white border-white' : 'text-white/40 border-transparent'
          )}
        >
          Watchlist
        </button>
        <button
          type="button"
          onClick={() => setMainTab('following')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
            mainTab === 'following' ? 'text-white border-white' : 'text-white/40 border-transparent'
          )}
        >
          Following
        </button>
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto">

        {mainTab === 'watchlist' && (
        <>
        {/* ── Trending Section ── */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">Trending</span>
              <button type="button" className="flex items-center gap-0.5 text-xs text-white/60">
                All <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
            </div>
            <button type="button" className="p-1">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {TRENDING.map((stock) => {
              const logo = getTickerLogo(stock.ticker)
              const isUp = stock.pct >= 0
              return (
                <div
                  key={stock.ticker}
                  className="shrink-0 w-[130px] rounded-xl p-3 flex flex-col"
                  style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {logo ? (
                      <img src={logo} alt="" className="w-7 h-7 rounded-full object-cover bg-white/10" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{stock.ticker[0]}</div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{stock.ticker}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold mb-1">${stock.price.toFixed(2)}</span>
                  <div className="my-1">
                    <MiniSpark values={stock.spark} isUp={isUp} />
                  </div>
                  <span className={clsx('text-xs font-semibold', isUp ? 'text-green-400' : 'text-red-400')}>
                    {isUp ? '↑' : '↓'} {Math.abs(stock.pct).toFixed(2)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Watchlist Section ── */}
        <div className="px-4 pt-4">
          {/* Header row: list picker + add + alert + sort */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 relative" ref={pickerRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setWatchlistPickerOpen((v) => !v) }}
                className="flex items-center gap-1 text-base font-bold"
              >
                <span className="truncate max-w-[120px]">{currentWatchlist?.name || 'Watchlist'}</span>
                <svg className={clsx('w-4 h-4 text-white/50 transition-transform', watchlistPickerOpen && 'rotate-180')} fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
              {/* Add symbol */}
              <button type="button" onClick={() => setAddingSymbol(true)} className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
              {/* Price alerts */}
              <button
                type="button"
                onClick={() => { setAlertModalTicker(null); setAlertModalOpen(true); setAlertTab('manage') }}
                className="relative w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0"
                aria-label="Price alerts"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 rounded-full bg-[#2196F3] text-[8px] font-bold text-white flex items-center justify-center px-0.5">{alerts.length}</span>
                )}
              </button>
              {/* Watchlist picker dropdown */}
              {watchlistPickerOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-white/10 bg-[#1c1c1e] shadow-xl py-1">
                  {watchlists.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => { setCurrentWatchlistId(w.id); setWatchlistPickerOpen(false) }}
                      className={clsx('w-full text-left px-4 py-2.5 text-sm', w.id === currentWatchlistId ? 'text-[#2196F3] font-semibold' : 'text-white/70')}
                    >
                      {w.name}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    type="button"
                    onClick={() => { setEditingName(true); setEditNameValue(currentWatchlist?.name ?? ''); setWatchlistPickerOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/70 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Rename List
                  </button>
                  {watchlists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => { setWatchlistPickerOpen(false); setConfirmDeleteOpen(true) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete List
                    </button>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    type="button"
                    onClick={() => { addWatchlist(); setWatchlistPickerOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#2196F3]"
                  >
                    + New List
                  </button>
                </div>
              )}
            </div>
            <div className="relative shrink-0" ref={sortMenuRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSortMenuOpen((v) => !v) }}
                className="flex items-center gap-1 text-xs text-white/50"
              >
                {SORT_OPTIONS.find((o) => o.key === watchlistSortKey)?.label || 'Gain'}
                <svg className={clsx('w-3 h-3 transition-transform', sortMenuOpen && 'rotate-180')} fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-white/10 bg-[#1c1c1e] shadow-xl py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setWatchlistSortKey(opt.key); setSortMenuOpen(false) }}
                      className={clsx('w-full text-left px-4 py-2.5 text-sm', watchlistSortKey === opt.key ? 'text-[#2196F3] font-semibold' : 'text-white/70')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inline rename watchlist */}
          {editingName && (
            <div className="flex items-center gap-2 mb-3">
              <input
                ref={editInputRef}
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setEditNameValue('') } }}
                onBlur={handleSaveName}
                className="flex-1 text-sm rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3] min-w-0"
                placeholder="List name"
              />
            </div>
          )}

          {/* Add symbol input */}
          {addingSymbol && (
            <form onSubmit={handleAddSymbol} className="flex items-center gap-2 mb-3">
              <input
                ref={addInputRef}
                type="text"
                value={addTickerValue}
                onChange={(e) => setAddTickerValue(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Escape') { setAddingSymbol(false); setAddTickerValue('') } }}
                placeholder="Ticker (e.g. AAPL)"
                className="flex-1 text-sm rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3] min-w-0"
                maxLength={10}
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-[#2196F3] text-sm font-semibold shrink-0">Add</button>
              <button type="button" onClick={() => { setAddingSymbol(false); setAddTickerValue('') }} className="text-white/40 text-lg px-1">×</button>
            </form>
          )}

          {/* Watchlist items */}
          <div className="divide-y divide-white/10">
            {sortedWatchlist.map((s) => {
              const q = getQuote(s.ticker)
              const price = q?.price ?? s.price
              const change = q?.change ?? s.change
              const pct = q?.changePercent ?? (price && price !== 0 ? (change / price) * 100 : 0)
              const isUp = (change ?? 0) >= 0
              const logo = getTickerLogo(s.ticker)
              const hasAlert = alerts.some((a) => a.ticker === s.ticker)
              return (
                <div key={s.ticker} className="flex items-center gap-3 py-3 group">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-white/5 border border-white/10">
                    {logo ? (
                      <img src={logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-white/50">{s.ticker[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold block">{s.ticker}</span>
                    <span className="text-xs text-white/40 block truncate">{s.name}</span>
                  </div>
                  {/* Per-row actions: alert + remove */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openAlertModal(s.ticker)}
                      className="p-1 rounded-full hover:bg-white/10"
                      aria-label={`Set alert for ${s.ticker}`}
                    >
                      <svg className={clsx('w-3.5 h-3.5', hasAlert ? 'text-[#2196F3]' : 'text-white/40')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSymbol(s.ticker)}
                      className="p-1 rounded-full hover:bg-white/10"
                      aria-label={`Remove ${s.ticker}`}
                    >
                      <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold block">${typeof price === 'number' ? price.toFixed(2) : '--'}</span>
                    <span className={clsx('text-xs font-medium', isUp ? 'text-green-400' : 'text-red-400')}>
                      {isUp ? '↑' : '↓'} ${Math.abs(change ?? 0).toFixed(2)} ({Math.abs(pct).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )
            })}
            {sortedWatchlist.length === 0 && (
              <div className="py-8 text-center text-sm text-white/30">
                No symbols yet. Tap + to add one.
              </div>
            )}
          </div>
        </div>
        </>
        )}

        {mainTab === 'following' && (
          <div className="px-4 pt-3 pb-4">
            {/* Recommended / Latest sub-tabs */}
            <div className="flex items-center gap-5 border-b border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setFollowingSort('recommended')}
                className={clsx(
                  'pb-2 text-sm font-semibold transition-colors border-b-2',
                  followingSort === 'recommended' ? 'text-white border-white' : 'text-white/40 border-transparent'
                )}
              >
                Recommended
              </button>
              <button
                type="button"
                onClick={() => setFollowingSort('latest')}
                className={clsx(
                  'pb-2 text-sm font-semibold transition-colors border-b-2',
                  followingSort === 'latest' ? 'text-white border-white' : 'text-white/40 border-transparent'
                )}
              >
                Latest
              </button>
            </div>

            {/* Feed messages */}
            <div className="divide-y divide-white/10">
              {(followingSort === 'recommended' ? FOLLOWING_RECOMMENDED : FOLLOWING_LATEST).map((msg) => (
                <div key={msg.id} className="flex gap-3 py-3">
                  <img src={msg.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{msg.user}</span>
                      <span className="text-[11px] text-white/40">{msg.time}</span>
                    </div>
                    <p className="text-[13px] text-white/80 mt-0.5 leading-snug">{msg.body}</p>
                    <div className="flex items-center gap-5 mt-2 text-[11px] text-white/40">
                      <button type="button" className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        {msg.comments}
                      </button>
                      <button type="button" className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        {msg.reposts}
                      </button>
                      <button type="button" className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        {msg.likes}
                      </button>
                      <button type="button" className="hover:text-white/70 transition-colors ml-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Confirm Delete Watchlist Modal ── */}
      {confirmDeleteOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6" aria-modal="true" role="alertdialog">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDeleteOpen(false)} />
          <div className="relative bg-[#1c1c1e] rounded-2xl border border-white/10 shadow-xl p-5 max-w-xs w-full">
            <p className="text-sm font-semibold text-white text-center mb-1">Delete Watchlist</p>
            <p className="text-xs text-white/50 text-center mb-5">Are you sure you want to delete "{currentWatchlist?.name}"? This cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmDeleteOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { if (currentWatchlistId) removeWatchlist(currentWatchlistId); setConfirmDeleteOpen(false) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Price Alerts Modal ── */}
      {alertModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAlertModalOpen(false)} />
          <div className="relative mt-auto bg-[#1c1c1e] rounded-t-2xl border-t border-white/10 shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2196F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-base font-bold text-white">
                  {alertModalTicker ? `Alerts — ${alertModalTicker}` : 'Price Alerts'}
                </span>
              </div>
              <button type="button" onClick={() => setAlertModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setAlertTab('set')}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold text-center border-b-2 -mb-px transition-colors',
                  alertTab === 'set' ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-white/40'
                )}
              >
                Set Alert
              </button>
              <button
                type="button"
                onClick={() => setAlertTab('manage')}
                className={clsx(
                  'flex-1 py-3 text-sm font-semibold text-center border-b-2 -mb-px transition-colors',
                  alertTab === 'manage' ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-white/40'
                )}
              >
                Manage Alerts{alerts.length > 0 && ` (${alerts.length})`}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {alertTab === 'set' && (
                <div className="space-y-4">
                  {/* Symbol search / select */}
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Search Symbol</label>
                    <input
                      type="text"
                      value={alertSymbolSearch}
                      onChange={(e) => { setAlertSymbolSearch(e.target.value.toUpperCase()); setAlertModalTicker(e.target.value.toUpperCase() || null) }}
                      placeholder="Type a symbol..."
                      className="w-full text-sm rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3]"
                    />
                  </div>
                  {/* Quick symbol pills from watchlist */}
                  {watchlist.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {watchlist.filter((s) => !alertSymbolSearch || s.ticker.includes(alertSymbolSearch)).slice(0, 12).map((s) => (
                        <button
                          key={s.ticker}
                          type="button"
                          onClick={() => { setAlertModalTicker(s.ticker); setAlertSymbolSearch(s.ticker) }}
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
                            alertModalTicker === s.ticker ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/60'
                          )}
                        >
                          {s.ticker}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Price + condition */}
                  {alertModalTicker && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Alert when {alertModalTicker} goes</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewAlertCondition('above')}
                            className={clsx(
                              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                              newAlertCondition === 'above' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/50 border border-white/10'
                            )}
                          >
                            Above
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewAlertCondition('below')}
                            className={clsx(
                              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                              newAlertCondition === 'below' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/50 border border-white/10'
                            )}
                          >
                            Below
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAlertPrice}
                          onChange={(e) => setNewAlertPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full text-sm rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Note (optional)</label>
                        <input
                          type="text"
                          value={newAlertNote}
                          onChange={(e) => setNewAlertNote(e.target.value)}
                          placeholder="e.g. Take profit level"
                          className="w-full text-sm rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateAlert}
                        disabled={!newAlertPrice || !alertModalTicker}
                        className={clsx(
                          'w-full py-3 rounded-xl text-sm font-bold transition-colors',
                          newAlertPrice && alertModalTicker ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/30 cursor-not-allowed'
                        )}
                      >
                        Create Alert
                      </button>
                    </>
                  )}
                </div>
              )}

              {alertTab === 'manage' && (
                <div>
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center">
                      <svg className="w-10 h-10 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm text-white/40">No alerts set yet</p>
                      <button type="button" onClick={() => setAlertTab('set')} className="mt-3 text-sm font-semibold text-[#2196F3]">
                        + Create your first alert
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{a.ticker}</span>
                              <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', a.condition === 'above' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                                {a.condition === 'above' ? '↑ Above' : '↓ Below'}
                              </span>
                            </div>
                            <span className="text-xs text-white/50">${parseFloat(a.price).toFixed(2)}{a.note ? ` · ${a.note}` : ''}</span>
                          </div>
                          <button type="button" onClick={() => removeAlert(a.id)} className="p-1.5 rounded-full hover:bg-white/10 shrink-0" aria-label="Delete alert">
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation (always visible) ── */}
      <div className="shrink-0 relative">
        {/* FAB */}
        <button
          type="button"
          className="absolute right-4 -top-16 w-14 h-14 rounded-full bg-[#2196F3] flex items-center justify-center shadow-lg shadow-blue-500/30 z-20"
        >
          <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
        </button>
        <IOSBottomNav />
      </div>
    </div>
  )
}
