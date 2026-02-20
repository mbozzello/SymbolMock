import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MessagePostBox from '../components/MessagePostBox.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const TICKER_QUOTES = {
  TSLA: { price: 387.42, change: +2.14 },
  AAPL: { price: 228.56, change: -0.83 },
  NVDA: { price: 131.28, change: +3.47 },
  AMZN: { price: 214.73, change: +1.22 },
  GOOGL: { price: 191.84, change: +0.68 },
  META: { price: 612.39, change: +1.95 },
  MSFT: { price: 415.22, change: -0.41 },
  AMD: { price: 168.54, change: +2.86 },
  SPY: { price: 602.18, change: +0.52 },
  GME: { price: 28.14, change: -4.12 },
  PLTR: { price: 78.93, change: +5.24 },
  BTC: { price: 97842, change: +1.37 },
  ETH: { price: 3421, change: +2.05 },
  DOGE: { price: 0.267, change: -1.88 },
  AVGO: { price: 224.61, change: +1.73 },
  DIS: { price: 112.44, change: +0.34 },
  INTC: { price: 23.18, change: -2.15 },
  HOOD: { price: 42.67, change: +3.81 },
  GLD: { price: 241.82, change: +0.91 },
}

const TICKER_REGEX = /(\$[A-Za-z][A-Za-z0-9.]*)/g

