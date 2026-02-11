import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTickerLogo } from '../constants/tickerLogos'

const TOTAL_STEPS = 7

const STREAM_MESSAGES = [
  { user: 'TechBull', avatar: '/avatars/who-follow-1.png', body: 'Breaking above the 20 EMA on strong volume $', time: 'now' },
  { user: 'MomentumKing', avatar: '/avatars/who-follow-2.png', body: 'Earnings beat could send this to new ATH', time: '1m' },
  { user: 'ChartReader', avatar: '/avatars/who-follow-3.png', body: 'Bullish divergence forming on the 4H', time: '2m' },
  { user: 'OptionsFlow', avatar: '/avatars/who-follow-4.png', body: 'Big call sweep just went through 250 strike', time: '3m' },
  { user: 'AlphaSeeker', avatar: '/avatars/who-follow-1.png', body: 'Institutional accumulation last 3 days', time: '4m' },
  { user: 'SwingTrader', avatar: '/avatars/who-follow-2.png', body: 'Holding for the breakout above 420', time: '5m' },
  { user: 'RetailWatch', avatar: '/avatars/who-follow-3.png', body: 'Sentiment shifting bullish in the stream', time: '6m' },
  { user: 'VolumeAlert', avatar: '/avatars/who-follow-4.png', body: 'Volume 2x average – something’s moving', time: '7m' },
  { user: 'LevelsPro', avatar: '/avatars/who-follow-1.png', body: 'Support at 398 held, watching for bounce', time: '8m' },
  { user: 'EarningsFan', avatar: '/avatars/who-follow-2.png', body: 'Guidance raise would be huge for next leg', time: '9m' },
]

const TRENDING_SYMBOLS = [
  { ticker: 'NVDA', followers: '678K', up: true },
  { ticker: 'AAPL', followers: '892K', up: true },
  { ticker: 'TSLA', followers: '756K', up: false },
  { ticker: 'MSFT', followers: '634K', up: true },
]

const MAG7_SYMBOLS = [
  { ticker: 'NVDA', followers: '678K', up: true },
  { ticker: 'AAPL', followers: '892K', up: true },
  { ticker: 'GOOGL', followers: '445K', up: true },
  { ticker: 'MSFT', followers: '634K', up: true },
]

const TOP_CRYPTO = [
  { ticker: 'BTC', followers: '412K', up: true, logo: 'crypto' },
  { ticker: 'ETH', followers: '289K', up: true, logo: 'crypto' },
  { ticker: 'SOL', followers: '156K', up: false, logo: 'crypto' },
  { ticker: 'DOGE', followers: '198K', up: true, logo: 'crypto' },
]

const MOST_NEW_WATCHERS = [
  { ticker: 'RKLB', followers: '89K', up: true },
  { ticker: 'GME', followers: '312K', up: true },
  { ticker: 'NVDA', followers: '678K', up: true },
  { ticker: 'AMZN', followers: '521K', up: true },
]

const TOP_GAINERS = [
  { ticker: 'CELH', followers: '124K', up: true },
  { ticker: 'TSLA', followers: '756K', up: false },
  { ticker: 'DIS', followers: '445K', up: true },
  { ticker: 'NVDA', followers: '678K', up: true },
]

const MOST_ACTIVE = [
  { ticker: 'TSLA', followers: '756K', up: false },
  { ticker: 'AAPL', followers: '892K', up: true },
  { ticker: 'GME', followers: '312K', up: true },
  { ticker: 'NVDA', followers: '678K', up: true },
]

// Search dropdown results (e.g. when typing "aa")
const SEARCH_DROPDOWN_STOCKS = [
  { ticker: 'AA', name: 'Alcoa Corp', change: 4.09 },
  { ticker: 'AAPL', name: 'Apple Inc', change: -0.3 },
  { ticker: 'AABB', name: 'Asia Broadband Inc', change: null },
  { ticker: 'AAL', name: 'American Airlines Group Inc', change: 3.51 },
]
const SEARCH_DROPDOWN_CRYPTO = [
  { ticker: 'AABBG', name: 'AABBG Token', change: null },
  { ticker: 'AAVE', name: 'AAVE', change: -1.67 },
  { ticker: 'GHST', name: 'Aavegotchi', change: -0.3 },
  { ticker: 'AAA', name: 'Moon Rabbit', change: -7.97 },
]

const TRADING_STYLES = [
  'Beginner',
  'YOLO',
  'Technical',
  'Fundamental',
  'Swing Trader',
  'Day Trader',
  'Long Term',
  'Options',
  'Momentum',
  'Value Investor',
]

