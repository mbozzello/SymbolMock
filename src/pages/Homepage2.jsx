import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import TickerLinkedText from '../components/TickerLinkedText.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function parseWatchers(w) {
  if (typeof w === 'number' && !isNaN(w)) return w
  const s = String(w || '0').replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*[KkMm]?$/i)
  if (m) {
    const n = parseFloat(m[1])
    if (/[Kk]$/.test(s)) return Math.round(n * 1000)
    if (/[Mm]$/.test(s)) return Math.round(n * 1000000)
    return Math.round(n)
  }
  return parseInt(s, 10) || 0
}

function formatNum(n) {
  return Number(n).toLocaleString()
}

const WATCHER_CHUNKS = [2, 5, 10, 3, 5, 8]

const TRENDING_NOW = [
  { ticker: 'TSLA', name: 'Tesla', price: 242.18, pct: 12.4, comments: '12.8K', sentiment: 75, rank: 1, followers: '1,050,370', whyBlurb: 'Cybertruck production ramp and full self-driving rollout are driving the conversation as investors weigh AI and robotaxi timelines against margin pressure, competition in China and Europe, and the path to volume growth—with delivery targets, battery cost curves, and regulatory updates also in focus.' },
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.32, pct: 18.6, comments: '15.2K', sentiment: 82, rank: 2, followers: '1,120,500', whyBlurb: 'Data center AI demand and the Blackwell chip ramp are driving record volume, with analysts debating whether guidance can support current valuations into next year.' },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, pct: -8.2, comments: '8.9K', sentiment: 45, rank: 3, followers: '892,500', whyBlurb: 'China sales and services growth are in focus as the street looks for iPhone stability and whether wearables and software can offset hardware cyclicality.' },
  { ticker: 'AMD', name: 'AMD', price: 156.43, pct: 14.3, comments: '9.2K', sentiment: 78, rank: 4, followers: '445,200', whyBlurb: 'MI300 adoption and data center share gains are in the spotlight with the stock riding momentum from AI build-out and better-than-feared PC and gaming trends.' },
  { ticker: 'AMZN', name: 'Amazon', price: 172.65, pct: 9.7, comments: '6.1K', sentiment: 68, rank: 5, followers: '620,800', whyBlurb: 'AWS reacceleration and advertising growth have reignited interest as margins expand and the market reprices the stock on durable cloud and retail strength.' },
]