function TickerPill({ ticker }) {
  const symbol = ticker.replace('$', '').toUpperCase()
  const logo = getTickerLogo(symbol)
  const quote = TICKER_QUOTES[symbol]
  return (
    <Link
      to="/symbol"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors align-middle no-underline"
      onClick={(e) => e.stopPropagation()}
    >
      {logo && <img src={logo} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />}
      <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">${symbol}</span>
      {quote && (
        <span className={clsx('text-[10px] font-semibold', quote.change >= 0 ? 'text-green-500' : 'text-red-500')}>
          {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
        </span>
      )}
    </Link>
  )
}

function ChatText({ text }) {
  if (!text || typeof text !== 'string') return <span>{text}</span>
  const parts = text.split(TICKER_REGEX)
  return (
    <>
      {parts.map((segment, i) => {
        if (TICKER_REGEX.test(segment)) {
          TICKER_REGEX.lastIndex = 0
          return <TickerPill key={i} ticker={segment} />
        }
        return <span key={i}>{segment}</span>
      })}
    </>
  )
}

const CURRENT_USER = { id: 'you', name: 'howardlindzon', avatar: '/avatars/howard-lindzon.png' }

const CONVERSATIONS = [
  {
    id: 'group-tsla-bulls',
    type: 'group',
    name: 'The Bull Boys Club',
    avatar: null,
    members: [
      CURRENT_USER,
      { id: 'u2', name: 'TeslaFanatic', avatar: '/avatars/leader-6.png' },
      { id: 'u3', name: 'ChartWizard', avatar: '/avatars/leader-5.png' },
    ],
    messages: [
      { id: 'm1', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'Anyone else loading calls before earnings?', time: '2:41 PM', isYou: true },
      { id: 'm2', sender: 'TeslaFanatic', avatar: '/avatars/leader-6.png', text: 'Already in. $TSLA 450c for March looking juicy', time: '2:42 PM', sentiment: 'bullish' },
      { id: 'm3', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', text: 'The weekly chart is screaming breakout. Cup and handle on the monthly too.', time: '2:43 PM' },
      { id: 'm4', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'FSD v13 numbers are insane. $TSLA is a $600 stock by summer', time: '2:45 PM', isYou: true, sentiment: 'bullish' },
      { id: 'm5', sender: 'TeslaFanatic', avatar: '/avatars/leader-6.png', text: 'Howard always calling it first 🔥', time: '2:47 PM' },
      { id: 'm6', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', text: 'Hard to argue with the track record', time: '2:48 PM' },
      { id: 'pred-1', type: 'prediction', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', ticker: 'TSLA', entryPrice: 362.10, targetPrice: 500, date: 'Jun 30, 2026', time: '2:49 PM', direction: 'bullish' },
      { id: 'wl-tsla-1', type: 'watchlist-add', sender: 'ChartWizard', ticker: 'NVDA', time: '2:50 PM' },
      { id: 'm7', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: "I'm coming for your spot @ChartWizard 👀", time: '2:53 PM', isYou: true },
    ],
    lastMessage: "I'm coming for your spot @ChartWizard 👀",
    lastTime: '2:53 PM',
    unread: 3,
    watchlist: [
      { ticker: 'TSLA', addedBy: 'howardlindzon' },
      { ticker: 'NVDA', addedBy: 'ChartWizard' },
      { ticker: 'PLTR', addedBy: 'TeslaFanatic' },
    ],
    predictions: [
      { id: 'p1', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', ticker: 'TSLA', entryPrice: 362.10, targetPrice: 500, date: 'Jun 30, 2026', createdAt: '2026-01-15', status: 'open' },
      { id: 'p2', sender: 'TeslaFanatic', avatar: '/avatars/leader-6.png', ticker: 'TSLA', entryPrice: 370.00, targetPrice: 600, date: 'Sep 30, 2026', createdAt: '2026-01-18', status: 'open' },
      { id: 'p3', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', ticker: 'NVDA', entryPrice: 118.50, targetPrice: 175, date: 'Mar 31, 2026', createdAt: '2026-01-10', status: 'open' },
      { id: 'p6', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', ticker: 'TSLA', entryPrice: 248.00, targetPrice: 380, date: 'Dec 31, 2025', createdAt: '2025-08-15', status: 'closed', closePrice: 387.42 },
      { id: 'p7', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', ticker: 'NVDA', entryPrice: 102.00, targetPrice: 140, date: 'Dec 31, 2025', createdAt: '2025-07-20', status: 'closed', closePrice: 131.28 },
    ],
  },
  {
    id: 'dm-emperor',
    type: 'dm',
    name: 'EmperorFox',
    avatar: '/avatars/leader-1.png',
    members: [{ id: 'u1', name: 'EmperorFox', avatar: '/avatars/leader-1.png' }, CURRENT_USER],
    messages: [
      { id: 'd1', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'Hey Howard, saw your $AAPL prediction. Bearish really?', time: '1:30 PM', sentiment: 'bearish' },
      { id: 'd2', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'Yeah, the valuation is stretched. Services growth slowing.', time: '1:32 PM', isYou: true },
      { id: 'd3', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: "Interesting take. I'm still long but I see your point on the multiple", time: '1:35 PM' },
      { id: 'd4', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: "It's just risk/reward. At 30x I'd rather be elsewhere", time: '1:37 PM', isYou: true },
      { id: 'd5', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'Fair. What are you buying instead?', time: '1:38 PM' },
    ],
    lastMessage: 'Fair. What are you buying instead?',
    lastTime: '1:38 PM',
    unread: 1,
  },
  {
    id: 'group-macro',
    type: 'group',
    name: 'Macro Traders',
    avatar: null,
    members: [
      { id: 'u4', name: 'FedWatcher', avatar: '/avatars/leader-2.png' },
      { id: 'u5', name: 'MacroMaven', avatar: '/avatars/leader-3.png' },
      { id: 'u6', name: 'BearishTruth', avatar: '/avatars/leader-6.png' },
      CURRENT_USER,
    ],
    messages: [
      { id: 'g1', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', text: 'Powell presser tomorrow. Everyone positioned?', time: '11:20 AM' },
      { id: 'g2', sender: 'MacroMaven', avatar: '/avatars/leader-3.png', text: 'Short duration, long $GLD. Classic defensive setup', time: '11:22 AM' },
      { id: 'g3', sender: 'BearishTruth', avatar: '/avatars/leader-6.png', text: "I think he stays hawkish. No cuts until they see real pain in labor market", time: '11:25 AM', sentiment: 'bearish' },
      { id: 'g4', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'The market is pricing in 3 cuts this year which feels aggressive', time: '11:28 AM', isYou: true },
      { id: 'g5', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', text: 'Exactly. The spread between market pricing and dot plot is massive', time: '11:30 AM' },
      { id: 'pred-m1', type: 'prediction', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', ticker: 'SPY', entryPrice: 580.00, targetPrice: 540, date: 'Mar 31, 2026', time: '11:31 AM', direction: 'bearish' },
      { id: 'wl-macro-1', type: 'watchlist-add', sender: 'MacroMaven', ticker: 'GLD', time: '11:33 AM' },
    ],
    lastMessage: 'The spread between market pricing and dot plot is massive',
    lastTime: '11:30 AM',
    unread: 0,
    watchlist: [
      { ticker: 'GLD', addedBy: 'MacroMaven' },
      { ticker: 'SPY', addedBy: 'FedWatcher' },
      { ticker: 'BTC', addedBy: 'howardlindzon' },
    ],
    predictions: [
      { id: 'mp1', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', ticker: 'SPY', entryPrice: 580.00, targetPrice: 540, date: 'Mar 31, 2026', createdAt: '2026-01-25', status: 'open' },
      { id: 'mp2', sender: 'MacroMaven', avatar: '/avatars/leader-3.png', ticker: 'GLD', entryPrice: 230.00, targetPrice: 280, date: 'Jun 30, 2026', createdAt: '2026-01-28', status: 'open' },
      { id: 'mp3', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', ticker: 'BTC', entryPrice: 88000, targetPrice: 120000, date: 'Jun 30, 2026', createdAt: '2026-02-01', status: 'open' },
      { id: 'mp4', sender: 'BearishTruth', avatar: '/avatars/leader-6.png', ticker: 'SPY', entryPrice: 590.00, targetPrice: 520, date: 'Dec 31, 2025', createdAt: '2025-10-01', status: 'closed', closePrice: 602.18 },
    ],
  },
  {
    id: 'dm-bullish',
    type: 'dm',
    name: 'TheBullishPenguin',
    avatar: '/avatars/leader-2.png',
    members: [{ id: 'u7', name: 'TheBullishPenguin', avatar: '/avatars/leader-2.png' }, CURRENT_USER],
    messages: [
      { id: 'b1', sender: 'TheBullishPenguin', avatar: '/avatars/leader-2.png', text: 'Nice call on the $NVDA dip buy last week', time: '9:15 AM', sentiment: 'bullish' },
      { id: 'b2', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'Thanks! AI capex cycle is just getting started', time: '9:18 AM', isYou: true },
      { id: 'b3', sender: 'TheBullishPenguin', avatar: '/avatars/leader-2.png', text: "Agreed. I'm eyeing $AVGO too for the same thesis", time: '9:20 AM' },
    ],
    lastMessage: "Agreed. I'm eyeing AVGO too for the same thesis",
    lastTime: '9:20 AM',
    unread: 0,
  },
  {
    id: 'group-options',
    type: 'group',
    name: 'Options Flow Alerts',
    avatar: null,
    members: [
      { id: 'u8', name: 'OptionsFlow', avatar: '/avatars/top-voice-1.png' },
      { id: 'u9', name: 'GammaSqueeze', avatar: '/avatars/ross-cameron.png' },
      { id: 'u10', name: 'SwingKing', avatar: '/avatars/michael-bolling.png' },
      CURRENT_USER,
    ],
    messages: [
      { id: 'o1', sender: 'OptionsFlow', avatar: '/avatars/top-voice-1.png', text: '🚨 MASSIVE sweep: $SPY 520P 3/21 — 45K contracts just hit the tape', time: 'Yesterday' },
      { id: 'o2', sender: 'GammaSqueeze', avatar: '/avatars/ross-cameron.png', text: "That's $12M in premium. Someone hedging hard", time: 'Yesterday' },
      { id: 'o3', sender: 'SwingKing', avatar: '/avatars/michael-bolling.png', text: 'Or they know something about FOMC', time: 'Yesterday' },
    ],
    lastMessage: 'Or they know something about FOMC',
    lastTime: 'Yesterday',
    unread: 0,
    watchlist: [
      { ticker: 'SPY', addedBy: 'OptionsFlow' },
      { ticker: 'AAPL', addedBy: 'GammaSqueeze' },
      { ticker: 'MSFT', addedBy: 'SwingKing' },
      { ticker: 'META', addedBy: 'howardlindzon' },
      { ticker: 'GOOGL', addedBy: 'OptionsFlow' },
    ],
  },
]

const SUGGESTED_USERS = [
  { id: 's1', name: 'CryptoOracle', avatar: '/avatars/leader-1.png' },
  { id: 's2', name: 'ProfessorShiba', avatar: '/avatars/leader-4.png' },
  { id: 's3', name: 'ElectionEdge', avatar: '/avatars/leader-5.png' },
  { id: 's4', name: 'VolatilityKing', avatar: '/avatars/top-voice-1.png' },
  { id: 's5', name: 'SentimentPro', avatar: '/avatars/top-voice-2.png' },
  { id: 's6', name: 'EarningsWhisper', avatar: '/avatars/top-voice-3.png' },
  { id: 's7', name: 'TechCatalyst', avatar: '/avatars/michael-bolling.png' },
  { id: 's8', name: 'QuantSignal', avatar: '/avatars/ross-cameron.png' },
]

function GroupAvatar({ members, size = 'md' }) {
  const show = members.filter((m) => m.id !== 'you').slice(0, 3)
  const s = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
  const container = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
  return (
    <div className={clsx('relative rounded-full bg-surface-muted border border-border flex items-center justify-center shrink-0', container)}>
      {show.length >= 2 ? (
        <div className="grid grid-cols-2 gap-0.5 p-1">
          {show.slice(0, 4).map((m, i) => (
            <img key={m.id} src={m.avatar} alt="" className={clsx('rounded-full object-cover', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
          ))}
        </div>
      ) : (
        <img src={show[0]?.avatar} alt="" className="w-full h-full rounded-full object-cover" />
      )}
    </div>
  )
}

function SentimentTag({ sentiment }) {
  if (!sentiment) return null
  const isBullish = sentiment === 'bullish'
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
      isBullish ? 'bg-green-500/15 text-green-600 border border-green-500/25' : 'bg-red-500/15 text-red-600 border border-red-500/25'
    )}>
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        {isBullish
          ? <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          : <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        }
      </svg>
      {sentiment}
    </span>
  )
}

function WatchlistSystemMessage({ msg, onOpenWatchlist }) {
  const logo = getTickerLogo(msg.ticker)
  const quote = TICKER_QUOTES[msg.ticker]
  return (
    <div className="flex justify-center mb-3">
      <div className="inline-flex flex-col items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-xs font-semibold text-text">
            <span className="text-primary">@{msg.sender === CURRENT_USER.name ? 'you' : msg.sender}</span>
            {' '}added to group watchlist
          </span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
          {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover" />}
          <span className="text-sm font-bold text-text">${msg.ticker}</span>
          {quote && (
            <span className={clsx('text-xs font-semibold', quote.change >= 0 ? 'text-green-500' : 'text-red-500')}>
              {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenWatchlist}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          View Group Watchlist
        </button>
        <span className="text-[10px] text-text-muted">{msg.time}</span>
      </div>
    </div>
  )
}

function PredictionMessage({ msg, leaderName }) {
  const logo = getTickerLogo(msg.ticker)
  const quote = TICKER_QUOTES[msg.ticker]
  const isBullish = msg.targetPrice > msg.entryPrice
  const pctMove = (((msg.targetPrice - msg.entryPrice) / msg.entryPrice) * 100).toFixed(1)
  const currentGain = quote ? (((quote.price - msg.entryPrice) / msg.entryPrice) * 100).toFixed(1) : null
  const isLeader = leaderName === msg.sender
  return (
    <div className={clsx('flex mb-3', msg.isYou ? 'justify-end' : 'gap-2.5')}>
      {!msg.isYou && (
        <div className="relative shrink-0 mt-0.5">
          <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
          {isLeader && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm leading-none">👑</span>}
        </div>
      )}
      <div className="max-w-[320px]">
        {!msg.isYou && (
          <div className="flex items-center mb-0.5">
            <span className="text-[11px] font-semibold text-text-muted">@{msg.sender}</span>
            {isLeader && <LeaderBadge />}
          </div>
        )}
        <div className={clsx('rounded-2xl border overflow-hidden', msg.isYou ? 'rounded-br-md' : 'rounded-bl-md', isBullish ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5')}>
          <div className={clsx('px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white', isBullish ? 'bg-green-600' : 'bg-red-600')}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                {isBullish
                  ? <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                }
              </svg>
              Price Prediction · {isBullish ? 'Bullish' : 'Bearish'}
            </div>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              {logo && <img src={logo} alt="" className="w-7 h-7 rounded-full object-cover" />}
              <div>
                <div className="text-sm font-bold text-text">${msg.ticker}</div>
                {quote && <div className="text-[10px] text-text-muted">{msg.ticker === 'BTC' ? quote.price.toLocaleString() : quote.price.toFixed(2)} current</div>}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-center flex-1">
                <div className="text-[10px] text-text-muted">Entry</div>
                <div className="text-xs font-bold text-text">{msg.ticker === 'BTC' ? msg.entryPrice.toLocaleString() : msg.entryPrice.toFixed(2)}</div>
              </div>
              <svg className={clsx('w-5 h-5 shrink-0', isBullish ? 'text-green-500' : 'text-red-500')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <div className="text-center flex-1">
                <div className="text-[10px] text-text-muted">Target</div>
                <div className={clsx('text-xs font-bold', isBullish ? 'text-green-600' : 'text-red-600')}>{msg.ticker === 'BTC' ? msg.targetPrice.toLocaleString() : msg.targetPrice.toFixed(2)}</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-[10px] text-text-muted">Move</div>
                <div className={clsx('text-xs font-bold', isBullish ? 'text-green-600' : 'text-red-600')}>{isBullish ? '+' : ''}{pctMove}%</div>
              </div>
            </div>
            {currentGain && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface border border-border">
                <span className="text-[10px] text-text-muted">Current P&L</span>
                <span className={clsx('text-xs font-bold', Number(currentGain) >= 0 ? 'text-green-600' : 'text-red-600')}>{Number(currentGain) >= 0 ? '+' : ''}{currentGain}%</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Target date: {msg.date}
            </div>
          </div>
        </div>
        <div className={clsx('text-[10px] text-text-muted mt-1', msg.isYou ? 'text-right' : '')}>{msg.time}</div>
      </div>
    </div>
  )
}

function getGroupLeaderboard(predictions) {
  if (!predictions || predictions.length === 0) return []
  const byUser = {}
  predictions.forEach((p) => {
    if (!byUser[p.sender]) byUser[p.sender] = { sender: p.sender, avatar: p.avatar, totalGain: 0, count: 0, wins: 0 }
    const user = byUser[p.sender]
    user.count++
    const currentPrice = TICKER_QUOTES[p.ticker]?.price || p.entryPrice
    const price = p.status === 'closed' ? p.closePrice : currentPrice
    const gain = ((price - p.entryPrice) / p.entryPrice) * 100
    const isBullish = p.targetPrice > p.entryPrice
    const effectiveGain = isBullish ? gain : -gain
    user.totalGain += effectiveGain
    if (effectiveGain > 0) user.wins++
  })
  return Object.values(byUser).sort((a, b) => b.totalGain - a.totalGain)
}

function LeaderBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[9px] font-bold text-amber-600 ml-1" title="#1 Leaderboard">
      👑 #1 Leaderboard
    </span>
  )
}

function ChatBubble({ msg, isGroup, leaderName }) {
  if (msg.isYou) {
    return (
      <div className="flex justify-end gap-2 mb-3">
        <div className="max-w-[75%]">
          <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md">
            <p className="text-sm leading-relaxed"><ChatText text={msg.text} /></p>
            {msg.sentiment && (
              <div className="mt-1.5"><SentimentTag sentiment={msg.sentiment} /></div>
            )}
          </div>
          <div className="text-[10px] text-text-muted mt-1 text-right">{msg.time}</div>
        </div>
      </div>
    )
  }
  const isLeader = isGroup && leaderName === msg.sender
  return (
    <div className="flex gap-2.5 mb-3">
      <div className="relative shrink-0 mt-0.5">
        <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
        {isLeader && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm leading-none">👑</span>}
      </div>
      <div className="max-w-[75%]">
        {isGroup && (
          <div className="flex items-center mb-0.5">
            <span className="text-[11px] font-semibold text-text-muted">@{msg.sender}</span>
            {isLeader && <LeaderBadge />}
          </div>
        )}
        <div className="bg-surface-muted border border-border px-4 py-2.5 rounded-2xl rounded-bl-md">
          <p className="text-sm text-text leading-relaxed"><ChatText text={msg.text} /></p>
          {msg.sentiment && (
            <div className="mt-1.5"><SentimentTag sentiment={msg.sentiment} /></div>
          )}
        </div>
        <div className="text-[10px] text-text-muted mt-1">{msg.time}</div>
      </div>
    </div>
  )
}

export default function Chat() {
  const { watchlist, isWatched, toggleWatch } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [activeConvoId, setActiveConvoId] = useState(CONVERSATIONS[0].id)
  const [inputText, setInputText] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [showGroupWatchlist, setShowGroupWatchlist] = useState(false)
  const [watchlistSearch, setWatchlistSearch] = useState('')
  const [showPredictModal, setShowPredictModal] = useState(false)
  const [predTicker, setPredTicker] = useState('')
  const [predTarget, setPredTarget] = useState('')
  const [predDate, setPredDate] = useState('Mar 31, 2026')
  const [predTickerSearch, setPredTickerSearch] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [lbTab, setLbTab] = useState('gain')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const activeConvo = conversations.find((c) => c.id === activeConvoId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvo?.messages?.length])

  const filteredConvos = searchQuery
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations

  const SEARCHABLE_TICKERS = ['TSLA','AAPL','NVDA','AMZN','GOOGL','META','MSFT','AMD','SPY','GME','PLTR','BTC','ETH','DOGE','AVGO','DIS','INTC','HOOD','GLD','SNAP','RIVN','SMCI','ABNB','LULU','SPOT']

  const addToGroupWatchlist = (ticker) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvoId) return c
        const existing = c.watchlist || []
        if (existing.some((w) => w.ticker === ticker)) return c
        const systemMsg = {
          id: `wl-${Date.now()}`,
          type: 'watchlist-add',
          sender: CURRENT_USER.name,
          ticker,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        }
        return {
          ...c,
          watchlist: [...existing, { ticker, addedBy: CURRENT_USER.name }],
          messages: [...c.messages, systemMsg],
          lastMessage: `Added $${ticker} to group watchlist`,
          lastTime: systemMsg.time,
        }
      })
    )
    setWatchlistSearch('')
  }

  const removeFromGroupWatchlist = (ticker) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvoId) return c
        return { ...c, watchlist: (c.watchlist || []).filter((w) => w.ticker !== ticker) }
      })
    )
  }

  const filteredWatchlistTickers = watchlistSearch.trim()
    ? SEARCHABLE_TICKERS.filter((t) =>
        t.toLowerCase().includes(watchlistSearch.toLowerCase()) &&
        !(activeConvo?.watchlist || []).some((w) => w.ticker === t)
      )
    : []

  const groupLeaderboard = activeConvo?.type === 'group' ? getGroupLeaderboard(activeConvo.predictions) : []
  const leaderName = groupLeaderboard.length > 0 ? groupLeaderboard[0].sender : null

  const handleSubmitPrediction = () => {
    if (!predTicker || !predTarget || !activeConvo) return
    const quote = TICKER_QUOTES[predTicker]
    if (!quote) return
    const target = parseFloat(predTarget)
    if (isNaN(target) || target <= 0) return
    const isBullish = target > quote.price
    const pred = {
      id: `pred-${Date.now()}`,
      sender: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      ticker: predTicker,
      entryPrice: quote.price,
      targetPrice: target,
      date: predDate,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'open',
    }
    const chatMsg = {
      id: `pred-msg-${Date.now()}`,
      type: 'prediction',
      sender: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      ticker: predTicker,
      entryPrice: quote.price,
      targetPrice: target,
      date: predDate,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      direction: isBullish ? 'bullish' : 'bearish',
      isYou: true,
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvoId
          ? { ...c, predictions: [...(c.predictions || []), pred], messages: [...c.messages, chatMsg], lastMessage: `Predicted $${predTicker} → ${target}`, lastTime: chatMsg.time }
          : c
      )
    )
    setShowPredictModal(false)
    setPredTicker('')
    setPredTarget('')
    setPredTickerSearch('')
  }

  const filteredPredTickers = predTickerSearch.trim()
    ? SEARCHABLE_TICKERS.filter((t) => t.toLowerCase().includes(predTickerSearch.toLowerCase()))
    : []

  const handleSend = () => {
    if (!inputText.trim() || !activeConvo) return
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isYou: true,
      ...(sentiment && { sentiment }),
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvoId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastTime: newMsg.time }
          : c
      )
    )
    setInputText('')
    setSentiment(null)
    inputRef.current?.focus()
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return
    const newConvo = {
      id: `group-${Date.now()}`,
      type: 'group',
      name: newGroupName.trim(),
      avatar: null,
      members: [...selectedMembers, CURRENT_USER],
      messages: [],
      lastMessage: 'Group created',
      lastTime: 'now',
      unread: 0,
    }
    setConversations((prev) => [newConvo, ...prev])
    setActiveConvoId(newConvo.id)
    setShowCreateGroup(false)
    setNewGroupName('')
    setSelectedMembers([])
    setMemberSearch('')
  }

  const toggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    )
  }

  const filteredSuggested = memberSearch
    ? SUGGESTED_USERS.filter((u) => u.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : SUGGESTED_USERS

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Chat</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        leftPadding={50}
      />

      <main className="lg:pl-[350px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <TickerTape />

        <div className="max-w-[1100px] mx-auto flex h-[calc(100vh-120px)]">
          {/* Conversation list sidebar */}
          <div className="w-[340px] shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-text">Messages</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Group
                </button>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth={2}/><path strokeLinecap="round" strokeWidth={2} d="m21 21-4.35-4.35" /></svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-border bg-surface-muted/50 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvos.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => { setActiveConvoId(convo.id); setConversations((prev) => prev.map((c) => c.id === convo.id ? { ...c, unread: 0 } : c)) }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50',
                    activeConvoId === convo.id ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'
                  )}
                >
                  {convo.type === 'group' ? (
                    <GroupAvatar members={convo.members} />
                  ) : (
                    <img src={convo.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text truncate">{convo.name}</span>
                      <span className="text-[10px] text-text-muted shrink-0">{convo.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-text-muted truncate">{convo.lastMessage}</span>
                      {convo.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{convo.unread}</span>
                      )}
                    </div>
                    {convo.type === 'group' && (
                      <span className="text-[10px] text-text-muted">{convo.members.length} members</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {activeConvo ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="border-b border-border shrink-0">
                <div className="px-5 py-3 flex items-center gap-3">
                  {activeConvo.type === 'group' ? (
                    <GroupAvatar members={activeConvo.members} size="sm" />
                  ) : (
                    <img src={activeConvo.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text">{activeConvo.name}</h3>
                      {activeConvo.type === 'group' && (activeConvo.watchlist || []).length > 0 && (
                        <span className="text-[10px] font-medium text-text-muted bg-surface-muted px-1.5 py-0.5 rounded-full">{activeConvo.members.length} members</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      {activeConvo.type === 'group'
                        ? activeConvo.members.filter((m) => m.id !== 'you').map((m) => m.name).join(', ')
                        : 'Online'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeConvo.type === 'group' && (
                      <button
                        type="button"
                        onClick={() => { setShowLeaderboard((v) => !v); if (showGroupWatchlist) setShowGroupWatchlist(false) }}
                        className={clsx(
                          'p-2 rounded-full transition-colors',
                          showLeaderboard ? 'bg-amber-400/15 text-amber-600' : 'text-text-muted hover:bg-surface-muted hover:text-text'
                        )}
                        aria-label="Group Leaderboard"
                        title="Group Leaderboard"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>
                      </button>
                    )}
                    {activeConvo.type === 'group' && (
                      <button
                        type="button"
                        onClick={() => { setShowGroupWatchlist((v) => !v); if (showLeaderboard) setShowLeaderboard(false) }}
                        className={clsx(
                          'p-2 rounded-full transition-colors',
                          showGroupWatchlist ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text'
                        )}
                        aria-label="Group Watchlist"
                        title="Group Watchlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </button>
                    )}
                    {activeConvo.type === 'group' && (
                      <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors" aria-label="Add member">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      </button>
                    )}
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors" aria-label="More">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </div>
                </div>

                {/* Group Leaderboard Panel */}
                {activeConvo.type === 'group' && showLeaderboard && (
                  <div className="px-4 pb-3">
                    <div className="bg-surface border-2 border-amber-400/40 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10">
                      <div className="flex border-b border-border">
                        {[['gain', '% Gain'], ['open', 'Open'], ['closed', 'Closed']].map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setLbTab(key)}
                            className={clsx(
                              'flex-1 py-2 text-[11px] font-bold transition-colors',
                              lbTab === key ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-text'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {lbTab === 'gain' && (
                          <div className="divide-y divide-border/50">
                            {groupLeaderboard.map((user, idx) => {
                              const isYou = user.sender === CURRENT_USER.name
                              return (
                                <div key={user.sender} className={clsx('flex items-center gap-3 px-4 py-2.5', isYou && 'bg-purple-500/5')}>
                                  <span className={clsx('w-5 text-center text-xs font-bold', idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-text-muted')}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                  </span>
                                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-border" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-semibold text-text truncate">@{user.sender}</span>
                                      {isYou && <span className="text-[9px] font-bold text-purple-600 bg-purple-500/10 px-1 rounded">YOU</span>}
                                      {idx === 0 && <LeaderBadge />}
                                    </div>
                                    <span className="text-[10px] text-text-muted">{user.count} predictions · {user.wins} wins</span>
                                  </div>
                                  <span className={clsx('text-sm font-bold', user.totalGain >= 0 ? 'text-green-600' : 'text-red-600')}>
                                    {user.totalGain >= 0 ? '+' : ''}{user.totalGain.toFixed(1)}%
                                  </span>
                                </div>
                              )
                            })}
                            {groupLeaderboard.length === 0 && <div className="px-4 py-6 text-center text-xs text-text-muted">No predictions yet</div>}
                          </div>
                        )}
                        {lbTab === 'open' && (
                          <div className="divide-y divide-border/50">
                            {(activeConvo.predictions || []).filter((p) => p.status === 'open').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => {
                              const logo = getTickerLogo(p.ticker)
                              const currentPrice = TICKER_QUOTES[p.ticker]?.price || p.entryPrice
                              const isBullish = p.targetPrice > p.entryPrice
                              const gain = ((currentPrice - p.entryPrice) / p.entryPrice) * 100
                              const effectiveGain = isBullish ? gain : -gain
                              return (
                                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                                  <img src={p.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                                  {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-text">${p.ticker}</span>
                                      <span className={clsx('text-[10px] font-bold', isBullish ? 'text-green-600' : 'text-red-600')}>→ {p.ticker === 'BTC' ? p.targetPrice.toLocaleString() : p.targetPrice}</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted">@{p.sender} · by {p.date}</span>
                                  </div>
                                  <span className={clsx('text-xs font-bold', effectiveGain >= 0 ? 'text-green-600' : 'text-red-600')}>
                                    {effectiveGain >= 0 ? '+' : ''}{effectiveGain.toFixed(1)}%
                                  </span>
                                </div>
                              )
                            })}
                            {(activeConvo.predictions || []).filter((p) => p.status === 'open').length === 0 && <div className="px-4 py-6 text-center text-xs text-text-muted">No open predictions</div>}
                          </div>
                        )}
                        {lbTab === 'closed' && (
                          <div className="divide-y divide-border/50">
                            {(activeConvo.predictions || []).filter((p) => p.status === 'closed').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => {
                              const logo = getTickerLogo(p.ticker)
                              const isBullish = p.targetPrice > p.entryPrice
                              const gain = ((p.closePrice - p.entryPrice) / p.entryPrice) * 100
                              const effectiveGain = isBullish ? gain : -gain
                              const hitTarget = isBullish ? p.closePrice >= p.targetPrice : p.closePrice <= p.targetPrice
                              return (
                                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                                  <img src={p.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                                  {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-text">${p.ticker}</span>
                                      <span className={clsx('text-[10px] font-bold px-1 rounded', hitTarget ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>{hitTarget ? 'HIT' : 'MISS'}</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted">@{p.sender} · {p.entryPrice} → {p.closePrice}</span>
                                  </div>
                                  <span className={clsx('text-xs font-bold', effectiveGain >= 0 ? 'text-green-600' : 'text-red-600')}>
                                    {effectiveGain >= 0 ? '+' : ''}{effectiveGain.toFixed(1)}%
                                  </span>
                                </div>
                              )
                            })}
                            {(activeConvo.predictions || []).filter((p) => p.status === 'closed').length === 0 && <div className="px-4 py-6 text-center text-xs text-text-muted">No closed predictions</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Watchlist Panel */}
                {activeConvo.type === 'group' && showGroupWatchlist && (
                  <div className="px-4 pb-3">
                    <div className="bg-surface border-2 border-primary/30 rounded-xl p-3 shadow-lg shadow-primary/10">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-text flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Group Watchlist
                        </span>
                        <span className="text-[10px] text-text-muted">{(activeConvo.watchlist || []).length} tickers</span>
                      </div>

                      {/* Ticker pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {(activeConvo.watchlist || []).map((item) => {
                          const logo = getTickerLogo(item.ticker)
                          const quote = TICKER_QUOTES[item.ticker]
                          return (
                            <div key={item.ticker} className="group/wl inline-flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg bg-surface border border-border hover:border-primary/30 transition-colors">
                              {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover" />}
                              <Link to="/symbol" className="text-xs font-bold text-text hover:text-primary transition-colors">${item.ticker}</Link>
                              {quote && (
                                <span className={clsx('text-[10px] font-semibold', quote.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                </span>
                              )}
                              <span className="text-[9px] text-text-muted">@{item.addedBy === CURRENT_USER.name ? 'you' : item.addedBy}</span>
                              {!isWatched(item.ticker) ? (
                                <button
                                  type="button"
                                  onClick={() => toggleWatch(item.ticker, item.ticker)}
                                  className="p-0.5 rounded-full hover:bg-green-500/10 text-primary hover:text-green-600 transition-all"
                                  title="Add to your watchlist"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                </button>
                              ) : (
                                <span className="p-0.5 text-green-500" title="On your watchlist">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFromGroupWatchlist(item.ticker)}
                                className="opacity-0 group-hover/wl:opacity-100 p-0.5 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {/* Add ticker search */}
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          <input
                            type="text"
                            value={watchlistSearch}
                            onChange={(e) => setWatchlistSearch(e.target.value)}
                            placeholder="Add a ticker..."
                            className="flex-1 text-xs bg-transparent text-text placeholder:text-text-muted focus:outline-none py-1"
                          />
                        </div>
                        {filteredWatchlistTickers.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-36 overflow-y-auto">
                            {filteredWatchlistTickers.slice(0, 8).map((t) => {
                              const logo = getTickerLogo(t)
                              const quote = TICKER_QUOTES[t]
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => addToGroupWatchlist(t)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-muted transition-colors text-left"
                                >
                                  {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover" />}
                                  <span className="text-xs font-bold text-text">${t}</span>
                                  {quote && (
                                    <span className={clsx('text-[10px] font-semibold ml-auto', quote.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                                      {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {activeConvo.type === 'group' && (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-muted border border-border text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {activeConvo.members.length} members in this group
                    </div>
                  </div>
                )}
                {activeConvo.messages.map((msg) => (
                  msg.type === 'watchlist-add'
                    ? <WatchlistSystemMessage key={msg.id} msg={msg} onOpenWatchlist={() => setShowGroupWatchlist(true)} />
                    : msg.type === 'prediction'
                      ? <PredictionMessage key={msg.id} msg={msg} leaderName={leaderName} />
                      : <ChatBubble key={msg.id} msg={msg} isGroup={activeConvo.type === 'group'} leaderName={leaderName} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-border shrink-0">
                {sentiment && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <SentimentTag sentiment={sentiment} />
                    <button type="button" onClick={() => setSentiment(null)} className="text-text-muted hover:text-text transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSentiment((s) => s === 'bullish' ? null : 'bullish')}
                      className={clsx(
                        'p-2 rounded-full transition-colors',
                        sentiment === 'bullish' ? 'bg-green-500/15 text-green-600' : 'text-text-muted hover:bg-surface-muted hover:text-text'
                      )}
                      title="Bullish"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSentiment((s) => s === 'bearish' ? null : 'bearish')}
                      className={clsx(
                        'p-2 rounded-full transition-colors',
                        sentiment === 'bearish' ? 'bg-red-500/15 text-red-600' : 'text-text-muted hover:bg-surface-muted hover:text-text'
                      )}
                      title="Bearish"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" /></svg>
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors" title="GIF">
                      <span className="text-[11px] font-extrabold leading-none tracking-tight">GIF</span>
                    </button>
                    {activeConvo.type === 'group' && (
                      <button
                        type="button"
                        onClick={() => setShowPredictModal(true)}
                        className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors"
                        title="Price Prediction"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                          <line x1="22" y1="2" x2="12" y2="12" />
                          <path d="M22 2l-5.5 1.5L18 5z" fill="currentColor" stroke="none" />
                          <line x1="22" y1="2" x2="16.5" y2="3.5" />
                          <line x1="22" y1="2" x2="18" y2="5" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder={activeConvo.type === 'group' ? `Message ${activeConvo.name}...` : `Message @${activeConvo.name}...`}
                      rows={1}
                      className="w-full px-4 py-2.5 text-sm rounded-2xl border border-border bg-surface-muted/50 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={clsx(
                      'p-2.5 rounded-full transition-all shrink-0',
                      inputText.trim() ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-muted text-text-muted cursor-not-allowed'
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateGroup(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-text">Create Group</h3>
              <button type="button" onClick={() => setShowCreateGroup(false)} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-text block mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. TSLA Trading Room"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text block mb-1.5">Add Members</label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-text">
                        <img src={m.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        {m.name}
                        <button type="button" onClick={() => toggleMember(m)} className="ml-0.5 text-text-muted hover:text-text">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                  {filteredSuggested
                    .filter((u) => !selectedMembers.some((m) => m.id === u.id))
                    .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleMember(user)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors text-left"
                    >
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
                      <span className="text-sm font-medium text-text">@{user.name}</span>
                      <svg className="w-5 h-5 ml-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedMembers.length === 0}
                className={clsx(
                  'w-full py-3 rounded-xl text-sm font-bold transition-opacity',
                  newGroupName.trim() && selectedMembers.length > 0
                    ? 'bg-primary text-white hover:opacity-90'
                    : 'bg-surface-muted text-text-muted cursor-not-allowed'
                )}
              >
                Create Group{selectedMembers.length > 0 ? ` with ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Prediction Modal */}
      {showPredictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPredictModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-sm bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="22" y1="2" x2="12" y2="12" />
                  <path d="M22 2l-5.5 1.5L18 5z" fill="currentColor" stroke="none" />
                  <line x1="22" y1="2" x2="16.5" y2="3.5" />
                  <line x1="22" y1="2" x2="18" y2="5" />
                </svg>
                Price Prediction
              </h3>
              <button type="button" onClick={() => setShowPredictModal(false)} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Ticker selection */}
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Ticker</label>
                {predTicker ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface">
                    {getTickerLogo(predTicker) && <img src={getTickerLogo(predTicker)} alt="" className="w-6 h-6 rounded-full object-cover" />}
                    <span className="text-sm font-bold text-text">${predTicker}</span>
                    {TICKER_QUOTES[predTicker] && <span className="text-xs text-text-muted ml-auto">{predTicker === 'BTC' ? TICKER_QUOTES[predTicker].price.toLocaleString() : TICKER_QUOTES[predTicker].price.toFixed(2)} current</span>}
                    <button type="button" onClick={() => { setPredTicker(''); setPredTickerSearch('') }} className="text-text-muted hover:text-text">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={predTickerSearch}
                      onChange={(e) => setPredTickerSearch(e.target.value)}
                      placeholder="Search ticker..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />
                    {filteredPredTickers.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredPredTickers.slice(0, 8).map((t) => {
                          const logo = getTickerLogo(t)
                          const q = TICKER_QUOTES[t]
                          return (
                            <button key={t} type="button" onClick={() => { setPredTicker(t); setPredTickerSearch('') }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-muted transition-colors text-left">
                              {logo && <img src={logo} alt="" className="w-5 h-5 rounded-full object-cover" />}
                              <span className="text-xs font-bold text-text">${t}</span>
                              {q && <span className="text-[10px] text-text-muted ml-auto">{t === 'BTC' ? q.price.toLocaleString() : q.price.toFixed(2)}</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Target price */}
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Target Price</label>
                <input
                  type="number"
                  value={predTarget}
                  onChange={(e) => setPredTarget(e.target.value)}
                  placeholder={predTicker && TICKER_QUOTES[predTicker] ? `Current: ${TICKER_QUOTES[predTicker].price}` : 'Enter target price'}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {predTicker && predTarget && TICKER_QUOTES[predTicker] && (
                  <div className="mt-2 flex items-center gap-2">
                    {(() => {
                      const current = TICKER_QUOTES[predTicker].price
                      const target = parseFloat(predTarget)
                      if (isNaN(target) || target <= 0) return null
                      const isBullish = target > current
                      const pct = (((target - current) / current) * 100).toFixed(1)
                      return (
                        <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', isBullish ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>
                          {isBullish ? '↑ Bullish' : '↓ Bearish'} · {isBullish ? '+' : ''}{pct}%
                        </span>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Target date */}
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Target Date</label>
                <div className="flex gap-2">
                  {['Mar 31, 2026', 'Jun 30, 2026', 'Sep 30, 2026', 'Dec 31, 2026'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPredDate(d)}
                      className={clsx(
                        'flex-1 py-2 text-[10px] font-semibold rounded-lg border transition-colors',
                        predDate === d ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/30'
                      )}
                    >
                      {d.split(', ')[0].replace(' ', '\n')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitPrediction}
                disabled={!predTicker || !predTarget}
                className={clsx(
                  'w-full py-3 rounded-xl text-sm font-bold transition-opacity',
                  predTicker && predTarget ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-muted text-text-muted cursor-not-allowed'
                )}
              >
                Share Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
