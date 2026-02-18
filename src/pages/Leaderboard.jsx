import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function seededShuffle(arr, seed) {
  const shuffled = [...arr]
  let s = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function shuffleLeaderboard(pages, seed) {
  const all = pages.flat()
  const shuffled = seededShuffle(all, seed)
  return shuffled.map((entry, i) => ({ ...entry, rank: i + 1 }))
}

function shuffleWithROI(rows, seed) {
  const shuffled = seededShuffle(rows, seed)
  const rois = rows.map((r) => r.roi).sort((a, b) => parseFloat(b) - parseFloat(a))
  return shuffled.map((entry, i) => ({ ...entry, rank: i + 1, roi: rois[i] }))
}

const TIMEFRAME_SEEDS = { 'Daily': 42, 'Weekly': 137, 'Monthly': 293, 'All time': 0 }

const MARKET_LEADERS_PAGES = [
  [
    { rank: 1, handle: 'CryptoOracle', avatar: '/avatars/leader-1.png', roi: '+156.2%', streak: 12 },
    { rank: 2, handle: 'FedWatcher', avatar: '/avatars/leader-2.png', roi: '+112.8%', streak: 9 },
    { rank: 3, handle: 'ProfessorShiba', avatar: '/avatars/leader-4.png', roi: '+98.5%', streak: 8 },
    { rank: 4, handle: 'ElectionEdge', avatar: '/avatars/leader-5.png', roi: '+87.3%', streak: 7 },
    { rank: 5, handle: 'MacroMaven', avatar: '/avatars/leader-6.png', roi: '+79.1%', streak: 6 },
    { rank: 6, handle: 'VolatilityKing', avatar: '/avatars/top-voice-1.png', roi: '+72.4%', streak: 5 },
    { rank: 7, handle: 'SentimentPro', avatar: '/avatars/top-voice-2.png', roi: '+68.9%', streak: 5 },
    { rank: 8, handle: 'EarningsWhisper', avatar: '/avatars/top-voice-3.png', roi: '+62.1%', streak: 4 },
    { rank: 9, handle: 'TechCatalyst', avatar: '/avatars/michael-bolling.png', roi: '+58.7%', streak: 4 },
    { rank: 10, handle: 'QuantSignal', avatar: '/avatars/ross-cameron.png', roi: '+54.3%', streak: 3 },
  ],
  [
    { rank: 11, handle: 'AlphaHunter', avatar: '/avatars/michele-steele.png', roi: '+51.2%', streak: 3 },
    { rank: 12, handle: 'MomentumKing', avatar: '/avatars/leader-3.png', roi: '+48.8%', streak: 3 },
    { rank: 13, handle: 'DegenDave', avatar: '/avatars/leader-1.png', roi: '+45.1%', streak: 2 },
    { rank: 14, handle: 'ChartNinja', avatar: '/avatars/leader-2.png', roi: '+42.7%', streak: 2 },
    { rank: 15, handle: 'OptionsOwl', avatar: '/avatars/leader-4.png', roi: '+39.4%', streak: 2 },
    { rank: 16, handle: 'SmartMoney', avatar: '/avatars/leader-5.png', roi: '+36.8%', streak: 2 },
    { rank: 17, handle: 'TrendSurfer', avatar: '/avatars/leader-6.png', roi: '+33.5%', streak: 1 },
    { rank: 18, handle: 'RiskManager', avatar: '/avatars/top-voice-1.png', roi: '+31.2%', streak: 1 },
    { rank: 19, handle: 'ValuePlay', avatar: '/avatars/top-voice-2.png', roi: '+28.9%', streak: 1 },
    { rank: 20, handle: 'SwingKing', avatar: '/avatars/top-voice-3.png', roi: '+26.1%', streak: 1 },
  ],
]

const PRICE_LEADERS_PAGES = [
  [
    { rank: 1, handle: 'EmperorFox', avatar: '/avatars/leader-1.png', roi: '+124.3%', accuracy: '78%' },
    { rank: 2, handle: 'TheBullishPenguin', avatar: '/avatars/leader-2.png', roi: '+98.7%', accuracy: '74%' },
    { rank: 3, handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', roi: '+82.9%', accuracy: '71%' },
    { rank: 4, handle: 'SkipperBullDolphin', avatar: '/avatars/leader-3.png', roi: '+76.4%', accuracy: '69%' },
    { rank: 5, handle: 'BitcoinBear', avatar: '/avatars/leader-4.png', roi: '+68.2%', accuracy: '67%' },
    { rank: 6, handle: 'ChartWizard', avatar: '/avatars/leader-5.png', roi: '+61.5%', accuracy: '65%' },
    { rank: 7, handle: 'TeslaFanatic', avatar: '/avatars/leader-6.png', roi: '+57.8%', accuracy: '63%' },
    { rank: 8, handle: 'OptionsFlow', avatar: '/avatars/top-voice-1.png', roi: '+52.4%', accuracy: '61%' },
    { rank: 9, handle: 'BearishTruth', avatar: '/avatars/top-voice-2.png', roi: '+48.1%', accuracy: '59%' },
    { rank: 10, handle: 'MomentumTrader', avatar: '/avatars/top-voice-3.png', roi: '+44.6%', accuracy: '57%' },
    { rank: 11, handle: 'RetailTrader42', avatar: '/avatars/michael-bolling.png', roi: '+41.2%', accuracy: '55%' },
  ],
  [
    { rank: 12, handle: 'GammaSqueeze', avatar: '/avatars/ross-cameron.png', roi: '+38.8%', accuracy: '54%' },
    { rank: 13, handle: 'FundTracker', avatar: '/avatars/michele-steele.png', roi: '+35.1%', accuracy: '52%' },
    { rank: 14, handle: 'EnergyBull', avatar: '/avatars/leader-1.png', roi: '+32.7%', accuracy: '51%' },
    { rank: 15, handle: 'ShortSqueeze', avatar: '/avatars/leader-2.png', roi: '+29.4%', accuracy: '49%' },
    { rank: 16, handle: 'DividendKing', avatar: '/avatars/leader-3.png', roi: '+26.8%', accuracy: '48%' },
    { rank: 17, handle: 'CatalystAlert', avatar: '/avatars/leader-4.png', roi: '+23.5%', accuracy: '47%' },
    { rank: 18, handle: 'QuantTrader', avatar: '/avatars/leader-5.png', roi: '+21.2%', accuracy: '45%' },
    { rank: 19, handle: 'SentimentReader', avatar: '/avatars/leader-6.png', roi: '+18.9%', accuracy: '44%' },
    { rank: 20, handle: 'MacroView', avatar: '/avatars/top-voice-1.png', roi: '+16.1%', accuracy: '42%' },
  ],
]

const YOUR_MARKET_RANK = { rank: 34, handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', roi: '+24.1%', streak: 1 }
const YOUR_PRICE_RANK = { rank: 3, handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', roi: '+82.9%', accuracy: '71%' }

const MARKET_EVENT_QUESTIONS = [
  {
    id: 'fed-rate-cuts-2026',
    title: 'How many Fed rate cuts in 2026?',
    icon: '/images/powell-streaming.png',
    options: [
      { label: '2 (50 bps)', pct: 26 },
      { label: '3 (75 bps)', pct: 55 },
    ],
    volume: '$12M Vol.',
  },
  {
    id: 'silver-feb',
    title: 'Will Silver (SI) hit__ by end of February?',
    icon: '/images/logos/slv.png',
    options: [
      { label: '↑ $120', pct: 2 },
      { label: '↓ $75', pct: 100 },
    ],
    volume: '$5M Vol.',
  },
  {
    id: 'nflx-feb',
    title: 'Will Netflix (NFLX) finish week of February 16 above__?',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/186px-Netflix_2015_N_logo.svg.png',
    options: [
      { label: '$20', pct: 100 },
      { label: '$30', pct: 100 },
    ],
    volume: '$62K Vol.',
  },
  {
    id: 'largest-co-feb',
    title: 'Largest Company End of February?',
    icon: '/images/logos/nvda.png',
    options: [
      { label: 'NVIDIA', pct: 98 },
      { label: 'Apple', pct: 1 },
    ],
    volume: '$10M Vol.',
  },
  {
    id: 'tsla-feb',
    title: 'Will Tesla (TSLA) close above __ end of February?',
    icon: '/images/logos/tesla.png',
    options: [
      { label: '$360', pct: 93 },
      { label: '$370', pct: 87 },
    ],
    volume: '$90K Vol.',
  },
  {
    id: 'largest-co-mar',
    title: 'Largest Company end of March?',
    icon: '/images/logos/nvda.png',
    options: [
      { label: 'NVIDIA', pct: 91 },
      { label: 'Apple', pct: 5 },
    ],
    volume: '$2M Vol.',
  },
  {
    id: 'ipos-2027',
    title: 'IPOs before 2027?',
    icon: null,
    iconEmoji: '📊',
    options: [
      { label: 'Discord', pct: 90 },
      { label: 'SpaceX', pct: 87 },
    ],
    volume: '$4M Vol.',
  },
  {
    id: 'silver-june',
    title: 'Will Silver (SI) hit__ by end of June?',
    icon: '/images/logos/slv.png',
    options: [
      { label: '↑ $120', pct: 29 },
      { label: '↓ $70', pct: 88 },
    ],
    volume: '$2M Vol.',
  },
  {
    id: 'largest-ipo-2026',
    title: 'Largest IPO by market cap in 2026?',
    icon: null,
    iconEmoji: '🏷️',
    options: [
      { label: 'SpaceX', pct: 86 },
      { label: 'OpenAI', pct: 5 },
    ],
    volume: '$225K Vol.',
  },
  {
    id: 'microstrategy',
    title: 'Nothing Ever Happens: MicroStrategy',
    icon: null,
    iconEmoji: '📈',
    chancePct: 85,
    volume: '$826K Vol.',
  },
]

const PRICE_PREDICTIONS_STREAM = [
  { id: 'pp1', user: 'EmperorFox', avatar: '/avatars/top-voice-1.png', ticker: 'TSLA', direction: 'bullish', target: 520, current: 433.07, date: 'Mar 15, 2026', time: '2m', likes: 234, comments: 45 },
  { id: 'pp2', user: 'TheBullishPenguin', avatar: '/avatars/top-voice-2.png', ticker: 'NVDA', direction: 'bullish', target: 180, current: 142.50, date: 'Apr 1, 2026', time: '5m', likes: 189, comments: 32 },
  { id: 'pp3', user: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', ticker: 'AAPL', direction: 'bearish', target: 195, current: 232.80, date: 'Mar 30, 2026', time: '8m', likes: 156, comments: 67 },
  { id: 'pp4', user: 'BitcoinBear', avatar: '/avatars/leader-4.png', ticker: 'BTC.X', direction: 'bearish', target: 72000, current: 96500, date: 'Feb 28, 2026', time: '12m', likes: 312, comments: 89 },
  { id: 'pp5', user: 'ChartWizard', avatar: '/avatars/leader-5.png', ticker: 'AMZN', direction: 'bullish', target: 260, current: 228.40, date: 'May 1, 2026', time: '15m', likes: 98, comments: 21 },
  { id: 'pp6', user: 'OptionsFlow', avatar: '/avatars/leader-3.png', ticker: 'META', direction: 'bullish', target: 720, current: 612.30, date: 'Apr 15, 2026', time: '18m', likes: 145, comments: 38 },
  { id: 'pp7', user: 'BearishTruth', avatar: '/avatars/leader-6.png', ticker: 'TSLA', direction: 'bearish', target: 280, current: 433.07, date: 'Jun 30, 2026', time: '22m', likes: 267, comments: 112 },
  { id: 'pp8', user: 'TeslaFanatic', avatar: '/avatars/top-voice-1.png', ticker: 'GOOGL', direction: 'bullish', target: 210, current: 185.20, date: 'Mar 20, 2026', time: '28m', likes: 78, comments: 15 },
  { id: 'pp9', user: 'MomentumTrader', avatar: '/avatars/top-voice-2.png', ticker: 'PLTR', direction: 'bullish', target: 45, current: 32.80, date: 'Apr 30, 2026', time: '35m', likes: 203, comments: 54 },
  { id: 'pp10', user: 'RetailTrader42', avatar: '/avatars/top-voice-3.png', ticker: 'SOL.X', direction: 'bullish', target: 280, current: 198.50, date: 'May 15, 2026', time: '41m', likes: 167, comments: 43 },
]

function LeaderRow({ rank, handle, avatar, roi, isYou, streak, accuracy }) {
  return (
    <div className={clsx(
      'grid grid-cols-[2rem_1fr_5rem] items-center gap-3 px-4 py-3',
      isYou && 'bg-purple-50 dark:bg-purple-950/20 border-l-2 border-purple-500'
    )}>
      <span className={clsx('text-sm tabular-nums font-medium', isYou ? 'text-purple-600 font-bold' : rank <= 3 ? 'text-yellow-600 font-bold' : 'text-text-muted')}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
      </span>
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
        <div className="min-w-0">
          <span className={clsx('text-sm font-semibold truncate block', isYou && 'text-purple-600')}>
            @{handle}
            {isYou && <span className="ml-1.5 text-[10px] font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">YOU</span>}
          </span>
          {streak && <span className="text-[10px] text-text-muted">🔥 {streak} streak</span>}
          {accuracy && <span className="text-[10px] text-text-muted">🎯 {accuracy} accuracy</span>}
        </div>
      </div>
      <span className="text-sm font-bold tabular-nums text-green-600 text-right">{roi}</span>
    </div>
  )
}

function QuestionCard({ q }) {
  const [votes, setVotes] = useState({})
  const p = q.chancePct ? Math.max(1, Math.min(99, q.chancePct)) / 100 : null
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {q.icon ? (
            <img src={q.icon} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
          ) : q.iconEmoji ? (
            <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center text-xl shrink-0">{q.iconEmoji}</div>
          ) : null}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text leading-tight">{q.title}</h4>
          </div>
          {q.chancePct && (
            <div className="shrink-0 text-center">
              <div className="text-2xl font-bold text-text">{q.chancePct}%</div>
              <div className="text-[10px] text-text-muted">chance</div>
            </div>
          )}
        </div>
      </div>
      {q.options && (
        <div className="px-4 pb-3 space-y-2">
          {q.options.map((opt, i) => {
            const optP = Math.max(0.01, Math.min(0.99, opt.pct / 100))
            const yesReturn = (1 / optP).toFixed(2)
            const noReturn = (1 / (1 - optP)).toFixed(2)
            return (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-sm text-text font-medium min-w-0">{opt.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold tabular-nums text-text w-10 text-right">{opt.pct}%</span>
                  <button
                    type="button"
                    onClick={() => setVotes((v) => ({ ...v, [`${i}-yes`]: !v[`${i}-yes`] }))}
                    className={clsx(
                      'px-3 py-1 rounded text-xs font-semibold transition-colors',
                      votes[`${i}-yes`]
                        ? 'bg-green-600 text-white'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setVotes((v) => ({ ...v, [`${i}-no`]: !v[`${i}-no`] }))}
                    className={clsx(
                      'px-3 py-1 rounded text-xs font-semibold transition-colors',
                      votes[`${i}-no`]
                        ? 'bg-red-600 text-white'
                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                    )}
                  >
                    No
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {q.chancePct && !q.options && (
        <div className="px-4 pb-3 flex items-center gap-3">
          <button type="button" className="flex-1 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400">
            Yes
          </button>
          <button type="button" className="flex-1 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400">
            No
          </button>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/30">
        <span className="text-xs text-text-muted font-medium">{q.volume}</span>
        <div className="flex items-center gap-3">
          <button type="button" className="text-text-muted hover:text-text transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          <button type="button" className="text-text-muted hover:text-text transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function PricePredictionCard({ pred }) {
  const logo = getTickerLogo(pred.ticker)
  const isBullish = pred.direction === 'bullish'
  const diff = isBullish ? ((pred.target - pred.current) / pred.current * 100).toFixed(1) : ((pred.current - pred.target) / pred.current * 100).toFixed(1)
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Link to={`/profile/${pred.user}`}>
              <img src={pred.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
            </Link>
            <div>
              <Link to={`/profile/${pred.user}`} className="text-sm font-semibold text-text hover:underline">@{pred.user}</Link>
              <div className="text-xs text-text-muted">{pred.time}</div>
            </div>
          </div>
          <span className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
            isBullish ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}>
            {isBullish ? '▲ Bullish' : '▼ Bearish'}
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-text">{pred.ticker.slice(0, 2)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text">{pred.ticker}</div>
            <div className="text-xs text-text-muted">Current: ${pred.current.toLocaleString()}</div>
          </div>
          <div className="text-right shrink-0">
            <div className={clsx('text-lg font-bold', isBullish ? 'text-green-600' : 'text-red-600')}>
              ${pred.target.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-muted">
              {isBullish ? '+' : '-'}{diff}% · by {pred.date}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/30">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {pred.likes}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {pred.comments}
          </span>
        </div>
        <button type="button" className="text-xs font-semibold text-primary hover:underline">View Details</button>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [marketPage, setMarketPage] = useState(0)
  const [pricePage, setPricePage] = useState(0)
  const [timeframe, setTimeframe] = useState('All time')

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

  const seed = TIMEFRAME_SEEDS[timeframe] ?? 0

  const allMarketRows = useMemo(() => {
    if (seed === 0) return MARKET_LEADERS_PAGES.flat()
    return shuffleWithROI(MARKET_LEADERS_PAGES.flat(), seed)
  }, [seed])

  const allPriceRows = useMemo(() => {
    if (seed === 0) return PRICE_LEADERS_PAGES.flat()
    return shuffleWithROI(PRICE_LEADERS_PAGES.flat(), seed + 50)
  }, [seed])

  const marketPageSize = 10
  const pricePageSize = PRICE_LEADERS_PAGES[0].length
  const marketPageCount = 245
  const pricePageCount = 123
  const marketRows = allMarketRows.slice(marketPage * marketPageSize, (marketPage + 1) * marketPageSize)
  const priceRows = allPriceRows.slice(pricePage * pricePageSize, (pricePage + 1) * pricePageSize)
  const showYourMarketRank = !marketRows.some((r) => r.handle === YOUR_MARKET_RANK.handle)
  const showYourPriceRank = !priceRows.some((r) => r.handle === YOUR_PRICE_RANK.handle)

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Leaderboards</div>
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

        <div className="max-w-[1100px] mx-auto px-4 py-6">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="text-xl font-bold text-text">Prediction Leaderboards</h1>
              <p className="text-sm text-text-muted">Top predictors across Market Events and Price Targets</p>
            </div>
          </div>

          {/* Timeframe filter */}
          <div className="flex items-center gap-2 mb-6">
            {['Daily', 'Weekly', 'Monthly', 'All time'].map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setMarketPage(0); setPricePage(0) }}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  timeframe === tf
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-surface-muted text-text hover:bg-border border border-border'
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Two leaderboards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Market Events Leaderboard */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-text flex items-center gap-2">
                      <span>📊</span> Market Events
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">Top traders predicting Market Event Outcomes</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs text-text-muted font-medium">155k participants</span>
                    <button type="button" className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity">Predict</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[2rem_1fr_5rem] items-center gap-3 px-4 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-surface-muted/20">
                <span>Rank</span>
                <span>Predictor</span>
                <span className="text-right">ROI</span>
              </div>
              <div className="divide-y divide-border">
                {marketRows.map((r) => (
                  <LeaderRow key={r.rank} {...r} isYou={r.handle === YOUR_MARKET_RANK.handle} />
                ))}
              </div>
              {showYourMarketRank && (
                <div className="border-t-2 border-dashed border-purple-300 dark:border-purple-800">
                  <LeaderRow {...YOUR_MARKET_RANK} isYou />
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-muted/20">
                <button
                  type="button"
                  onClick={() => setMarketPage((p) => Math.max(0, p - 1))}
                  disabled={marketPage === 0}
                  className={clsx(
                    'flex items-center gap-1 text-sm font-medium transition-colors',
                    marketPage === 0 ? 'text-text-muted/40 cursor-not-allowed' : 'text-text hover:text-primary'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Prev
                </button>
                <span className="text-xs text-text-muted">Page {marketPage + 1} of {marketPageCount}</span>
                <button
                  type="button"
                  onClick={() => setMarketPage((p) => Math.min(marketPageCount - 1, p + 1))}
                  disabled={marketPage === marketPageCount - 1}
                  className={clsx(
                    'flex items-center gap-1 text-sm font-medium transition-colors',
                    marketPage === marketPageCount - 1 ? 'text-text-muted/40 cursor-not-allowed' : 'text-text hover:text-primary'
                  )}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Price Targets Leaderboard */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-text flex items-center gap-2">
                      <span>🎯</span> Price Targets
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">Top traders using the Price Prediction tool</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs text-text-muted font-medium">66k participants</span>
                    <button type="button" className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity">Predict</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[2rem_1fr_5rem] items-center gap-3 px-4 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-surface-muted/20">
                <span>Rank</span>
                <span>Predictor</span>
                <span className="text-right">ROI</span>
              </div>
              <div className="divide-y divide-border">
                {priceRows.map((r) => (
                  <LeaderRow key={r.rank} {...r} isYou={r.handle === YOUR_PRICE_RANK.handle} />
                ))}
              </div>
              {showYourPriceRank && (
                <div className="border-t-2 border-dashed border-purple-300 dark:border-purple-800">
                  <LeaderRow {...YOUR_PRICE_RANK} isYou />
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-muted/20">
                <button
                  type="button"
                  onClick={() => setPricePage((p) => Math.max(0, p - 1))}
                  disabled={pricePage === 0}
                  className={clsx(
                    'flex items-center gap-1 text-sm font-medium transition-colors',
                    pricePage === 0 ? 'text-text-muted/40 cursor-not-allowed' : 'text-text hover:text-primary'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Prev
                </button>
                <span className="text-xs text-text-muted">Page {pricePage + 1} of {pricePageCount}</span>
                <button
                  type="button"
                  onClick={() => setPricePage((p) => Math.min(pricePageCount - 1, p + 1))}
                  disabled={pricePage === pricePageCount - 1}
                  className={clsx(
                    'flex items-center gap-1 text-sm font-medium transition-colors',
                    pricePage === pricePageCount - 1 ? 'text-text-muted/40 cursor-not-allowed' : 'text-text hover:text-primary'
                  )}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content below leaderboards, side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Event Questions */}
            <div>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <span>📊</span> Popular Market Events
              </h3>
              <div className="space-y-4">
                {MARKET_EVENT_QUESTIONS.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </div>

            {/* Price Prediction Stream */}
            <div>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <span>🎯</span> Popular Price Predictions
              </h3>
              <div className="space-y-4">
                {PRICE_PREDICTIONS_STREAM.map((pred) => (
                  <PricePredictionCard key={pred.id} pred={pred} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