/** Featured news preview per symbol (small image + headline for single-line preview) */
const TRENDING_NOW_NEWS = {
  TSLA: { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=120&h=120&fit=crop', headline: 'Tesla Stock Rises Premarket: CEO Elon Musk Pulls The Curtain Back On Semi Truck', slug: 'tsla-breaking-out' },
  NVDA: { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&h=120&fit=crop', headline: 'NVIDIA Data Center Revenue Beats Estimates', slug: null },
  AAPL: { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&h=120&fit=crop', headline: 'Apple Unveils New AI Features at WWDC', slug: null },
  AMD: { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&h=120&fit=crop', headline: 'AMD MI300 Adoption and Data Center Share Gains', slug: null },
  AMZN: { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop', headline: 'AWS Reacceleration and Advertising Growth Reignite Interest', slug: null },
}

/** Popular topic pills per symbol: { emoji, label } */
const POPULAR_TOPICS = {
  TSLA: [
    { emoji: '🚀', label: 'Merging Ambitions' },
    { emoji: '🤖', label: 'Robotaxi Dreams' },
    { emoji: '🚚', label: 'Semi Truck Boost' },
    { emoji: '📊', label: 'Volatile Range' },
  ],
  NVDA: [
    { emoji: '🖥️', label: 'Data Center Demand' },
    { emoji: '🔮', label: 'Blackwell Ramp' },
    { emoji: '📈', label: 'AI Capex' },
    { emoji: '⚡', label: 'Earnings Beat' },
  ],
  AAPL: [
    { emoji: '📱', label: 'Services Growth' },
    { emoji: '🌏', label: 'China Sales' },
    { emoji: '💵', label: 'Capital Return' },
    { emoji: '🔒', label: 'Ecosystem Lock-in' },
  ],
  AMD: [
    { emoji: '🔷', label: 'MI300 Adoption' },
    { emoji: '🏢', label: 'Data Center Share' },
    { emoji: '📊', label: 'Guidance' },
    { emoji: '⚙️', label: 'Execution' },
  ],
  AMZN: [
    { emoji: '☁️', label: 'AWS Reacceleration' },
    { emoji: '📢', label: 'Advertising' },
    { emoji: '📦', label: 'Retail Margins' },
    { emoji: '💰', label: 'Free Cash Flow' },
  ],
}

const STREAM_MESSAGES = {
  NVDA: [
    { id: 1, user: 'AIBull', avatar: '/avatars/top-voice-1.png', body: 'Data center demand is insane. $NVDA guidance will crush again.', time: '2m', comments: 24, reposts: 8, likes: 142, topicIndex: 0 },
    { id: 2, user: 'TechTrader', avatar: '/avatars/top-voice-2.png', body: 'NVDA at $875 and still not expensive given the growth. Holding through earnings.', time: '5m', comments: 18, reposts: 5, likes: 89, topicIndex: 3 },
    { id: 3, user: 'ChipWatcher', avatar: '/avatars/top-voice-3.png', body: 'Blackwell ramp is the real story. Anyone trimming here will regret it.', time: '8m', comments: 31, reposts: 12, likes: 203, topicIndex: 1 },
    { id: 4, user: 'MomentumKing', avatar: '/avatars/howard-lindzon.png', body: '15.2K messages and 82% bullish. Crowd is right on this one.', time: '12m', comments: 9, reposts: 3, likes: 67, topicIndex: 2 },
  ],
  TSLA: [
    { id: 1, user: 'EVBull', avatar: '/avatars/top-voice-1.png', body: 'Cybertruck deliveries ramping. $TSLA demand story intact.', time: '1m', comments: 45, reposts: 11, likes: 278, topicIndex: 2 },
    { id: 2, user: 'ElonFan', avatar: '/avatars/top-voice-2.png', body: 'FSD rollout accelerating. This is the year Tesla becomes an AI company.', time: '4m', comments: 62, reposts: 19, likes: 391, topicIndex: 1 },
    { id: 3, user: 'AutoAnalyst', avatar: '/avatars/top-voice-3.png', body: 'Margins holding up better than expected. Long $TSLA.', time: '7m', comments: 22, reposts: 6, likes: 134, topicIndex: 3 },
  ],
  AAPL: [
    { id: 1, user: 'AppleLong', avatar: '/avatars/top-voice-1.png', body: 'Services growth is the real margin story. $AAPL underrated here.', time: '3m', comments: 15, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 2, user: 'ValueMind', avatar: '/avatars/top-voice-2.png', body: 'China weakness priced in. Buying the dip.', time: '6m', comments: 28, reposts: 7, likes: 156, topicIndex: 1 },
  ],
  AMD: [
    { id: 1, user: 'ChipFan', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption ramping. $AMD taking share from NVDA in some segments.', time: '2m', comments: 19, reposts: 6, likes: 112, topicIndex: 0 },
    { id: 2, user: 'DataCenterBull', avatar: '/avatars/top-voice-2.png', body: '78% bullish and for good reason. AMD execution has been stellar.', time: '5m', comments: 11, reposts: 2, likes: 74, topicIndex: 3 },
  ],
  AMZN: [
    { id: 1, user: 'CloudBull', avatar: '/avatars/top-voice-1.png', body: 'AWS growth reaccelerating. $AMZN still cheap vs growth.', time: '4m', comments: 33, reposts: 9, likes: 187, topicIndex: 0 },
    { id: 2, user: 'RetailWatcher', avatar: '/avatars/top-voice-2.png', body: 'Ads and cloud driving margins. This is a hold for the long term.', time: '9m', comments: 7, reposts: 1, likes: 52, topicIndex: 1 },
  ],
}

const TRENDING_SYMBOLS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', watchers: '1.1M+', price: 889.42, change: 21.79, pct: 2.45, sentiment: 78, sentimentLabel: 'Extremely Bullish', bullTag: 'Data Center Demand', bearTag: 'Valuation', spark: [860, 865, 870, 875, 880, 885, 888, 889] },
  { ticker: 'AAPL', name: 'Apple Inc.', watchers: '892.5K+', price: 182.51, change: -1.5, pct: -0.82, sentiment: 48, sentimentLabel: 'Neutral', bullTag: 'Services', bearTag: 'China', spark: [184, 183.5, 183, 182.8, 182.5, 182.3, 182.6, 182.51], hasEarnings: true, earningsLabel: "Q4'25 Earnings", earningsCount: 2362 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', watchers: '756', price: 201.12, change: 6.46, pct: 3.21, sentiment: 65, sentimentLabel: 'Bullish', bullTag: 'Cybertruck', bearTag: 'EV Competition', spark: [194, 195, 196, 197, 198, 199, 200, 201] },
]

const WATCHLIST_PREVIEW = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 889.42, change: 21.79 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 182.51, change: -1.5 },
]

const MARKET_CARDS = [
  { symbol: 'SPY', price: 609.98, change: -5.23, pct: -0.85, sentiment: 62, sentimentLabel: 'BULLISH', topTopic: 'Metals Nosedive', topTopicIcon: 'medal' },
  { symbol: 'QQQ', price: 523.41, change: -6.12, pct: -1.16, sentiment: 58, sentimentLabel: 'BULLISH', topTopic: 'New Fed Chair', topTopicIcon: 'chair' },
  { symbol: 'BITCOIN', price: 97234.5, change: 1245.2, pct: 1.3, sentiment: 71, sentimentLabel: 'BULLISH', topTopic: 'ETF Flows', topTopicIcon: 'chart' },
  { symbol: 'GLD', price: 2654.8, change: -8.4, pct: -0.32, sentiment: 48, sentimentLabel: 'NEUTRAL', topTopic: 'Rate Cuts', topTopicIcon: 'scissors' },
  { symbol: 'VIX', price: 18.52, change: 1.64, pct: 9.72, sentiment: 35, sentimentLabel: 'BEARISH', topTopic: 'Volatility', topTopicIcon: 'bolt' },
]

/** Live earnings calls for carousel (symbols we have logos for; listeners in hundreds) */
const LIVE_EARNINGS_CALLS = [
  { ticker: 'AAPL', listeners: 240, started: '21m ago' },
  { ticker: 'NVDA', listeners: 192, started: '14m ago' },
  { ticker: 'TSLA', listeners: 156, started: '8m ago' },
  { ticker: 'AMD', listeners: 320, started: '32m ago' },
  { ticker: 'MSFT', listeners: 278, started: '5m ago' },
  { ticker: 'GOOGL', listeners: 234, started: '18m ago' },
  { ticker: 'AMZN', listeners: 412, started: '25m ago' },
  { ticker: 'PLTR', listeners: 189, started: '41m ago' },
]

/** Top watchlist adds (symbols we have logos for) */
const TOP_WATCHLIST_ADDITIONS = [
  { ticker: 'NVDA', pctChange: 4.2, adds: 892 },
  { ticker: 'TSLA', pctChange: 2.1, adds: 645 },
  { ticker: 'PLTR', pctChange: 11.5, adds: 521 },
  { ticker: 'AAPL', pctChange: 1.8, adds: 478 },
  { ticker: 'AMD', pctChange: 3.2, adds: 412 },
  { ticker: 'GME', pctChange: 8.4, adds: 389 },
  { ticker: 'MSFT', pctChange: 0.9, adds: 256 },
  { ticker: 'AMZN', pctChange: 1.2, adds: 234 },
  { ticker: 'GOOGL', pctChange: -0.5, adds: 198 },
]

/** Top watchlist removals (symbols we have logos for) */
const TOP_WATCHLIST_REMOVALS = [
  { ticker: 'HOOD', pctChange: -5.2, removals: 312 },
  { ticker: 'DIS', pctChange: -3.8, removals: 287 },
  { ticker: 'TSLA', pctChange: 2.1, removals: 245 },
  { ticker: 'NVDA', pctChange: 4.2, removals: 198 },
  { ticker: 'GME', pctChange: 8.4, removals: 176 },
  { ticker: 'PLTR', pctChange: 11.5, removals: 134 },
  { ticker: 'AMD', pctChange: 3.2, removals: 98 },
  { ticker: 'AAPL', pctChange: 1.8, removals: 87 },
]

/** Top Discussions: top polls (choices only, no winning %) */
const TOP_DISCUSSIONS_POLLS = [
  { id: 6, question: 'Which mega-cap has the best risk/reward here?', choices: ['$AAPL', '$MSFT', '$NVDA', '$GOOGL'], votes: '8.2k', timeLabel: '2d left', published: 'Feb 09, 2026 · 8:00 AM', comments: 203 },
  { id: 1, question: 'What do you expect from $HOOD earnings on Tuesday?', choices: ['Beat EPS and revenue', 'Beat EPS, miss revenue', 'Miss EPS, beat revenue', 'Miss EPS and revenue'], votes: '5.7k', timeLabel: '21h left', published: 'Feb 09, 2026 · 10:23 AM', comments: 84 },
  { id: 2, question: 'What will be the S&P 500\'s next 5% move?', choices: ['Up 5%', 'Down 5%'], votes: '14k', timeLabel: 'Ended 13h ago', published: 'Feb 08, 2026 · 2:15 PM', comments: 312 },
  { id: 3, question: 'Are you buying the dip on any of these beaten down growth stocks?', choices: ['$HOOD', '$APP', '$PLTR', '$RKLB'], votes: '1.7k', timeLabel: 'Ended 1d ago', published: 'Feb 08, 2026 · 9:00 AM', comments: 156 },
  { id: 4, question: 'Where does crypto go from here?', choices: ['Recovery and trend continuation', 'Sideways consolidation', 'Lower lows ahead', 'Volatile chop before direction'], votes: '11.5k', timeLabel: 'Ended 1d ago', published: 'Feb 07, 2026 · 4:45 PM', comments: 428 },
  { id: 5, question: 'What do you expect from $RDDT earnings on Thursday?', choices: ['Beat EPS and revenue', 'Beat EPS, miss revenue', 'Miss EPS, beat revenue', 'Miss EPS and revenue'], votes: '3k', timeLabel: 'Ended 4d ago', published: 'Feb 06, 2026 · 11:20 AM', comments: 67 },
]

/** Prediction Leaderboard: top 10, one card per person */
const PREDICTION_LEADERBOARD = [
  { rank: 1, handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', value: 452 },
  { rank: 2, handle: 'amitDBA', avatar: '/avatars/top-voice-2.png', value: 318 },
  { rank: 3, handle: 'Trading4Living', avatar: '/avatars/top-voice-3.png', value: 287 },
  { rank: 4, handle: 'gpaisa', avatar: '/avatars/top-voice-1.png', value: 150 },
  { rank: 5, handle: 'ivanhoff', avatar: '/avatars/top-voice-2.png', value: 120 },
  { rank: 6, handle: 'CryptoOracle', avatar: '/avatars/user-avatar.png', value: 98 },
  { rank: 7, handle: 'FedWatcher', avatar: '/avatars/top-voice-2.png', value: 87 },
  { rank: 8, handle: 'ProfessorShiba', avatar: '/avatars/top-voice-3.png', value: 76 },
  { rank: 9, handle: 'ElectionEdge', avatar: '/avatars/top-voice-1.png', value: 65 },
  { rank: 10, handle: 'MacroMaven', avatar: '/avatars/top-voice-2.png', value: 54 },
]

const TOP_NEWS_BY_CATEGORY = {
  Technology: [
    { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=280&h=160&fit=crop', ticker: 'AAPL', pctChange: 1.8, title: 'Apple Unveils New AI Features at WWDC', source: 'Alex Rivera', time: '2h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=280&h=160&fit=crop', ticker: 'NVDA', pctChange: 4.2, title: 'NVIDIA Data Center Revenue Beats Estimates', source: 'Jon Morgan', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'MSFT', pctChange: 0.9, title: 'Microsoft Cloud Growth Accelerates', source: 'Tom Bruni', time: '5h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'GOOGL', pctChange: -0.5, title: 'Alphabet Ad Revenue In Line With Views', source: 'Michele Steele', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&h=160&fit=crop', ticker: 'TSLA', pctChange: 2.1, title: 'Tesla FSD Update Rollout Expands', source: 'Michael Bolling', time: '3h ago' },
  ],
  Healthcare: [
    { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=280&h=160&fit=crop', ticker: 'JNJ', pctChange: 0.7, title: 'Johnson & Johnson Raises Full-Year Guidance', source: 'Alex Rivera', time: '4h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=280&h=160&fit=crop', ticker: 'UNH', pctChange: -0.3, title: 'UnitedHealth Earnings Top Street Views', source: 'Jon Morgan', time: '1 day ago' },
    { image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=280&h=160&fit=crop', ticker: 'PFE', pctChange: 1.2, title: 'Pfizer Vaccine Sales Beat in Q2', source: 'Tom Bruni', time: '6h ago' },
    { image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=280&h=160&fit=crop', ticker: 'ABBV', pctChange: 2.4, title: 'AbbVie Lifts Outlook on Immunology Strength', source: 'Michele Steele', time: '2 days ago' },
    { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=280&h=160&fit=crop', ticker: 'LLY', pctChange: 3.1, title: 'Eli Lilly GLP-1 Demand Drives Upgrade', source: 'Alex Rivera', time: '5h ago' },
  ],
  Predictive: [
    { image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=280&h=160&fit=crop', ticker: 'PLTR', pctChange: 11.5, title: 'Palantir Beats on Revenue, Lifts Forecast', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', ticker: 'AI', pctChange: -2.8, title: 'C3.ai Stock Volatile After Earnings', source: 'Jon Morgan', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'PATH', pctChange: 5.2, title: 'UiPath Automation Demand Strong', source: 'Tom Bruni', time: '4h ago' },
    { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', ticker: 'CRWD', pctChange: 1.9, title: 'CrowdStrike Subscriber Growth Beats', source: 'Michele Steele', time: '2 days ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'SNOW', pctChange: -1.4, title: 'Snowflake Guidance Underwhelms Street', source: 'Alex Rivera', time: '6h ago' },
  ],
  Finance: [
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'JPM', pctChange: 0.6, title: 'JPMorgan Net Interest Income Rises', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'BAC', pctChange: -0.2, title: 'Bank of America Loan Growth Steady', source: 'Jon Morgan', time: '5h ago' },
    { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', ticker: 'GS', pctChange: 2.1, title: 'Goldman Trading Revenue Beats', source: 'Tom Bruni', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'MS', pctChange: 1.3, title: 'Morgan Stanley Wealth Management Strong', source: 'Michele Steele', time: '4h ago' },
    { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', ticker: 'V', pctChange: 0.4, title: 'Visa Volume Growth In Line', source: 'Alex Rivera', time: '2 days ago' },
  ],
  Energy: [
    { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=280&h=160&fit=crop', ticker: 'XOM', pctChange: -0.8, title: 'Exxon Reports Lower Refining Margins', source: 'Alex Rivera', time: '1 day ago', video: true },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=280&h=160&fit=crop', ticker: 'CVX', pctChange: 1.2, title: 'Chevron Raises Buyback Guidance', source: 'Jon Morgan', time: '5h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=280&h=160&fit=crop', ticker: 'OXY', pctChange: 3.4, title: 'Occidental Permian Output Beats', source: 'Tom Bruni', time: '6h ago' },
    { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=280&h=160&fit=crop', ticker: 'COP', pctChange: -0.5, title: 'ConocoPhillips Production Update', source: 'Michele Steele', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=280&h=160&fit=crop', ticker: 'SLB', pctChange: 2.0, title: 'Schlumberger International Growth', source: 'Alex Rivera', time: '2 days ago' },
  ],
}

function SentimentGauge({ value, label, compact }) {
  const isBullish = label === 'BULLISH'
  const isBearish = label === 'BEARISH'
  const strokeColor = isBullish ? 'var(--color-success)' : isBearish ? 'var(--color-danger)' : '#f59e0b'
  const size = compact ? 44 : 40
  const stroke = compact ? 2.5 : 3
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg]" style={{ minWidth: size, minHeight: size }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </svg>
        <span className={clsx('absolute font-bold text-text', compact ? 'text-sm' : 'text-xs')}>{value}</span>
      </div>
      <span className={clsx('font-bold uppercase', compact ? 'text-xs mt-0' : 'text-[10px] mt-0.5')} style={{ color: strokeColor }}>{label}</span>
    </div>
  )
}

function MiniSparkline({ values = [], isUp }) {
  if (!values?.length) return null
  const width = 64
  const height = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 2)
    return `${x},${y}`
  }).join(' ')
  const color = isUp !== false && values[values.length - 1] >= values[0] ? 'var(--color-success)' : 'var(--color-danger)'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-6 shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Homepage2() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const navigate = useNavigate()
  const [selectedTicker, setSelectedTicker] = useState(TRENDING_NOW[0].ticker)
  const [newPostCount, setNewPostCount] = useState(0)
  const incrementIndexRef = useRef(0)
  const { getQuote } = useLiveQuotesContext()
  const { toggleWatch } = useWatchlist()

  const selectedItem = TRENDING_NOW.find((s) => s.ticker === selectedTicker) ?? TRENDING_NOW[0]
  const [watchersCount, setWatchersCount] = useState(() => parseWatchers(selectedItem.followers))
  const [floatingWatchers, setFloatingWatchers] = useState(0)

  useEffect(() => {
    setWatchersCount(parseWatchers(selectedItem.followers))
    setFloatingWatchers(0)
  }, [selectedTicker, selectedItem.followers])

  useEffect(() => {
    const t = setInterval(() => {
      const chunk = WATCHER_CHUNKS[Math.floor(Math.random() * WATCHER_CHUNKS.length)]
      setWatchersCount((c) => c + chunk)
      setFloatingWatchers(chunk)
      setTimeout(() => setFloatingWatchers(0), 900)
    }, 1800)
    return () => clearInterval(t)
  }, [selectedTicker])

  const NEW_POST_INCREMENTS = [10, 8, 3, 9, 12]
  useEffect(() => {
    const interval = setInterval(() => {
      const next = NEW_POST_INCREMENTS[incrementIndexRef.current % NEW_POST_INCREMENTS.length]
      incrementIndexRef.current += 1
      setNewPostCount((c) => c + next)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const mergeQuote = (staticItem) => {
    const q = getQuote(staticItem.ticker)
    if (!q) return staticItem
    return { ...staticItem, price: q.price, change: q.change ?? staticItem.change, pct: q.changePercent ?? staticItem.pct }
  }

  const messages = (STREAM_MESSAGES[selectedTicker] ?? STREAM_MESSAGES.NVDA).slice(0, 4)
  const popularTopics = POPULAR_TOPICS[selectedTicker] ?? POPULAR_TOPICS.TSLA

  return (
    <div className="min-h-screen bg-background text-text">
      <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />

      <div className="flex max-w-[1400px] mx-auto">
        {/* Column 1: New to Stocktwits + Unlock Watchlist */}
        <aside className="hidden lg:flex w-[269px] shrink-0 flex-col border-r border-border p-4 gap-6">
          <section className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <h2 className="text-sm font-bold text-text mb-2">New to Stocktwits?</h2>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Get access to real-time conversations, investor sentiment, price predictions and customized watchlists.
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-surface hover:bg-surface-muted transition-colors text-left">
                <img src="/avatars/user-avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text">Continue as Michael</div>
                  <div className="text-xs text-text-muted truncate">mbozzello@stocktwits...</div>
                </div>
                <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </button>
              <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-surface hover:bg-surface-muted transition-colors text-left">
                <span className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-text" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c3.08-.2 4.85 1.5 6 3.2 1.15-1.7 2.92-3.4 6-3.2 5.54.28 6.26 7.94 1.67 12.87-.86.79-1.62.97-3.06.35-1.15-.48-2.15-.46-3.24 0-1.03.45-2.1.6-3.08-.35zM12.03 7.25c-.87 0-1.57-.7-1.57-1.57s.7-1.57 1.57-1.57 1.57.7 1.57 1.57-.7 1.57-1.57 1.57z"/></svg>
                </span>
                <span className="text-sm font-semibold text-text">Continue with Apple</span>
              </button>
              <button type="button" className="w-full py-2.5 rounded-lg border border-border bg-black text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Create Account
              </button>
              <Link to="/symbol" className="text-xs text-primary hover:underline text-center py-1">
                Log in to existing account
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <h2 className="text-sm font-bold text-text mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Unlock Watchlist
            </h2>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Customize your watchlist - add symbols to see reactions and insights on your feed.
            </p>
            <div className="flex gap-2 mb-3">
              <button type="button" className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-muted">Quick add</button>
              <button type="button" className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-muted">Customize</button>
            </div>
            <p className="text-[11px] text-text-muted mb-3">
              Add preset lists like Top 5 Trending or Mag 7 in one tap from the feed.
            </p>
            <button type="button" className="w-full py-2.5 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20">
              Sign in to add symbols
            </button>
            <div className="mt-3 space-y-2">
              {WATCHLIST_PREVIEW.map((s) => {
                const item = mergeQuote(s)
                return (
                <div key={item.ticker} className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border">
                  {getTickerLogo(item.ticker) ? (
                    <img src={getTickerLogo(item.ticker)} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded bg-surface flex items-center justify-center text-xs font-bold shrink-0">{item.ticker[0]}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-text truncate">{item.ticker} {item.name}</div>
                    <div className="text-xs text-text-muted">${typeof item.price === 'number' ? item.price.toFixed(2) : '--'} <span className={item.change >= 0 ? 'text-success' : 'text-danger'}>{item.change >= 0 ? '+' : ''}{(item.pct ?? item.change ?? 0).toFixed(2)}%</span></div>
                  </div>
                </div>
                )
              })}
            </div>
          </section>
        </aside>

        {/* Middle: Market cards (full width) + Trending Now | Stream */}
        <main className="flex-1 min-w-0 flex flex-col p-4 lg:p-6 gap-4">
          {/* Header: Market Overview (selected) + Following / Watchlist (locked, sign-up to unlock) */}
          <div className="flex items-center gap-6 border-b-2 border-border pb-2 shrink-0">
            <span className="text-base font-bold text-black border-b-2 border-black pb-0.5 -mb-0.5" style={{ borderBottomWidth: 2 }}>
              Market Overview
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted" title="Sign up to unlock">
              Following
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted" title="Sign up to unlock">
              Watchlist
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
          </div>
          {/* Market cards — full width row (tight layout); prices/pct from live quotes when available */}
          <div className="w-full flex gap-2 overflow-x-auto pb-1 shrink-0">
            {MARKET_CARDS.map((card) => {
              const q = getQuote(card.symbol)
              const price = q?.price ?? card.price
              const change = q?.change ?? card.change
              const pct = q?.changePercent ?? card.pct
              return (
              <div
                key={card.symbol}
                className="flex-1 min-w-[130px] rounded-lg border border-border bg-white dark:bg-surface px-2.5 py-2 flex flex-col"
              >
                <div className="flex items-center gap-1.5">
                  {getTickerLogo(card.symbol) ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-muted border border-border flex items-center justify-center shrink-0">
                      <img src={getTickerLogo(card.symbol)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <span className="text-xs font-bold text-text">{card.symbol}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                  <div className="text-base font-bold text-text min-w-0 tabular-nums">
                    {price >= 1000 ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : price.toFixed(2)}
                  </div>
                  <SentimentGauge value={card.sentiment} label={card.sentimentLabel} compact />
                </div>
                <div className={clsx('text-[11px] font-semibold tabular-nums', pct >= 0 ? 'text-success' : 'text-danger')}>
                  ({change >= 0 ? '+' : ''}{change.toFixed(2)}) {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-border">
                  <div className="text-[8px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">Community Discussing</div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-muted text-[11px] font-medium text-text">
                    {card.topTopicIcon === 'medal' && <span aria-hidden>🏅</span>}
                    {card.topTopicIcon === 'chair' && <span aria-hidden>🪑</span>}
                    {card.topTopicIcon === 'chart' && <span aria-hidden>📈</span>}
                    {card.topTopicIcon === 'scissors' && <span aria-hidden>✂️</span>}
                    {card.topTopicIcon === 'bolt' && <span aria-hidden>⚡</span>}
                    {card.topTopic}
                    <span className="text-text-muted" aria-hidden>&gt;</span>
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          {/* Trending: header above, then symbol tabs + content for more horizontal space */}
          <div className="shrink-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-text mb-1.5">
              <span className="text-orange-500" aria-hidden>🔥</span>
              Trending &gt;
            </h2>
          <div className="flex flex-col gap-0 rounded-2xl border border-border overflow-hidden bg-surface-muted/10">
            <div className="flex border-b border-border bg-surface-muted/30">
              {TRENDING_NOW.map((s) => {
                const item = mergeQuote(s)
                const isSelected = selectedTicker === item.ticker
                const isLive = item.ticker === 'AAPL'
                const pctNum = typeof item.pct === 'number' ? item.pct : 0
                return (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => { setSelectedTicker(item.ticker); setNewPostCount(0); }}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3.5 text-base font-semibold transition-colors border-r border-border last:border-r-0 min-w-0 flex-1',
                      isSelected && !isLive && 'bg-amber-50 dark:bg-amber-950/30 text-text border-b-2 border-b-amber-500 -mb-px',
                      isSelected && isLive && 'bg-[rgba(221,214,254,0.25)] text-text border-b-2 border-b-[#7c3aed] -mb-px',
                      !isSelected && isLive && 'text-text-muted hover:bg-[rgba(221,214,254,0.15)]',
                      !isSelected && !isLive && 'text-text-muted hover:bg-surface-muted/50'
                    )}
                  >
                    <div className="flex flex-col items-center gap-0 shrink-0 -mt-0.5">
                      <div className="relative">
                        <div className="w-[57.6px] h-[57.6px] rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0">
                          {getTickerLogo(item.ticker) ? (
                            <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base font-bold text-text-muted">{item.ticker[0]}</span>
                          )}
                        </div>
                        {isLive && (
                          <span
                            className="absolute left-1/2 -translate-x-1/2 -top-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase text-white whitespace-nowrap animate-live-pulse"
                            style={{ backgroundColor: '#7c3aed' }}
                          >
                            Live
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-text-muted leading-tight">#{item.rank ?? 1}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); navigate('/symbol'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); navigate('/symbol'); } }}
                        className="font-semibold text-primary hover:underline cursor-pointer focus:outline-none focus:underline"
                      >
                        ${item.ticker}
                      </span>
                      <span className="text-text-muted font-normal text-sm">
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : '--'}
                      </span>
                      <span className={clsx('text-sm font-semibold', pctNum >= 0 ? 'text-success' : 'text-danger')}>
                        {pctNum >= 0 ? '+' : ''}{pctNum.toFixed(1)}%
                      </span>
                      <span className={clsx('text-[11px] font-medium mt-0.5', (item.sentiment ?? 50) >= 50 ? 'text-success' : 'text-danger')}>
                        {item.sentiment ?? 50}% bullish
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Content: Why it's trending + Popular Topics (full width, fixed height; messages scroll inside) */}
          <div
            className={clsx(
              'flex flex-col min-h-0 overflow-hidden rounded-b-2xl border-t-0 border-2 transition-[border-color,box-shadow] p-3 h-[460px]',
              'bg-background/50',
              selectedTicker === 'AAPL'
                ? 'border-[#7c3aed] border-t-[#7c3aed] shadow-[0_0_0_1px_rgba(124,58,237,0.2)]'
                : 'border-amber-500/70 border-t-amber-500/70 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]'
            )}
          >
            {/* Why it's trending card: watchers row + main content in one cohesive box */}
            <div
              className="w-full mb-3 rounded-2xl overflow-hidden shrink-0"
              style={selectedTicker === 'AAPL'
                ? { backgroundColor: 'rgba(221, 214, 254, 0.5)' }
                : { background: 'linear-gradient(to right, rgba(254, 215, 170, 0.6), rgba(250, 204, 211, 0.5), rgba(221, 214, 254, 0.5))' }
              }
            >
              {/* Watchers, Add to Watchlist, Top News — part of the same card */}
              <div className="flex items-center gap-3 flex-wrap px-4 pt-2.5 pb-1 border-b border-black/10 dark:border-white/10 text-sm">
                <span className="relative inline-flex items-center gap-1.5 text-text-muted">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="tabular-nums">{formatNum(watchersCount)}</span>
                  {floatingWatchers > 0 && (
                    <span className="absolute left-full ml-1 bottom-0 text-green-600 dark:text-green-400 text-xs font-bold animate-watchers-float-wiggle whitespace-nowrap">+{floatingWatchers}</span>
                  )}
                  <span>Watchers</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleWatch(selectedTicker, selectedItem.name)}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg border-2 border-border bg-white/60 dark:bg-surface/60 px-3 py-1.5 text-sm font-bold text-text transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                  aria-label="Add to Watchlist"
                  title="Add to Watchlist"
                >
                  <span className="leading-none">+</span>
                  <span>Add to Watchlist</span>
                </button>
                {(() => {
                  const news = TRENDING_NOW_NEWS[selectedTicker] ?? TRENDING_NOW_NEWS.TSLA
                  const to = news.slug ? `/article/${news.slug}` : '/news'
                  return (
                    <Link
                      to={to}
                      className="flex items-center gap-2 min-w-0 flex-1 rounded-lg border border-border bg-white/60 dark:bg-surface/60 hover:border-border-strong hover:bg-white/80 dark:hover:bg-surface/80 transition-colors overflow-hidden"
                      aria-label={news.headline}
                    >
                      <div className="w-8 h-8 shrink-0 rounded-l-md overflow-hidden bg-surface-muted">
                        <img src={news.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium text-text truncate pr-2 py-1.5">
                        <span className="text-text-muted">Top News: </span>
                        {news.headline}
                      </span>
                    </Link>
                  )
                })()}
              </div>

              {/* AAPL: Live earnings call; others: Why it's trending */}
              {selectedTicker === 'AAPL' ? (
              <div className="w-full flex items-center justify-between gap-3 px-4 pt-1.5 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-text">Q1 &apos;26 Earnings Call</h3>
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#7c3aed' }}>Live</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                    <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span>2.1K Listeners</span>
                    <span className="text-border">|</span>
                    <span>Started 21m ago</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#7c3aed' }}
                  aria-label="Join live earnings call"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Join
                </button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-3 px-4 pt-1.5 pb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wide">Why It&apos;s Trending</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2 pr-2" title={selectedItem.whyBlurb}>
                    {selectedItem.whyBlurb}
                  </p>
                </div>
                <button type="button" onClick={() => navigate('/symbol')} className="shrink-0 text-sm font-semibold text-primary hover:underline whitespace-nowrap" aria-label="View full summary">
                  View Full Summary →
                </button>
              </div>
            )}
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
              <div className="mb-2 shrink-0 flex items-center gap-2 min-w-0">
                <div className="shrink-0">
                  <h3 className="text-sm font-semibold text-text">Popular Community Topics</h3>
                  <p className="text-xs text-text-muted">What the Community&apos;s Saying</p>
                </div>
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden py-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
                  {popularTopics.map((t, i) => {
                    const slug = t.label.toLowerCase().replace(/\s+/g, '-')
                    const pillClass = 'inline-flex items-center gap-1.5 rounded-full border border-border bg-white dark:bg-surface px-3 py-1 text-xs font-medium text-text shrink-0'
                    if (selectedTicker === 'TSLA') {
                      return (
                        <Link
                          key={i}
                          to={`/symbol?topic=${slug}`}
                          className={clsx(pillClass, 'hover:border-border-strong hover:bg-surface-muted transition-colors')}
                        >
                          <span aria-hidden>{t.emoji}</span>
                          {t.label}
                        </Link>
                      )
                    }
                    return (
                      <span key={i} className={pillClass}>
                        <span aria-hidden>{t.emoji}</span>
                        {t.label}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="relative flex-[0.9] min-h-0 flex flex-col rounded-xl border border-border overflow-hidden bg-surface-muted/20">
              {newPostCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setNewPostCount(0); navigate('/symbol'); }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#4285F4' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {newPostCount} New Post{newPostCount === 1 ? '' : 's'}
                </button>
              )}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-0">
              {messages.map((msg) => {
                const topic = popularTopics[msg.topicIndex ?? 0]
                return (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
                  <img src={msg.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-text">{msg.user}</span>
                      <span className="text-xs text-text-muted">{msg.time}</span>
                      {topic && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted/50 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                          <span aria-hidden>{topic.emoji}</span>
                          {topic.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text mt-0.5 leading-snug"><TickerLinkedText text={msg.body} /></p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {msg.comments ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {msg.reposts ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {msg.likes ?? 0}
                      </button>
                    </div>
                  </div>
                </div>
                )
              })}
              </div>
              </div>
              <div className="flex-[0.1] min-h-0 shrink-0" aria-hidden />
            </div>
          </div>
          </div>
          </div>

          {/* Earnings Call: horizontal carousel of live calls */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-3">Earnings Call &gt;</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {LIVE_EARNINGS_CALLS.map((call) => (
                <button
                  key={call.ticker}
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="flex shrink-0 w-[140px] flex-col items-center rounded-xl border border-border bg-white dark:bg-surface p-4 hover:border-border-strong hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-muted border border-border flex items-center justify-center shrink-0">
                    {getTickerLogo(call.ticker) ? (
                      <img src={getTickerLogo(call.ticker)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-text-muted">{call.ticker[0]}</span>
                    )}
                  </div>
                  <span className="mt-2 font-bold text-text text-sm uppercase tracking-tight">{call.ticker}</span>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#7c3aed' }} aria-hidden />
                    <span className="font-semibold text-[#7c3aed]">Live</span>
                    <svg className="w-3.5 h-3.5 text-text shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="text-text font-medium">{call.listeners}</span>
                  </div>
                  <span className="mt-2 text-[11px] text-text-muted">{call.started}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Top News: horizontal carousel */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-3">Top News &gt;</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {(TOP_NEWS_BY_CATEGORY.Technology ?? []).map((art, i) => {
                const newsPct = getQuote(art.ticker)?.changePercent ?? art.pctChange ?? 0
                return (
                <Link
                  key={`news-${i}-${art.title}`}
                  to="/news"
                  className="flex shrink-0 w-[280px] flex-col rounded-xl border border-border bg-surface overflow-hidden hover:border-border-strong hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video w-full bg-surface-muted">
                    <img src={art.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    {art.video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-text ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                    <span
                      className={clsx(
                        'absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-bold text-white tabular-nums',
                        newsPct >= 0 ? 'bg-success' : 'bg-danger'
                      )}
                    >
                      ${art.ticker} {newsPct >= 0 ? '+' : ''}{typeof newsPct === 'number' ? newsPct.toFixed(1) : newsPct}%
                    </span>
                  </div>
                  <div className="p-3 flex flex-col min-h-0">
                    <h3 className="text-sm font-semibold text-text line-clamp-2 leading-snug">{art.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{art.source} • {art.time}</p>
                  </div>
                </Link>
                )
              })}
            </div>
          </section>

          {/* Prediction Leaderboard: top 10, one card per person */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-3">Prediction Leaderboard &gt;</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {PREDICTION_LEADERBOARD.map((p) => (
                <button
                  key={`leaderboard-${p.rank}-${p.handle}`}
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="flex shrink-0 w-[140px] flex-col items-center rounded-xl border border-border bg-white dark:bg-surface p-4 hover:border-border-strong hover:shadow-md transition-all"
                >
                  <img src={p.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-border mb-3" />
                  <span className="text-sm font-bold text-text tabular-nums">#{p.rank}</span>
                  <span className="mt-1 text-sm font-medium text-text truncate w-full text-center" title={`@${p.handle}`}>@{p.handle}</span>
                  <span className="mt-2 text-sm font-bold text-success tabular-nums">+{p.value}%</span>
                </button>
              ))}
            </div>
          </section>

          {/* Top Watchlist Adds: tight pill carousel; pct from live quotes when available */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-2">Top Watchlist Adds &gt;</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {TOP_WATCHLIST_ADDITIONS.map((item) => {
                const addPct = getQuote(item.ticker)?.changePercent ?? item.pctChange
                return (
                <button
                  key={`add-${item.ticker}`}
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white dark:bg-surface px-3 py-1.5 hover:border-border-strong hover:shadow-sm transition-all"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-muted border border-border flex items-center justify-center shrink-0">
                    {getTickerLogo(item.ticker) ? (
                      <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-text-muted">{item.ticker[0]}</span>
                    )}
                  </div>
                  <span className="font-semibold text-text text-sm uppercase tracking-tight">{item.ticker}</span>
                  <span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold tabular-nums', addPct >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                    {addPct >= 0 ? '+' : ''}{typeof addPct === 'number' ? addPct.toFixed(1) : addPct}%
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap">{item.adds} adds</span>
                </button>
                )
              })}
            </div>
          </section>

          {/* Top Watchlist Removals: tight pill carousel; pct from live quotes when available */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-2">Top Watchlist Removals &gt;</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {TOP_WATCHLIST_REMOVALS.map((item) => {
                const remPct = getQuote(item.ticker)?.changePercent ?? item.pctChange
                return (
                <button
                  key={`rem-${item.ticker}`}
                  type="button"
                  onClick={() => navigate('/symbol')}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white dark:bg-surface px-3 py-1.5 hover:border-border-strong hover:shadow-sm transition-all"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-muted border border-border flex items-center justify-center shrink-0">
                    {getTickerLogo(item.ticker) ? (
                      <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-text-muted">{item.ticker[0]}</span>
                    )}
                  </div>
                  <span className="font-semibold text-text text-sm uppercase tracking-tight">{item.ticker}</span>
                  <span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold tabular-nums', remPct >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                    {remPct >= 0 ? '+' : ''}{typeof remPct === 'number' ? remPct.toFixed(1) : remPct}%
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap">{item.removals} removals</span>
                </button>
                )
              })}
            </div>
          </section>

          {/* Top Discussions: poll carousel (choices + votes, no %) */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-3">Top Discussions &gt;</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
              {TOP_DISCUSSIONS_POLLS.map((poll) => (
                <div
                  key={poll.id}
                  className="flex shrink-0 w-[280px] h-[340px] flex-col rounded-xl border border-border bg-white dark:bg-surface overflow-hidden"
                >
                  <div className="p-3 flex flex-col h-full min-h-0">
                    <h3 className="text-sm font-bold text-text leading-snug shrink-0">
                      {poll.question.split(/(\$[A-Za-z]+)/).map((part, i) => {
                        const match = part.match(/^\$([A-Za-z]+)$/)
                        if (match) {
                          const ticker = match[1].toUpperCase()
                          const logo = getTickerLogo(ticker)
                          if (logo) {
                            return (
                              <span key={i} className="inline-flex items-center gap-1 align-middle">
                                <img src={logo} alt="" className="w-4 h-4 rounded object-cover shrink-0 inline-block" />
                                {part}
                              </span>
                            )
                          }
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </h3>
                    <ul className={clsx('mt-2.5 flex flex-col gap-1.5 min-h-[120px] flex-1', poll.choices.length === 2 && 'justify-center')} aria-label="Poll choices">
                      {poll.choices.map((choice, i) => {
                        const tickerMatch = choice.match(/^\$([A-Za-z]+)$/)
                        const logo = tickerMatch ? getTickerLogo(tickerMatch[1].toUpperCase()) : null
                        return (
                          <li key={i} className={poll.choices.length === 2 ? 'flex-1 flex' : ''}>
                            <span className={clsx(
                              'block w-full rounded-lg border border-border bg-surface-muted/50 font-medium text-text',
                              poll.choices.length === 2 ? 'px-3 py-3.5 text-sm flex-1 flex items-center gap-2' : 'px-3 py-2 text-xs flex items-center gap-2'
                            )}>
                              {logo ? <img src={logo} alt="" className="w-5 h-5 rounded object-cover shrink-0" /> : null}
                              {choice}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="mt-2.5 shrink-0">
                      <p className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-text">{poll.votes} votes</span>
                        <span className="text-[11px] text-text-muted">· {poll.timeLabel}</span>
                      </p>
                      {poll.published && (
                        <p className="mt-0.5 text-[10px] text-text-muted">Published: {poll.published}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('/symbol')}
                        className="mt-2 text-xs font-semibold text-primary hover:underline text-left"
                      >
                        {poll.comments} comments &gt;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
