import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import IOSBottomNav from '../components/IOSBottomNav.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...v) { return v.filter(Boolean).join(' ') }

/* ══════════════════════════════════════════════════════════════
   OVERVIEW DATA  (mirrored from Homepage3 Market Overview)
   ══════════════════════════════════════════════════════════════ */
const MARKET_CARDS = [
  { symbol: 'SPY', price: 609.98, change: -5.23, pct: -0.85, sentiment: 62, sentimentLabel: 'BULLISH', topTopic: 'Metals Nosedive', topTopicIcon: '🏅' },
  { symbol: 'QQQ', price: 523.41, change: -6.12, pct: -1.16, sentiment: 58, sentimentLabel: 'BULLISH', topTopic: 'New Fed Chair', topTopicIcon: '🪑' },
  { symbol: 'BITCOIN', price: 97234.5, change: 1245.2, pct: 1.3, sentiment: 71, sentimentLabel: 'BULLISH', topTopic: 'ETF Flows', topTopicIcon: '📈' },
  { symbol: 'GLD', price: 2654.8, change: -8.4, pct: -0.32, sentiment: 48, sentimentLabel: 'NEUTRAL', topTopic: 'Rate Cuts', topTopicIcon: '✂️' },
  { symbol: 'VIX', price: 18.52, change: 1.64, pct: 9.72, sentiment: 35, sentimentLabel: 'BEARISH', topTopic: 'Volatility', topTopicIcon: '⚡' },
]

const TRENDING_NOW = [
  { ticker: 'TSLA', name: 'Tesla', price: 242.18, pct: 15.84, comments: '12.8K', sentiment: 75, whyBlurb: 'Cybertruck production ramp and full self-driving rollout are driving the conversation.' },
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.32, pct: 48.93, comments: '15.2K', sentiment: 82, whyBlurb: 'Data center AI demand and the Blackwell chip ramp are driving record volume.' },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, pct: -8.25, comments: '8.9K', sentiment: 45, whyBlurb: 'China sales and services growth are in focus as the street looks for iPhone stability.' },
  { ticker: 'AMD', name: 'AMD', price: 156.43, pct: 24.67, comments: '9.2K', sentiment: 78, whyBlurb: 'MI300 adoption and data center share gains are in the spotlight.' },
  { ticker: 'AMZN', name: 'Amazon', price: 172.65, pct: 18.32, comments: '6.1K', sentiment: 68, whyBlurb: 'AWS reacceleration and advertising growth have reignited interest.' },
  { ticker: 'META', name: 'Meta', price: 412.50, pct: 8.50, comments: '5.2K', sentiment: 72, whyBlurb: 'Reality Labs spend and AI investment are in focus.' },
  { ticker: 'MSFT', name: 'Microsoft', price: 348.90, pct: 12.45, comments: '4.8K', sentiment: 65, whyBlurb: 'Azure growth and Copilot monetization are driving the conversation.' },
  { ticker: 'GOOGL', name: 'Alphabet', price: 142.30, pct: -12.34, comments: '4.1K', sentiment: 58, whyBlurb: 'Search and YouTube ad trends, plus Gemini and cloud trajectory.' },
  { ticker: 'PLTR', name: 'Palantir', price: 28.45, pct: 36.21, comments: '6.5K', sentiment: 81, whyBlurb: 'AIP bootcamp pipeline and government demand driving record volume.' },
  { ticker: 'GME', name: 'GameStop', price: 29.96, pct: 22.56, comments: '8.2K', sentiment: 62, whyBlurb: 'Retail interest and turnaround execution are in focus.' },
]

