import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import IOSBottomNav from '../components/IOSBottomNav.jsx'
import IOSShareSheet from '../components/IOSShareSheet.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...v) { return v.filter(Boolean).join(' ') }

/* ══════════════════════════════════════════════════════════════
   OVERVIEW DATA  (mirrored from Homepage3 Market Overview)
   ══════════════════════════════════════════════════════════════ */
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
  { emoji: '🖥️', label: 'Data Center Demand', count: '52.3K', color: '#6366f1', tickers: ['NVDA', 'AMD', 'AVGO', 'MSFT'] },
  { emoji: '📈', label: 'AI Capex', count: '44.6K', color: '#06b6d4', tickers: ['NVDA', 'MSFT', 'GOOGL', 'META'] },
  { emoji: '🤖', label: 'Robotaxi Dreams', count: '41.2K', color: '#22c55e', tickers: ['TSLA', 'NVDA', 'GOOGL'] },
  { emoji: '🔮', label: 'Blackwell Ramp', count: '38.1K', color: '#8b5cf6', tickers: ['NVDA', 'AMD'] },
  { emoji: '⚡', label: 'Earnings Beat', count: '35.2K', color: '#f59e0b', tickers: ['NVDA', 'AAPL', 'AMZN', 'TSLA'] },
  { emoji: '☁️', label: 'AWS Reacceleration', count: '31.5K', color: '#f97316', tickers: ['AMZN', 'MSFT', 'GOOGL'] },
  { emoji: '🚀', label: 'Merging Ambitions', count: '28.4K', color: '#ef4444', tickers: ['TSLA'] },
  { emoji: '🔷', label: 'MI300 Adoption', count: '26.8K', color: '#3b82f6', tickers: ['AMD', 'NVDA'] },
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
  { id: 6, question: 'Which mega-cap has the best risk/reward here?', choices: ['$AAPL', '$MSFT', '$NVDA', '$GOOGL'], votes: '8.2k', timeLabel: '2d left', published: 'Feb 09, 2026 · 8:00 AM', comments: 203 },
  { id: 1, question: 'What do you expect from $HOOD earnings on Tuesday?', choices: ['Beat EPS and revenue', 'Beat EPS, miss revenue', 'Miss EPS, beat revenue', 'Miss EPS and revenue'], votes: '5.7k', timeLabel: '21h left', published: 'Feb 09, 2026 · 10:23 AM', comments: 84 },
  { id: 2, question: "What will be the S&P 500's next 5% move?", choices: ['Up 5%', 'Down 5%'], votes: '14k', timeLabel: 'Ended 13h ago', published: 'Feb 08, 2026 · 2:15 PM', comments: 312 },
  { id: 3, question: 'Are you buying the dip on any of these beaten down growth stocks?', choices: ['$HOOD', '$APP', '$PLTR', '$RKLB'], votes: '1.7k', timeLabel: 'Ended 1d ago', published: 'Feb 08, 2026 · 9:00 AM', comments: 156 },
  { id: 4, question: 'Where does crypto go from here?', choices: ['Recovery and trend continuation', 'Sideways consolidation', 'Lower lows ahead', 'Volatile chop before direction'], votes: '11.5k', timeLabel: 'Ended 1d ago', published: 'Feb 07, 2026 · 4:45 PM', comments: 428 },
  { id: 5, question: 'What do you expect from $RDDT earnings on Thursday?', choices: ['Beat EPS and revenue', 'Beat EPS, miss revenue', 'Miss EPS, beat revenue', 'Miss EPS and revenue'], votes: '3k', timeLabel: 'Ended 4d ago', published: 'Feb 06, 2026 · 11:20 AM', comments: 67 },
]

