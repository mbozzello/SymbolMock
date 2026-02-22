import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...v) { return v.filter(Boolean).join(' ') }

const CATEGORIES = ['Trending', 'New', 'Stocks', 'Crypto', 'Macro', 'Earnings', 'IPOs', 'Tech', 'Commodities']

const INITIAL_BALANCE = 4_820

const CLOSED_BETS = [
  { question: 'AAPL beats Q1 2026 earnings?', side: 'Yes', amount: 150, result: 'Won', payout: 210 },
  { question: 'ETH above $5k by Jan 2026?', side: 'Yes', amount: 300, result: 'Lost', payout: 0 },
  { question: 'MSFT market cap $4T by Q4 2025?', side: 'No', amount: 200, result: 'Won', payout: 340 },
]

function getStoredBalance() {
  try {
    const v = localStorage.getItem('stpred-coins')
    if (v !== null) return Number(v)
  } catch {}
  return INITIAL_BALANCE
}

function setStoredBalance(n) {
  try { localStorage.setItem('stpred-coins', String(n)) } catch {}
}

const MARKETS = [
  {
    id: 'm-fed',
    icon: '🏦',
    iconBg: '#e0e7ff',
    image: '/images/powell-streaming.png',
    question: 'Will 2 Fed Rate Cuts Happen in 2026?',
    expandedQuestion: 'How many Fed rate cuts in 2026?',
    options: [
      { label: '0 (0 bps)', pct: 3 },
      { label: '1 (25 bps)', pct: 8 },
      { label: '2 (50 bps)', pct: 26 },
      { label: '3 (75 bps)', pct: 55 },
      { label: '4 (100 bps)', pct: 6 },
      { label: '>5 (+125 bps)', pct: 2 },
    ],
    volume: '64.38k',
    endDate: 'Dec 31',
    predictors: 8412,
    category: 'Macro',
  },
  {
    id: 'm1',
    icon: '📈',
    iconBg: '#dbeafe',
    question: 'Will TSLA hit $500 by year end?',
    options: [
      { label: 'Yes', pct: 64 },
      { label: 'No', pct: 36 },
    ],
    volume: '59.53k',
    endDate: 'Dec 31',
    predictors: 6_320,
    category: 'Stocks',
  },
  {
    id: 'm2',
    icon: '🤖',
    iconBg: '#fef9c3',
    question: 'NVDA earnings beat consensus Q2 2026?',
    options: [
      { label: 'Yes', pct: 78 },
      { label: 'No', pct: 22 },
    ],
    volume: '124.8k',
    endDate: 'Aug 28',
    predictors: 12_480,
    category: 'Earnings',
  },
  {
    id: 'm3',
    icon: '🪙',
    iconBg: '#fef3c7',
    question: 'Bitcoin above $150k before July 2026?',
    options: [
      { label: 'Yes', pct: 41 },
      { label: 'No', pct: 59 },
    ],
    volume: '89.2k',
    endDate: 'Jul 01',
    predictors: 9_140,
    category: 'Crypto',
  },
  {
    id: 'm4',
    icon: '🏦',
    iconBg: '#e0e7ff',
    question: 'Fed rate cut before September 2026?',
    options: [
      { label: 'Yes', pct: 73 },
      { label: 'No', pct: 27 },
    ],
    volume: '64.38k',
    endDate: 'Sep 01',
    predictors: 7_290,
    category: 'Macro',
  },
  {
    id: 'm5',
    icon: '🚗',
    iconBg: '#dcfce7',
    question: 'Tesla Robotaxi launch in 2026?',
    options: [
      { label: 'Yes', pct: 61 },
      { label: 'No', pct: 39 },
    ],
    volume: '6.32k',
    endDate: 'Dec 31',
    predictors: 4_970,
    category: 'Stocks',
  },
  {
    id: 'm6',
    icon: '💎',
    iconBg: '#fce7f3',
    question: 'Ethereum flips Bitcoin market cap by 2027?',
    options: [
      { label: 'Yes', pct: 12 },
      { label: 'No', pct: 88 },
    ],
    volume: '4.08k',
    endDate: 'Jan 01',
    predictors: 3_120,
    category: 'Crypto',
  },
  {
    id: 'm7',
    icon: '📊',
    iconBg: '#e0f2fe',
    question: 'S&P 500 above 6,500 by Q3 2026?',
    options: [
      { label: 'Yes', pct: 55 },
      { label: 'No', pct: 45 },
    ],
    volume: '79.26k',
    endDate: 'Sep 30',
    predictors: 5_680,
    category: 'Macro',
  },
  {
    id: 'm8',
    icon: '🍎',
    iconBg: '#f3e8ff',
    question: 'Apple launches foldable iPhone in 2026?',
    options: [
      { label: 'Yes', pct: 28 },
      { label: 'No', pct: 72 },
    ],
    volume: '9.91k',
    endDate: 'Dec 31',
    predictors: 2_340,
    category: 'Tech',
  },
  {
    id: 'm9',
    icon: '🛢️',
    iconBg: '#fef3c7',
    question: 'Oil above $100/barrel before year end?',
    options: [
      { label: 'Yes', pct: 34 },
      { label: 'No', pct: 66 },
    ],
    volume: '12.4k',
    endDate: 'Dec 31',
    predictors: 1_890,
    category: 'Commodities',
  },
  {
    id: 'm10',
    icon: '💰',
    iconBg: '#dbeafe',
    question: 'How many Tesla deliveries in Q2 2026?',
    options: [
      { label: '400k–450k', pct: 61 },
      { label: '450k–500k', pct: 39 },
    ],
    volume: '1.98k',
    endDate: 'Jul 01',
    predictors: 1_420,
    category: 'Earnings',
  },
  {
    id: 'm11',
    icon: '🔗',
    iconBg: '#ecfdf5',
    question: 'Solana ETF approved before 2027?',
    options: [
      { label: 'Yes', pct: 47 },
      { label: 'No', pct: 53 },
    ],
    volume: '24.75k',
    endDate: 'Dec 31',
    predictors: 4_210,
    category: 'Crypto',
  },
  {
    id: 'm12',
    icon: '🏢',
    iconBg: '#e0e7ff',
    question: 'Reddit (RDDT) above $200 by mid-2026?',
    options: [
      { label: 'Yes', pct: 52 },
      { label: 'No', pct: 48 },
    ],
    volume: '3.56k',
    endDate: 'Jun 30',
    predictors: 2_150,
    category: 'Stocks',
  },
  {
    id: 'm13',
    icon: '⚡',
    iconBg: '#fef9c3',
    question: 'Gold above $3,000/oz by October 2026?',
    options: [
      { label: 'Yes', pct: 68 },
      { label: 'No', pct: 32 },
    ],
    volume: '33.1k',
    endDate: 'Oct 01',
    predictors: 3_870,
    category: 'Commodities',
  },
  {
    id: 'm14',
    icon: '🚀',
    iconBg: '#fce7f3',
    question: 'Stripe IPO in 2026?',
    options: [
      { label: 'Yes', pct: 38 },
      { label: 'No', pct: 62 },
    ],
    volume: '9.9k',
    endDate: 'Dec 31',
    predictors: 2_640,
    category: 'IPOs',
  },
  {
    id: 'm15',
    icon: '📱',
    iconBg: '#e0f2fe',
    question: 'OpenAI launches consumer hardware by end of 2026?',
    options: [
      { label: 'Jul 31, 2026', pct: 45 },
      { label: 'Mar 31, 2026', pct: 5 },
    ],
    volume: '24.75k',
    endDate: 'Dec 31',
    predictors: 5_120,
    category: 'Tech',
  },
  {
    id: 'm16',
    icon: '🎯',
    iconBg: '#dcfce7',
    question: 'Which company will have the best AI model for coding on May 31?',
    options: [
      { label: 'OpenAI', pct: 50 },
      { label: 'Anthropic', pct: 50 },
    ],
    volume: '3',
    endDate: 'May 31',
    predictors: 1_980,
    category: 'Tech',
  },
]