const TOP_TOPICS = [
  { emoji: '🖥️', label: 'Data Center Demand', count: '52.3K', color: '#6366f1' },
  { emoji: '📈', label: 'AI Capex', count: '44.6K', color: '#06b6d4' },
  { emoji: '🤖', label: 'Robotaxi Dreams', count: '41.2K', color: '#22c55e' },
  { emoji: '🔮', label: 'Blackwell Ramp', count: '38.1K', color: '#8b5cf6' },
  { emoji: '⚡', label: 'Earnings Beat', count: '35.2K', color: '#f59e0b' },
  { emoji: '☁️', label: 'AWS Reacceleration', count: '31.5K', color: '#f97316' },
  { emoji: '🚀', label: 'Merging Ambitions', count: '28.4K', color: '#ef4444' },
  { emoji: '🔷', label: 'MI300 Adoption', count: '26.8K', color: '#3b82f6' },
]

const LIVE_EARNINGS = [
  { ticker: 'AAPL', listeners: 240, started: '21m ago' },
  { ticker: 'NVDA', listeners: 192, started: '14m ago' },
  { ticker: 'TSLA', listeners: 156, started: '8m ago' },
  { ticker: 'AMD', listeners: 320, started: '32m ago' },
  { ticker: 'MSFT', listeners: 278, started: '5m ago' },
  { ticker: 'GOOGL', listeners: 234, started: '18m ago' },
  { ticker: 'AMZN', listeners: 412, started: '25m ago' },
  { ticker: 'PLTR', listeners: 189, started: '41m ago' },
]

const TOP_WATCHLIST_ADDS = [
  { ticker: 'NVDA', pct: 4.2, adds: 892 },
  { ticker: 'TSLA', pct: 2.1, adds: 645 },
  { ticker: 'PLTR', pct: 11.5, adds: 521 },
  { ticker: 'AAPL', pct: 1.8, adds: 478 },
  { ticker: 'AMD', pct: 3.2, adds: 412 },
  { ticker: 'GME', pct: 8.4, adds: 389 },
]