const WTF_CATEGORIES = ['Trending', 'Day Trader', 'Options', 'Crypto', 'Swing', 'Macro', 'Value']
const WTF_PEOPLE = {
  Trending: [
    { handle: 'howardlindzon', name: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', bio: 'Co-Founder & CEO @Stocktwits', verified: true, followers: '376.2K' },
    { handle: 'rosscameron', name: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', bio: 'Founder @WarriorTrading. $10M+ verified profits.', verified: true, followers: '128.5K' },
    { handle: 'FinanceBuzz', name: 'Finance Buzz', avatar: '/avatars/who-follow-3.png', bio: 'Breaking down complex market events simply.', verified: true, followers: '112.4K' },
    { handle: 'MarketVibes', name: 'Market Vibes', avatar: '/avatars/who-follow-4.png', bio: 'Daily market recaps and pre-market analysis.', verified: false, followers: '89.7K' },
    { handle: 'StreetSmarts', name: 'Street Smarts', avatar: '/avatars/ross-cameron.png', bio: 'Making finance fun. Viral market explainers.', verified: true, followers: '324.1K' },
    { handle: 'CryptoKing', name: 'Crypto King', avatar: '/avatars/top-voice-1.png', bio: 'Full-time crypto trader since 2017.', verified: false, followers: '52.8K' },
  ],
  'Day Trader': [
    { handle: 'rosscameron', name: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', bio: 'Founder @WarriorTrading. Day trading educator.', verified: true, followers: '128.5K' },
    { handle: 'ScalpKing', name: 'Scalp King', avatar: '/avatars/top-voice-3.png', bio: 'ES and NQ futures scalper. 200+ trades/week.', verified: false, followers: '34.8K' },
    { handle: 'TapeReader', name: 'Tape Reader', avatar: '/avatars/top-voice-1.png', bio: 'Order flow, time & sales, Level 2 depth.', verified: false, followers: '22.1K' },
    { handle: 'PreMarketPro', name: 'Pre-Market Pro', avatar: '/avatars/michael-bolling.png', bio: 'Gap scanners and news catalysts daily.', verified: false, followers: '31.4K' },
    { handle: 'GapTrader', name: 'Gap Trader', avatar: '/avatars/who-follow-2.png', bio: 'Gap-and-go specialist. Small caps with volume.', verified: false, followers: '19.2K' },
    { handle: 'FuturesEdge', name: 'Futures Edge', avatar: '/avatars/top-voice-2.png', bio: 'ES, NQ, and CL futures full-time since 2016.', verified: false, followers: '28.9K' },
  ],
  Options: [
    { handle: 'OptionsFlow', name: 'Options Flow', avatar: '/avatars/top-voice-1.png', bio: 'Real-time unusual options activity tracking.', verified: false, followers: '67.1K' },
    { handle: 'ThetaGang', name: 'Theta Gang', avatar: '/avatars/who-follow-2.png', bio: 'Premium selling specialist. Time decay is my edge.', verified: false, followers: '41.2K' },
    { handle: 'GammaExposure', name: 'Gamma Exposure', avatar: '/avatars/top-voice-3.png', bio: 'Tracking dealer gamma positioning daily.', verified: false, followers: '35.4K' },
    { handle: '0DTEWarrior', name: '0DTE Warrior', avatar: '/avatars/who-follow-4.png', bio: 'Zero-days-to-expiration options specialist.', verified: false, followers: '47.2K' },
    { handle: 'SpreadTrader', name: 'Spread Trader', avatar: '/avatars/ross-cameron.png', bio: 'Credit spreads, debit spreads, and butterflies.', verified: false, followers: '29.3K' },
    { handle: 'VolSurface', name: 'Vol Surface', avatar: '/avatars/michele-steele.png', bio: 'Volatility trader and former market maker.', verified: false, followers: '13.7K' },
  ],
  Crypto: [
    { handle: 'CryptoKing', name: 'Crypto King', avatar: '/avatars/top-voice-1.png', bio: 'Full-time crypto trader since 2017. DeFi & L1s.', verified: false, followers: '52.8K' },
    { handle: 'BTCMaxi', name: 'BTC Maxi', avatar: '/avatars/top-voice-1.png', bio: 'Bitcoin-only conviction. Halving cycles.', verified: false, followers: '73.6K' },
    { handle: 'DeFiDegen', name: 'DeFi Degen', avatar: '/avatars/top-voice-3.png', bio: 'Yield farming and on-chain analysis.', verified: false, followers: '38.5K' },
    { handle: 'OnChainAlpha', name: 'On-Chain Alpha', avatar: '/avatars/who-follow-4.png', bio: 'Whale wallets and exchange flows.', verified: false, followers: '26.1K' },
    { handle: 'AltSeason', name: 'Alt Season', avatar: '/avatars/howard-lindzon.png', bio: 'Altcoin specialist. Finding the next 10x.', verified: false, followers: '44.9K' },
    { handle: 'MemeCoiner', name: 'Meme Coiner', avatar: '/avatars/who-follow-4.png', bio: 'DOGE, SHIB, and the next viral token.', verified: false, followers: '56.3K' },
  ],
  Swing: [
    { handle: 'MomentumKing', name: 'Momentum King', avatar: '/avatars/who-follow-2.png', bio: 'Relative strength and volume breakouts.', verified: false, followers: '31.6K' },
    { handle: 'SwingSetups', name: 'Swing Setups', avatar: '/avatars/top-voice-1.png', bio: 'Multi-day holds based on weekly charts.', verified: false, followers: '22.8K' },
    { handle: 'TrendRider', name: 'Trend Rider', avatar: '/avatars/ross-cameron.png', bio: 'Riding trends. 12-year track record.', verified: false, followers: '19.5K' },
    { handle: 'BreakoutHunter', name: 'Breakout Hunter', avatar: '/avatars/who-follow-3.png', bio: 'Cup & handle, bull flags, tight consolidations.', verified: false, followers: '17.3K' },
    { handle: 'PullbackKing', name: 'Pullback King', avatar: '/avatars/who-follow-4.png', bio: 'Buying pullbacks in uptrends. Fibonacci levels.', verified: false, followers: '18.3K' },
    { handle: 'PatternTrader', name: 'Pattern Trader', avatar: '/avatars/who-follow-3.png', bio: 'Classical chart patterns. Textbook entries.', verified: false, followers: '28.6K' },
  ],
  Macro: [
    { handle: 'MacroMaven', name: 'Macro Maven', avatar: '/avatars/who-follow-4.png', bio: 'Global macro strategist. Former institutional PM.', verified: false, followers: '22.4K' },
    { handle: 'FedWatcher', name: 'Fed Watcher', avatar: '/avatars/top-voice-2.png', bio: 'Interest rate forecasting since 2010.', verified: false, followers: '35.6K' },
    { handle: 'GeopoliticsNow', name: 'Geopolitics Now', avatar: '/avatars/top-voice-3.png', bio: 'How geopolitics moves markets.', verified: false, followers: '45.8K' },
    { handle: 'ChiefEconomist', name: 'Chief Economist', avatar: '/avatars/top-voice-2.png', bio: 'Former Fed economist. Data releases decoded.', verified: true, followers: '52.4K' },
    { handle: 'InflationWatch', name: 'Inflation Watch', avatar: '/avatars/who-follow-3.png', bio: 'CPI, PPI, PCE — every inflation data point.', verified: false, followers: '33.1K' },
    { handle: 'BondVigilante', name: 'Bond Vigilante', avatar: '/avatars/michele-steele.png', bio: 'Fixed income. Auctions and credit spreads.', verified: false, followers: '26.9K' },
  ],
  Value: [
    { handle: 'MarginOfSafety', name: 'Margin of Safety', avatar: '/avatars/top-voice-1.png', bio: 'Buffett-style value investing. Moats & management.', verified: false, followers: '42.3K' },
    { handle: 'DividendKing', name: 'Dividend King', avatar: '/avatars/michael-bolling.png', bio: '25-year DRIP portfolio. Yield + growth.', verified: false, followers: '33.7K' },
    { handle: 'ValueHunter', name: 'Value Hunter', avatar: '/avatars/who-follow-3.png', bio: 'Deep value & contrarian plays. CFA charterholder.', verified: false, followers: '14.9K' },
    { handle: 'FCFocus', name: 'Free Cash Flow Focus', avatar: '/avatars/top-voice-2.png', bio: 'Undervalued compounders with sustainable FCF.', verified: false, followers: '18.2K' },
    { handle: 'DividendGrowth', name: 'Dividend Growth', avatar: '/avatars/ross-cameron.png', bio: 'Companies raising dividends 10+ years straight.', verified: false, followers: '38.9K' },
    { handle: 'QualityCompound', name: 'Quality Compounder', avatar: '/avatars/michele-steele.png', bio: 'High ROIC, capital-light businesses.', verified: false, followers: '22.5K' },
  ],
}

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
   FOR YOU FEED DATA (mixed video + message posts)
   ══════════════════════════════════════════════════════════════ */
const FYF_ITEMS = [
  {
    id: 1, type: 'video',
    user: { handle: 'shahh', name: 'shah', avatar: '/avatars/top-voice-1.png', verified: true },
    caption: 'oh boy we might actually be in trouble',
    videoThumb: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=430&h=760&fit=crop',
    overlay: 'Michael Saylor says credit risk over Strategy overblown',
    duration: '00:43', elapsed: '00:05',
    comments: 752, reposts: 706, likes: 3300, views: '867K',
    time: '8h',
  },
  {
    id: 2, type: 'message',
    user: { handle: 'howardlindzon', name: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', verified: true, badge: 'EDGE' },
    ticker: 'HOOD', sentiment: 'bullish',
    body: '$HOOD updated robinhood cheat sheet',
    embed: { source: 'EquityResearch...', sourceIcon: '📊', date: '2/10/26, 8:15 PM', title: '$HOOD 4Q25 - The SuperApp Nobody\'s Pricing In. Robinhood\'s 2026 Roadmap Is Insane. Bull $175', domain: 'open.substack.com', hasChart: true },
    comments: 1, reposts: 0, likes: 7,
    time: '11:18 AM',
  },
  {
    id: 3, type: 'video',
    user: { handle: 'MickeyMarkets', name: 'Michael Bolling', avatar: '/avatars/who-follow-1.png', verified: true },
    caption: '$NVDA Blackwell ramp is real. Jensen just confirmed another quarter of insane demand.',
    videoThumb: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=430&h=760&fit=crop',
    overlay: 'NVIDIA CEO confirms Blackwell demand far exceeds supply',
    duration: '01:22', elapsed: '00:15',
    comments: 423, reposts: 189, likes: 2100, views: '412K',
    time: '3h',
  },
  {
    id: 4, type: 'message',
    user: { handle: 'TechTrader', name: 'TechTrader', avatar: '/avatars/top-voice-2.png', verified: false },
    ticker: 'TSLA', sentiment: 'bullish',
    body: 'Cybertruck production numbers just leaked. Way higher than expected. This is going to send it. Full self-driving v12.5 rollout expanding to 100% of fleet by March.',
    embed: null,
    comments: 45, reposts: 12, likes: 234,
    time: '2h',
  },
  {
    id: 5, type: 'video',
    user: { handle: 'CNBCClips', name: 'CNBC Clips', avatar: '/avatars/top-voice-3.png', verified: true },
    caption: 'Fed Chair Powell: "We are in no hurry to cut rates"',
    videoThumb: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=430&h=760&fit=crop',
    overlay: 'Powell speaks on rate policy and inflation trajectory',
    duration: '02:15', elapsed: '00:32',
    comments: 1200, reposts: 845, likes: 5600, views: '1.2M',
    time: '5h',
  },
  {
    id: 6, type: 'message',
    user: { handle: 'QuantQueen', name: 'QuantQueen', avatar: '/avatars/top-voice-2.png', verified: false },
    ticker: 'AMD', sentiment: 'bullish',
    body: 'MI300X allocations completely sold out through Q3. Lisa Su just confirmed on the call that inference demand is accelerating faster than training. $AMD is about to have its moment.',
    embed: null,
    comments: 89, reposts: 34, likes: 567,
    time: '45m',
  },
  {
    id: 7, type: 'video',
    user: { handle: 'rosscameron', name: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', verified: true },
    caption: 'Day trading $GME — caught the breakout for +$8,400 in 12 minutes',
    videoThumb: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=430&h=760&fit=crop',
    overlay: 'Live trade: GME breakout above $31 resistance',
    duration: '03:45', elapsed: '01:02',
    comments: 312, reposts: 156, likes: 1890, views: '523K',
    time: '1h',
  },
  {
    id: 8, type: 'message',
    user: { handle: 'CryptoBull', name: 'CryptoBull', avatar: '/avatars/user-avatar.png', verified: false },
    ticker: 'BTC', sentiment: 'bullish',
    body: 'Bitcoin ETF inflows just hit a new daily record. Over $1.2B in a single day. Institutions are not slowing down. The supply shock is coming.',
    embed: null,
    comments: 156, reposts: 78, likes: 1200,
    time: '30m',
  },
  {
    id: 9, type: 'video',
    user: { handle: 'steeletwits', name: 'Michele Steele', avatar: '/avatars/michele-steele.png', verified: true },
    caption: 'Why the earnings revision cycle is just getting started for big tech',
    videoThumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=430&h=760&fit=crop',
    overlay: 'Big Tech earnings revisions accelerating into Q2',
    duration: '04:12', elapsed: '00:48',
    comments: 267, reposts: 123, likes: 1450, views: '389K',
    time: '6h',
  },
  {
    id: 10, type: 'message',
    user: { handle: 'AlphaSeeker', name: 'AlphaSeeker', avatar: '/avatars/top-voice-1.png', verified: false },
    ticker: 'PLTR', sentiment: 'bullish',
    body: 'Palantir AIP bootcamp pipeline is absolutely insane. Every Fortune 500 company wants in. This is going to be a $100B company within 2 years. Commercial revenue inflection is HERE.',
    embed: null,
    comments: 67, reposts: 23, likes: 345,
    time: '1h',
  },
]

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function IOSExplore() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [trendingTicker, setTrendingTicker] = useState('TSLA')
  const [wtfCat, setWtfCat] = useState('Trending')
  const [sectorFilter, setSectorFilter] = useState('Technology')
  const [earningsFilter, setEarningsFilter] = useState('upcoming')
  const [forYouUnlocked, setForYouUnlocked] = useState(false)
  const [fyCurrentIndex, setFyCurrentIndex] = useState(0)
  const [fyLiked, setFyLiked] = useState(() => new Set())
  const [fyPlaying, setFyPlaying] = useState(true)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const searchRef = useRef(null)
  const fyContainerRef = useRef(null)
  const fyTouchStartY = useRef(0)
  const fyTouchStartTime = useRef(0)

  const TABS = [
    ...(forYouUnlocked ? [{ id: 'foryou', label: 'For You' }] : []),
    { id: 'overview', label: 'Overview' },
    { id: 'news', label: 'News' },
    { id: 'earnings', label: 'Earnings' },
  ]

  /* ── For You swipe handling ── */
  const fyItem = FYF_ITEMS[fyCurrentIndex] || FYF_ITEMS[0]

  const handleFyTouchStart = useCallback((e) => {
    fyTouchStartY.current = e.touches[0].clientY
    fyTouchStartTime.current = Date.now()
  }, [])

  const handleFyTouchEnd = useCallback((e) => {
    const dy = fyTouchStartY.current - e.changedTouches[0].clientY
    const dt = Date.now() - fyTouchStartTime.current
    const velocity = Math.abs(dy) / dt
    // Swipe up → next, swipe down → prev (threshold: 50px or fast flick)
    if (dy > 50 || (dy > 20 && velocity > 0.3)) {
      setFyCurrentIndex(prev => Math.min(prev + 1, FYF_ITEMS.length - 1))
    } else if (dy < -50 || (dy < -20 && velocity > 0.3)) {
      setFyCurrentIndex(prev => Math.max(prev - 1, 0))
    }
  }, [])

  const toggleFyLike = useCallback((id) => {
    setFyLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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
          <button
            type="button"
            onClick={() => { if (!forYouUnlocked) { setForYouUnlocked(true); setActiveTab('foryou') } }}
            className="relative"
          >
            <div className={clsx('w-6 h-3 rounded-sm border relative overflow-hidden transition-colors', forYouUnlocked ? 'border-[#2196F3]' : 'border-white/40')}>
              <div className={clsx('absolute inset-y-0.5 left-0.5 right-1 rounded-[1px]', forYouUnlocked ? 'bg-[#2196F3]' : 'bg-white')} style={{ width: '70%' }} />
            </div>
          </button>
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
      <div className={clsx('flex-1', activeTab === 'foryou' ? 'overflow-hidden' : 'overflow-y-auto')}>

        {/* ═══════════  FOR YOU TAB  ═══════════ */}
        {activeTab === 'foryou' && (
          <div
            ref={fyContainerRef}
            className="h-full w-full relative bg-black select-none"
            onTouchStart={handleFyTouchStart}
            onTouchEnd={handleFyTouchEnd}
          >
            {/* ── Video Item ── */}
            {fyItem.type === 'video' && (
              <div className="absolute inset-0 flex flex-col">
                {/* Video background */}
                <div className="absolute inset-0">
                  <img src={fyItem.videoThumb} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Overlay text on video */}
                <div className="absolute bottom-28 left-0 right-14 px-4 z-10">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 mb-3 inline-block">
                    <p className="text-sm font-semibold leading-snug">{fyItem.overlay}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-white/60 tabular-nums">{fyItem.elapsed}</span>
                    <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '12%' }} />
                    </div>
                    <span className="text-[10px] text-white/60 tabular-nums">{fyItem.duration}</span>
                  </div>
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <img src={fyItem.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{fyItem.user.name}</span>
                      {fyItem.user.verified && (
                        <svg className="w-3.5 h-3.5 text-[#2196F3]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      )}
                    </div>
                    <button type="button" className="ml-auto px-3 py-1 rounded-full text-xs font-semibold border border-white/30 text-white active:bg-white/10">
                      Follow
                    </button>
                  </div>
                  <p className="text-[13px] text-white/90 mt-2 leading-snug">{fyItem.caption}</p>
                  <span className="text-[11px] text-white/40 mt-1 block">{fyItem.time}</span>
                </div>

                {/* Right side action buttons — matches /symbol web icons */}
                <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
                  {/* Comment */}
                  <button type="button" onClick={() => navigate('/notifications')} className="flex flex-col items-center gap-0.5">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <span className="text-[10px] font-semibold">{formatCount(fyItem.comments)}</span>
                  </button>
                  {/* Repost */}
                  <button type="button" className="flex flex-col items-center gap-0.5">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span className="text-[10px] font-semibold">{formatCount(fyItem.reposts)}</span>
                  </button>
                  {/* Like */}
                  <button type="button" onClick={() => toggleFyLike(fyItem.id)} className="flex flex-col items-center gap-0.5">
                    <svg className={clsx('w-7 h-7', fyLiked.has(fyItem.id) ? 'text-red-500' : 'text-white')} fill={fyLiked.has(fyItem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    <span className="text-[10px] font-semibold">{formatCount(fyLiked.has(fyItem.id) ? fyItem.likes + 1 : fyItem.likes)}</span>
                  </button>
                  {/* Share */}
                  <button type="button" onClick={() => setShareSheetOpen(true)} className="flex flex-col items-center gap-0.5">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                  {/* Bookmark */}
                  <button type="button" className="flex flex-col items-center gap-0.5">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"/></svg>
                  </button>
                </div>

                {/* Pagination dots */}
                <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-10">
                  {FYF_ITEMS.map((_, i) => (
                    <div key={i} className={clsx('h-0.5 rounded-full transition-all', i === fyCurrentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30')} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Message Item ── */}
            {fyItem.type === 'message' && (
              <div className="absolute inset-0 flex flex-col bg-black">
                {/* Pagination dots */}
                <div className="shrink-0 flex justify-center gap-1 pt-3 pb-2">
                  {FYF_ITEMS.map((_, i) => (
                    <div key={i} className={clsx('h-0.5 rounded-full transition-all', i === fyCurrentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30')} />
                  ))}
                </div>

                {/* Message card centered */}
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    {/* User header */}
                    <div className="flex items-center gap-3 p-4 pb-3">
                      <div className="relative">
                        <img src={fyItem.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                        {fyItem.user.badge && (
                          <span className="absolute -bottom-1 -left-1 bg-[#2196F3] text-white text-[7px] font-bold px-1 py-0.5 rounded leading-none">{fyItem.user.badge}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">{fyItem.user.name}</span>
                          {fyItem.user.verified && (
                            <svg className="w-3.5 h-3.5 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                          <span>@{fyItem.user.handle}</span>
                          <span>·</span>
                          <span>{fyItem.time}</span>
                        </div>
                      </div>
                      <button type="button" className="text-white/30">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                      </button>
                    </div>

                    {/* Ticker + sentiment */}
                    {fyItem.ticker && (
                      <div className="px-4 pb-2 flex items-center gap-2">
                        {fyItem.sentiment === 'bullish' && (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
                            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">↑</span>
                          </span>
                        )}
                        <span className="text-[#2196F3] text-sm font-semibold">${fyItem.ticker}</span>
                      </div>
                    )}

                    {/* Message body */}
                    <div className="px-4 pb-3">
                      <p className="text-[15px] leading-relaxed">{fyItem.body}</p>
                    </div>

                    {/* Embed card */}
                    {fyItem.embed && (
                      <div className="mx-4 mb-3 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                        <div className="flex items-center gap-2 p-3 border-b border-white/5">
                          <span className="text-sm">{fyItem.embed.sourceIcon}</span>
                          <span className="text-xs font-semibold text-white/70">{fyItem.embed.source}</span>
                          {fyItem.user.verified && (
                            <svg className="w-3 h-3 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                          )}
                          <span className="ml-auto text-[10px] text-white/30">{fyItem.embed.date}</span>
                        </div>
                        <div className="p-3">
                          <p className="text-[13px] leading-snug font-medium">{fyItem.embed.title}</p>
                          {fyItem.embed.hasChart && (
                            <div className="mt-3 h-32 bg-black rounded-lg border border-white/10 flex items-center justify-center">
                              {/* Fake candlestick chart */}
                              <svg className="w-full h-full p-3" viewBox="0 0 300 100" preserveAspectRatio="none">
                                {[0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285].map((x, i) => {
                                  const vals = [20,22,18,25,30,28,35,32,38,42,40,45,50,48,55,60,65,70,75,72]
                                  const y = 100 - vals[i]
                                  const h = 8 + Math.random() * 15
                                  const up = i % 3 !== 0
                                  return (
                                    <g key={i}>
                                      <line x1={x+5} y1={y-4} x2={x+5} y2={y+h+4} stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="1" />
                                      <rect x={x+2} y={y} width="6" height={h} fill={up ? '#22c55e' : '#ef4444'} rx="0.5" />
                                    </g>
                                  )
                                })}
                              </svg>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/30">
                            <span>{fyItem.embed.domain && `🔗 ${fyItem.embed.domain}`}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Engagement bar — matches /symbol web */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-white/40">
                      <button type="button" onClick={() => navigate('/notifications')} className="flex items-center gap-1.5 active:text-white/70 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        <span className="text-xs">{fyItem.comments}</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 active:text-white/70 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span className="text-xs">{fyItem.reposts}</span>
                      </button>
                      <button type="button" onClick={() => toggleFyLike(fyItem.id)} className={clsx('flex items-center gap-1.5 active:scale-110 transition-transform', fyLiked.has(fyItem.id) ? 'text-red-500' : 'text-white/40')}>
                        <svg className="w-4 h-4" fill={fyLiked.has(fyItem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span className="text-xs">{fyLiked.has(fyItem.id) ? fyItem.likes + 1 : fyItem.likes}</span>
                      </button>
                      <button type="button" onClick={() => setShareSheetOpen(true)} className="active:text-white/70 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      </button>
                      <button type="button" className="active:text-[#2196F3] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Swipe hint */}
                {fyCurrentIndex === 0 && (
                  <div className="shrink-0 pb-4 flex flex-col items-center text-white/20 animate-bounce">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    <span className="text-[10px]">Swipe up</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════  OVERVIEW TAB  ═══════════ */}
        {activeTab === 'overview' && (
          <div className="px-3 py-4 space-y-5">

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

            {/* Who to Follow */}
            <section>
              <h2 className="text-base font-bold mb-2">Who to Follow</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {WTF_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWtfCat(cat)}
                    className={clsx(
                      'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border',
                      wtfCat === cat ? 'bg-[#2196F3] text-white border-[#2196F3]' : 'bg-transparent text-white/50 border-white/10'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-3 px-3 mt-1" style={{ scrollbarWidth: 'none' }}>
                {(WTF_PEOPLE[wtfCat] || []).map(person => (
                  <div key={person.handle} className="shrink-0 w-[150px] flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <img src={person.avatar} alt="" className="w-11 h-11 rounded-full object-cover mb-2 bg-white/10" />
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[11px] font-bold truncate max-w-[110px]">{person.name}</span>
                      {person.verified && (
                        <svg className="w-3 h-3 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      )}
                    </div>
                    <span className="text-[9px] text-white/30 mb-1">@{person.handle}</span>
                    <p className="text-[9px] text-white/40 leading-tight line-clamp-2 mb-1.5 min-h-[22px]">{person.bio}</p>
                    <span className="text-[9px] text-white/30 mb-2">{person.followers} followers</span>
                    <button type="button" className="w-full py-1.5 rounded-full text-[11px] font-semibold bg-[#2196F3] text-white active:opacity-80 transition-opacity">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Topics */}
            <section>
              <h2 className="text-base font-bold mb-2">Top Topics</h2>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TOP_TOPICS.map(t => (
                  <div key={t.label} className="shrink-0 w-[180px] rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{t.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-tight">{t.label}</div>
                        <div className="text-[10px] text-white/40">{t.count} posts</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tickers.map(ticker => (
                        <button
                          key={ticker}
                          type="button"
                          onClick={() => navigate(`/symbol?ticker=${ticker}`)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 active:bg-white/20 transition-colors"
                        >
                          {getTickerLogo(ticker) ? (
                            <img src={getTickerLogo(ticker)} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">{ticker[0]}</span>
                          )}
                          <span className="text-[10px] font-semibold text-white/80">{ticker}</span>
                        </button>
                      ))}
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

            {/* Top Discussions (Polls) – horizontal carousel */}
            <section>
              <h2 className="text-base font-bold mb-2">Top Discussions</h2>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                {TOP_DISCUSSIONS.map(poll => (
                  <div key={poll.id} className="shrink-0 w-[260px] rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col">
                    <p className="text-[13px] font-semibold leading-snug line-clamp-2 mb-2">{poll.question}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {poll.choices.map(c => (
                        <span key={c} className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-white/60">{c}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between text-[10px] text-white/30 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span>{poll.votes} votes</span>
                        <span>💬 {poll.comments}</span>
                      </div>
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

      {/* ── Share Sheet ── */}
      <IOSShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />

      {/* ── Bottom Navigation ── */}
      <IOSBottomNav />
    </div>
  )
}