const RECOMMENDED_TRADERS = [
  { id: '1', handle: 'MomoTrader', initial: 'M', avatar: '/avatars/who-follow-1.png', followers: '245K', style: 'Momentum Plays', talkingAbout: [{ icon: 'rocket', label: 'Momentum Surge' }, { icon: 'cloud', label: 'High Volume' }, { icon: 'chart', label: 'Price Action' }] },
  { id: '2', handle: 'BreakoutHunter', initial: 'B', avatar: '/avatars/who-follow-2.png', followers: '178K', style: 'Breakout Trading', talkingAbout: [{ icon: 'star', label: 'Breakout Alert' }, { icon: 'bars', label: 'Volume Breakout' }] },
  { id: '3', handle: 'TechAnalyst', initial: 'T', avatar: '/avatars/who-follow-3.png', followers: '312K', style: 'Technical', talkingAbout: [{ icon: 'chart', label: 'Support & Resistance' }, { icon: 'trend', label: 'Trend Lines' }] },
  { id: '4', handle: 'ValueViking', initial: 'V', avatar: '/avatars/who-follow-4.png', followers: '156K', style: 'Value Investor', talkingAbout: [{ icon: 'doc', label: 'Earnings' }, { icon: 'cash', label: 'DCF' }] },
  { id: '5', handle: 'SwingQueen', initial: 'S', avatar: '/avatars/who-follow-1.png', followers: '89K', style: 'Swing Trader', talkingAbout: [{ icon: 'wave', label: 'Swing Setups' }, { icon: 'clock', label: 'Hold Periods' }] },
  { id: '6', handle: 'DayTraderPro', initial: 'D', avatar: '/avatars/who-follow-2.png', followers: '201K', style: 'Day Trader', talkingAbout: [{ icon: 'flash', label: 'Scalping' }, { icon: 'volume', label: 'Intraday Vol' }] },
  { id: '7', handle: 'OptionsOwl', initial: 'O', avatar: '/avatars/who-follow-3.png', followers: '267K', style: 'Options', talkingAbout: [{ icon: 'strike', label: 'Strike Selection' }, { icon: 'theta', label: 'Theta Decay' }] },
  { id: '8', handle: 'FundamentalFan', initial: 'F', avatar: '/avatars/who-follow-4.png', followers: '134K', style: 'Fundamental', talkingAbout: [{ icon: 'doc', label: '10-K Deep Dive' }, { icon: 'ratio', label: 'Ratios' }] },
  { id: '9', handle: 'howardlindzon', initial: 'H', avatar: '/avatars/who-follow-2.png', followers: '412K', style: 'Momentum Plays', talkingAbout: [{ icon: 'rocket', label: 'Momentum' }, { icon: 'chart', label: 'Markets' }, { icon: 'cloud', label: 'Community' }] },
]

const STYLE_MATCH = {
  'Beginner': ['Value Investor', 'Fundamental'],
  'YOLO': ['Momentum Plays', 'Breakout Trading'],
  'Momentum': ['Momentum Plays'],
  'Technical': ['Technical'],
  'Fundamental': ['Fundamental'],
  'Swing Trader': ['Swing Trader'],
  'Day Trader': ['Day Trader'],
  'Long Term': ['Value Investor'],
  'Options': ['Options'],
  'Value Investor': ['Value Investor'],
  'Breakout Trading': ['Breakout Trading'],
}

const TRENDING_WITH_WHY = [
  { ticker: 'PYPL', rank: 1, price: 43.66, pctChange: -16.57, name: 'PayPal', explanation: 'PayPal is trending after its latest earnings report missed expectations and included a weak outlook, further complicated by the announcement of a CEO transition.' },
  { ticker: 'PLTR', rank: 2, price: 164.71, pctChange: 11.47, name: 'Palantir', explanation: 'Palantir is trending after beating Q4 earnings expectations and issuing blockbuster guidance for FY25 and FY26, driven by accelerating commercial revenue and government demand.' },
  { ticker: 'NVDA', rank: 3, price: 892.34, pctChange: 4.2, name: 'NVIDIA', explanation: 'NVIDIA is trending on continued AI demand and data center strength, with analysts raising price targets following the latest GPU roadmap updates.' },
  { ticker: 'TSLA', rank: 4, price: 312.45, pctChange: -2.1, name: 'Tesla', explanation: 'Tesla is trending after delivery numbers and updates on Full Self-Driving rollout, with investors weighing robotaxi timeline against macro and EV competition.' },
]

const LIVE_EARNINGS_CALLS = [
  { ticker: 'GLXY', listeners: 1247, timeAgo: '1h ago' },
  { ticker: 'TWO', listeners: 892, timeAgo: '35m ago' },
  { ticker: 'TER', listeners: 2103, timeAgo: '1h ago' },
  { ticker: 'CPRI', listeners: 456, timeAgo: '1h ago' },
]

const FOLLOWERS_SAYING = [
  { id: '1', username: 'MomoTrader', avatar: '/avatars/who-follow-1.png', followers: '245K', recentTopics: ['Momentum', 'Breakouts', 'Volume'] },
  { id: '2', username: 'TechAnalyst', avatar: '/avatars/who-follow-2.png', followers: '312K', recentTopics: ['Technical', 'Support & Resistance', 'Earnings'] },
  { id: '3', username: 'OptionsOwl', avatar: '/avatars/who-follow-3.png', followers: '267K', recentTopics: ['Options', 'Strike Selection', 'IV'] },
  { id: '4', username: 'ValueViking', avatar: '/avatars/who-follow-4.png', followers: '156K', recentTopics: ['Value', 'DCF', '10-K'] },
]

function ChartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 2 5-6" />
    </svg>
  )
}

function GroupIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <circle cx="17" cy="7" r="2" />
      <path d="M14 21v-2a2.5 2.5 0 0 1 2.5-2.5h0A2.5 2.5 0 0 1 19 19v2" />
      <circle cx="12" cy="7" r="2" />
      <path d="M9 21v-2a2.5 2.5 0 0 1 2.5-2.5h0" />
    </svg>
  )
}

function TalkingAboutIcon({ type }) {
  const cls = 'w-3.5 h-3.5 shrink-0'
  switch (type) {
    case 'rocket':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
    case 'chart':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 2 5-6" /></svg>
    case 'cloud':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
    case 'star':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15 9 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 9" /></svg>
    case 'bars':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="6" rx="1" /><rect x="10" y="8" width="4" height="10" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></svg>
    case 'doc':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
    case 'trend':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 7-8.5 8.5-4-4L2 17" /><path d="M16 7h6v6" /></svg>
    case 'cash':
    case 'ratio':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 10h.01" /><path d="M7 14h.01" /></svg>
    case 'wave':
    case 'clock':
    case 'flash':
    case 'volume':
    case 'strike':
    case 'theta':
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
  }
}

function RecommendedTraderCard({ trader, isFollowing, onFollowToggle }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)]">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#334155] flex items-center justify-center shrink-0">
        {trader.avatar ? (
          <img src={trader.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold">{trader.initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-white">@{trader.handle}</div>
            <div className="text-xs text-[#94a3b8] mt-0.5">
              {trader.followers} followers <span className="text-[#94a3b8]">•</span>{' '}
              <span className="text-[#38bdf8]">{trader.style}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onFollowToggle}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold shrink-0 transition-colors ${
              isFollowing ? 'bg-black text-white' : 'bg-white text-black hover:opacity-90'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        <div className="mt-3">
          <div className="text-xs text-[#94a3b8] mb-1.5">Talking about</div>
          <div className="flex flex-wrap gap-1.5">
            {trader.talkingAbout.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-white border border-[rgba(255,255,255,0.2)] bg-[#0f172a]/80">
                <TalkingAboutIcon type={item.icon} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CryptoIcon({ className }) {
  return (
    <div className={`w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 ${className || ''}`}>
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6h1V12h1.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5zm0 4.5H12v-3h.5v3z" />
      </svg>
    </div>
  )
}

// Simple sparkline path: 0-1 normalized, up = true means line trends up
const SPARKLINE_UP = 'M0,12 L3,10 L6,8 L9,6 L12,5 L15,4 L18,3 L21,2 L24,1'
const SPARKLINE_DOWN = 'M0,2 L3,4 L6,6 L9,8 L12,10 L15,12 L18,14 L21,16 L24,18'

const HEADER_TOP_TOPICS = ['AI', 'Earnings', 'Options flow', 'Technical setup']

function SymbolHeaderCard({ ticker, followers, up }) {
  const logoUrl = getTickerLogo(ticker)
  const dotColor = up ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
  const isCrypto = ['BTC', 'ETH', 'SOL', 'DOGE'].includes(ticker)
  const sparkPath = up ? SPARKLINE_UP : SPARKLINE_DOWN
  const sparkColor = up ? 'var(--color-success)' : 'var(--color-danger)'
  return (
    <div className="rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] p-5">
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#334155]" />
        ) : isCrypto ? (
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6h1V12h1.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5zm0 4.5H12v-3h.5v3z" />
            </svg>
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full shrink-0 ${dotColor}`} />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-lg text-white">${ticker}</div>
          <div className="flex items-center gap-2 text-xs text-[#94a3b8] mt-0.5">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              {followers}
            </span>
            <span>·</span>
            <span className={up ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
              {up ? '+2.4%' : '-1.2%'} today
            </span>
          </div>
          {/* Sparkline */}
          <div className="mt-3 h-8 w-full max-w-[140px]">
            <svg viewBox="0 0 24 18" className="w-full h-full" preserveAspectRatio="none">
              <path
                d={sparkPath}
                fill="none"
                stroke={sparkColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* Top topics */}
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-2">Top topics</div>
        <div className="flex flex-wrap gap-2">
          {HEADER_TOP_TOPICS.map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-white/90 bg-white/10"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageStream({ messages }) {
  const repeated = [...messages, ...messages]
  return (
    <div
      className="flex flex-col gap-0 pt-2 pb-2 w-full"
      style={{ animation: 'messageStream 30s linear infinite' }}
    >
      <style>{`
        @keyframes messageStream {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
      `}</style>
      {repeated.map((m, i) => (
        <div key={`${i}-${m.user}`} className="px-3 py-2 flex items-center gap-1.5 shrink-0">
          {m.avatar && (
            <img src={m.avatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0 bg-[#334155]" />
          )}
          <span className="text-xs font-semibold text-[#38bdf8] shrink-0">@{m.user}</span>
          <span className="text-xs text-white/90 break-words flex-1 min-w-0">{m.body}</span>
          <span className="text-[10px] text-[#64748b] shrink-0">{m.time}</span>
        </div>
      ))}
    </div>
  )
}

function SearchDropdownRow({ item, isCrypto, selected, onToggle }) {
  const logoUrl = getTickerLogo(item.ticker)
  const hasChange = item.change != null
  const isUp = hasChange && item.change >= 0
  return (
    <button
      type="button"
      onClick={() => onToggle(item.ticker)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left"
    >
      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#334155] flex items-center justify-center shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-white/80">{item.ticker.slice(0, 1)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm text-white">{item.ticker}</div>
        <div className="text-xs text-[#94a3b8] truncate">{item.name}</div>
      </div>
      {hasChange && (
        <span className={`text-xs font-medium shrink-0 ${isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          {isUp ? '↑' : '↓'}{Math.abs(item.change).toFixed(2)}%
        </span>
      )}
      <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center shrink-0">
        {selected ? (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </div>
    </button>
  )
}

function SymbolCard({ symbol, selected, onToggle }) {
  const dotColor = symbol.up ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
  const logoUrl = getTickerLogo(symbol.ticker)
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-3 min-w-0">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#334155]" />
        ) : symbol.logo === 'crypto' ? (
          <CryptoIcon />
        ) : (
          <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />
        )}
        <div className="min-w-0">
          <div className="font-bold text-sm text-white">{symbol.ticker}</div>
          <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            {symbol.followers}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggle(symbol.ticker)}
        className={selected ? 'w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-bold' : 'w-8 h-8 rounded-full bg-[#334155] text-white flex items-center justify-center hover:bg-[#475569]'}
        aria-label={selected ? 'Remove' : 'Add'}
      >
        {selected ? '✓' : '+'}
      </button>
    </div>
  )
}

function TrendingWhyCard({ item, selected, onSelect }) {
  const logoUrl = getTickerLogo(item.ticker)
  const isUp = item.pctChange >= 0
  return (
    <button
      type="button"
      onClick={() => onSelect(item.ticker)}
      className={`flex flex-col rounded-xl border text-left p-4 min-w-[260px] max-w-[280px] shrink-0 transition-colors ${
        selected
          ? 'bg-[#1e293b] border-white'
          : 'bg-[#1e293b] border-[rgba(255,255,255,0.08)] hover:border-white/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#334155]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {item.ticker.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-lg text-white">{item.ticker}</div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-white">${item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 ${isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {isUp ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                )}
                {isUp ? '+' : ''}{item.pctChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <span className="text-lg font-bold text-white shrink-0">#{item.rank}</span>
      </div>
      <p className="text-xs text-white/90 leading-relaxed line-clamp-3">{item.explanation}</p>
    </button>
  )
}

function HeadphoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

function LiveEarningsCallCard({ call }) {
  const logoUrl = getTickerLogo(call.ticker)
  return (
    <button
      type="button"
      className="flex flex-col gap-2 p-4 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] min-w-[140px] shrink-0 text-left hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#334155]" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white/80">{call.ticker.slice(0, 1)}</span>
          </div>
        )}
        <span className="font-bold text-lg text-white uppercase tracking-tight">{call.ticker}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[#a78bfa] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] shrink-0" aria-hidden />
          Live
        </span>
        <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
          <HeadphoneIcon className="w-3.5 h-3.5" />
          {call.listeners >= 1000 ? `${(call.listeners / 1000).toFixed(1)}K` : call.listeners.toLocaleString()}
        </span>
      </div>
      <div className="text-[11px] text-[#64748b]">{call.timeAgo}</div>
    </button>
  )
}

function FollowerSayingCard({ person }) {
  return (
    <div className="flex flex-col rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] p-4 min-w-[200px] max-w-[240px] shrink-0">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={person.avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#334155]"
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm truncate">@{person.username}</div>
          <div className="text-xs text-[#94a3b8]">{person.followers} followers</div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-2">Recent topics discussed</div>
      <div className="flex flex-wrap gap-1.5">
        {person.recentTopics.map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 rounded-md text-xs text-white/90 bg-white/10 border border-[rgba(255,255,255,0.12)]"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  )
}

function YourSymbolsRow({ symbols, selectedTicker, onSelect }) {
  const displayList = symbols.slice(0, 4)
  const symbolMap = [...TRENDING_SYMBOLS, ...MAG7_SYMBOLS, ...MOST_ACTIVE].reduce((acc, s) => ({ ...acc, [s.ticker]: s }), {})
  if (displayList.length === 0) {
    return (
      <div className="rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] px-4 py-5">
        <p className="text-sm text-[#94a3b8]">You didn&apos;t select any symbols in step 1. Pick one from trending below.</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] p-3">
      <div className="flex flex-wrap gap-2">
        {displayList.map((ticker) => {
          const sym = symbolMap[ticker] || { ticker, followers: '—', up: true }
          const logoUrl = getTickerLogo(ticker)
          const selected = selectedTicker === ticker
          return (
            <button
              key={ticker}
              type="button"
              onClick={() => onSelect(ticker)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                selected ? 'bg-white text-black border-white' : 'bg-[#0f172a] border-[rgba(255,255,255,0.08)] hover:border-white/30'
              }`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className={`w-2 h-2 rounded-full shrink-0 ${sym.up ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`} />
              )}
              <span className="font-bold text-sm">{ticker}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedSymbols, setSelectedSymbols] = useState([])
  const [selectedStyles, setSelectedStyles] = useState([])
  const [followingTraderIds, setFollowingTraderIds] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [step2AvatarUrl, setStep2AvatarUrl] = useState(null)
  const [showPushPromptModal, setShowPushPromptModal] = useState(false)
  const [getStartedEmail, setGetStartedEmail] = useState('')
  const [signUpFullName, setSignUpFullName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('stockbro69@aol.com')
  const [signUpUsername, setSignUpUsername] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpReferral, setSignUpReferral] = useState('')
  const [signUpDailyRip, setSignUpDailyRip] = useState(true)
  const [signUpCryptotwits, setSignUpCryptotwits] = useState(true)
  const [signUpPasswordVisible, setSignUpPasswordVisible] = useState(false)

  const toggleFollow = (traderId) => {
    setFollowingTraderIds((prev) => (prev.includes(traderId) ? prev.filter((id) => id !== traderId) : [...prev, traderId]))
  }

  const toggleSymbol = (ticker) => {
    setSelectedSymbols((prev) => (prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]))
  }

  const addAllSymbols = (symbols) => {
    const tickers = symbols.map((s) => s.ticker)
    setSelectedSymbols((prev) => [...new Set([...prev, ...tickers])])
  }

  const removeAllSymbols = (symbols) => {
    const tickers = new Set(symbols.map((s) => s.ticker))
    setSelectedSymbols((prev) => prev.filter((t) => !tickers.has(t)))
  }

  const toggleStyle = (style) => {
    setSelectedStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]))
  }

  const handleContinue = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else navigate('/home')
  }

  const handleSkip = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else navigate('/home')
  }

  const handleAllowPush = () => {
    // In a real app would request Notification permission here
    if (step < TOTAL_STEPS) setStep(step + 1)
    else navigate('/home')
  }

  const handleDestinationSelect = (ticker) => {
    setSelectedDestination((prev) => (prev === ticker ? null : ticker))
  }

  const handleLetsGo = () => {
    // In a real app could navigate to /symbol/:ticker
    navigate('/home')
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] text-white flex flex-col relative">
      {/* Progress bar - hide on intro screens 1-3 */}
      {step >= 4 && (
        <div className="h-0.5 w-full bg-[#334155] shrink-0">
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${((step - 3) / 4) * 100}%` }} />
        </div>
      )}

      {/* Scrollable content - only this area scrolls; bottom nav stays fixed */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
        {step >= 2 && (
          <div className="px-4 pt-4 shrink-0 sm:px-5">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-[100dvh] w-full bg-black text-white">
            <div className="pt-12 px-5">
              <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-8 w-auto object-contain opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold leading-tight">
                Tap into<br />the voice<br />of the<br />markets.
              </p>
            </div>
            <div className="px-5 pb-10 pt-4 space-y-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-full font-semibold text-base bg-white text-black hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
              <p className="text-center text-sm text-white/80">
                Already have an account?{' '}
                <button type="button" onClick={() => setStep(2)} className="underline font-medium text-white hover:opacity-90">
                  Log in
                </button>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full px-4 pb-8 sm:px-5 bg-[#0f172a] text-white">
            <div className="flex items-center justify-center relative py-4">
              <button type="button" onClick={() => setStep(1)} className="absolute left-0 p-2 -ml-2 text-white/80 hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-7 w-auto object-contain opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 className="text-2xl font-bold text-white mt-6 mb-6">Get Started</h1>
            <input
              type="email"
              value={getStartedEmail}
              onChange={(e) => setGetStartedEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3.5 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] mb-4"
            />
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-[#334155] text-white mb-4"
            >
              Create Account
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.12)]" />
              <span className="text-xs text-[#94a3b8]">or</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.12)]" />
            </div>
            <button type="button" className="w-full py-3 rounded-xl font-medium text-sm bg-black border border-[rgba(255,255,255,0.2)] text-white flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button type="button" className="w-full py-3 rounded-xl font-medium text-sm bg-white text-black flex items-center justify-center gap-2 mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18.24 2.31.26 3.5-.33 1.81-1.02 3.25-.12 4.28 1.08.96 1.12 1.9 2.08 1.9 3.64 0 .62-.05 1.24-.14 1.86-.18 1.31-.37 2.64-.54 3.97-.18 1.34-.1 2.59.5 3.74.71 1.4 2.08 2.28 3.92 2.28 1.64 0 3.05-.43 4.28-1.27 1.19-.82 2.13-1.95 2.89-3.35.75-1.4 1.27-2.92 1.55-4.53.27-1.6.31-3.24.13-4.9-.2-1.74-.58-3.42-1.14-5.02zM12.03 7.25c1.48-.04 2.74 1.2 2.75 2.67 0 1.47-1.21 2.72-2.73 2.76-1.53.04-2.77-1.2-2.77-2.71-.01-1.51 1.24-2.7 2.75-2.72z"/></svg>
              Continue with Apple
            </button>
            <p className="text-center text-sm text-[#94a3b8]">
              Already have an account?{' '}
              <button type="button" className="underline text-white font-medium">Log In</button>
            </p>
            <p className="text-center text-xs text-[#64748b] mt-6">
              By signing up, you agree to the{' '}
              <button type="button" className="underline text-[#94a3b8]">Terms and Conditions</button>
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full px-4 pb-8 sm:px-5 bg-[#0f172a] text-white">
            <div className="flex items-center justify-center relative py-4">
              <button type="button" onClick={() => setStep(2)} className="absolute left-0 p-2 -ml-2 text-white/80 hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-7 w-auto object-contain opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 className="text-2xl font-bold text-white mt-2 mb-6">Sign up</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Full Name</label>
                <input type="text" value={signUpFullName} onChange={(e) => setSignUpFullName(e.target.value)} placeholder="Full Name" className="w-full px-0 py-2 bg-transparent border-0 border-b border-[rgba(255,255,255,0.2)] text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Email Address</label>
                <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} className="w-full px-0 py-2 bg-transparent border-0 border-b border-[rgba(255,255,255,0.2)] text-white text-sm focus:outline-none focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Create a Username</label>
                <input type="text" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} placeholder="Create a Username" className="w-full px-0 py-2 bg-transparent border-0 border-b border-[rgba(255,255,255,0.2)] text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Create a password</label>
                <div className="flex items-center border-b border-[rgba(255,255,255,0.2)]">
                  <input type={signUpPasswordVisible ? 'text' : 'password'} value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="Create a password" className="flex-1 px-0 py-2 bg-transparent border-0 text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-0" />
                  <button type="button" onClick={() => setSignUpPasswordVisible((v) => !v)} className="p-2 text-[#94a3b8] hover:text-white" aria-label={signUpPasswordVisible ? 'Hide password' : 'Show password'}>
                    {signUpPasswordVisible ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Referral Code (Optional)</label>
                <input type="text" value={signUpReferral} onChange={(e) => setSignUpReferral(e.target.value)} placeholder="Referral Code (Optional)" className="w-full px-0 py-2 bg-transparent border-0 border-b border-[rgba(255,255,255,0.2)] text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-0" />
              </div>
            </div>
            <p className="text-sm text-white/90 mt-6 mb-2">Sign Me Up for:</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={signUpDailyRip} onChange={(e) => setSignUpDailyRip(e.target.checked)} className="mt-1 rounded border-white/30 text-[#38bdf8] focus:ring-[#38bdf8]" />
              <span className="text-sm text-white/90">The Daily Rip (daily market updates)</span>
            </label>
            <label className="flex items-start gap-3 mt-2 cursor-pointer">
              <input type="checkbox" checked={signUpCryptotwits} onChange={(e) => setSignUpCryptotwits(e.target.checked)} className="mt-1 rounded border-white/30 text-[#38bdf8] focus:ring-[#38bdf8]" />
              <span className="text-sm text-white/90">Cryptotwits (weekly analysis)</span>
            </label>
            <p className="text-sm text-white/80 mt-4">By signing up, you agree to our <button type="button" className="underline text-[#38bdf8]">Terms and Conditions</button></p>
            <button type="button" onClick={() => setStep(4)} className="w-full py-3.5 rounded-xl font-semibold text-sm bg-[#334155] text-white mt-8">Sign Up</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto w-full px-4 pt-4 pb-32 sm:px-5">
            <div className="flex flex-col items-center text-center pt-4 pb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mb-4">
                <ChartIcon className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h1 className="text-xl font-bold text-white">@StockBro69</h1>
              <h1 className="text-xl font-bold text-white mt-1">Follow Your First Symbols</h1>
              <p className="text-sm text-[#94a3b8] mt-1">Stay updated on the stocks you care about</p>
            </div>

            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbols..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#64748b] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {search.trim().length > 0 && (() => {
                const q = search.trim().toLowerCase()
                const stocks = SEARCH_DROPDOWN_STOCKS.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
                const crypto = SEARCH_DROPDOWN_CRYPTO.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
                if (stocks.length === 0 && crypto.length === 0) return null
                return (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] shadow-xl max-h-[320px] overflow-y-auto z-20">
                    {stocks.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Stocks & ETFs</div>
                        {stocks.map((item) => (
                          <SearchDropdownRow
                            key={`s-${item.ticker}`}
                            item={item}
                            isCrypto={false}
                            selected={selectedSymbols.includes(item.ticker)}
                            onToggle={toggleSymbol}
                          />
                        ))}
                      </div>
                    )}
                    {crypto.length > 0 && (
                      <div className="py-2 border-t border-[rgba(255,255,255,0.08)]">
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Crypto</div>
                        {crypto.map((item) => (
                          <SearchDropdownRow
                            key={`c-${item.ticker}`}
                            item={item}
                            isCrypto
                            selected={selectedSymbols.includes(item.ticker)}
                            onToggle={toggleSymbol}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="space-y-5">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>🔥</span> Trending
                <button type="button" onClick={() => { const allIn = TRENDING_SYMBOLS.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(TRENDING_SYMBOLS) : addAllSymbols(TRENDING_SYMBOLS) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {TRENDING_SYMBOLS.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TRENDING_SYMBOLS.map((s) => (
                  <SymbolCard key={s.ticker} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>⭐</span> Mag 7
                <button type="button" onClick={() => { const allIn = MAG7_SYMBOLS.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(MAG7_SYMBOLS) : addAllSymbols(MAG7_SYMBOLS) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {MAG7_SYMBOLS.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {MAG7_SYMBOLS.map((s) => (
                  <SymbolCard key={`mag7-${s.ticker}`} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>₿</span> Top Crypto
                <button type="button" onClick={() => { const allIn = TOP_CRYPTO.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(TOP_CRYPTO) : addAllSymbols(TOP_CRYPTO) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {TOP_CRYPTO.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TOP_CRYPTO.map((s) => (
                  <SymbolCard key={`crypto-${s.ticker}`} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>📈</span> Most New Watchers
                <button type="button" onClick={() => { const allIn = MOST_NEW_WATCHERS.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(MOST_NEW_WATCHERS) : addAllSymbols(MOST_NEW_WATCHERS) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {MOST_NEW_WATCHERS.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {MOST_NEW_WATCHERS.map((s) => (
                  <SymbolCard key={`new-${s.ticker}`} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>🚀</span> Top Gainers
                <button type="button" onClick={() => { const allIn = TOP_GAINERS.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(TOP_GAINERS) : addAllSymbols(TOP_GAINERS) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {TOP_GAINERS.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TOP_GAINERS.map((s) => (
                  <SymbolCard key={`gainers-${s.ticker}`} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>💬</span> Most Active
                <button type="button" onClick={() => { const allIn = MOST_ACTIVE.every((s) => selectedSymbols.includes(s.ticker)); allIn ? removeAllSymbols(MOST_ACTIVE) : addAllSymbols(MOST_ACTIVE) }} className="ml-auto text-xs font-medium text-[#38bdf8] hover:text-white transition-colors">
                  {MOST_ACTIVE.every((s) => selectedSymbols.includes(s.ticker)) ? 'Remove All' : 'Add All'}
                </button>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {MOST_ACTIVE.map((s) => (
                  <SymbolCard key={`active-${s.ticker}`} symbol={s} selected={selectedSymbols.includes(s.ticker)} onToggle={toggleSymbol} />
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full px-4 pb-32 sm:px-5">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <h1 className="text-xl font-bold text-white">Tell Us More So We Can Customize</h1>
            </div>

            {/* Upload avatar + username */}
            <div className="flex flex-col items-center mb-6">
              <button
                type="button"
                onClick={() => setStep2AvatarUrl(step2AvatarUrl ? null : '/avatars/who-follow-1.png')}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1e293b] border-2 border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center group-hover:border-[#38bdf8]/50 transition-colors">
                  {step2AvatarUrl ? (
                    <img src={step2AvatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#38bdf8] font-medium">
                  {step2AvatarUrl ? 'Change photo' : 'Add a photo'}
                </span>
              </button>
              <div className="mt-1 text-sm font-medium text-white">@StockBro69</div>
            </div>

            <h2 className="text-base font-semibold text-white mb-3">What&apos;s your trading style?</h2>
            <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
              {TRADING_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                    selectedStyles.includes(style)
                      ? 'bg-white text-black border-white'
                      : 'bg-[#1e293b] text-white border-[rgba(255,255,255,0.08)] hover:bg-[#334155]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="px-3 py-2.5 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] mb-4">
              <p className="text-xs text-[#94a3b8] flex items-center gap-2">
                <span>👆</span> Select one or more trading styles above to discover traders
              </p>
            </div>

            {selectedStyles.length > 0 && (() => {
              const matched = RECOMMENDED_TRADERS.filter((t) =>
                selectedStyles.some((ss) => (STYLE_MATCH[ss] || [ss]).includes(t.style))
              )
              if (selectedStyles.includes('Momentum')) {
                matched.sort((a, b) => (a.handle === 'howardlindzon' ? -1 : b.handle === 'howardlindzon' ? 1 : 0))
              }
              return (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-sm font-semibold text-white">Recommended Traders ({matched.length})</h2>
                    <button
                      type="button"
                      onClick={() => {
                        const matchedIds = matched.map((t) => t.id)
                        const allFollowed = matchedIds.every((id) => followingTraderIds.includes(id))
                        if (allFollowed) {
                          setFollowingTraderIds((prev) => prev.filter((id) => !matchedIds.includes(id)))
                        } else {
                          setFollowingTraderIds((prev) => [...new Set([...prev, ...matchedIds])])
                        }
                      }}
                      className="text-xs font-medium text-[#38bdf8] hover:text-white transition-colors"
                    >
                      {matched.every((t) => followingTraderIds.includes(t.id)) ? 'Unfollow All' : 'Follow All'}
                    </button>
                  </div>
                  {matched.map((trader) => (
                    <RecommendedTraderCard
                    key={trader.id}
                    trader={trader}
                    isFollowing={followingTraderIds.includes(trader.id)}
                    onFollowToggle={() => toggleFollow(trader.id)}
                  />
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 min-h-0 overflow-y-auto w-full px-4 pb-32 sm:px-5">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <h1 className="text-xl font-bold text-white">Power of the Symbol Page</h1>
              <p className="text-sm text-[#94a3b8] mt-1">Your homebase for how the community reacts</p>
            </div>

            {/* Header card and push notification use same symbol */}
            {(() => {
              const step3Ticker = selectedSymbols.length > 0 ? selectedSymbols[0] : 'NVDA'
              return (
                <>
                  <SymbolHeaderCard
                    ticker={step3Ticker}
                    followers={selectedSymbols.length > 0 ? '678K' : '678K'}
                    up={true}
                  />

                  {/* Real-time message stream */}
                  <div className="mt-4 rounded-xl bg-[#1e293b] border border-[rgba(255,255,255,0.08)] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
                      <span className="text-xs font-medium text-[#94a3b8]">Live stream</span>
                    </div>
                    <div className="h-44 overflow-hidden relative">
                      <div className="absolute inset-0 overflow-hidden">
                        <MessageStream messages={STREAM_MESSAGES} />
                      </div>
                    </div>
                  </div>

                  {/* Push notification mock - same ticker/logo as header card */}
                  <div className="mt-5 flex justify-center">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e293b] border border-[rgba(255,255,255,0.12)] shadow-lg max-w-[320px] w-full">
                      {getTickerLogo(step3Ticker) ? (
                        <img
                          src={getTickerLogo(step3Ticker)}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover shrink-0 bg-[#334155]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#334155] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white/80">{step3Ticker.slice(0, 1)}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-0.5">
                          <span>Stocktwits</span>
                          <span>·</span>
                          <span>now</span>
                        </div>
                        <div className="text-sm font-medium text-white leading-snug">
                          <span>${step3Ticker} is Trending! 🔥</span>
                          <br />
                          <span>Tap to see why</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </>
              )
            })()}

            <p className="mt-5 text-lg text-white text-center font-medium leading-snug">
              Never miss a moment. Allow push.
            </p>
          </div>
        )}

        {step === 7 && (
          <div className="flex-1 min-h-0 overflow-y-auto w-full px-4 pb-32 sm:px-5">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <h1 className="text-xl font-bold text-white">Where do you want to go?</h1>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white mb-2">Your symbols</h2>
                <YourSymbolsRow
                  symbols={selectedSymbols}
                  selectedTicker={selectedDestination}
                  onSelect={handleDestinationSelect}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white mb-2">See what&apos;s trending and why</h2>
                <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-5 sm:px-5 scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                    {TRENDING_WITH_WHY.map((item) => (
                      <TrendingWhyCard
                        key={item.ticker}
                        item={item}
                        selected={selectedDestination === item.ticker}
                        onSelect={handleDestinationSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white mb-2">Listen to live earnings calls</h2>
                <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-5 sm:px-5 scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                    {LIVE_EARNINGS_CALLS.map((call) => (
                      <LiveEarningsCallCard key={call.ticker} call={call} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white mb-2">See what your followers are saying</h2>
                <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-5 sm:px-5 scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                    {FOLLOWERS_SAYING.map((person) => (
                      <FollowerSayingCard key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>

      {/* Fixed bottom nav - only for onboarding steps 4-7 */}
      {step >= 4 ? (
        <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
          <div
            className="w-full max-w-md bg-[#0f172a] border-t border-white/10 px-4 pt-4 pb-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <div className="w-full space-y-3">
            {step === 6 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowPushPromptModal(true)}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white text-black hover:opacity-90 transition-opacity"
                >
                  Allow
                </button>
                <button type="button" onClick={() => setStep(7)} className="w-full text-center text-sm text-[#94a3b8] hover:text-white">
                  Skip
                </button>
              </>
            ) : step === 7 ? (
              <>
                <button
                  type="button"
                  onClick={handleLetsGo}
                  disabled={!selectedDestination}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
                >
                  Let&apos;s Go
                </button>
                <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#94a3b8] hover:text-white">
                  Skip
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white text-black hover:opacity-90 transition-opacity"
                >
                  {step === 4 ? `Continue (${selectedSymbols.length} selected)` : 'Continue'}
                </button>
                <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#94a3b8] hover:text-white">
                  Skip
                </button>
              </>
            )}
            </div>
          </div>
        </div>
      ) : null}

      {/* iOS-style push notification system prompt */}
      {showPushPromptModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="push-prompt-title">
          <div className="bg-white rounded-xl shadow-xl max-w-[280px] w-full overflow-hidden">
            <div className="px-5 pt-5 pb-2 text-center">
              <h2 id="push-prompt-title" className="text-base font-semibold text-black leading-snug">
                &quot;Stocktwits&quot; Would Like To Send You Notifications
              </h2>
              <p className="mt-2 text-sm text-black/90 leading-snug">
                Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
              </p>
            </div>
            <div className="mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPushPromptModal(false)}
                className="w-full py-3.5 text-sm font-semibold text-blue-600 hover:bg-gray-50 active:bg-gray-100"
              >
                Don&apos;t Allow
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPushPromptModal(false)
                  setStep(7)
                }}
                className="w-full py-3.5 text-sm font-semibold text-blue-600 border-t border-gray-200 hover:bg-gray-50 active:bg-gray-100"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}