const PREDICTION_LEADERBOARD = [
  { rank: 1, handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', value: 452 },
  { rank: 2, handle: 'amitDBA', avatar: '/avatars/top-voice-2.png', value: 318 },
  { rank: 3, handle: 'Trading4Living', avatar: '/avatars/top-voice-3.png', value: 287 },
  { rank: 4, handle: 'gpaisa', avatar: '/avatars/top-voice-1.png', value: 150 },
  { rank: 5, handle: 'ivanhoff', avatar: '/avatars/top-voice-2.png', value: 120 },
]

const TOP_DISCUSSIONS = [
  { id: 1, question: 'Which mega-cap has the best risk/reward here?', choices: ['$AAPL', '$MSFT', '$NVDA', '$GOOGL'], votes: '8.2k', timeLabel: '2d left' },
  { id: 2, question: 'What do you expect from $HOOD earnings on Tuesday?', choices: ['Beat EPS & rev', 'Beat EPS, miss rev', 'Miss both'], votes: '5.7k', timeLabel: '21h left' },
  { id: 3, question: "S&P 500's next 5% move?", choices: ['Up 5%', 'Down 5%'], votes: '14k', timeLabel: 'Ended' },
]

/* ══════════════════════════════════════════════════════════════
   NEWS DATA  (mirrored from News.jsx)
   ══════════════════════════════════════════════════════════════ */
const COMMUNITY_FOCUS = [
  { image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&h=300&fit=crop', headline: 'Tesla Stock Surges 12% After Record Q4 Deliveries', author: 'Michael Bolling', avatar: '/avatars/who-follow-1.png', time: '11 days ago', ticker: 'TSLA', pct: 12.0, video: true },
  { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=300&fit=crop', headline: 'Market Open: Tech Stocks Rally After Fed Comments', author: 'Jon Morgan', avatar: '/avatars/top-voice-1.png', time: '5 days ago', ticker: null, pct: null },
  { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=300&fit=crop', headline: 'Is $TSLA finally breaking out?', author: 'Michael Bolling', avatar: '/avatars/who-follow-1.png', time: '12 days ago', ticker: 'TSLA', pct: 2.4 },
  { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=300&fit=crop', headline: 'Options Flow: What Smart Money Is Buying', author: 'Tom Bruni', avatar: '/avatars/top-voice-1.png', time: '1 day ago', ticker: null, pct: null, video: true },
  { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=300&fit=crop', headline: 'Bitcoin Approaches $35K as ETF Flows Surge', author: 'Cryptotwits', avatar: '/avatars/top-voice-2.png', time: '2 days ago', ticker: 'BTC', pct: 5.8 },
  { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=300&fit=crop', headline: 'Fed Signals Further Rate Cuts in Q2', author: 'Michele Steele', avatar: '/avatars/top-voice-1.png', time: '1 day ago', ticker: null, pct: null },
]

const SECTOR_CATEGORIES = ['Technology', 'Healthcare', 'Predictive', 'Finance', 'Energy']
const SECTOR_EMOJIS = { Technology: '🤖', Healthcare: '🏥', Predictive: '🔮', Finance: '💰', Energy: '⚡' }

const SECTOR_ARTICLES = {
  Technology: [
    { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=280&h=160&fit=crop', ticker: 'AAPL', pct: 1.8, title: 'Apple Unveils New AI Features at WWDC', source: 'Alex Rivera', time: '2h ago', video: true },
    { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=280&h=160&fit=crop', ticker: 'NVDA', pct: 4.2, title: 'NVIDIA Data Center Revenue Beats', source: 'Jon Morgan', time: '1d ago' },
    { image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=280&h=160&fit=crop', ticker: 'MSFT', pct: 0.9, title: 'Microsoft Cloud Growth Accelerates', source: 'Tom Bruni', time: '5h ago' },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'GOOGL', pct: -0.5, title: 'Alphabet Ad Revenue In Line', source: 'Michele Steele', time: '1d ago' },
    { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&h=160&fit=crop', ticker: 'TSLA', pct: 2.1, title: 'Tesla FSD Rollout Expands', source: 'Michael Bolling', time: '3h ago' },
  ],
  Healthcare: [
    { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=280&h=160&fit=crop', ticker: 'JNJ', pct: 0.7, title: 'J&J Raises Full-Year Guidance', source: 'Alex Rivera', time: '4h ago' },
    { image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=280&h=160&fit=crop', ticker: 'UNH', pct: -0.3, title: 'UnitedHealth Earnings Top Views', source: 'Jon Morgan', time: '1d ago' },
    { image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=280&h=160&fit=crop', ticker: 'PFE', pct: 1.2, title: 'Pfizer Vaccine Sales Beat', source: 'Tom Bruni', time: '6h ago' },
    { image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=280&h=160&fit=crop', ticker: 'ABBV', pct: 2.4, title: 'AbbVie Lifts Outlook', source: 'Michele Steele', time: '2d ago' },
  ],
  Predictive: [
    { image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=280&h=160&fit=crop', ticker: 'PLTR', pct: 11.5, title: 'Palantir Beats, Lifts Forecast', source: 'Alex Rivera', time: '1d ago', video: true },
    { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', ticker: 'AI', pct: -2.8, title: 'C3.ai Volatile After Earnings', source: 'Jon Morgan', time: '3h ago' },
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'PATH', pct: 5.2, title: 'UiPath Demand Strong', source: 'Tom Bruni', time: '4h ago' },
  ],
  Finance: [
    { image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&h=160&fit=crop', ticker: 'JPM', pct: 0.6, title: 'JPMorgan Net Interest Income Rises', source: 'Alex Rivera', time: '1d ago' },
    { image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=280&h=160&fit=crop', ticker: 'BAC', pct: -0.2, title: 'BofA Loan Growth Steady', source: 'Jon Morgan', time: '5h ago' },
    { image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=280&h=160&fit=crop', ticker: 'GS', pct: 2.1, title: 'Goldman Trading Revenue Beats', source: 'Tom Bruni', time: '3h ago' },
  ],
  Energy: [
    { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=280&h=160&fit=crop', ticker: 'XOM', pct: -0.8, title: 'Exxon Lower Refining Margins', source: 'Alex Rivera', time: '1d ago' },
    { image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=280&h=160&fit=crop', ticker: 'CVX', pct: 1.2, title: 'Chevron Raises Buyback', source: 'Jon Morgan', time: '5h ago' },
    { image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=280&h=160&fit=crop', ticker: 'OXY', pct: 3.4, title: 'Occidental Permian Beats', source: 'Tom Bruni', time: '6h ago' },
  ],
}

const TRENDING_NEWS = [
  { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=280&h=160&fit=crop', title: 'Palantir Jumps 15% After Major Defense Contract', meta: 'Alex Rivera • 2h ago', ticker: 'PLTR', pct: 15.0, video: true },
  { image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&h=160&fit=crop', title: "Breaking Down Tesla's Q4 Numbers", meta: 'Michael Bolling • 5h ago', ticker: 'TSLA', pct: 2.4 },
  { image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=280&h=160&fit=crop', title: 'Nicola ETF Inflows Are Insane', meta: 'Jon Morgan • 3h ago', ticker: 'BTC', pct: 5.8 },
  { image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=280&h=160&fit=crop', title: 'AMD Gains on Data Center Market Share', meta: 'Tom Bruni • 1d ago', ticker: 'AMD', pct: 17.9 },
]

const SHOWS = [
  { image: '/images/big-tech-podcast.png', title: 'BIGTECH PODCAST', desc: 'Weekly deep dives into big tech' },
  { image: '/images/howard-lindzon-show.png', title: 'The Howard Lindzon Show', desc: 'Markets and startup investing' },
  { image: '/images/philosophical-quant.png', title: 'The Philosophical Quant', desc: 'Quantitative strategies explained' },
  { image: '/images/cryptotwits-podcast.png', title: 'Cryptotwits Podcast', desc: 'Crypto and macro' },
  { image: '/images/retail-edge.png', title: 'RetailEDG Show', desc: 'Retail and options flow' },
  { image: '/images/board-room.png', title: 'Board Room Exclusives', desc: 'Premium content' },
]

/* ══════════════════════════════════════════════════════════════
   EARNINGS DATA
   ══════════════════════════════════════════════════════════════ */
const EARNINGS_CALENDAR = [
  { ticker: 'AAPL', name: 'Apple Inc.', date: 'Feb 6', time: 'AMC', epsEst: '$2.10', revEst: '$124.1B', sentiment: 68 },
  { ticker: 'AMZN', name: 'Amazon', date: 'Feb 6', time: 'AMC', epsEst: '$1.48', revEst: '$187.3B', sentiment: 72 },
  { ticker: 'GOOGL', name: 'Alphabet', date: 'Feb 4', time: 'AMC', epsEst: '$1.89', revEst: '$86.1B', sentiment: 65, reported: true, epsBeat: true },
  { ticker: 'MSFT', name: 'Microsoft', date: 'Jan 29', time: 'AMC', epsEst: '$3.12', revEst: '$68.8B', sentiment: 71, reported: true, epsBeat: true },
  { ticker: 'META', name: 'Meta', date: 'Jan 29', time: 'AMC', epsEst: '$6.73', revEst: '$46.9B', sentiment: 74, reported: true, epsBeat: true },
  { ticker: 'TSLA', name: 'Tesla', date: 'Jan 29', time: 'AMC', epsEst: '$0.71', revEst: '$25.6B', sentiment: 58, reported: true, epsBeat: false },
  { ticker: 'AMD', name: 'AMD', date: 'Feb 4', time: 'AMC', epsEst: '$1.09', revEst: '$7.53B', sentiment: 78, reported: true, epsBeat: true },
  { ticker: 'NVDA', name: 'NVIDIA', date: 'Feb 26', time: 'AMC', epsEst: '$0.84', revEst: '$38.2B', sentiment: 82 },
  { ticker: 'PLTR', name: 'Palantir', date: 'Feb 3', time: 'AMC', epsEst: '$0.11', revEst: '$778M', sentiment: 80, reported: true, epsBeat: true },
  { ticker: 'HOOD', name: 'Robinhood', date: 'Feb 12', time: 'AMC', epsEst: '$0.42', revEst: '$682M', sentiment: 55 },
  { ticker: 'SNAP', name: 'Snap Inc.', date: 'Feb 4', time: 'AMC', epsEst: '$0.08', revEst: '$1.36B', sentiment: 42, reported: true, epsBeat: false },
  { ticker: 'DIS', name: 'Disney', date: 'Feb 5', time: 'BMO', epsEst: '$1.44', revEst: '$24.6B', sentiment: 60 },
]

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function IOSExplore() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [trendingTicker, setTrendingTicker] = useState('TSLA')
  const [sectorFilter, setSectorFilter] = useState('Technology')
  const [earningsFilter, setEarningsFilter] = useState('upcoming')
  const searchRef = useRef(null)

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'news', label: 'News' },
    { id: 'earnings', label: 'Earnings' },
  ]

  const selectedTrending = TRENDING_NOW.find(t => t.ticker === trendingTicker) || TRENDING_NOW[0]

  const filteredEarnings = earningsFilter === 'upcoming'
    ? EARNINGS_CALENDAR.filter(e => !e.reported)
    : EARNINGS_CALENDAR.filter(e => e.reported)

  /* ── search filter across tickers ── */
  const searchResults = search.trim().length > 0
    ? TRENDING_NOW.filter(t => t.ticker.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div className="mx-auto max-w-[430px] h-screen flex flex-col overflow-hidden bg-black text-white relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>

      {/* ── iOS Status Bar ── */}
      <div className="shrink-0 flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M1 9l2 2c3.9-3.9 10.1-3.9 14 0l2-2C14.1 4.1 5.9 4.1 1 9zm8 8l3 3 3-3a4.2 4.2 0 00-6 0zm-4-4l2 2a7 7 0 019.9 0l2-2C14.1 8.1 9.9 8.1 5 13z" /></svg>
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M2 22h20V2z" opacity="0.3" /><path d="M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z" /></svg>
          <div className="w-6 h-3 rounded-sm border border-white/40 relative overflow-hidden">
            <div className="absolute inset-y-0.5 left-0.5 right-1 bg-white rounded-[1px]" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* ── Top Bar: hamburger + search + chat ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10">
        {/* Hamburger */}
        <button type="button" className="p-1 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        {/* Search bar */}
        <div className="flex-1 relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbols, people, topics..."
            className="w-full bg-white/10 rounded-full pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#2196F3]/50"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            </button>
          )}
        </div>

        {/* Chat icon */}
        <button type="button" className="p-1 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
        </button>
      </div>

      {/* ── Search Results Overlay ── */}
      {search.trim().length > 0 && (
        <div className="absolute top-[105px] left-0 right-0 bottom-0 bg-black z-30 overflow-y-auto px-4 pt-3">
          {searchResults.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">No results for "{search}"</p>
          ) : (
            searchResults.map(t => (
              <button key={t.ticker} type="button" onClick={() => { setSearch(''); navigate(`/symbol?ticker=${t.ticker}`) }} className="flex items-center gap-3 w-full py-3 border-b border-white/5 active:bg-white/5">
                {getTickerLogo(t.ticker) ? (
                  <img src={getTickerLogo(t.ticker)} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{t.ticker[0]}</div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm font-semibold">{t.ticker}</div>
                  <div className="text-xs text-white/40">{t.name}</div>
                </div>
                <span className={clsx('text-xs font-semibold', t.pct >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {t.pct >= 0 ? '+' : ''}{t.pct.toFixed(2)}%
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Section Tabs ── */}
      <div className="shrink-0 flex border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
              activeTab === tab.id ? 'text-white border-white' : 'text-white/40 border-transparent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ═══════════  OVERVIEW TAB  ═══════════ */}
        {activeTab === 'overview' && (
          <div className="px-3 py-4 space-y-5">

            {/* Market Cards */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
              {MARKET_CARDS.map(card => {
                const up = card.pct >= 0
                return (
                  <div key={card.symbol} className="shrink-0 w-[150px] rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      {getTickerLogo(card.symbol) && (
                        <img src={getTickerLogo(card.symbol)} alt="" className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span className="text-xs font-bold">{card.symbol}</span>
                    </div>
                    <div className="text-sm font-bold mt-0.5 tabular-nums">
                      {card.price >= 1000 ? card.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : card.price.toFixed(2)}
                    </div>
                    <div className={clsx('text-[11px] font-semibold tabular-nums', up ? 'text-green-400' : 'text-red-400')}>
                      {up ? '+' : ''}{card.pct.toFixed(2)}%
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-white/10">
                      <div className="text-[8px] uppercase tracking-wide text-white/30 mb-0.5">Discussing</div>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px]">
                        <span>{card.topTopicIcon}</span>
                        <span className="text-white/70">{card.topTopic}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Trending */}
            <section>
              <h2 className="text-base font-bold mb-2">Trending</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TRENDING_NOW.map(s => (
                  <button
                    key={s.ticker}
                    type="button"
                    onClick={() => setTrendingTicker(s.ticker)}
                    className={clsx(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors',
                      trendingTicker === s.ticker ? 'border-[#2196F3] bg-[#2196F3]/15 text-[#2196F3]' : 'border-white/10 text-white/70'
                    )}
                  >
                    {getTickerLogo(s.ticker) ? (
                      <img src={getTickerLogo(s.ticker)} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{s.ticker[0]}</span>
                    )}
                    <span className="font-semibold">{s.ticker}</span>
                    <span className={clsx('tabular-nums', s.pct >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>
              {/* Why trending card */}
              <div className="rounded-xl p-3 mt-1" style={{ background: 'linear-gradient(135deg, rgba(254,215,170,0.15), rgba(250,204,211,0.12), rgba(139,92,246,0.12))' }}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/60">Why ${selectedTrending.ticker} Is Trending</h3>
                <p className="text-[13px] text-white/70 mt-1 leading-relaxed">{selectedTrending.whyBlurb}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-white/40">
                  <span>{selectedTrending.comments} messages</span>
                  <span>Sentiment: {selectedTrending.sentiment}%</span>
                </div>
              </div>
            </section>

            {/* Live Earnings Calls */}
            <section>
              <h2 className="text-base font-bold mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                Live Earnings Calls
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {LIVE_EARNINGS.map(e => (
                  <div key={e.ticker} className="shrink-0 w-[130px] rounded-xl border border-white/10 bg-white/5 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      {getTickerLogo(e.ticker) && (
                        <img src={getTickerLogo(e.ticker)} alt="" className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span className="text-xs font-bold">{e.ticker}</span>
                    </div>
                    <div className="text-[10px] text-white/40">🎧 {e.listeners} listening</div>
                    <div className="text-[10px] text-white/30">Started {e.started}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Topics */}
            <section>
              <h2 className="text-base font-bold mb-2">Top Topics</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TOP_TOPICS.map(t => (
                  <div key={t.label} className="shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-lg">{t.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold">{t.label}</div>
                      <div className="text-[10px] text-white/40">{t.count} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Prediction Leaderboard */}
            <section>
              <h2 className="text-base font-bold mb-2">Prediction Leaderboard</h2>
              <div className="space-y-0 divide-y divide-white/5">
                {PREDICTION_LEADERBOARD.map(p => (
                  <div key={p.rank} className="flex items-center gap-3 py-2.5">
                    <span className="text-xs font-bold text-white/30 w-4 text-right">{p.rank}</span>
                    <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">@{p.handle}</span>
                    </div>
                    <span className="text-xs font-semibold text-green-400">{p.value} pts</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Watchlist Adds */}
            <section>
              <h2 className="text-base font-bold mb-2">Top Watchlist Adds</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TOP_WATCHLIST_ADDS.map(w => (
                  <div key={w.ticker} className="shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    {getTickerLogo(w.ticker) && (
                      <img src={getTickerLogo(w.ticker)} alt="" className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="text-xs font-bold">{w.ticker}</div>
                      <div className="text-[10px] text-white/40">+{w.adds} adds</div>
                    </div>
                    <span className={clsx('text-[10px] font-semibold ml-1', w.pct >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {w.pct >= 0 ? '+' : ''}{w.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Discussions (Polls) */}
            <section>
              <h2 className="text-base font-bold mb-2">Top Discussions</h2>
              <div className="space-y-3">
                {TOP_DISCUSSIONS.map(poll => (
                  <div key={poll.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[13px] font-semibold leading-snug">{poll.question}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {poll.choices.map(c => (
                        <span key={c} className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-white/60">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                      <span>{poll.votes} votes</span>
                      <span>{poll.timeLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ═══════════  NEWS TAB  ═══════════ */}
        {activeTab === 'news' && (
          <div className="px-3 py-4 space-y-5">

            {/* Community Focus Hero */}
            <section>
              <h2 className="text-base font-bold mb-2">Community Focus</h2>
              {COMMUNITY_FOCUS.slice(0, 1).map((art, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-[16/9] bg-white/5">
                  <img src={art.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  {art.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-5 h-5 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-bold leading-snug">{art.headline}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/70">
                      <img src={art.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{art.author}</span>
                      <span>{art.time}</span>
                      {art.ticker && (
                        <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-semibold', (art.pct ?? 0) >= 0 ? 'bg-green-500/80' : 'bg-red-500/80')}>
                          ${art.ticker} {(art.pct ?? 0) >= 0 ? '+' : ''}{art.pct}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* More articles */}
              <div className="mt-3 space-y-3">
                {COMMUNITY_FOCUS.slice(1).map((art, i) => (
                  <div key={i} className="flex gap-3 active:bg-white/5 rounded-lg p-1 -m-1">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      <img src={art.image} alt="" className="w-full h-full object-cover" />
                      {art.video && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                            <svg className="w-3 h-3 text-black ml-px" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold line-clamp-2 leading-snug">{art.headline}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5">{art.author} • {art.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sector Focus */}
            <section>
              <h2 className="text-base font-bold mb-2">Sector Focus</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {SECTOR_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSectorFilter(cat)}
                    className={clsx(
                      'shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      sectorFilter === cat ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/60'
                    )}
                  >
                    <span>{SECTOR_EMOJIS[cat]}</span>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-3 px-3 mt-1" style={{ scrollbarWidth: 'none' }}>
                {(SECTOR_ARTICLES[sectorFilter] || []).map((art, i) => {
                  const up = (art.pct ?? 0) >= 0
                  return (
                    <div key={i} className="shrink-0 w-[200px] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      <div className="relative aspect-video bg-white/5">
                        <img src={art.image} alt="" className="w-full h-full object-cover" />
                        {art.video && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                              <svg className="w-4 h-4 text-black ml-px" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        )}
                        <span className={clsx('absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold', up ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white')}>
                          ${art.ticker} {up ? '+' : ''}{art.pct}%
                        </span>
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-semibold line-clamp-2 leading-snug">{art.title}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{art.source} • {art.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Shows */}
            <section>
              <h2 className="text-base font-bold mb-2">Shows</h2>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {SHOWS.map((show, i) => (
                  <div key={i} className="shrink-0 w-[160px] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <div className="aspect-video bg-white/5">
                      <img src={show.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold line-clamp-1">{show.title}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{show.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Now */}
            <section>
              <h2 className="text-base font-bold mb-2">Trending Now</h2>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TRENDING_NEWS.map((art, i) => {
                  const up = (art.pct ?? 0) >= 0
                  return (
                    <div key={i} className="shrink-0 w-[200px] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      <div className="relative aspect-video bg-white/5">
                        <img src={art.image} alt="" className="w-full h-full object-cover" />
                        {art.video && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                              <svg className="w-4 h-4 text-black ml-px" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        )}
                        {art.ticker && (
                          <span className={clsx('absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold', up ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white')}>
                            ${art.ticker} {up ? '+' : ''}{art.pct}%
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-semibold line-clamp-2 leading-snug">{art.title}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{art.meta}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* ═══════════  EARNINGS TAB  ═══════════ */}
        {activeTab === 'earnings' && (
          <div className="px-3 py-4 space-y-4">

            {/* Upcoming / Reported toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEarningsFilter('upcoming')}
                className={clsx(
                  'flex-1 py-2 rounded-full text-xs font-semibold transition-colors',
                  earningsFilter === 'upcoming' ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/50'
                )}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setEarningsFilter('reported')}
                className={clsx(
                  'flex-1 py-2 rounded-full text-xs font-semibold transition-colors',
                  earningsFilter === 'reported' ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/50'
                )}
              >
                Reported
              </button>
            </div>

            {/* Live Earnings Calls */}
            {earningsFilter === 'upcoming' && (
              <section>
                <h2 className="text-sm font-bold mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                  Live Calls
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                  {LIVE_EARNINGS.map(e => (
                    <div key={e.ticker} className="shrink-0 w-[130px] rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getTickerLogo(e.ticker) && (
                          <img src={getTickerLogo(e.ticker)} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className="text-xs font-bold">{e.ticker}</span>
                      </div>
                      <div className="text-[10px] text-white/40">🎧 {e.listeners} listening</div>
                      <div className="text-[10px] text-white/30">Started {e.started}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Earnings Calendar List */}
            <section>
              <h2 className="text-sm font-bold mb-2">{earningsFilter === 'upcoming' ? 'Upcoming Earnings' : 'Recently Reported'}</h2>
              <div className="divide-y divide-white/5">
                {filteredEarnings.map(e => (
                  <div key={e.ticker} className="py-3 flex items-center gap-3">
                    {getTickerLogo(e.ticker) ? (
                      <img src={getTickerLogo(e.ticker)} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{e.ticker[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{e.ticker}</span>
                        <span className="text-[10px] text-white/30">{e.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/40">
                        <span>{e.date}</span>
                        <span className="text-white/20">•</span>
                        <span>{e.time === 'AMC' ? 'After Close' : 'Before Open'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-white/50">
                        EPS Est. <span className="text-white/70 font-medium">{e.epsEst}</span>
                      </div>
                      <div className="text-[11px] text-white/50">
                        Rev Est. <span className="text-white/70 font-medium">{e.revEst}</span>
                      </div>
                      {e.reported && (
                        <div className={clsx('text-[10px] font-semibold mt-0.5', e.epsBeat ? 'text-green-400' : 'text-red-400')}>
                          {e.epsBeat ? '✓ Beat' : '✗ Missed'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sentiment around earnings */}
            <section>
              <h2 className="text-sm font-bold mb-2">Earnings Sentiment</h2>
              <div className="space-y-2">
                {EARNINGS_CALENDAR.slice(0, 6).map(e => (
                  <div key={e.ticker} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-10">{e.ticker}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-green-400" style={{ width: `${e.sentiment}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-white/50 w-8 text-right">{e.sentiment}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </div>

      {/* ── Bottom Navigation ── */}
      <IOSBottomNav />
    </div>
  )
}