function PredictionGauge({ value, size = 48, strokeWidth = 4 }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3b82f6" strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">{value}%</span>
    </div>
  )
}

function TradeModal({ market, onClose, onBetPlaced, coinBalance, onDeductCoins }) {
  const [votes, setVotes] = useState({})
  const [betModal, setBetModal] = useState(null)
  const [betAmount, setBetAmount] = useState(50)
  const [placedBets, setPlacedBets] = useState(() => {
    try {
      const saved = localStorage.getItem(`stpred-bets-${market.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [betSuccess, setBetSuccess] = useState(null)

  const options = market.options ?? []
  const question = market.expandedQuestion || market.question

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {market.image ? (
              <img src={market.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
            ) : (
              <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: market.iconBg }}>
                {market.icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-text leading-snug truncate">{question}</h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                <span>{market.volume} Vol</span>
                <span>⏱ {market.endDate}</span>
                <span>{(market.predictors ?? 0).toLocaleString()} predictors</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors shrink-0 ml-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {options.map((opt, i) => {
            const vote = votes[i]
            const p = Math.max(0.01, Math.min(0.99, opt.pct / 100))
            const yesReturn = (1 / p).toFixed(2)
            const noReturn = (1 / (1 - p)).toFixed(2)
            const yesBet = placedBets[`${i}-yes`]
            const noBet = placedBets[`${i}-no`]
            return (
              <div key={i} className="flex items-center gap-4">
                <PredictionGauge value={opt.pct} size={52} strokeWidth={4.5} />
                <div className="min-w-0 flex-1">
                  <span className="text-base font-semibold text-text block">{opt.label}</span>
                  {yesBet && <span className="text-[11px] text-green-600 font-medium">Wagered {Number(yesBet.amount).toLocaleString()} → Win {Number(yesBet.potentialReturn).toLocaleString()}</span>}
                  {noBet && <span className="text-[11px] text-red-600 font-medium">Wagered {Number(noBet.amount).toLocaleString()} → Win {Number(noBet.potentialReturn).toLocaleString()}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBetAmount(50)
                      setBetModal({ optionIndex: i, side: 'yes', label: opt.label, multiplier: yesReturn, pct: opt.pct })
                    }}
                    className={clsx(
                      'flex items-center justify-center gap-2 w-[110px] py-2 rounded-full text-sm font-bold border transition-colors',
                      (vote === 'yes' || yesBet)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-surface border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                    )}
                  >
                    <span>Yes</span>
                    <span className={clsx('text-xs font-medium', (vote === 'yes' || yesBet) ? 'text-green-100' : 'text-green-500')}>{yesReturn}x</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBetAmount(50)
                      setBetModal({ optionIndex: i, side: 'no', label: opt.label, multiplier: noReturn, pct: opt.pct })
                    }}
                    className={clsx(
                      'flex items-center justify-center gap-2 w-[110px] py-2 rounded-full text-sm font-bold border transition-colors',
                      (vote === 'no' || noBet)
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-surface border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                    )}
                  >
                    <span>No</span>
                    <span className={clsx('text-xs font-medium', (vote === 'no' || noBet) ? 'text-red-100' : 'text-red-400')}>{noReturn}x</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bet sub-modal */}
        {betModal && (
          <div className="absolute inset-0 bg-white dark:bg-surface flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-bold text-text">{betModal.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{betModal.side === 'yes' ? 'Buying Yes' : 'Buying No'} @ {betModal.pct}%</p>
              </div>
              <button type="button" onClick={() => { setBetModal(null); setBetSuccess(null) }} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            </div>
            {!betSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
                <div className="text-center">
                  <p className="text-3xl font-bold text-text">{betAmount.toLocaleString()} <span className="text-lg text-text-muted">coins</span></p>
                  <p className="text-sm text-text-muted mt-1">Potential return: <span className="font-bold text-text">{Math.round(betAmount * Number(betModal.multiplier)).toLocaleString()} coins</span> ({betModal.multiplier}x)</p>
                  <p className="text-xs text-text-muted mt-1">Balance: <span className="font-semibold text-text">{(coinBalance ?? 0).toLocaleString()} coins</span></p>
                </div>
                <div className="flex gap-2 w-full max-w-xs">
                  {[25, 50, 100, 250, 500].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setBetAmount(q)}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        betAmount === q ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text hover:bg-surface-muted'
                      )}
                    >{q}</button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const key = `${betModal.optionIndex}-${betModal.side}`
                    const newBet = { amount: betAmount, potentialReturn: Math.round(betAmount * Number(betModal.multiplier)), side: betModal.side, label: betModal.label, ts: Date.now() }
                    const nextBets = { ...placedBets, [key]: newBet }
                    try { localStorage.setItem(`stpred-bets-${market.id}`, JSON.stringify(nextBets)) } catch {}
                    setPlacedBets(nextBets)
                    if (onDeductCoins) onDeductCoins(betAmount)
                    setBetSuccess({ amount: betAmount, potentialReturn: Math.round(betAmount * Number(betModal.multiplier)) })
                    setTimeout(() => { if (onBetPlaced) onBetPlaced() }, 50)
                  }}
                  className={clsx(
                    'w-full max-w-xs py-3 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90',
                    betModal.side === 'yes' ? 'bg-green-600' : 'bg-red-600'
                  )}
                >
                  Place {betModal.side === 'yes' ? 'Yes' : 'No'} Bet
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <p className="text-lg font-bold text-text">Bet Placed!</p>
                <p className="text-sm text-text-muted">{betSuccess.amount.toLocaleString()} coins wagered → {betSuccess.potentialReturn.toLocaleString()} potential return</p>
                <button type="button" onClick={() => { setBetSuccess(null); setBetModal(null) }} className="mt-2 px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MarketCard({ market, onOpenTrade }) {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpenTrade(market)}
    >
      <div className="flex items-start gap-3">
        {market.image ? (
          <img src={market.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
        ) : (
          <span
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: market.iconBg }}
          >
            {market.icon}
          </span>
        )}
        <p className="text-sm font-semibold text-text leading-snug flex-1 min-w-0">{market.question}</p>
        {market.options.length <= 2 && (
          <span className="shrink-0 text-sm font-bold text-success">{market.options[0].pct}%</span>
        )}
      </div>

      <div className="space-y-2">
        {market.options.slice(0, 2).map((opt) => (
          <div key={opt.label} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-text truncate">{opt.label}</span>
                <span className="text-xs font-bold text-text ml-2">{opt.pct}%</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-green-50 dark:bg-green-950/20 text-success border border-green-200 dark:border-green-800">Yes</span>
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800">No</span>
          </div>
        ))}
        {market.options.length > 2 && (
          <p className="text-[10px] text-text-muted">+{market.options.length - 2} more options</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-text-muted pt-1 border-t border-border">
        <span>{market.volume} Vol</span>
        <span>⏱ {market.endDate}</span>
      </div>
    </div>
  )
}

export default function StocktwitsPredictions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [activeCategory, setActiveCategory] = useState('Trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [tradeModal, setTradeModal] = useState(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const [walletTab, setWalletTab] = useState('open')
  const [coinBalance, setCoinBalance] = useState(getStoredBalance)
  const [liveBets, setLiveBets] = useState(() => {
    const bets = []
    try {
      for (const m of MARKETS) {
        const saved = localStorage.getItem(`stpred-bets-${m.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          Object.entries(parsed).forEach(([key, b]) => {
            const betSide = b.side === 'yes' ? 'Yes' : b.side === 'no' ? 'No' : b.side
            const label = b.label ? `${m.question} — ${b.label}` : m.question
            bets.push({ question: label, side: betSide, amount: b.amount, potentialReturn: b.potentialReturn, endDate: m.endDate, ts: b.ts || 0 })
          })
        }
      }
    } catch {}
    bets.sort((a, b) => b.ts - a.ts)
    return bets
  })

  const allOpenBets = liveBets
  const totalWagered = liveBets.reduce((s, b) => s + b.amount, 0)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      const match = MARKETS.find((m) => m.question.toLowerCase().includes(q.toLowerCase()))
      if (match) setTradeModal(match)
    }
  }, [searchParams])

  const refreshLiveBets = () => {
    const bets = []
    try {
      for (const m of MARKETS) {
        const saved = localStorage.getItem(`stpred-bets-${m.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          Object.entries(parsed).forEach(([key, b]) => {
            const betSide = b.side === 'yes' ? 'Yes' : b.side === 'no' ? 'No' : b.side
            const label = b.label ? `${m.question} — ${b.label}` : m.question
            bets.push({ question: label, side: betSide, amount: b.amount, potentialReturn: b.potentialReturn, endDate: m.endDate, ts: b.ts || 0 })
          })
        }
      }
    } catch {}
    bets.sort((a, b) => b.ts - a.ts)
    setLiveBets(bets)
  }

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const filtered = MARKETS.filter((m) => {
    if (activeCategory !== 'Trending' && activeCategory !== 'New' && m.category !== activeCategory) return false
    if (searchQuery && !m.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Predictions</div>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-muted transition-colors text-text"
                aria-label="Back"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-text">Prediction Markets</h1>
                <p className="text-xs text-text-muted mt-0.5">Simple Yes or No predictions on stocks, crypto & macro</p>
              </div>
            </div>

            {/* Wallet */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setWalletOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-muted transition-colors"
              >
                <img src="/icons/st-coin.png" alt="" className="w-5 h-5 rounded-sm object-contain" />
                <span className="text-sm font-bold text-text">{coinBalance.toLocaleString()}</span>
                <span className="text-[10px] text-text-muted">coins</span>
                <svg className={clsx('w-3.5 h-3.5 text-text-muted transition-transform', walletOpen && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              {walletOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-border bg-surface shadow-xl z-30">
                  {/* Wallet stats */}
                  <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-text">{coinBalance.toLocaleString()}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Balance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-amber-500">{totalWagered.toLocaleString()}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Wagered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-success">{allOpenBets.length}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border">
                    {['open', 'closed'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setWalletTab(tab)}
                        className={clsx(
                          'flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2',
                          walletTab === tab ? 'text-text border-primary' : 'text-text-muted border-transparent hover:text-text'
                        )}
                      >
                        {tab} ({tab === 'open' ? allOpenBets.length : CLOSED_BETS.length})
                      </button>
                    ))}
                  </div>

                  {/* Bet list */}
                  <div className="max-h-[280px] overflow-y-auto">
                    {walletTab === 'open' ? (
                      allOpenBets.map((bet, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text truncate">{bet.question}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', bet.side === 'Yes' ? 'bg-green-100 dark:bg-green-950/30 text-success' : 'bg-red-100 dark:bg-red-950/30 text-danger')}>{bet.side}</span>
                              <span className="text-[10px] text-text-muted">⏱ {bet.endDate}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-text">{bet.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-success">→ {bet.potentialReturn.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      CLOSED_BETS.map((bet, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text truncate">{bet.question}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', bet.side === 'Yes' ? 'bg-green-100 dark:bg-green-950/30 text-success' : 'bg-red-100 dark:bg-red-950/30 text-danger')}>{bet.side}</span>
                              <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', bet.result === 'Won' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}>{bet.result}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-text">{bet.amount.toLocaleString()}</p>
                            <p className={clsx('text-[10px] font-bold', bet.result === 'Won' ? 'text-success' : 'text-danger')}>
                              {bet.result === 'Won' ? `+${bet.payout.toLocaleString()}` : `-${bet.amount.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  activeCategory === cat
                    ? 'bg-text text-background'
                    : 'bg-surface border border-border text-text hover:bg-surface-muted'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of market cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((market) => (
              <MarketCard key={market.id} market={market} onOpenTrade={setTradeModal} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg font-medium">No markets found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </div>
      </main>

      {/* Trade modal */}
      {tradeModal && (
        <TradeModal
          market={tradeModal}
          onClose={() => setTradeModal(null)}
          onBetPlaced={refreshLiveBets}
          coinBalance={coinBalance}
          onDeductCoins={(amount) => {
            setCoinBalance((prev) => {
              const next = Math.max(0, prev - amount)
              setStoredBalance(next)
              return next
            })
          }}
        />
      )}
    </div>
  )
}
