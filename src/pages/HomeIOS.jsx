import { useState } from 'react'
import { getTickerLogo } from '../constants/tickerLogos.js'

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

/* ── Watchlist ── */
const WATCHLIST = [
  { ticker: 'SEDG', name: 'Solaredge Technologies Inc', price: 36.33, change: -0.46, pct: -1.25 },
  { ticker: 'KNX', name: 'Knight-Swift Transportation Ho...', price: 60.26, change: 0.21, pct: 0.35 },
  { ticker: 'CACI', name: 'Caci International Inc. - Registe...', price: 550.00, change: -75.80, pct: -12.45 },
  { ticker: 'RICK', name: 'RCI Hospitality Holdings Inc', price: 23.40, change: -0.35, pct: -1.47 },
  { ticker: 'KMI', name: 'Kinder Morgan Inc - Ordinary S...', price: 31.50, change: 0.49, pct: 1.58 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co', price: 311.50, change: -6.78, pct: -2.12 },
  { ticker: 'WLTH', name: 'Wealthfront Corp.', price: 4.90, change: -0.22, pct: -4.29 },
  { ticker: 'LFCR', name: 'Lifecore Biomedical', price: 7.23, change: 0.18, pct: 2.55 },
  { ticker: 'AAPL', name: 'Apple Inc', price: 227.63, change: 1.42, pct: 0.63 },
  { ticker: 'MSFT', name: 'Microsoft Corp', price: 412.18, change: -3.24, pct: -0.78 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', price: 228.93, change: 2.87, pct: 1.27 },
  { ticker: 'GOOGL', name: 'Alphabet Inc', price: 186.45, change: -1.13, pct: -0.60 },
  { ticker: 'META', name: 'Meta Platforms Inc', price: 612.30, change: 8.45, pct: 1.40 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 117.82, change: -2.31, pct: -1.92 },
  { ticker: 'DIS', name: 'Walt Disney Co', price: 112.45, change: 0.87, pct: 0.78 },
  { ticker: 'HOOD', name: 'Robinhood Markets Inc', price: 54.23, change: 1.56, pct: 2.96 },
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
  const [activeTab, setActiveTab] = useState('home')
  const [mainTab, setMainTab] = useState('watchlist') // 'watchlist' | 'following'
  const [followingSort, setFollowingSort] = useState('recommended') // 'recommended' | 'latest'
  const [watchlistFilter, setWatchlistFilter] = useState('All')
  const [watchlistSort, setWatchlistSort] = useState('My Sort')

  return (
    <div className="mx-auto max-w-[430px] h-screen bg-black text-white flex flex-col overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>

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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">Watchlist</span>
              <button type="button" className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="flex items-center gap-0.5 text-xs text-white/60">
                {watchlistFilter} <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
              <button type="button" className="flex items-center gap-0.5 text-xs text-white/60">
                {watchlistSort} <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {WATCHLIST.map((stock) => {
              const isUp = stock.change >= 0
              return (
                <div key={stock.ticker} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <span className="text-sm font-bold block">{stock.ticker}</span>
                    <span className="text-xs text-white/40 block truncate max-w-[200px]">{stock.name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-sm font-semibold block">${stock.price.toFixed(2)}</span>
                    <span className={clsx('text-xs font-medium', isUp ? 'text-green-400' : 'text-red-400')}>
                      {isUp ? '↑' : '↓'} ${Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.pct).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )
            })}
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

      {/* ── Bottom Navigation (always visible) ── */}
      <div className="shrink-0 bg-black border-t border-white/10 pb-5 pt-2 px-2 relative">
        {/* FAB */}
        <button
          type="button"
          className="absolute right-4 -top-16 w-14 h-14 rounded-full bg-[#2196F3] flex items-center justify-center shadow-lg shadow-blue-500/30 z-20"
        >
          <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
        </button>
        <div className="flex items-center justify-around">
          {[
            { id: 'home', label: 'Home', icon: (active) => (
              <svg className="w-6 h-6" fill={active ? '#2196F3' : 'none'} stroke={active ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
            )},
            { id: 'community', label: 'Community', icon: (active) => (
              <svg className="w-6 h-6" fill="none" stroke={active ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
            )},
            { id: 'explore', label: 'Explore', icon: (active) => (
              <svg className="w-6 h-6" fill="none" stroke={active ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            )},
            { id: 'trending', label: 'Trending', icon: (active) => (
              <svg className="w-6 h-6" fill="none" stroke={active ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"/></svg>
            )},
            { id: 'notifications', label: 'Notifications', badge: 4, icon: (active) => (
              <svg className="w-6 h-6" fill="none" stroke={active ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 relative"
            >
              <div className="relative">
                {tab.icon(activeTab === tab.id)}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={clsx('text-[10px]', activeTab === tab.id ? 'text-[#2196F3]' : 'text-white/50')}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
