import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTickerLogo } from '../constants/tickerLogos.js'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { useTickerTape } from '../contexts/TickerTapeContext.jsx'
import IOSBottomNav from '../components/IOSBottomNav.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

/* ──────────── SCREENER DATA ──────────── */
const SCREENER_ROWS = [
  { rank: 1, ticker: 'HOOD', name: 'Robinhood Market...', price: 90.25, pctChange: -9.24, volume: '59.74M', volumeNum: 59.74e6, watchers: '112.30K', watchersNum: 112300, followers: '94.20K', followersNum: 94200, sentiment: 'bearish', sentimentScore: -100, marketCap: '$89.45B', marketCapNum: 89.45e9, type: 'equity', spark: [92, 91, 90.5, 91, 90.2, 89.8, 90, 90.25] },
  { rank: 2, ticker: 'XRP', name: 'Ripple', price: 2.34, pctChange: 8.33, volume: '5.60B', volumeNum: 5.6e9, watchers: '278.00K', watchersNum: 278000, followers: '456.00K', followersNum: 456000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$134.00B', marketCapNum: 134e9, type: 'crypto', spark: [2.1, 2.15, 2.2, 2.25, 2.28, 2.32, 2.33, 2.34] },
  { rank: 3, ticker: 'PLTR', name: 'Palantir', price: 158.06, pctChange: 7.77, volume: '72.81M', volumeNum: 72.81e6, watchers: '145.20K', watchersNum: 145200, followers: '89.50K', followersNum: 89500, sentiment: 'bullish', sentimentScore: 100, marketCap: '$349.39B', marketCapNum: 349.39e9, type: 'equity', spark: [145, 148, 152, 154, 156, 157, 157.5, 158.06] },
  { rank: 4, ticker: 'DOGE', name: 'Dogecoin', price: 0.1842, pctChange: 7.22, volume: '2.10B', volumeNum: 2.1e9, watchers: '342.00K', watchersNum: 342000, followers: '890.00K', followersNum: 890000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$26.50B', marketCapNum: 26.5e9, type: 'crypto', spark: [0.17, 0.171, 0.175, 0.178, 0.18, 0.182, 0.183, 0.1842] },
  { rank: 5, ticker: 'BTC', name: 'Bitcoin', price: 97842.50, pctChange: 2.25, volume: '45.20B', volumeNum: 45.2e9, watchers: '892.00K', watchersNum: 892000, followers: '1.25M', followersNum: 1.25e6, sentiment: 'bullish', sentimentScore: 100, marketCap: '$1.92T', marketCapNum: 1.92e12, type: 'crypto', spark: [95500, 96000, 96500, 97000, 97200, 97600, 97800, 97842.5] },
  { rank: 6, ticker: 'ETH', name: 'Ethereum', price: 3245.80, pctChange: -2.67, volume: '18.90B', volumeNum: 18.9e9, watchers: '645.00K', watchersNum: 645000, followers: '890.00K', followersNum: 890000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$390.00B', marketCapNum: 390e9, type: 'crypto', spark: [3320, 3300, 3280, 3260, 3255, 3248, 3246, 3245.8] },
  { rank: 7, ticker: 'TSLA', name: 'Tesla Inc', price: 248.92, pctChange: -4.76, volume: '92.30M', volumeNum: 92.3e6, watchers: '485.00K', watchersNum: 485000, followers: '620.00K', followersNum: 620000, sentiment: 'bearish', sentimentScore: -100, marketCap: '$792.00B', marketCapNum: 792e9, type: 'equity', spark: [260, 255, 252, 250, 249, 248.5, 249, 248.92] },
  { rank: 8, ticker: 'AAPL', name: 'Apple Inc', price: 178.25, pctChange: 1.05, volume: '58.20M', volumeNum: 58.2e6, watchers: '425.00K', watchersNum: 425000, followers: '520.00K', followersNum: 520000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$2.78T', marketCapNum: 2.78e12, type: 'equity', spark: [176, 176.5, 177, 177.5, 177.8, 178, 178.2, 178.25] },
  { rank: 9, ticker: 'NVDA', name: 'NVIDIA Corp', price: 128.34, pctChange: 3.42, volume: '82.10M', volumeNum: 82.1e6, watchers: '520.00K', watchersNum: 520000, followers: '680.00K', followersNum: 680000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$3.10T', marketCapNum: 3.1e12, type: 'equity', spark: [120, 121, 123, 125, 124, 126, 127, 128.34] },
  { rank: 10, ticker: 'SOL', name: 'Solana', price: 178.45, pctChange: 5.18, volume: '3.80B', volumeNum: 3.8e9, watchers: '198.00K', watchersNum: 198000, followers: '310.00K', followersNum: 310000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$84.00B', marketCapNum: 84e9, type: 'crypto', spark: [165, 168, 170, 172, 174, 176, 177, 178.45] },
]

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'mostActive', label: 'Most Active' },
  { key: 'watchers', label: 'Watchers' },
  { key: 'mostBullish', label: 'Most Bullish' },
  { key: 'mostBearish', label: 'Most Bearish' },
  { key: 'topGainers', label: 'Top Gainers' },
  { key: 'topLosers', label: 'Top Losers' },
]

const COLUMN_DEFS = [
  { id: 'rank', label: '#', locked: true },
  { id: 'symbol', label: 'Symbol', locked: true },
  { id: 'chart', label: 'Chart' },
  { id: 'lastPrice', label: 'Price' },
  { id: 'pctChange', label: '24h %' },
  { id: 'volume', label: 'Volume' },
  { id: 'watchers', label: 'Watchers' },
  { id: 'followers', label: 'Followers' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'marketCap', label: 'Mkt Cap' },
]
const DEFAULT_COLS = ['rank', 'symbol', 'chart', 'lastPrice', 'pctChange', 'volume', 'watchers', 'sentiment', 'marketCap']

const parseNum = (s) => {
  if (typeof s === 'number') return s
  const m = String(s).match(/^([\d.]+)([KMBT])?$/)
  if (!m) return 0
  let n = parseFloat(m[1])
  const u = m[2]
  if (u === 'K') n *= 1e3; else if (u === 'M') n *= 1e6; else if (u === 'B') n *= 1e9; else if (u === 'T') n *= 1e12
  return n
}

/* ──────────── HEATMAP DATA ──────────── */
const HEATMAP_DATA = [
  { ticker: 'NVDA', sector: 'Technology', pctChange: -0.75, marketCapNum: 3100e9 },
  { ticker: 'AAPL', sector: 'Technology', pctChange: -0.30, marketCapNum: 2780e9 },
  { ticker: 'MSFT', sector: 'Technology', pctChange: -0.06, marketCapNum: 2900e9 },
  { ticker: 'AVGO', sector: 'Technology', pctChange: -1.04, marketCapNum: 800e9 },
  { ticker: 'AMD', sector: 'Technology', pctChange: -1.11, marketCapNum: 280e9 },
  { ticker: 'PLTR', sector: 'Technology', pctChange: -2.39, marketCapNum: 250e9 },
  { ticker: 'GOOGL', sector: 'Communication', pctChange: -1.78, marketCapNum: 2000e9 },
  { ticker: 'META', sector: 'Communication', pctChange: -0.94, marketCapNum: 1200e9 },
  { ticker: 'NFLX', sector: 'Communication', pctChange: 0.90, marketCapNum: 300e9 },
  { ticker: 'AMZN', sector: 'Consumer', pctChange: -0.83, marketCapNum: 1850e9 },
  { ticker: 'TSLA', sector: 'Consumer', pctChange: 1.87, marketCapNum: 792e9 },
  { ticker: 'WMT', sector: 'Consumer', pctChange: -1.75, marketCapNum: 490e9 },
  { ticker: 'LLY', sector: 'Healthcare', pctChange: -1.90, marketCapNum: 750e9 },
  { ticker: 'JNJ', sector: 'Healthcare', pctChange: -0.14, marketCapNum: 400e9 },
  { ticker: 'JPM', sector: 'Financials', pctChange: -1.24, marketCapNum: 550e9 },
  { ticker: 'V', sector: 'Financials', pctChange: 0.78, marketCapNum: 550e9 },
  { ticker: 'HOOD', sector: 'Financials', pctChange: -9.24, marketCapNum: 89e9 },
  { ticker: 'BTC', sector: 'Digital Assets', pctChange: 2.25, marketCapNum: 1920e9 },
  { ticker: 'ETH', sector: 'Digital Assets', pctChange: -2.67, marketCapNum: 390e9 },
  { ticker: 'XRP', sector: 'Digital Assets', pctChange: 8.33, marketCapNum: 134e9 },
  { ticker: 'DOGE', sector: 'Digital Assets', pctChange: 7.22, marketCapNum: 26e9 },
  { ticker: 'XOM', sector: 'Energy', pctChange: 0.25, marketCapNum: 440e9 },
  { ticker: 'CVX', sector: 'Energy', pctChange: -0.20, marketCapNum: 280e9 },
]

/* ──────────── TOPICS DATA ──────────── */
const TOPICS_DATA = [
  { id: 'datacenter', label: 'Data Center Demand', count: 52300, color: '#6366f1', symbols: ['NVDA', 'AMD', 'AVGO'] },
  { id: 'aicapex', label: 'AI Capex', count: 44600, color: '#06b6d4', symbols: ['NVDA', 'AMD', 'MSFT', 'GOOGL'] },
  { id: 'robotaxi', label: 'Robotaxi Dreams', count: 41200, color: '#22c55e', symbols: ['TSLA', 'NVDA', 'GOOGL'] },
  { id: 'blackwell', label: 'Blackwell Ramp', count: 38100, color: '#8b5cf6', symbols: ['NVDA', 'AMD'] },
  { id: 'earningsbeat', label: 'Earnings Beat', count: 35200, color: '#f59e0b', symbols: ['NVDA', 'AAPL', 'AMZN'] },
  { id: 'aws', label: 'AWS Reacceleration', count: 31500, color: '#f97316', symbols: ['AMZN', 'MSFT', 'GOOGL'] },
  { id: 'merging', label: 'Merging Ambitions', count: 28400, color: '#ef4444', symbols: ['TSLA'] },
  { id: 'mi300', label: 'MI300 Adoption', count: 26800, color: '#3b82f6', symbols: ['AMD', 'NVDA'] },
  { id: 'services', label: 'Services Growth', count: 22500, color: '#a855f7', symbols: ['AAPL', 'GOOGL'] },
  { id: 'dcshare', label: 'Data Center Share', count: 20100, color: '#6d28d9', symbols: ['AMD', 'NVDA', 'AVGO'] },
  { id: 'volatilerange', label: 'Volatile Range', count: 19600, color: '#fb923c', symbols: ['TSLA', 'GME'] },
  { id: 'china', label: 'China Sales', count: 18200, color: '#ec4899', symbols: ['AAPL', 'TSLA'] },
]

/* ──────────── WHO TO FOLLOW DATA ──────────── */
const WTF_CATEGORIES = ['All', 'Influencer', 'Day Trader', 'Analyst', 'Crypto', 'Options', 'Swing Trader']
const WTF_PEOPLE = [
  { handle: 'howardlindzon', name: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', bio: 'Co-Founder & CEO @Stocktwits', followers: '376.2K', category: 'Influencer', verified: true },
  { handle: 'Steeletwits', name: 'Michele Steele', avatar: '/avatars/michele-steele.png', bio: 'Head of Content @Stocktwits', followers: '42.1K', category: 'Influencer', verified: true },
  { handle: 'FinanceBuzz', name: 'Finance Buzz', avatar: '/avatars/who-follow-3.png', bio: 'Breaking down market events', followers: '112.4K', category: 'Influencer', verified: true },
  { handle: 'MarketVibes', name: 'Market Vibes', avatar: '/avatars/who-follow-4.png', bio: 'Daily market recaps and pre-market analysis', followers: '89.7K', category: 'Influencer', verified: false },
  { handle: 'rosscameron', name: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', bio: 'Founder @WarriorTrading. Day trading educator.', followers: '128.5K', category: 'Day Trader', verified: true },
  { handle: 'ScalpKing', name: 'Scalp King', avatar: '/avatars/top-voice-3.png', bio: 'ES and NQ futures scalper', followers: '34.8K', category: 'Day Trader', verified: false },
  { handle: 'GapTrader', name: 'Gap Trader', avatar: '/avatars/who-follow-2.png', bio: 'Gap-and-go specialist', followers: '19.2K', category: 'Day Trader', verified: false },
  { handle: 'michaelbolling', name: 'Michael Bolling', avatar: '/avatars/michael-bolling.png', bio: 'VP of Content @Stocktwits', followers: '85.3K', category: 'Analyst', verified: true },
  { handle: 'EarningsEdge', name: 'Earnings Edge', avatar: '/avatars/top-voice-2.png', bio: 'Deep-dive earnings analysis', followers: '38.1K', category: 'Analyst', verified: false },
  { handle: 'CryptoKing', name: 'Crypto King', avatar: '/avatars/who-follow-1.png', bio: 'Full-time crypto trader since 2017', followers: '52.8K', category: 'Crypto', verified: false },
  { handle: 'DeFiDegen', name: 'DeFi Degen', avatar: '/avatars/top-voice-3.png', bio: 'Yield farming, liquidity pools, on-chain', followers: '38.5K', category: 'Crypto', verified: false },
  { handle: 'OptionsFlow', name: 'Options Flow', avatar: '/avatars/top-voice-1.png', bio: 'Real-time unusual options activity', followers: '67.1K', category: 'Options', verified: false },
  { handle: 'ThetaGang', name: 'Theta Gang', avatar: '/avatars/who-follow-2.png', bio: 'Premium selling specialist. Wheel strategy.', followers: '41.2K', category: 'Options', verified: false },
  { handle: 'MomentumKing', name: 'Momentum King', avatar: '/avatars/who-follow-2.png', bio: 'Swing trading momentum setups', followers: '31.6K', category: 'Swing Trader', verified: false },
  { handle: 'SwingSetups', name: 'Swing Setups', avatar: '/avatars/top-voice-1.png', bio: 'Multi-day holds based on weekly charts', followers: '22.8K', category: 'Swing Trader', verified: false },
  { handle: 'TrendRider', name: 'Trend Rider', avatar: '/avatars/ross-cameron.png', bio: 'Riding trends until they bend', followers: '19.5K', category: 'Swing Trader', verified: false },
  { handle: 'WallStWolf', name: 'Wall St Wolf', avatar: '/avatars/top-voice-1.png', bio: 'Former hedge fund PM turned creator', followers: '205.8K', category: 'Influencer', verified: true },
  { handle: 'AIBull', name: 'AI Bull', avatar: '/avatars/top-voice-1.png', bio: 'Full-time AI/semiconductor analyst', followers: '18.7K', category: 'Analyst', verified: false },
  { handle: 'BTCMaxi', name: 'BTC Maxi', avatar: '/avatars/top-voice-1.png', bio: 'Bitcoin-only conviction', followers: '73.6K', category: 'Crypto', verified: false },
  { handle: '0DTEWarrior', name: '0DTE Warrior', avatar: '/avatars/who-follow-4.png', bio: 'Zero-days-to-expiration specialist', followers: '47.2K', category: 'Options', verified: false },
]

/* ──────────── SENTIMENT DATA ──────────── */
const SENTIMENT_DATA = {
  dates: ['1/14','1/15','1/16','1/17','1/18','1/20','1/21','1/22','1/23','1/24','1/25','1/26','1/27','1/28','1/29','1/30','1/31','2/1','2/3','2/4','2/5','2/6','2/7','2/8','2/9'],
  sentiment: [1.02,1.0,1.01,1.05,1.08,1.1,1.12,1.14,1.18,1.28,1.32,1.28,1.24,1.18,1.15,1.2,1.18,1.12,1.08,1.05,1.02,1.08,1.12,1.14,1.18],
  spy: [0.52,0.48,0.45,0.5,0.54,0.58,0.62,0.65,0.68,0.72,0.74,0.76,0.78,0.8,0.82,0.84,0.86,0.88,0.85,0.87,0.9,0.92,0.94,0.96,0.98],
}

/* ──────────── Mini sparkline ──────────── */
function MiniSpark({ values, isUp }) {
  const w = 60, h = 22, pad = 2
  const min = Math.min(...values), max = Math.max(...values)
  const range = Math.max(1, max - min)
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-14 h-5 shrink-0">
      <polyline fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="1.5" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ──────────── Squarified treemap layout ──────────── */
function squarifyLayout(items, rect) {
  if (items.length === 0) return []
  if (items.length === 1) return [{ ...items[0], x: rect.x, y: rect.y, w: rect.w, h: rect.h }]
  const total = items.reduce((s, d) => s + d.value, 0)
  if (total <= 0) return []
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const results = []
  let remaining = sorted
  let cur = { ...rect }
  while (remaining.length > 0) {
    const isWide = cur.w >= cur.h
    const side = isWide ? cur.h : cur.w
    const remTotal = remaining.reduce((s, d) => s + d.value, 0)
    const area = cur.w * cur.h
    let row = [remaining[0]]
    let rowVal = remaining[0].value
    let best = worstAR(row, rowVal, side, area, remTotal)
    for (let i = 1; i < remaining.length; i++) {
      const next = [...row, remaining[i]]
      const nextVal = rowVal + remaining[i].value
      const w = worstAR(next, nextVal, side, area, remTotal)
      if (w <= best) { row = next; rowVal = nextVal; best = w } else break
    }
    const rowArea = (rowVal / remTotal) * area
    const rowLen = rowArea / side
    let off = 0
    for (const item of row) {
      const itemLen = (item.value / rowVal) * side
      if (isWide) results.push({ ...item, x: cur.x, y: cur.y + off, w: rowLen, h: itemLen })
      else results.push({ ...item, x: cur.x + off, y: cur.y, w: itemLen, h: rowLen })
      off += itemLen
    }
    if (isWide) cur = { x: cur.x + rowLen, y: cur.y, w: cur.w - rowLen, h: cur.h }
    else cur = { x: cur.x, y: cur.y + rowLen, w: cur.w, h: cur.h - rowLen }
    remaining = remaining.slice(row.length)
  }
  return results
}
function worstAR(row, rowVal, side, totalArea, totalVal) {
  const rArea = (rowVal / totalVal) * totalArea
  const rLen = rArea / side
  let worst = 0
  for (const item of row) {
    const iLen = (item.value / rowVal) * side
    worst = Math.max(worst, Math.max(rLen / Math.max(0.01, iLen), iLen / Math.max(0.01, rLen)))
  }
  return worst
}

function getHeatColor(pct) {
  if (pct < 0) {
    const s = Math.min(1, Math.abs(pct) / 10)
    return `rgb(${Math.round(30 + 195 * s)}, ${Math.round(20 + 10 * (1 - s))}, ${Math.round(20 + 10 * (1 - s))})`
  }
  const s = Math.min(1, pct / 10)
  return `rgb(${Math.round(20 + 10 * (1 - s))}, ${Math.round(30 + 170 * s)}, ${Math.round(20 + 10 * (1 - s))})`
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function IOSTools() {
  const navigate = useNavigate()
  const { addSymbol } = useWatchlist()
  const { getQuote } = useLiveQuotesContext()
  const { iosTrending, applyIosTrending, clearIosTrending } = useTickerTape()

  const [activeSection, setActiveSection] = useState('screener')
  const [screenerSort, setScreenerSort] = useState('trending')

  // Screener filters + columns
  const [visibleCols, setVisibleCols] = useState(DEFAULT_COLS)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showColumnsModal, setShowColumnsModal] = useState(false)
  const [advFilters, setAdvFilters] = useState({ priceMin: '', priceMax: '', volumeMin: '', volumeMax: '', marketCapMin: '', marketCapMax: '', watchersMin: '', watchersMax: '', sentimentScore: 0 })
  const [appliedFilters, setAppliedFilters] = useState(null)

  // Who to follow
  const [wtfCat, setWtfCat] = useState('All')
  const [followed, setFollowed] = useState(new Set())

  // Sentiment
  const [showSpy, setShowSpy] = useState(true)

  const SECTIONS = [
    { id: 'screener', label: 'Screener' },
    { id: 'heatmaps', label: 'Heatmaps' },
    { id: 'topics', label: 'Topics' },
    { id: 'whoToFollow', label: 'Who to Follow' },
    { id: 'sentiment', label: 'Sentiment' },
  ]

  /* ── Screener sort/filter ── */
  const sortedRows = useMemo(() => {
    let rows = [...SCREENER_ROWS].map((r) => {
      const q = getQuote(r.ticker)
      if (q) return { ...r, price: q.price, pctChange: q.changePercent ?? r.pctChange }
      return r
    })
    if (appliedFilters) {
      const f = appliedFilters
      if (f.priceMin !== '') rows = rows.filter((r) => r.price >= parseFloat(f.priceMin))
      if (f.priceMax !== '') rows = rows.filter((r) => r.price <= parseFloat(f.priceMax))
      if (f.volumeMin !== '') rows = rows.filter((r) => r.volumeNum >= parseNum(f.volumeMin))
      if (f.volumeMax !== '') rows = rows.filter((r) => r.volumeNum <= parseNum(f.volumeMax))
      if (f.marketCapMin !== '') rows = rows.filter((r) => (r.marketCapNum || 0) >= parseNum(f.marketCapMin))
      if (f.marketCapMax !== '') rows = rows.filter((r) => (r.marketCapNum || 0) <= parseNum(f.marketCapMax))
      if (f.watchersMin !== '') rows = rows.filter((r) => r.watchersNum >= parseNum(f.watchersMin))
      if (f.watchersMax !== '') rows = rows.filter((r) => r.watchersNum <= parseNum(f.watchersMax))
      if (f.sentimentScore && f.sentimentScore !== 0) rows = rows.filter((r) => f.sentimentScore > 0 ? r.sentimentScore >= f.sentimentScore : r.sentimentScore <= f.sentimentScore)
    }
    if (screenerSort === 'topGainers') rows.sort((a, b) => b.pctChange - a.pctChange)
    else if (screenerSort === 'topLosers') rows.sort((a, b) => a.pctChange - b.pctChange)
    else if (screenerSort === 'mostActive') rows.sort((a, b) => b.volumeNum - a.volumeNum)
    else if (screenerSort === 'watchers') rows.sort((a, b) => b.watchersNum - a.watchersNum)
    else if (screenerSort === 'mostBullish') rows.sort((a, b) => b.sentimentScore - a.sentimentScore)
    else if (screenerSort === 'mostBearish') rows.sort((a, b) => a.sentimentScore - b.sentimentScore)
    else rows.sort((a, b) => a.rank - b.rank)
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [getQuote, appliedFilters, screenerSort])

  /* ── Heatmap tiles ── */
  const heatTiles = useMemo(() => {
    const W = 400, H = 300, LBL_H = 16
    const sectorMap = new Map()
    HEATMAP_DATA.forEach((d) => {
      if (!sectorMap.has(d.sector)) sectorMap.set(d.sector, [])
      sectorMap.get(d.sector).push(d)
    })
    const sectors = Array.from(sectorMap.entries()).map(([name, items]) => ({
      name, items, value: items.reduce((s, d) => s + d.marketCapNum, 0),
    }))
    const sectorRects = squarifyLayout(
      sectors.map((s) => ({ id: s.name, value: s.value })),
      { x: 0, y: 0, w: W, h: H }
    )
    const all = []
    sectorRects.forEach((sr) => {
      const sec = sectors.find((s) => s.name === sr.id)
      if (!sec) return
      all.push({ type: 'sector', name: sr.id, x: sr.x, y: sr.y, w: sr.w, h: sr.h })
      const inner = { x: sr.x + 1, y: sr.y + LBL_H, w: sr.w - 2, h: sr.h - LBL_H - 1 }
      if (inner.w <= 0 || inner.h <= 0) return
      const stockRects = squarifyLayout(
        sec.items.map((d) => ({ id: d.ticker, value: d.marketCapNum, data: d })),
        inner
      )
      stockRects.forEach((t) => all.push({ type: 'stock', ...t }))
    })
    return { tiles: all, W, H }
  }, [])

  /* ── Topics bubbles (simple grid for mobile) ── */
  const topicsSorted = useMemo(() => [...TOPICS_DATA].sort((a, b) => b.count - a.count), [])

  /* ── Who to follow filtered ── */
  const wtfFiltered = useMemo(() => {
    return wtfCat === 'All' ? WTF_PEOPLE : WTF_PEOPLE.filter((u) => u.category === wtfCat)
  }, [wtfCat])

  const toggleFollow = (handle) => {
    setFollowed((prev) => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  /* ── Sentiment chart ── */
  const sentimentChart = useMemo(() => {
    const W = 380, H = 200, PAD = { top: 20, right: 40, bottom: 30, left: 10 }
    const cW = W - PAD.left - PAD.right
    const cH = H - PAD.top - PAD.bottom
    const yMin = 0.3, yMax = 1.5, yRange = yMax - yMin
    const toX = (i) => PAD.left + (i / (SENTIMENT_DATA.dates.length - 1)) * cW
    const toY = (v) => PAD.top + (1 - (v - yMin) / yRange) * cH
    const sentPath = SENTIMENT_DATA.sentiment.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
    const spyPath = SENTIMENT_DATA.spy.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
    const labelStep = Math.max(1, Math.floor(SENTIMENT_DATA.dates.length / 6))
    return { W, H, PAD, cW, cH, yMin, yMax, toX, toY, sentPath, spyPath, labelStep }
  }, [])

  return (
    <div className="mx-auto max-w-[430px] h-screen flex flex-col overflow-hidden bg-black text-white relative">

      {/* ── iOS Status Bar ── */}
      <div className="shrink-0 flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M1 9l2 2c3.9-3.9 10.1-3.9 14 0l2-2C14.1 4.1 5.9 4.1 1 9zm8 8l3 3 3-3a4.2 4.2 0 00-6 0zm-4-4l2 2a7 7 0 019.9 0l2-2C14.1 8.1 9.9 8.1 5 13z" /></svg>
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M2 22h20V2z" opacity="0.3" /><path d="M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z" /></svg>
          <div className="flex items-center gap-px">
            <div className="w-6 h-3 rounded-sm border border-white/40 relative overflow-hidden">
              <div className="absolute inset-y-0.5 left-0.5 right-1 bg-white rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Nav ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10">
        <button type="button" onClick={() => navigate('/homeios')} className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <span className="text-base font-bold">Social Tools</span>
        <div className="w-6" />
      </div>

      {/* ── Section Tabs ── */}
      <div className="shrink-0 flex overflow-x-auto border-b border-white/10" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={clsx(
              'flex-none px-4 py-2.5 text-sm font-semibold text-center transition-colors border-b-2 whitespace-nowrap',
              activeSection === sec.id
                ? 'text-white border-white'
                : 'text-white/40 border-transparent'
            )}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ══════ SCREENER ══════ */}
        {activeSection === 'screener' && (
          <div className="py-3 space-y-3">
            {/* Sort tabs — horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-3 pb-1" style={{ scrollbarWidth: 'none' }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setScreenerSort(opt.key)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition-colors',
                    screenerSort === opt.key
                      ? 'bg-[#2196F3] text-white'
                      : 'bg-white/10 text-white/50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filters + Columns buttons */}
            <div className="flex items-center gap-2 px-3">
              <button
                type="button"
                onClick={() => setShowFiltersModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 bg-white/5 text-white/70"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters{appliedFilters ? ' ●' : ''}
              </button>
              <button
                type="button"
                onClick={() => setShowColumnsModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 bg-white/5 text-white/70"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Columns
              </button>
              <button
                type="button"
                onClick={() => {
                  const tickers = sortedRows.map((r) => ({
                    ticker: r.ticker,
                    name: r.name,
                    price: r.price,
                    pct: r.pctChange,
                    spark: r.spark || [r.price * 0.97, r.price * 0.98, r.price * 0.99, r.price, r.price * 1.01, r.price * 0.995, r.price * 1.005, r.price],
                  }))
                  applyIosTrending(tickers)
                  navigate('/homeios')
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2196F3] text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                Apply to Trending
              </button>
              {(appliedFilters || iosTrending) && (
                <button type="button" onClick={() => { setAppliedFilters(null); setAdvFilters({ priceMin: '', priceMax: '', volumeMin: '', volumeMax: '', marketCapMin: '', marketCapMax: '', watchersMin: '', watchersMax: '', sentimentScore: 0 }); clearIosTrending() }} className="text-[10px] text-red-400 font-medium ml-auto">
                  Clear{appliedFilters ? ' filters' : ''}{appliedFilters && iosTrending ? ' &' : ''}{iosTrending ? ' trending' : ''}
                </button>
              )}
            </div>

            {/* Horizontally scrollable table */}
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <table className="text-xs" style={{ minWidth: visibleCols.length * 85 }}>
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    {visibleCols.map((colId) => {
                      const def = COLUMN_DEFS.find((c) => c.id === colId)
                      if (!def) return null
                      const isLeft = colId === 'rank' || colId === 'symbol'
                      return (
                        <th key={colId} className={clsx('py-2 px-2.5 font-medium whitespace-nowrap', isLeft ? 'text-left' : 'text-right')}>
                          {def.label}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r) => {
                    const up = r.pctChange >= 0
                    return (
                      <tr key={r.ticker} className="border-b border-white/5 active:bg-white/5">
                        {visibleCols.map((colId) => {
                          if (colId === 'rank') return <td key={colId} className="py-2.5 px-2.5 text-white/40">{r.rank}</td>
                          if (colId === 'symbol') return (
                            <td key={colId} className="py-2.5 px-2.5">
                              <div className="flex items-center gap-2">
                                {getTickerLogo(r.ticker) ? (
                                  <img src={getTickerLogo(r.ticker)} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold shrink-0">{r.ticker[0]}</div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-semibold text-white">{r.ticker}</div>
                                  <div className="text-[10px] text-white/40 truncate max-w-[70px]">{r.name}</div>
                                </div>
                              </div>
                            </td>
                          )
                          if (colId === 'chart') return <td key={colId} className="py-2.5 px-2.5 text-right"><MiniSpark values={r.spark} isUp={up} /></td>
                          if (colId === 'lastPrice') return (
                            <td key={colId} className="py-2.5 px-2.5 text-right font-medium text-white whitespace-nowrap tabular-nums">
                              {r.price >= 1000 ? `$${r.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${r.price.toFixed(2)}`}
                            </td>
                          )
                          if (colId === 'pctChange') return (
                            <td key={colId} className={clsx('py-2.5 px-2.5 text-right font-semibold whitespace-nowrap tabular-nums', up ? 'text-green-400' : 'text-red-400')}>
                              {up ? '+' : ''}{r.pctChange.toFixed(2)}%
                            </td>
                          )
                          if (colId === 'volume') return <td key={colId} className="py-2.5 px-2.5 text-right text-white/50 whitespace-nowrap tabular-nums">{r.volume}</td>
                          if (colId === 'watchers') return <td key={colId} className="py-2.5 px-2.5 text-right text-white/50 whitespace-nowrap tabular-nums">{r.watchers}</td>
                          if (colId === 'followers') return <td key={colId} className="py-2.5 px-2.5 text-right text-white/50 whitespace-nowrap tabular-nums">{r.followers}</td>
                          if (colId === 'sentiment') return (
                            <td key={colId} className="py-2.5 px-2.5 text-right">
                              <span className={clsx(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap',
                                r.sentiment === 'bullish' && 'bg-green-500/20 text-green-400',
                                r.sentiment === 'bearish' && 'bg-red-500/20 text-red-400',
                                r.sentiment === 'neutral' && 'bg-white/10 text-white/50'
                              )}>
                                {r.sentiment}
                              </span>
                            </td>
                          )
                          if (colId === 'marketCap') return <td key={colId} className="py-2.5 px-2.5 text-right text-white/50 whitespace-nowrap tabular-nums">{r.marketCap}</td>
                          return null
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Sentiment summary row */}
            <div className="flex items-center gap-3 px-3 text-[10px] text-white/40">
              <span>Bullish: {sortedRows.filter((r) => r.sentimentScore > 0).length}</span>
              <span>Bearish: {sortedRows.filter((r) => r.sentimentScore < 0).length}</span>
              <span>Neutral: {sortedRows.filter((r) => r.sentimentScore === 0).length}</span>
            </div>
          </div>
        )}

        {/* ══════ HEATMAPS ══════ */}
        {activeSection === 'heatmaps' && (
          <div className="px-3 py-3 space-y-3">
            <p className="text-xs text-white/50">Market cap weighted heatmap colored by 24h price change</p>
            <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#111' }}>
              <svg viewBox={`0 0 ${heatTiles.W} ${heatTiles.H}`} className="w-full">
                {heatTiles.tiles.map((t, idx) => {
                  if (t.type === 'sector') {
                    return (
                      <g key={`sec-${t.name}`}>
                        <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="none" stroke="#333" strokeWidth="1" />
                        <text x={t.x + 3} y={t.y + 12} fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="600">{t.name}</text>
                      </g>
                    )
                  }
                  const d = t.data
                  const bg = getHeatColor(d.pctChange)
                  const show = t.w > 25 && t.h > 18
                  const showVal = t.w > 35 && t.h > 28
                  return (
                    <g key={`stk-${t.id}`}>
                      <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={bg} stroke="#222" strokeWidth="0.5" />
                      {show && (
                        <text
                          x={t.x + t.w / 2} y={t.y + t.h / 2 - (showVal ? 3 : 0)}
                          textAnchor="middle" dominantBaseline="central"
                          fill="white" fontWeight="700" fontSize={t.w > 60 ? 11 : 8}
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                        >
                          {t.id}
                        </text>
                      )}
                      {showVal && (
                        <text
                          x={t.x + t.w / 2} y={t.y + t.h / 2 + 10}
                          textAnchor="middle" dominantBaseline="central"
                          fill="rgba(255,255,255,0.8)" fontSize={t.w > 60 ? 9 : 7}
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                        >
                          {d.pctChange >= 0 ? '+' : ''}{d.pctChange.toFixed(2)}%
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-white/50">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-600" /> Bearish</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-700" /> Neutral</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-600" /> Bullish</span>
            </div>
          </div>
        )}

        {/* ══════ TOPICS ══════ */}
        {activeSection === 'topics' && (
          <div className="px-3 py-3 space-y-3">
            <p className="text-xs text-white/50">Most discussed topics across all symbols</p>
            <div className="space-y-2">
              {topicsSorted.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl p-3 border border-white/10 active:bg-white/5"
                  style={{ borderLeftWidth: 4, borderLeftColor: topic.color }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold">{topic.label}</span>
                    <span className="text-[10px] text-white/40">{(topic.count / 1000).toFixed(1)}K posts</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.symbols.map((sym) => (
                      <span key={sym} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-[#2196F3]">
                        {getTickerLogo(sym) && <img src={getTickerLogo(sym)} alt="" className="w-3 h-3 rounded object-cover" />}
                        ${sym}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => topic.symbols.forEach((sym) => addSymbol(sym, sym))}
                      className="px-2 py-0.5 rounded-md bg-[#2196F3]/15 text-[10px] font-semibold text-[#2196F3]"
                    >
                      + Add All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ WHO TO FOLLOW ══════ */}
        {activeSection === 'whoToFollow' && (
          <div className="px-3 py-3 space-y-3">
            <p className="text-xs text-white/50">Discover traders, analysts, and influencers</p>
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {WTF_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setWtfCat(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors',
                    wtfCat === cat ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/60'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {wtfFiltered.map((user) => {
                const isFollowing = followed.has(user.handle)
                return (
                  <div key={user.handle} className="rounded-xl p-3 border border-white/10">
                    <div className="flex items-start gap-3">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm truncate">{user.name}</span>
                          {user.verified && (
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0">
                              <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40">@{user.handle} · {user.followers} followers</p>
                        <p className="text-[11px] text-white/60 mt-0.5 line-clamp-1">{user.bio}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFollow(user.handle)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors',
                          isFollowing ? 'border border-white/20 text-white/60' : 'bg-[#2196F3] text-white'
                        )}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══════ SENTIMENT INDEX ══════ */}
        {activeSection === 'sentiment' && (
          <div className="px-3 py-3 space-y-3">
            <h2 className="text-base font-bold">Sentiment Index</h2>

            {/* SPY toggle */}
            <button
              type="button"
              onClick={() => setShowSpy((v) => !v)}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                showSpy ? 'border-green-500 bg-green-950/30 text-green-400' : 'border-white/20 text-white/50'
              )}
            >
              <span className={clsx('w-2 h-2 rounded-full', showSpy ? 'bg-green-500' : 'bg-white/20')} />
              SPY Price
            </button>

            {/* Chart */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2 overflow-hidden">
              <svg viewBox={`0 0 ${sentimentChart.W} ${sentimentChart.H}`} className="w-full" style={{ maxHeight: 220 }}>
                {/* Baseline */}
                <line
                  x1={sentimentChart.PAD.left} y1={sentimentChart.toY(1.0)}
                  x2={sentimentChart.W - sentimentChart.PAD.right} y2={sentimentChart.toY(1.0)}
                  stroke="white" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3"
                />
                {/* Grid lines */}
                {[0.6, 0.9, 1.2, 1.5].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={sentimentChart.PAD.left} y1={sentimentChart.toY(tick)}
                      x2={sentimentChart.W - sentimentChart.PAD.right} y2={sentimentChart.toY(tick)}
                      stroke="white" strokeWidth="0.3" opacity="0.15"
                    />
                    <text x={sentimentChart.W - sentimentChart.PAD.right + 5} y={sentimentChart.toY(tick) + 3} fontSize="8" fill="rgba(255,255,255,0.4)">
                      {tick.toFixed(1)}
                    </text>
                  </g>
                ))}
                {/* Date labels */}
                {SENTIMENT_DATA.dates.map((d, i) => {
                  if (i % sentimentChart.labelStep !== 0 && i !== SENTIMENT_DATA.dates.length - 1) return null
                  return (
                    <text key={i} x={sentimentChart.toX(i)} y={sentimentChart.H - 5} fontSize="7" textAnchor="middle" fill="rgba(255,255,255,0.4)">
                      {d}
                    </text>
                  )
                })}
                {/* SPY line */}
                {showSpy && <path d={sentimentChart.spyPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
                {/* Sentiment line */}
                <path d={sentimentChart.sentPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 rounded-full inline-block" />
                Sentiment Index
              </span>
              {showSpy && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-green-500 rounded-full inline-block" />
                  SPY Price
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0 border-t border-dashed border-white/30 inline-block" style={{ width: 12 }} />
                Baseline (1.0)
              </span>
            </div>

            {/* Gauge */}
            <div className="rounded-xl border border-white/10 p-4">
              <div className="text-center mb-2 text-xs text-white/50">Current Sentiment</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">1.18</div>
                  <div className="text-[10px] text-white/40">Slightly Bullish</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-white/80">↑ 0.06</div>
                  <div className="text-[10px] text-white/40">vs last week</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Filters Modal ── */}
      {showFiltersModal && (
        <div className="absolute inset-0 z-50 flex flex-col" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowFiltersModal(false)} />
          <div className="relative mt-auto bg-[#1c1c1e] rounded-t-2xl border-t border-white/10 shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <span className="text-base font-bold text-white">Filters</span>
              <button type="button" onClick={() => setShowFiltersModal(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { label: 'Price', minKey: 'priceMin', maxKey: 'priceMax', placeholder: ['Min', 'Max'] },
                { label: 'Volume', minKey: 'volumeMin', maxKey: 'volumeMax', placeholder: ['e.g. 1M', 'e.g. 100M'] },
                { label: 'Market Cap', minKey: 'marketCapMin', maxKey: 'marketCapMax', placeholder: ['e.g. 1B', 'e.g. 1T'] },
                { label: 'Watchers', minKey: 'watchersMin', maxKey: 'watchersMax', placeholder: ['e.g. 10K', 'e.g. 1M'] },
              ].map((group) => (
                <div key={group.label}>
                  <label className="text-xs text-white/50 mb-1.5 block">{group.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={advFilters[group.minKey]}
                      onChange={(e) => setAdvFilters((p) => ({ ...p, [group.minKey]: e.target.value }))}
                      placeholder={group.placeholder[0]}
                      className="flex-1 text-sm rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3]"
                    />
                    <span className="text-white/30 self-center">–</span>
                    <input
                      type="text"
                      value={advFilters[group.maxKey]}
                      onChange={(e) => setAdvFilters((p) => ({ ...p, [group.maxKey]: e.target.value }))}
                      placeholder={group.placeholder[1]}
                      className="flex-1 text-sm rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#2196F3]"
                    />
                  </div>
                </div>
              ))}
              {/* Sentiment filter */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Sentiment</label>
                <div className="flex gap-2">
                  {[
                    { label: 'All', value: 0 },
                    { label: 'Bullish', value: 50 },
                    { label: 'Bearish', value: -50 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAdvFilters((p) => ({ ...p, sentimentScore: opt.value }))}
                      className={clsx(
                        'flex-1 py-2 rounded-xl text-xs font-semibold transition-colors',
                        advFilters.sentimentScore === opt.value ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-4 py-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => { setAdvFilters({ priceMin: '', priceMax: '', volumeMin: '', volumeMax: '', marketCapMin: '', marketCapMax: '', watchersMin: '', watchersMax: '', sentimentScore: 0 }); setAppliedFilters(null); setShowFiltersModal(false) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => { setAppliedFilters({ ...advFilters }); setShowFiltersModal(false) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#2196F3] text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Columns Modal ── */}
      {showColumnsModal && (
        <div className="absolute inset-0 z-50 flex flex-col" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowColumnsModal(false)} />
          <div className="relative mt-auto bg-[#1c1c1e] rounded-t-2xl border-t border-white/10 shadow-xl flex flex-col max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <span className="text-base font-bold text-white">Columns</span>
              <button type="button" onClick={() => setShowColumnsModal(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {COLUMN_DEFS.map((col) => {
                const active = visibleCols.includes(col.id)
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={col.locked}
                    onClick={() => {
                      if (col.locked) return
                      setVisibleCols((prev) => active ? prev.filter((c) => c !== col.id) : [...prev, col.id])
                    }}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors',
                      col.locked ? 'text-white/30 cursor-not-allowed' : 'text-white',
                      active && !col.locked && 'bg-white/5'
                    )}
                  >
                    <span>{col.label}{col.locked ? ' (locked)' : ''}</span>
                    <div className={clsx(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                      active ? 'border-[#2196F3] bg-[#2196F3]' : 'border-white/30'
                    )}>
                      {active && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-4 py-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#2196F3] text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation ── */}
      <IOSBottomNav />
    </div>
  )
}
