import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation.jsx'
import LeftSidebar from '../components/LeftSidebar.jsx'
import LatestNews from '../components/LatestNews.jsx'
import TopDiscussions from '../components/TopDiscussions.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'
import TickerLinkedText from '../components/TickerLinkedText.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { useBookmarks } from '../contexts/BookmarkContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

/** Messages from people the user follows — for Following feed. Recommended = popular (any order); Latest = reverse chron */
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
  { id: 'f13', user: 'HyperscaleFan', avatar: '/avatars/michael-bolling.png', body: 'MSFT, GOOGL, META all increasing AI spend. $NVDA is the enabler.', time: '1h 8m', ts: 68, comments: 16, reposts: 5, likes: 102 },
  { id: 'f14', user: 'AIWatcher', avatar: '/avatars/ross-cameron.png', body: 'Apple Intelligence rollout could be a sleeper catalyst for upgrades.', time: '1h 22m', ts: 82, comments: 11, reposts: 3, likes: 76 },
  { id: 'f15', user: 'BeatRaising', avatar: '/avatars/ross-cameron.png', body: 'History of under-promising. This quarter will be no different for $NVDA.', time: '2h 28m', ts: 148, comments: 22, reposts: 7, likes: 145 },
]
const FOLLOWING_RECOMMENDED = [...FOLLOWING_FEED].sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2))
const FOLLOWING_LATEST = [...FOLLOWING_FEED].sort((a, b) => a.ts - b.ts)

const DEFAULT_AVATAR = '/avatars/user-avatar.png'

/** Random social-style images to show under message body (like a real feed) */
const FEED_IMAGES = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
]

const TRENDING_NOW = [
  { ticker: 'TSLA', name: 'Tesla', price: 242.18, pct: 15.84, comments: '12.8K', sentiment: 75, rank: 1, followers: '1,050,370', whyBlurb: 'Cybertruck production ramp and full self-driving rollout are driving the conversation as investors weigh AI and robotaxi timelines against margin pressure, competition in China and Europe, and the path to volume growth—with delivery targets, battery cost curves, and regulatory updates also in focus.' },
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.32, pct: 48.93, comments: '15.2K', sentiment: 82, rank: 2, followers: '1,120,500', whyBlurb: 'Data center AI demand and the Blackwell chip ramp are driving record volume, with analysts debating whether guidance can support current valuations into next year.' },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, pct: -8.25, comments: '8.9K', sentiment: 45, rank: 3, followers: '892,500', whyBlurb: 'China sales and services growth are in focus as the street looks for iPhone stability and whether wearables and software can offset hardware cyclicality.' },
  { ticker: 'AMD', name: 'AMD', price: 156.43, pct: 24.67, comments: '9.2K', sentiment: 78, rank: 4, followers: '445,200', whyBlurb: 'MI300 adoption and data center share gains are in the spotlight with the stock riding momentum from AI build-out and better-than-feared PC and gaming trends.' },
  { ticker: 'AMZN', name: 'Amazon', price: 172.65, pct: 18.32, comments: '6.1K', sentiment: 68, rank: 5, followers: '620,800', whyBlurb: 'AWS reacceleration and advertising growth have reignited interest as margins expand and the market reprices the stock on durable cloud and retail strength.' },
  { ticker: 'META', name: 'Meta', price: 412.50, pct: 8.50, comments: '5.2K', sentiment: 72, rank: 6, followers: '498,200', whyBlurb: 'Reality Labs spend and AI investment are in focus as the street weighs metaverse timing against strong ad demand and Threads growth.' },
  { ticker: 'MSFT', name: 'Microsoft', price: 348.90, pct: 12.45, comments: '4.8K', sentiment: 65, rank: 7, followers: '892,100', whyBlurb: 'Azure growth and Copilot monetization are driving the conversation as investors assess AI infrastructure spend and cloud market share.' },
  { ticker: 'GOOGL', name: 'Alphabet', price: 142.30, pct: -12.34, comments: '4.1K', sentiment: 58, rank: 8, followers: '712,400', whyBlurb: 'Search and YouTube ad trends, plus Gemini and cloud trajectory, are in focus as the street weighs regulatory overhang.' },
  { ticker: 'PLTR', name: 'Palantir', price: 28.45, pct: 36.21, comments: '6.5K', sentiment: 81, rank: 9, followers: '445,800', whyBlurb: 'AIP bootcamp pipeline and government demand are driving record volume as the street debates commercial adoption and valuation.' },
  { ticker: 'GME', name: 'GameStop', price: 29.96, pct: 22.56, comments: '8.2K', sentiment: 62, rank: 10, followers: '1,200,500', whyBlurb: 'Retail interest and turnaround execution are in focus as the community watches cost cuts, NFT pivot, and potential catalyst events.' },
]

/** Top 10 trending for Market Overview section only (pills + why blurb, no stream) */
const MARKET_OVERVIEW_TRENDING = [...TRENDING_NOW]

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

/** Short AI summaries per ticker + topic (only shown when topic pill is clicked, not Latest) */
const TOPIC_AI_SUMMARIES = {
  TSLA: [
    { summary: 'Traders debate whether Tesla\'s energy storage, robotics, and FSD ambitions can justify its valuation, while others argue the Cybertruck ramp and Robotaxi timeline remain the key catalysts.', posts: 47, recency: '2h ago' },
    { summary: 'The community is split on Robotaxi timelines—bulls see regulatory approval as imminent while skeptics warn of years of delays and capital burn.', posts: 62, recency: '1h ago' },
    { summary: 'Semi and Megapack production ramps are driving discussion, with fleets testing and energy storage backlog at record levels.', posts: 28, recency: '3h ago' },
    { summary: 'Traders intensely debate if the stock will break higher from its range or face a sharp correction given mixed macro and EV competition.', posts: 39, recency: '2h ago' },
  ],
  NVDA: [
    { summary: 'Data center demand continues to dominate the conversation, with traders debating whether hyperscaler spend can sustain current growth rates through next year.', posts: 52, recency: '1h ago' },
    { summary: 'The Blackwell ramp is the focal point—bulls see sampling as a bullish signal while bears question supply chain readiness.', posts: 41, recency: '2h ago' },
    { summary: 'AI capex sustainability is under debate. Some argue the build-out has legs; others warn of a 2026 slowdown.', posts: 35, recency: '3h ago' },
    { summary: 'Earnings expectations are elevated. The street is split on whether guidance can support current valuations.', posts: 48, recency: '1h ago' },
  ],
  AAPL: [
    { summary: 'Services growth is the key margin story. Traders debate whether Apple can sustain high-margin expansion amid hardware cyclicality.', posts: 31, recency: '2h ago' },
    { summary: 'China sales remain in focus—bears see persistent weakness while bulls argue the worst is priced in.', posts: 44, recency: '1h ago' },
    { summary: 'Capital return and buyback pace are driving discussion. Many see the yield-plus-buyback combo as compelling.', posts: 27, recency: '4h ago' },
    { summary: 'Ecosystem lock-in and upgrade cycles are debated. Apple Intelligence rollout could be a sleeper catalyst.', posts: 38, recency: '2h ago' },
  ],
  AMD: [
    { summary: 'MI300 adoption is ramping. The community debates whether AMD can take meaningful share from NVIDIA in key AI segments.', posts: 39, recency: '2h ago' },
    { summary: 'Data center share gains are in focus. Execution has been stellar, but valuation versus NVDA remains a question.', posts: 33, recency: '1h ago' },
    { summary: 'Guidance was seen as conservative. Traders debate whether the data center build-out has legs through 2026.', posts: 29, recency: '3h ago' },
    { summary: 'PC and gaming are holding up. The community views execution as strong with MI300 as the growth driver.', posts: 24, recency: '4h ago' },
  ],
  AMZN: [
    { summary: 'AWS reacceleration is the main topic. Traders debate whether cloud growth can sustain and support margin expansion.', posts: 45, recency: '1h ago' },
    { summary: 'Advertising revenue growth is driving discussion. Amazon is increasingly viewed as an ad company alongside retail and cloud.', posts: 28, recency: '2h ago' },
    { summary: 'Retail margins are improving. Prime stickiness and delivery efficiency remain key themes.', posts: 22, recency: '3h ago' },
    { summary: 'Free cash flow generation is back. Ads plus AWS are seen as the margin expansion story.', posts: 36, recency: '2h ago' },
  ],
}

const STREAM_MESSAGES = {
  NVDA: [
    { id: 1, user: 'AIBull', avatar: '/avatars/top-voice-1.png', body: 'Data center demand is insane. $NVDA guidance will crush again.', time: '2m', comments: 24, reposts: 8, likes: 142, topicIndex: 0 },
    { id: 2, user: 'TechTrader', avatar: '/avatars/top-voice-2.png', body: 'NVDA at $875 and still not expensive given the growth. Holding through earnings.', time: '5m', comments: 18, reposts: 5, likes: 89, topicIndex: 3 },
    { id: 3, user: 'ChipWatcher', avatar: '/avatars/top-voice-3.png', body: 'Blackwell ramp is the real story. Anyone trimming here will regret it.', time: '8m', comments: 31, reposts: 12, likes: 203, topicIndex: 1 },
    { id: 4, user: 'MomentumKing', avatar: '/avatars/howard-lindzon.png', body: '15.2K messages and 82% bullish. Crowd is right on this one.', time: '12m', comments: 9, reposts: 3, likes: 67, topicIndex: 2 },
    { id: 5, user: 'DataCenterBull', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption accelerating. $NVDA and $AMD both benefiting from AI build-out.', time: '15m', comments: 14, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 6, user: 'GrowthInvestor', avatar: '/avatars/top-voice-2.png', body: 'Earnings beat coming. Supply constraints are easing and demand is still strong.', time: '22m', comments: 7, reposts: 2, likes: 45, topicIndex: 1 },
    { id: 7, user: 'AITrader', avatar: '/avatars/top-voice-3.png', body: 'Valuation is fair at 35x forward. Growth justifies premium.', time: '31m', comments: 19, reposts: 6, likes: 112, topicIndex: 3 },
    { id: 8, user: 'SemiWatcher', avatar: '/avatars/howard-lindzon.png', body: 'Blackwell sampling now. Next gen datacenter cycle is just starting.', time: '45m', comments: 11, reposts: 3, likes: 76, topicIndex: 1 },
    { id: 9, user: 'CloudBuilder', avatar: '/avatars/michele-steele.png', body: 'Every hyperscaler is doubling down. $NVDA is the only game in town for training.', time: '52m', comments: 21, reposts: 7, likes: 156, topicIndex: 0 },
    { id: 10, user: 'QuantMind', avatar: '/avatars/ross-cameron.png', body: 'Inference demand is the next wave. $NVDA well positioned.', time: '1h', comments: 13, reposts: 4, likes: 88, topicIndex: 2 },
    { id: 11, user: 'HyperscaleFan', avatar: '/avatars/michael-bolling.png', body: 'MSFT, GOOGL, META all increasing AI spend. $NVDA is the enabler.', time: '1h 8m', comments: 16, reposts: 5, likes: 102, topicIndex: 0 },
    { id: 12, user: 'RampWatcher', avatar: '/avatars/user-avatar.png', body: 'Blackwell yields improving. Production ramp ahead of schedule per some sources.', time: '1h 15m', comments: 8, reposts: 2, likes: 54, topicIndex: 1 },
    { id: 13, user: 'CapexBull', avatar: '/avatars/top-voice-1.png', body: 'AI capex cycle has 2-3 years left. $NVDA wins regardless of who builds.', time: '1h 22m', comments: 11, reposts: 3, likes: 78, topicIndex: 2 },
    { id: 14, user: 'EarningsFocus', avatar: '/avatars/top-voice-2.png', body: 'Revenue guide will be key. Street expects another beat and raise.', time: '1h 35m', comments: 19, reposts: 6, likes: 134, topicIndex: 3 },
    { id: 15, user: 'DataCenterPro', avatar: '/avatars/top-voice-3.png', body: 'Hopper to Blackwell transition is smooth. No demand destruction.', time: '1h 48m', comments: 7, reposts: 1, likes: 46, topicIndex: 0 },
    { id: 16, user: 'SupplyChain', avatar: '/avatars/howard-lindzon.png', body: 'CoWoS capacity expanding. $NVDA securing supply for next 18 months.', time: '2h', comments: 14, reposts: 4, likes: 92, topicIndex: 1 },
    { id: 17, user: 'AICycle', avatar: '/avatars/michele-steele.png', body: 'Training vs inference split shifting. Both segments growing.', time: '2h 12m', comments: 9, reposts: 2, likes: 61, topicIndex: 2 },
    { id: 18, user: 'BeatRaising', avatar: '/avatars/ross-cameron.png', body: 'History of under-promising. This quarter will be no different.', time: '2h 28m', comments: 22, reposts: 7, likes: 145, topicIndex: 3 },
    { id: 19, user: 'ComputeKing', avatar: '/avatars/michael-bolling.png', body: 'DGX Cloud adoption growing. Enterprise AI spend just starting.', time: '2h 45m', comments: 6, reposts: 1, likes: 39, topicIndex: 0 },
    { id: 20, user: 'NextGenChip', avatar: '/avatars/user-avatar.png', body: 'Rubin on the roadmap. Multi-year visibility is unmatched.', time: '3h', comments: 18, reposts: 5, likes: 118, topicIndex: 1 },
    { id: 21, user: 'DataCenterVet', avatar: '/avatars/top-voice-1.png', body: 'H100 to H200 transition complete. Blackwell next.', time: '3h 20m', comments: 12, reposts: 3, likes: 85, topicIndex: 0 },
    { id: 22, user: 'AIInvestor', avatar: '/avatars/top-voice-2.png', body: 'Building custom silicon is hard. $NVDA moat is real.', time: '3h 45m', comments: 9, reposts: 2, likes: 58, topicIndex: 0 },
    { id: 23, user: 'RampOptimist', avatar: '/avatars/top-voice-3.png', body: 'Blackwell packaging yields improving. Q2 ramp on track.', time: '4h', comments: 15, reposts: 4, likes: 98, topicIndex: 1 },
    { id: 24, user: 'CapexSkeptic', avatar: '/avatars/howard-lindzon.png', body: '2026 capex could slow. But inference is the growth driver.', time: '4h 18m', comments: 7, reposts: 1, likes: 44, topicIndex: 2 },
    { id: 25, user: 'EarningsBull', avatar: '/avatars/michele-steele.png', body: 'Gross margin expansion from Blackwell mix. Story intact.', time: '4h 35m', comments: 11, reposts: 3, likes: 72, topicIndex: 3 },
    { id: 26, user: 'HyperscaleSpend', avatar: '/avatars/ross-cameron.png', body: 'CapEx guides from MSFT GOOGL META all bullish for $NVDA.', time: '5h', comments: 16, reposts: 5, likes: 108, topicIndex: 0 },
    { id: 27, user: 'BlackwellSample', avatar: '/avatars/michael-bolling.png', body: 'Early Blackwell feedback positive. Performance per watt unmatched.', time: '5h 22m', comments: 10, reposts: 2, likes: 66, topicIndex: 1 },
    { id: 28, user: 'AIBuildOut', avatar: '/avatars/user-avatar.png', body: 'AI infra build-out 2-3 year cycle. $NVDA at the center.', time: '5h 48m', comments: 8, reposts: 2, likes: 52, topicIndex: 2 },
    { id: 29, user: 'StreetBeat', avatar: '/avatars/top-voice-1.png', body: 'Consensus too low. Another beat and raise coming.', time: '6h', comments: 14, reposts: 4, likes: 92, topicIndex: 3 },
    { id: 30, user: 'TrainerSpend', avatar: '/avatars/top-voice-2.png', body: 'Training spend still 70% of data center. $NVDA dominant.', time: '6h 25m', comments: 6, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 31, user: 'YieldImprove', avatar: '/avatars/top-voice-3.png', body: 'CoWoS yields at 80%+. Blackwell supply no longer a concern.', time: '6h 52m', comments: 13, reposts: 4, likes: 88, topicIndex: 1 },
    { id: 32, user: 'InferenceWave', avatar: '/avatars/howard-lindzon.png', body: 'Inference deployment accelerating. $NVDA inference revenue growing.', time: '7h 15m', comments: 9, reposts: 2, likes: 61, topicIndex: 2 },
    { id: 33, user: 'GuideUp', avatar: '/avatars/michele-steele.png', body: 'Full year guide will be raised. No doubt.', time: '7h 42m', comments: 18, reposts: 6, likes: 124, topicIndex: 3 },
    { id: 34, user: 'DemandSustain', avatar: '/avatars/ross-cameron.png', body: 'Backlog still massive. Demand not the question.', time: '8h', comments: 7, reposts: 1, likes: 45, topicIndex: 0 },
    { id: 35, user: 'B100Timing', avatar: '/avatars/michael-bolling.png', body: 'B100 sampling to tier-1 customers. Ramp in H2.', time: '8h 28m', comments: 11, reposts: 3, likes: 76, topicIndex: 1 },
    { id: 36, user: 'CapexCycle', avatar: '/avatars/user-avatar.png', body: 'AI capex cycle has legs. Enterprise just getting started.', time: '8h 55m', comments: 8, reposts: 2, likes: 54, topicIndex: 2 },
    { id: 37, user: 'ConsensusLow', avatar: '/avatars/top-voice-1.png', body: 'Street estimates 10% too low. Easy beat.', time: '9h 20m', comments: 12, reposts: 4, likes: 82, topicIndex: 3 },
    { id: 38, user: 'DGXDemand', avatar: '/avatars/top-voice-2.png', body: 'DGX pod demand from enterprises. Not just hyperscalers.', time: '9h 48m', comments: 10, reposts: 2, likes: 68, topicIndex: 0 },
    { id: 39, user: 'SupplySecure', avatar: '/avatars/top-voice-3.png', body: 'TSMC CoWoS allocation secured. $NVDA supply locked in.', time: '10h 15m', comments: 9, reposts: 2, likes: 59, topicIndex: 1 },
    { id: 40, user: 'DualSegment', avatar: '/avatars/howard-lindzon.png', body: 'Training and inference both growing. No slowdown.', time: '10h 42m', comments: 7, reposts: 1, likes: 43, topicIndex: 2 },
    { id: 41, user: 'RaiseComing', avatar: '/avatars/michele-steele.png', body: 'Q3 guide will surprise. Data center momentum strong.', time: '11h', comments: 15, reposts: 5, likes: 102, topicIndex: 3 },
    { id: 42, user: 'CloudBuild', avatar: '/avatars/ross-cameron.png', body: 'Every cloud provider building. $NVDA the arms dealer.', time: '11h 30m', comments: 8, reposts: 2, likes: 55, topicIndex: 0 },
    { id: 43, user: 'RampOnTrack', avatar: '/avatars/michael-bolling.png', body: 'Blackwell production ramp on schedule. No delays.', time: '12h', comments: 11, reposts: 3, likes: 74, topicIndex: 1 },
    { id: 44, user: 'SpendSustain', avatar: '/avatars/user-avatar.png', body: 'Hyperscaler AI spend doubling YoY. Sustainable.', time: '12h 35m', comments: 6, reposts: 1, likes: 39, topicIndex: 2 },
    { id: 45, user: 'EPSBeat', avatar: '/avatars/top-voice-1.png', body: 'EPS will beat by 15%+. Revenue guide up.', time: '13h', comments: 14, reposts: 4, likes: 96, topicIndex: 3 },
    { id: 46, user: 'OnlyGame', avatar: '/avatars/top-voice-2.png', body: 'For training, $NVDA is the only game. AMD in inference.', time: '13h 40m', comments: 10, reposts: 3, likes: 71, topicIndex: 0 },
    { id: 47, user: 'B200Ramp', avatar: '/avatars/top-voice-3.png', body: 'B200 volume ramp in Q4. 2026 revenue visibility high.', time: '14h 10m', comments: 9, reposts: 2, likes: 62, topicIndex: 1 },
    { id: 48, user: 'BuildOutContinue', avatar: '/avatars/howard-lindzon.png', body: 'AI build-out 18-24 months minimum. Capex cycle ongoing.', time: '14h 45m', comments: 8, reposts: 2, likes: 53, topicIndex: 2 },
    { id: 49, user: 'BeatRaise', avatar: '/avatars/michele-steele.png', body: 'Beat and raise quarter. Same as last 8 quarters.', time: '15h 20m', comments: 16, reposts: 5, likes: 112, topicIndex: 3 },
    { id: 50, user: 'EnterpriseAI', avatar: '/avatars/ross-cameron.png', body: 'Enterprise AI spend ramping. $NVDA Beneficiary.', time: '16h', comments: 7, reposts: 1, likes: 46, topicIndex: 0 },
    { id: 51, user: 'YieldUp', avatar: '/avatars/michael-bolling.png', body: 'Packaging yields at record. Blackwell supply improving.', time: '16h 40m', comments: 10, reposts: 3, likes: 69, topicIndex: 1 },
    { id: 52, user: 'MultiYear', avatar: '/avatars/user-avatar.png', body: 'AI infra multi-year build. $NVDA revenue visibility strong.', time: '17h 15m', comments: 6, reposts: 1, likes: 40, topicIndex: 2 },
    { id: 53, user: 'RevenueUp', avatar: '/avatars/top-voice-1.png', body: 'Revenue guide will go up 5%+. Street too conservative.', time: '17h 50m', comments: 12, reposts: 4, likes: 86, topicIndex: 3 },
    { id: 54, user: 'HyperscaleOnly', avatar: '/avatars/top-voice-2.png', body: 'Top 4 hyperscalers = 60% of data center. Concentrated but growing.', time: '18h 30m', comments: 8, reposts: 2, likes: 57, topicIndex: 0 },
    { id: 55, user: 'SamplingComplete', avatar: '/avatars/top-voice-3.png', body: 'Blackwell sampling done. Production volume now.', time: '19h', comments: 11, reposts: 3, likes: 75, topicIndex: 1 },
    { id: 56, user: 'CapexBull', avatar: '/avatars/howard-lindzon.png', body: 'AI capex still early. 2026-2027 huge years.', time: '19h 35m', comments: 7, reposts: 2, likes: 48, topicIndex: 2 },
    { id: 57, user: 'EPSGuide', avatar: '/avatars/michele-steele.png', body: 'EPS guide raise likely. Buyback helping too.', time: '20h', comments: 13, reposts: 4, likes: 94, topicIndex: 3 },
    { id: 58, user: 'DemandInsane', avatar: '/avatars/ross-cameron.png', body: 'Demand still exceeds supply. Allocation sold out.', time: '20h 45m', comments: 9, reposts: 2, likes: 63, topicIndex: 0 },
    { id: 59, user: 'ProdRamp', avatar: '/avatars/michael-bolling.png', body: 'Production ramp ahead of plan. Supply chain executing.', time: '21h 20m', comments: 10, reposts: 3, likes: 70, topicIndex: 1 },
    { id: 60, user: 'SpendWave', avatar: '/avatars/user-avatar.png', body: 'AI spend wave continuing. No signs of slowdown.', time: '22h', comments: 6, reposts: 1, likes: 41, topicIndex: 2 },
    { id: 61, user: 'QuarterBeat', avatar: '/avatars/top-voice-1.png', body: 'This quarter will beat. Next quarter guide up.', time: '22h 40m', comments: 15, reposts: 5, likes: 106, topicIndex: 3 },
    { id: 62, user: 'DCSpend', avatar: '/avatars/top-voice-2.png', body: 'Data center spend inflection. $NVDA winning.', time: '23h 20m', comments: 8, reposts: 2, likes: 58, topicIndex: 0 },
    { id: 63, user: 'B100Volume', avatar: '/avatars/top-voice-3.png', body: 'B100 volume in H2. Ramp on track.', time: '1d', comments: 10, reposts: 2, likes: 69, topicIndex: 1 },
    { id: 64, user: 'SpendCycle', avatar: '/avatars/howard-lindzon.png', body: 'AI spend cycle 2+ years. Building out.', time: '1d 1h', comments: 6, reposts: 1, likes: 42, topicIndex: 2 },
    { id: 65, user: 'StreetLow', avatar: '/avatars/michele-steele.png', body: 'Street estimates low. Easy beat.', time: '1d 2h', comments: 12, reposts: 3, likes: 86, topicIndex: 3 },
    { id: 66, user: 'HyperscaleDC', avatar: '/avatars/ross-cameron.png', body: 'Hyperscale data center build. $NVDA core.', time: '1d 3h', comments: 7, reposts: 1, likes: 51, topicIndex: 0 },
    { id: 67, user: 'ProdRamp', avatar: '/avatars/michael-bolling.png', body: 'Production ramp ahead. Supply chain executing.', time: '1d 4h', comments: 9, reposts: 2, likes: 64, topicIndex: 1 },
    { id: 68, user: 'CapexSustain', avatar: '/avatars/user-avatar.png', body: 'Capex sustainability. No drop-off in sight.', time: '1d 5h', comments: 5, reposts: 1, likes: 37, topicIndex: 2 },
    { id: 69, user: 'GuideRaise', avatar: '/avatars/top-voice-1.png', body: 'Guide raise coming. Data center momentum.', time: '1d 6h', comments: 11, reposts: 3, likes: 80, topicIndex: 3 },
    { id: 70, user: 'TrainingDemand', avatar: '/avatars/top-voice-2.png', body: 'Training demand unabated. Inference growing.', time: '1d 7h', comments: 6, reposts: 1, likes: 45, topicIndex: 0 },
    { id: 71, user: 'SupplyImprove', avatar: '/avatars/top-voice-3.png', body: 'Supply improving. Not a constraint.', time: '1d 8h', comments: 8, reposts: 2, likes: 59, topicIndex: 1 },
    { id: 72, user: 'BuildOut', avatar: '/avatars/howard-lindzon.png', body: 'AI build-out continues. Multi-year.', time: '1d 9h', comments: 4, reposts: 1, likes: 34, topicIndex: 2 },
    { id: 73, user: 'RevenueBeat', avatar: '/avatars/michele-steele.png', body: 'Revenue will beat. Guide up.', time: '1d 10h', comments: 10, reposts: 2, likes: 71, topicIndex: 3 },
    { id: 74, user: 'DemandTrend', avatar: '/avatars/ross-cameron.png', body: 'Demand trend strong. Backlog full.', time: '1d 11h', comments: 5, reposts: 1, likes: 40, topicIndex: 0 },
    { id: 75, user: 'YieldUp', avatar: '/avatars/michael-bolling.png', body: 'Yields improving. Blackwell supply up.', time: '1d 12h', comments: 7, reposts: 1, likes: 53, topicIndex: 1 },
    { id: 76, user: 'InfraSpend', avatar: '/avatars/user-avatar.png', body: 'Infra spend from hyperscalers. $NVDA benefit.', time: '1d 13h', comments: 3, reposts: 1, likes: 32, topicIndex: 2 },
    { id: 77, user: 'EPSGuide', avatar: '/avatars/top-voice-1.png', body: 'EPS guide will surprise. Bullish.', time: '1d 14h', comments: 9, reposts: 2, likes: 67, topicIndex: 3 },
  ],
  TSLA: [
    { id: 1, user: 'EVBull', avatar: '/avatars/top-voice-1.png', body: 'Cybertruck deliveries ramping. $TSLA demand story intact.', time: '1m', comments: 45, reposts: 11, likes: 278, topicIndex: 2 },
    { id: 2, user: 'ElonFan', avatar: '/avatars/top-voice-2.png', body: 'FSD rollout accelerating. This is the year Tesla becomes an AI company.', time: '4m', comments: 62, reposts: 19, likes: 391, topicIndex: 1 },
    { id: 3, user: 'AutoAnalyst', avatar: '/avatars/top-voice-3.png', body: 'Margins holding up better than expected. Long $TSLA.', time: '7m', comments: 22, reposts: 6, likes: 134, topicIndex: 3 },
    { id: 4, user: 'RobotaxiHopeful', avatar: '/avatars/howard-lindzon.png', body: 'Robotaxi timeline is the key. Regulatory approval could be a catalyst.', time: '12m', comments: 18, reposts: 5, likes: 89, topicIndex: 1 },
    { id: 5, user: 'EVSkeptic', avatar: '/avatars/top-voice-1.png', body: 'Semi production ramping. Fleets are testing.', time: '18m', comments: 9, reposts: 2, likes: 56, topicIndex: 2 },
    { id: 6, user: 'TechTrader', avatar: '/avatars/top-voice-2.png', body: 'Energy storage margins improving. Megapack backlog is huge.', time: '24m', comments: 12, reposts: 4, likes: 67, topicIndex: 0 },
    { id: 7, user: 'GrowthHawk', avatar: '/avatars/top-voice-3.png', body: '$TSLA at $242 and still room to run. Cybertruck margin inflection coming.', time: '31m', comments: 18, reposts: 5, likes: 94, topicIndex: 3 },
    { id: 8, user: 'MomentumRider', avatar: '/avatars/howard-lindzon.png', body: 'Battery cost curve is the real story. $TSLA leading the pack.', time: '42m', comments: 6, reposts: 1, likes: 41, topicIndex: 2 },
    { id: 9, user: 'AIBeliever', avatar: '/avatars/michele-steele.png', body: 'Optimus demo was impressive. Robotics could be bigger than cars.', time: '58m', comments: 34, reposts: 9, likes: 212, topicIndex: 1 },
    { id: 10, user: 'MacroBull', avatar: '/avatars/ross-cameron.png', body: 'Rate cuts are a tailwind. $TSLA benefits from lower cap ex financing.', time: '1h', comments: 8, reposts: 2, likes: 53, topicIndex: 3 },
    { id: 11, user: 'EnergyStorage', avatar: '/avatars/michael-bolling.png', body: 'Megapack plus Optimus plus FSD. Multiple revenue streams converging.', time: '1h 14m', comments: 21, reposts: 6, likes: 156, topicIndex: 0 },
    { id: 12, user: 'RobotaxiDream', avatar: '/avatars/user-avatar.png', body: 'August 8 could be huge. Robotaxi unveil could reset narrative.', time: '1h 28m', comments: 45, reposts: 12, likes: 289, topicIndex: 1 },
    { id: 13, user: 'SemiFleet', avatar: '/avatars/top-voice-1.png', body: 'Pepsi and others scaling Semi orders. Fleet economics improving.', time: '1h 42m', comments: 11, reposts: 3, likes: 72, topicIndex: 2 },
    { id: 14, user: 'RangeTrader', avatar: '/avatars/top-voice-2.png', body: 'Stuck in $220-$250. Break above $250 and we run. Below $220 and we test $200.', time: '1h 55m', comments: 28, reposts: 8, likes: 198, topicIndex: 3 },
    { id: 15, user: 'ValuationDebate', avatar: '/avatars/top-voice-3.png', body: 'EV + energy + robotics + AI. Hard to value. That\'s the opportunity.', time: '2h 8m', comments: 16, reposts: 4, likes: 124, topicIndex: 0 },
    { id: 16, user: 'FSDLover', avatar: '/avatars/howard-lindzon.png', body: 'V12 is a game changer. Usage-based revenue could be massive.', time: '2h 22m', comments: 38, reposts: 10, likes: 267, topicIndex: 1 },
    { id: 17, user: 'TruckBull', avatar: '/avatars/michele-steele.png', body: 'Cybertruck waitlist still long. Demand not the issue.', time: '2h 38m', comments: 9, reposts: 2, likes: 58, topicIndex: 2 },
    { id: 18, user: 'ChoppyMarkets', avatar: '/avatars/ross-cameron.png', body: 'Macro uncertainty keeping $TSLA range-bound. Earnings could break it.', time: '2h 51m', comments: 14, reposts: 4, likes: 91, topicIndex: 3 },
    { id: 19, user: 'MultiBusiness', avatar: '/avatars/michael-bolling.png', body: 'Not just a car company. Energy and robotics will matter more over time.', time: '3h', comments: 19, reposts: 5, likes: 132, topicIndex: 0 },
    { id: 20, user: 'RegulatoryHopeful', avatar: '/avatars/user-avatar.png', body: 'China FSD approval could be catalyst. Robotaxi permits in select cities.', time: '3h 15m', comments: 22, reposts: 6, likes: 148, topicIndex: 1 },
    { id: 21, user: 'MegapackBull', avatar: '/avatars/top-voice-1.png', body: 'Megapack orders from utilities. Energy storage TAM expanding.', time: '3h 42m', comments: 14, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 22, user: 'OptimusFan', avatar: '/avatars/top-voice-2.png', body: 'Optimus in factories by 2026. Robotics revenue stream emerging.', time: '4h 10m', comments: 21, reposts: 6, likes: 156, topicIndex: 1 },
    { id: 23, user: 'SemiOrders', avatar: '/avatars/top-voice-3.png', body: 'Walmart and others adding Semi. Fleet adoption accelerating.', time: '4h 38m', comments: 9, reposts: 2, likes: 61, topicIndex: 2 },
    { id: 24, user: 'RangeBound', avatar: '/avatars/howard-lindzon.png', body: 'Stuck in range until catalyst. Robotaxi or earnings could break it.', time: '5h 5m', comments: 18, reposts: 5, likes: 124, topicIndex: 3 },
    { id: 25, user: 'FSDRevenue', avatar: '/avatars/michele-steele.png', body: 'FSD subscription could be $5B+ revenue. Under-appreciated.', time: '5h 35m', comments: 16, reposts: 5, likes: 112, topicIndex: 0 },
    { id: 26, user: 'RobotaxiPermits', avatar: '/avatars/ross-cameron.png', body: 'More cities approving robotaxi testing. Regulatory momentum.', time: '6h', comments: 12, reposts: 3, likes: 84, topicIndex: 1 },
    { id: 27, user: 'FleetEconomics', avatar: '/avatars/michael-bolling.png', body: 'Semi total cost of ownership beating diesel. Fleet math works.', time: '6h 30m', comments: 8, reposts: 2, likes: 52, topicIndex: 2 },
    { id: 28, user: 'VolatilityPlay', avatar: '/avatars/user-avatar.png', body: '$220-$250 chop. Options premium juicy. Selling puts.', time: '7h', comments: 15, reposts: 4, likes: 102, topicIndex: 3 },
    { id: 29, user: 'StorageGrowth', avatar: '/avatars/top-voice-1.png', body: 'Energy storage revenue doubling. Grid demand huge.', time: '7h 35m', comments: 11, reposts: 3, likes: 76, topicIndex: 0 },
    { id: 30, user: 'V12Breakthrough', avatar: '/avatars/top-voice-2.png', body: 'V12 end-to-end is the real deal. Robotaxi tech ready.', time: '8h 10m', comments: 28, reposts: 8, likes: 198, topicIndex: 1 },
    { id: 31, user: 'CybertruckScale', avatar: '/avatars/top-voice-3.png', body: 'Cybertruck at 5K/week. Margin inflection coming.', time: '8h 45m', comments: 10, reposts: 2, likes: 68, topicIndex: 2 },
    { id: 32, user: 'EarningsCatalyst', avatar: '/avatars/howard-lindzon.png', body: 'Earnings could break the range. Guide is key.', time: '9h 20m', comments: 13, reposts: 4, likes: 88, topicIndex: 3 },
    { id: 33, user: 'DiversifiedRev', avatar: '/avatars/michele-steele.png', body: 'Cars + storage + FSD + robotics. Multiple growth vectors.', time: '9h 55m', comments: 9, reposts: 2, likes: 58, topicIndex: 0 },
    { id: 34, user: 'August8', avatar: '/avatars/ross-cameron.png', body: 'August 8 Robotaxi event. Could be massive for narrative.', time: '10h 30m', comments: 35, reposts: 9, likes: 245, topicIndex: 1 },
    { id: 35, user: 'MegapackBacklog', avatar: '/avatars/michael-bolling.png', body: 'Megapack backlog 18+ months. Demand not the issue.', time: '11h', comments: 7, reposts: 1, likes: 45, topicIndex: 2 },
    { id: 36, user: 'BreakoutWatch', avatar: '/avatars/user-avatar.png', body: 'Watching $250. Break and hold = run to $280.', time: '11h 40m', comments: 14, reposts: 4, likes: 96, topicIndex: 3 },
    { id: 37, user: 'BatteryCost', avatar: '/avatars/top-voice-1.png', body: '4680 cost coming down. Margins improving.', time: '12h 15m', comments: 8, reposts: 2, likes: 54, topicIndex: 0 },
    { id: 38, user: 'RegulatoryPath', avatar: '/avatars/top-voice-2.png', body: 'Robotaxi regulatory path clearing. DOT favorable.', time: '12h 50m', comments: 11, reposts: 3, likes: 78, topicIndex: 1 },
    { id: 39, user: 'PepsiScale', avatar: '/avatars/top-voice-3.png', body: 'Pepsi scaling Semi fleet. Real-world validation.', time: '13h 30m', comments: 6, reposts: 1, likes: 42, topicIndex: 2 },
    { id: 40, user: 'ChoppyAction', avatar: '/avatars/howard-lindzon.png', body: 'Macro headlines driving chop. Fundamentals intact.', time: '14h', comments: 12, reposts: 3, likes: 82, topicIndex: 3 },
    { id: 41, user: 'PowerwallPlus', avatar: '/avatars/michele-steele.png', body: 'Powerwall + solar + Megapack. Full energy stack.', time: '14h 40m', comments: 10, reposts: 2, likes: 66, topicIndex: 0 },
    { id: 42, user: 'DriverlessSoon', avatar: '/avatars/ross-cameron.png', body: 'Driverless approval in more states. Expansion continues.', time: '15h 20m', comments: 19, reposts: 5, likes: 132, topicIndex: 1 },
    { id: 43, user: 'FleetAdoption', avatar: '/avatars/michael-bolling.png', body: 'More fleets ordering Semi. Word of mouth positive.', time: '16h', comments: 7, reposts: 1, likes: 47, topicIndex: 2 },
    { id: 44, user: 'Support220', avatar: '/avatars/user-avatar.png', body: '$220 support holding. Accumulating on dips.', time: '16h 45m', comments: 11, reposts: 3, likes: 74, topicIndex: 3 },
    { id: 45, user: 'StorageMargin', avatar: '/avatars/top-voice-1.png', body: 'Energy storage margins improving. Scale benefits.', time: '17h 20m', comments: 8, reposts: 2, likes: 55, topicIndex: 0 },
    { id: 46, user: 'TechReady', avatar: '/avatars/top-voice-2.png', body: 'Robotaxi tech ready. Regulatory the gating factor.', time: '18h', comments: 15, reposts: 4, likes: 108, topicIndex: 1 },
    { id: 47, user: 'SemiMargin', avatar: '/avatars/top-voice-3.png', body: 'Semi margins turning positive. Volume = leverage.', time: '18h 40m', comments: 6, reposts: 1, likes: 40, topicIndex: 2 },
    { id: 48, user: 'Consolidation', avatar: '/avatars/howard-lindzon.png', body: 'Consolidating before next move. Patience.', time: '19h 15m', comments: 9, reposts: 2, likes: 62, topicIndex: 3 },
    { id: 49, user: 'ThreePillars', avatar: '/avatars/michele-steele.png', body: 'EV + Energy + AI. Three pillars of growth.', time: '19h 50m', comments: 12, reposts: 3, likes: 86, topicIndex: 0 },
    { id: 50, user: 'PermitMomentum', avatar: '/avatars/ross-cameron.png', body: 'Robotaxi permits expanding. California leading.', time: '20h 30m', comments: 13, reposts: 4, likes: 94, topicIndex: 1 },
    { id: 51, user: 'Class8Orders', avatar: '/avatars/michael-bolling.png', body: 'Class 8 truck orders up. Semi well positioned.', time: '21h', comments: 5, reposts: 1, likes: 36, topicIndex: 2 },
    { id: 52, user: 'RangeTrade', avatar: '/avatars/user-avatar.png', body: 'Trading the range. Sell $248, buy $225.', time: '21h 45m', comments: 10, reposts: 2, likes: 70, topicIndex: 3 },
    { id: 53, user: 'GridDemand', avatar: '/avatars/top-voice-1.png', body: 'Grid storage demand from renewables. Megapack TAM huge.', time: '22h 25m', comments: 9, reposts: 2, likes: 59, topicIndex: 0 },
    { id: 54, user: 'EventCatalyst', avatar: '/avatars/top-voice-2.png', body: 'Robotaxi event could be watershed. Bullish setup.', time: '23h', comments: 22, reposts: 6, likes: 156, topicIndex: 1 },
    { id: 55, user: 'FleetValidation', avatar: '/avatars/top-voice-3.png', body: 'Real fleet data from Semi. Economics proving out.', time: '23h 40m', comments: 6, reposts: 1, likes: 43, topicIndex: 2 },
    { id: 56, user: 'BreakoutSetup', avatar: '/avatars/howard-lindzon.png', body: 'Coiling for breakout. Either direction. Stay nimble.', time: '1d', comments: 11, reposts: 3, likes: 78, topicIndex: 3 },
    { id: 57, user: 'RevenueStreams', avatar: '/avatars/michele-steele.png', body: 'Multiple revenue streams converging. Story intact.', time: '1d 1h', comments: 8, reposts: 2, likes: 52, topicIndex: 0 },
    { id: 58, user: 'TimelineClarity', avatar: '/avatars/ross-cameron.png', body: 'Robotaxi timeline clarifying. 2026-2027 deployment.', time: '1d 2h', comments: 14, reposts: 4, likes: 98, topicIndex: 1 },
    { id: 59, user: 'ProductionScale', avatar: '/avatars/michael-bolling.png', body: 'Semi production scaling. No major issues.', time: '1d 3h', comments: 5, reposts: 1, likes: 35, topicIndex: 2 },
    { id: 60, user: 'EarningsKey', avatar: '/avatars/user-avatar.png', body: 'Next earnings could break range. Delivery guide key.', time: '1d 4h', comments: 12, reposts: 3, likes: 84, topicIndex: 3 },
    { id: 61, user: 'PowerwallRev', avatar: '/avatars/top-voice-1.png', body: 'Powerwall revenue growing. Residential storage.', time: '1d 5h', comments: 8, reposts: 2, likes: 55, topicIndex: 0 },
    { id: 62, user: 'GridScale', avatar: '/avatars/top-voice-2.png', body: 'Grid-scale storage. Megapack opportunity.', time: '1d 6h', comments: 7, reposts: 1, likes: 49, topicIndex: 0 },
    { id: 63, user: 'SolarPlus', avatar: '/avatars/top-voice-3.png', body: 'Solar + storage bundle. Growing attach.', time: '1d 7h', comments: 6, reposts: 1, likes: 43, topicIndex: 0 },
    { id: 64, user: 'OptimusRevenue', avatar: '/avatars/howard-lindzon.png', body: 'Optimus revenue path. Factories first.', time: '1d 8h', comments: 9, reposts: 2, likes: 61, topicIndex: 0 },
    { id: 65, user: 'MultiVector', avatar: '/avatars/michele-steele.png', body: 'Multiple growth vectors. Energy + auto + AI.', time: '1d 9h', comments: 5, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 66, user: 'StorageTAM', avatar: '/avatars/ross-cameron.png', body: 'Storage TAM expanding. $TSLA well positioned.', time: '1d 10h', comments: 7, reposts: 1, likes: 50, topicIndex: 0 },
  ],
  AAPL: [
    { id: 1, user: 'AppleLong', avatar: '/avatars/top-voice-1.png', body: 'Services growth is the real margin story. $AAPL underrated here.', time: '3m', comments: 15, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 2, user: 'ValueMind', avatar: '/avatars/top-voice-2.png', body: 'China weakness priced in. Buying the dip.', time: '6m', comments: 28, reposts: 7, likes: 156, topicIndex: 1 },
    { id: 3, user: 'EcosystemBull', avatar: '/avatars/top-voice-3.png', body: 'Capital return story is strong. Buyback pace accelerating.', time: '11m', comments: 12, reposts: 3, likes: 72, topicIndex: 3 },
    { id: 4, user: 'iPhoneWatcher', avatar: '/avatars/howard-lindzon.png', body: 'iPhone 16 cycle looking solid. Wearables margin improving.', time: '20m', comments: 8, reposts: 2, likes: 41, topicIndex: 0 },
    { id: 5, user: 'DividendChaser', avatar: '/avatars/michele-steele.png', body: 'Yield plus buyback is compelling. $AAPL cash flow machine.', time: '28m', comments: 11, reposts: 3, likes: 69, topicIndex: 3 },
    { id: 6, user: 'AIWatcher', avatar: '/avatars/ross-cameron.png', body: 'Apple Intelligence rollout could be a sleeper catalyst for upgrades.', time: '35m', comments: 19, reposts: 5, likes: 124, topicIndex: 1 },
    { id: 7, user: 'MarginBull', avatar: '/avatars/michael-bolling.png', body: 'Gross margin expansion from services mix. Story is playing out.', time: '48m', comments: 6, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 8, user: 'ValuationGuy', avatar: '/avatars/user-avatar.png', body: 'Trading at 28x vs historical. Fair value here with optionality.', time: '1h', comments: 14, reposts: 4, likes: 91, topicIndex: 3 },
    { id: 9, user: 'ServicesFan', avatar: '/avatars/top-voice-1.png', body: 'App Store, iCloud, Music, Arcade—all growing. Margin mix shifting.', time: '1h 12m', comments: 12, reposts: 3, likes: 86, topicIndex: 0 },
    { id: 10, user: 'ChinaWatcher', avatar: '/avatars/top-voice-2.png', body: 'Local competition in China is tough. But installed base is stickier.', time: '1h 25m', comments: 24, reposts: 6, likes: 167, topicIndex: 1 },
    { id: 11, user: 'BuybackBull', avatar: '/avatars/top-voice-3.png', body: '$90B annual buyback. That\'s a floor under the stock.', time: '1h 38m', comments: 9, reposts: 2, likes: 64, topicIndex: 3 },
    { id: 12, user: 'EcosystemLock', avatar: '/avatars/howard-lindzon.png', body: 'Switching costs are real. Watch, AirPods, HomePod—sticky.', time: '1h 52m', comments: 17, reposts: 5, likes: 118, topicIndex: 3 },
    { id: 13, user: 'MarginStory', avatar: '/avatars/michele-steele.png', body: 'Hardware margins flat, services up. That\'s the thesis.', time: '2h 5m', comments: 8, reposts: 1, likes: 52, topicIndex: 0 },
    { id: 14, user: 'AsiaSales', avatar: '/avatars/ross-cameron.png', body: 'Greater China down but India and rest of Asia growing. Mix shift.', time: '2h 18m', comments: 13, reposts: 4, likes: 94, topicIndex: 1 },
    { id: 15, user: 'CashReturn', avatar: '/avatars/michael-bolling.png', body: 'Dividend bump coming? Shareholders pushing for more return.', time: '2h 35m', comments: 11, reposts: 3, likes: 76, topicIndex: 3 },
    { id: 16, user: 'UpgradeCycle', avatar: '/avatars/user-avatar.png', body: 'AI features could drive iPhone 17 upgrade cycle. Watching closely.', time: '2h 48m', comments: 19, reposts: 6, likes: 142, topicIndex: 1 },
    { id: 17, user: 'ServicesMix', avatar: '/avatars/top-voice-1.png', body: 'Advertising in App Store and Search growing. High margin.', time: '3h', comments: 6, reposts: 1, likes: 41, topicIndex: 0 },
    { id: 18, user: 'ChinaMacro', avatar: '/avatars/top-voice-2.png', body: 'Stimulus in China could help. Consumer confidence is the key.', time: '3h 15m', comments: 15, reposts: 4, likes: 109, topicIndex: 1 },
    { id: 19, user: 'ReturnCapital', avatar: '/avatars/top-voice-3.png', body: 'Net cash position still massive. Return more or do a big acquisition?', time: '3h 32m', comments: 10, reposts: 2, likes: 68, topicIndex: 3 },
    { id: 20, user: 'StickyEcosystem', avatar: '/avatars/howard-lindzon.png', body: 'Family sharing, Continuity, Handoff. Hard to leave once you\'re in.', time: '3h 48m', comments: 14, reposts: 4, likes: 97, topicIndex: 3 },
    { id: 21, user: 'RevRecShift', avatar: '/avatars/top-voice-1.png', body: 'Services revenue recognition improved. High-margin mix.', time: '4h 15m', comments: 9, reposts: 2, likes: 61, topicIndex: 0 },
    { id: 22, user: 'HuaweiRisk', avatar: '/avatars/top-voice-2.png', body: 'Huawei taking share in China. But $AAPL brand sticky.', time: '4h 45m', comments: 18, reposts: 5, likes: 128, topicIndex: 1 },
    { id: 23, user: 'DividendYield', avatar: '/avatars/top-voice-3.png', body: 'Dividend yield attractive. Plus buyback = total return.', time: '5h 20m', comments: 11, reposts: 3, likes: 79, topicIndex: 2 },
    { id: 24, user: 'LockIn', avatar: '/avatars/howard-lindzon.png', body: 'Ecosystem lock-in stronger than ever. Churn low.', time: '6h', comments: 10, reposts: 2, likes: 68, topicIndex: 3 },
    { id: 25, user: 'MarginExpand', avatar: '/avatars/michele-steele.png', body: 'Gross margin expansion from services. Story playing out.', time: '6h 40m', comments: 7, reposts: 1, likes: 48, topicIndex: 0 },
    { id: 26, user: 'IndiaGrowth', avatar: '/avatars/ross-cameron.png', body: 'India growing double digits. Offsetting China.', time: '7h 15m', comments: 13, reposts: 4, likes: 92, topicIndex: 1 },
    { id: 27, user: 'BuybackPace', avatar: '/avatars/michael-bolling.png', body: '$90B buyback annualized. Shrinking share count.', time: '7h 55m', comments: 12, reposts: 3, likes: 86, topicIndex: 2 },
    { id: 28, user: 'UpgradeCycle', avatar: '/avatars/user-avatar.png', body: 'iPhone 17 cycle could be strong. AI features driving.', time: '8h 30m', comments: 15, reposts: 4, likes: 108, topicIndex: 3 },
    { id: 29, user: 'AppStoreCut', avatar: '/avatars/top-voice-1.png', body: 'App Store take rate stable. Regulatory risk priced.', time: '9h 10m', comments: 8, reposts: 2, likes: 56, topicIndex: 0 },
    { id: 30, user: 'ChinaStimulus', avatar: '/avatars/top-voice-2.png', body: 'China stimulus could help. Consumer confidence key.', time: '9h 50m', comments: 14, reposts: 4, likes: 98, topicIndex: 1 },
    { id: 31, user: 'CashReturn', avatar: '/avatars/top-voice-3.png', body: 'Returning $100B+ annually. Shareholder friendly.', time: '10h 35m', comments: 10, reposts: 2, likes: 72, topicIndex: 2 },
    { id: 32, user: 'Continuity', avatar: '/avatars/howard-lindzon.png', body: 'Handoff and Continuity. Switching cost is real.', time: '11h 20m', comments: 9, reposts: 2, likes: 64, topicIndex: 3 },
    { id: 33, user: 'iCloudGrowth', avatar: '/avatars/michele-steele.png', body: 'iCloud storage rev growing. Recurring revenue.', time: '12h', comments: 6, reposts: 1, likes: 42, topicIndex: 0 },
    { id: 34, user: 'LocalComp', avatar: '/avatars/ross-cameron.png', body: 'Xiaomi and others in China. But premium segment holds.', time: '12h 45m', comments: 11, reposts: 3, likes: 78, topicIndex: 1 },
    { id: 35, user: 'YieldPlus', avatar: '/avatars/michael-bolling.png', body: 'Yield plus buyback. Better than bond for long term.', time: '13h 30m', comments: 8, reposts: 2, likes: 58, topicIndex: 2 },
    { id: 36, user: 'DeviceEcosystem', avatar: '/avatars/user-avatar.png', body: 'Watch, AirPods, Mac. All connected. Sticky.', time: '14h 20m', comments: 12, reposts: 3, likes: 84, topicIndex: 3 },
    { id: 37, user: 'MusicArcade', avatar: '/avatars/top-voice-1.png', body: 'Music and Arcade growing. Services mix improving.', time: '15h 10m', comments: 5, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 38, user: 'MarketShare', avatar: '/avatars/top-voice-2.png', body: 'China share stable in premium. Volume down but mix up.', time: '16h', comments: 13, reposts: 4, likes: 94, topicIndex: 1 },
    { id: 39, user: 'ShareShrink', avatar: '/avatars/top-voice-3.png', body: 'Share count shrinking 3-4% per year. EPS tailwind.', time: '16h 50m', comments: 9, reposts: 2, likes: 66, topicIndex: 2 },
    { id: 40, user: 'SwitchingCost', avatar: '/avatars/howard-lindzon.png', body: 'Once in ecosystem, hard to leave. Data, apps, devices.', time: '17h 40m', comments: 10, reposts: 2, likes: 70, topicIndex: 3 },
    { id: 41, user: 'ServiceMargin', avatar: '/avatars/michele-steele.png', body: 'Services margin 70%+. Driving overall margin up.', time: '18h 35m', comments: 7, reposts: 1, likes: 50, topicIndex: 0 },
    { id: 42, user: 'GreaterChina', avatar: '/avatars/ross-cameron.png', body: 'Greater China 20% of rev. Key region to watch.', time: '19h 30m', comments: 12, reposts: 3, likes: 88, topicIndex: 1 },
    { id: 43, user: 'DividendGrowth', avatar: '/avatars/michael-bolling.png', body: 'Dividend growing 4% per year. Sustainable.', time: '20h 25m', comments: 8, reposts: 2, likes: 59, topicIndex: 2 },
    { id: 44, user: 'FamilySharing', avatar: '/avatars/user-avatar.png', body: 'Family Sharing drives retention. Multi-device households.', time: '21h 20m', comments: 9, reposts: 2, likes: 65, topicIndex: 3 },
    { id: 45, user: 'AdRevenue', avatar: '/avatars/top-voice-1.png', body: 'Search ads in App Store. High margin, growing.', time: '22h 15m', comments: 6, reposts: 1, likes: 44, topicIndex: 0 },
    { id: 46, user: 'ExportData', avatar: '/avatars/top-voice-2.png', body: 'China export data concerning. But installed base resilient.', time: '23h 10m', comments: 14, reposts: 4, likes: 102, topicIndex: 1 },
    { id: 47, user: 'CapitalAlloc', avatar: '/avatars/top-voice-3.png', body: 'Capital allocation best in class. Buyback + dividend.', time: '1d', comments: 10, reposts: 2, likes: 72, topicIndex: 2 },
    { id: 48, user: 'PrivacyMoat', avatar: '/avatars/howard-lindzon.png', body: 'Privacy as differentiator. Consumers value it.', time: '1d 1h', comments: 8, reposts: 2, likes: 57, topicIndex: 3 },
    { id: 49, user: 'RevMix', avatar: '/avatars/michele-steele.png', body: 'Revenue mix shifting to services. Less cyclical.', time: '1d 2h', comments: 5, reposts: 1, likes: 36, topicIndex: 0 },
    { id: 50, user: 'AsiaPac', avatar: '/avatars/ross-cameron.png', body: 'Rest of Asia growing. India, Korea, Japan.', time: '1d 3h', comments: 11, reposts: 3, likes: 80, topicIndex: 1 },
    { id: 51, user: 'ReturnShareholders', avatar: '/avatars/michael-bolling.png', body: 'Returning cash to shareholders. No wasteful M&A.', time: '1d 4h', comments: 9, reposts: 2, likes: 64, topicIndex: 2 },
    { id: 52, user: 'Integration', avatar: '/avatars/user-avatar.png', body: 'Devices work together seamlessly. Ecosystem advantage.', time: '1d 5h', comments: 10, reposts: 2, likes: 68, topicIndex: 3 },
    { id: 53, user: 'RecurringRev', avatar: '/avatars/top-voice-1.png', body: 'Subscriptions = recurring. Predictable revenue.', time: '1d 6h', comments: 6, reposts: 1, likes: 45, topicIndex: 0 },
    { id: 54, user: 'PricedIn', avatar: '/avatars/top-voice-2.png', body: 'China weakness priced in. Risk/reward favorable.', time: '1d 7h', comments: 12, reposts: 3, likes: 86, topicIndex: 1 },
    { id: 55, user: 'EPSAccel', avatar: '/avatars/top-voice-3.png', body: 'Buyback accelerating EPS growth. Share count down.', time: '1d 8h', comments: 7, reposts: 1, likes: 51, topicIndex: 2 },
    { id: 56, user: 'Retention', avatar: '/avatars/howard-lindzon.png', body: 'iPhone retention 90%+. Ecosystem works.', time: '1d 9h', comments: 9, reposts: 2, likes: 63, topicIndex: 3 },
    { id: 57, user: 'MarginStory', avatar: '/avatars/michele-steele.png', body: 'Services driving margin expansion. Multi-year trend.', time: '1d 10h', comments: 5, reposts: 1, likes: 39, topicIndex: 0 },
    { id: 58, user: 'StimulusHope', avatar: '/avatars/ross-cameron.png', body: 'China stimulus could boost consumer. Watching.', time: '1d 11h', comments: 11, reposts: 3, likes: 77, topicIndex: 1 },
    { id: 59, user: 'TotalReturn', avatar: '/avatars/michael-bolling.png', body: 'Yield + buyback + growth = total return.', time: '1d 12h', comments: 8, reposts: 2, likes: 58, topicIndex: 2 },
    { id: 60, user: 'CrossSell', avatar: '/avatars/user-avatar.png', body: 'Cross-sell across devices. Watch to iPhone to Mac.', time: '1d 13h', comments: 7, reposts: 1, likes: 49, topicIndex: 3 },
    { id: 61, user: 'BuybackFloor', avatar: '/avatars/top-voice-1.png', body: 'Buyback provides floor. $90B annual is massive.', time: '1d 14h', comments: 11, reposts: 3, likes: 80, topicIndex: 2 },
    { id: 62, user: 'DivGrowth', avatar: '/avatars/top-voice-2.png', body: 'Dividend growth 4%+. Income + growth.', time: '1d 15h', comments: 6, reposts: 1, likes: 43, topicIndex: 2 },
    { id: 63, user: 'ShareRepurchase', avatar: '/avatars/top-voice-3.png', body: 'Aggressive share repurchase. EPS accretion.', time: '1d 16h', comments: 9, reposts: 2, likes: 62, topicIndex: 2 },
    { id: 64, user: 'CashReturn', avatar: '/avatars/howard-lindzon.png', body: 'Returning 100% of FCF. Shareholder friendly.', time: '1d 17h', comments: 8, reposts: 2, likes: 56, topicIndex: 2 },
    { id: 65, user: 'YieldStory', avatar: '/avatars/michele-steele.png', body: 'Yield plus growth. Rare combo in mega-cap.', time: '1d 18h', comments: 10, reposts: 2, likes: 71, topicIndex: 2 },
    { id: 66, user: 'CapitalReturn', avatar: '/avatars/ross-cameron.png', body: 'Capital return program largest in tech.', time: '1d 19h', comments: 7, reposts: 1, likes: 50, topicIndex: 2 },
    { id: 67, user: 'NetCash', avatar: '/avatars/michael-bolling.png', body: 'Net cash position. Optionality for M&A or return.', time: '1d 20h', comments: 9, reposts: 2, likes: 65, topicIndex: 2 },
    { id: 68, user: 'TotalReturn', avatar: '/avatars/user-avatar.png', body: 'Total return via div + buyback + appreciation.', time: '1d 21h', comments: 8, reposts: 1, likes: 54, topicIndex: 2 },
    { id: 69, user: 'ShareholderValue', avatar: '/avatars/top-voice-1.png', body: 'Shareholder value creation through capital return.', time: '1d 22h', comments: 6, reposts: 1, likes: 41, topicIndex: 2 },
    { id: 70, user: 'FCFReturn', avatar: '/avatars/top-voice-2.png', body: 'Returning all FCF to shareholders. Discipline.', time: '1d 23h', comments: 10, reposts: 2, likes: 69, topicIndex: 2 },
  ],
  AMD: [
    { id: 1, user: 'ChipFan', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption ramping. $AMD taking share from NVDA in some segments.', time: '2m', comments: 19, reposts: 6, likes: 112, topicIndex: 0 },
    { id: 2, user: 'DataCenterBull', avatar: '/avatars/top-voice-2.png', body: '78% bullish and for good reason. AMD execution has been stellar.', time: '5m', comments: 11, reposts: 2, likes: 74, topicIndex: 3 },
    { id: 3, user: 'AIBuilder', avatar: '/avatars/top-voice-3.png', body: 'Guidance was conservative. Data center build-out has legs.', time: '9m', comments: 14, reposts: 4, likes: 92, topicIndex: 2 },
    { id: 4, user: 'SemiCycle', avatar: '/avatars/howard-lindzon.png', body: 'PC and gaming holding up. MI300 is the growth driver.', time: '16m', comments: 6, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 5, user: 'InstinctBull', avatar: '/avatars/michele-steele.png', body: 'Instinct MI300X shipping to hyperscalers. $AMD playing catch-up but executing.', time: '23m', comments: 16, reposts: 5, likes: 105, topicIndex: 1 },
    { id: 6, user: 'ValueSemi', avatar: '/avatars/ross-cameron.png', body: 'Better value than NVDA at current multiples. Both can win in AI.', time: '38m', comments: 9, reposts: 2, likes: 62, topicIndex: 3 },
    { id: 7, user: 'GamingRevival', avatar: '/avatars/michael-bolling.png', body: 'RDNA 4 looking solid. Gaming bottomed. Data center is the growth story.', time: '51m', comments: 7, reposts: 1, likes: 44, topicIndex: 2 },
    { id: 8, user: 'AICycle', avatar: '/avatars/user-avatar.png', body: 'AI build-out is multi-year. $AMD has room to run from here.', time: '1h', comments: 12, reposts: 3, likes: 78, topicIndex: 0 },
    { id: 9, user: 'MI300Adopter', avatar: '/avatars/top-voice-1.png', body: 'MSFT and META testing MI300. Second source is real.', time: '1h 18m', comments: 15, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 10, user: 'DataCenterShare', avatar: '/avatars/top-voice-2.png', body: 'Taking share in inference. Training is NVDA domain but inference is diverse.', time: '1h 35m', comments: 10, reposts: 2, likes: 67, topicIndex: 1 },
    { id: 11, user: 'GuideConservative', avatar: '/avatars/top-voice-3.png', body: 'Management sandbagged. Raised guide twice already this year.', time: '1h 52m', comments: 13, reposts: 4, likes: 89, topicIndex: 2 },
    { id: 12, user: 'ExecutionPro', avatar: '/avatars/howard-lindzon.png', body: 'Lisa Su delivery bias. Under-promise, over-deliver.', time: '2h 8m', comments: 8, reposts: 1, likes: 54, topicIndex: 3 },
    { id: 13, user: 'InstinctDemand', avatar: '/avatars/michele-steele.png', body: 'MI300 capacity allocation sold out. Demand > supply.', time: '2h 25m', comments: 17, reposts: 5, likes: 116, topicIndex: 0 },
    { id: 14, user: 'HyperscaleDiversify', avatar: '/avatars/ross-cameron.png', body: 'Hyperscalers want second source. $AMD is the only real option.', time: '2h 42m', comments: 11, reposts: 3, likes: 82, topicIndex: 1 },
    { id: 15, user: 'RaiseExpect', avatar: '/avatars/michael-bolling.png', body: 'Next quarter guide will likely be raised again. Data center momentum strong.', time: '2h 58m', comments: 9, reposts: 2, likes: 61, topicIndex: 2 },
    { id: 16, user: 'PCGaming', avatar: '/avatars/user-avatar.png', body: 'Client and gaming stable. Not the growth driver but not a drag.', time: '3h 15m', comments: 6, reposts: 1, likes: 39, topicIndex: 3 },
    { id: 17, user: 'MI350Coming', avatar: '/avatars/top-voice-1.png', body: 'MI350 on roadmap. Competing with Blackwell in key segments.', time: '3h 32m', comments: 14, reposts: 4, likes: 95, topicIndex: 0 },
    { id: 18, user: 'InferencePlay', avatar: '/avatars/top-voice-2.png', body: 'Inference is where AMD can win. Lower power, good perf.', time: '3h 48m', comments: 10, reposts: 2, likes: 71, topicIndex: 1 },
    { id: 19, user: 'GuidanceRaise', avatar: '/avatars/top-voice-3.png', body: 'Full year guide could go up again. Data center surprise to upside.', time: '4h', comments: 12, reposts: 3, likes: 84, topicIndex: 2 },
    { id: 20, user: 'OperationalExcellence', avatar: '/avatars/howard-lindzon.png', body: 'Gross margins expanding. Execution across segments is solid.', time: '4h 18m', comments: 7, reposts: 1, likes: 47, topicIndex: 3 },
    { id: 21, user: 'MI300Volume', avatar: '/avatars/top-voice-1.png', body: 'MI300 volume ramping. Second source narrative real.', time: '4h 50m', comments: 14, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 22, user: 'InferenceShare', avatar: '/avatars/top-voice-2.png', body: 'Taking inference share. Training harder to crack.', time: '5h 25m', comments: 10, reposts: 2, likes: 68, topicIndex: 1 },
    { id: 23, user: 'ConservativeGuide', avatar: '/avatars/top-voice-3.png', body: 'Guide always conservative. Lisa Su style.', time: '6h', comments: 12, reposts: 3, likes: 82, topicIndex: 2 },
    { id: 24, user: 'OperationalEx', avatar: '/avatars/howard-lindzon.png', body: 'Operational excellence across segments.', time: '6h 40m', comments: 7, reposts: 1, likes: 48, topicIndex: 3 },
    { id: 25, user: 'InstinctAdoption', avatar: '/avatars/michele-steele.png', body: 'Instinct adoption from hyperscalers. Real demand.', time: '7h 20m', comments: 11, reposts: 3, likes: 76, topicIndex: 0 },
    { id: 26, user: 'DataCenterMix', avatar: '/avatars/ross-cameron.png', body: 'Data center mix shifting. Inference opportunity.', time: '8h', comments: 9, reposts: 2, likes: 62, topicIndex: 1 },
    { id: 27, user: 'RaiseLikely', avatar: '/avatars/michael-bolling.png', body: 'Next quarter guide raise likely. Momentum strong.', time: '8h 45m', comments: 10, reposts: 2, likes: 69, topicIndex: 2 },
    { id: 28, user: 'ExecutionTrack', avatar: '/avatars/user-avatar.png', body: 'Execution on track. No surprises.', time: '9h 35m', comments: 6, reposts: 1, likes: 42, topicIndex: 3 },
    { id: 29, user: 'SecondSource', avatar: '/avatars/top-voice-1.png', body: 'Hyperscalers want second source. $AMD is it.', time: '10h 25m', comments: 13, reposts: 4, likes: 90, topicIndex: 0 },
    { id: 30, user: 'ShareGains', avatar: '/avatars/top-voice-2.png', body: 'Share gains in inference. Training later.', time: '11h 20m', comments: 8, reposts: 2, likes: 55, topicIndex: 1 },
    { id: 31, user: 'GuideUpside', avatar: '/avatars/top-voice-3.png', body: 'Guide has upside. Data center beat likely.', time: '12h 15m', comments: 11, reposts: 3, likes: 78, topicIndex: 2 },
    { id: 32, user: 'MarginExpand', avatar: '/avatars/howard-lindzon.png', body: 'Gross margin expansion. Product mix.', time: '13h 10m', comments: 7, reposts: 1, likes: 46, topicIndex: 3 },
    { id: 33, user: 'MI300X', avatar: '/avatars/michele-steele.png', body: 'MI300X in production. Shipments growing.', time: '14h', comments: 12, reposts: 3, likes: 84, topicIndex: 0 },
    { id: 34, user: 'InferencePlay', avatar: '/avatars/ross-cameron.png', body: 'Inference is the play. Lower power, good perf.', time: '14h 55m', comments: 9, reposts: 2, likes: 64, topicIndex: 1 },
    { id: 35, user: 'DataCenterGuide', avatar: '/avatars/michael-bolling.png', body: 'Data center guide will be raised. Momentum.', time: '15h 50m', comments: 10, reposts: 2, likes: 71, topicIndex: 2 },
    { id: 36, user: 'SegmentExecution', avatar: '/avatars/user-avatar.png', body: 'All segments executing. Client, gaming, DC.', time: '16h 50m', comments: 6, reposts: 1, likes: 44, topicIndex: 3 },
    { id: 37, user: 'AdoptionRamp', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption ramping. Multi-quarter story.', time: '17h 55m', comments: 11, reposts: 3, likes: 77, topicIndex: 0 },
    { id: 38, user: 'TrainingLater', avatar: '/avatars/top-voice-2.png', body: 'Training share later. Inference first.', time: '19h', comments: 8, reposts: 2, likes: 58, topicIndex: 1 },
    { id: 39, user: 'BeatExpect', avatar: '/avatars/top-voice-3.png', body: 'Quarter will beat. Guide raised again.', time: '20h 10m', comments: 12, reposts: 3, likes: 86, topicIndex: 2 },
    { id: 40, user: 'LisaSu', avatar: '/avatars/howard-lindzon.png', body: 'Lisa Su execution. Under-promise, over-deliver.', time: '21h 25m', comments: 9, reposts: 2, likes: 66, topicIndex: 3 },
    { id: 41, user: 'CapacitySold', avatar: '/avatars/michele-steele.png', body: 'MI300 capacity sold out. Demand > supply.', time: '22h 45m', comments: 10, reposts: 2, likes: 72, topicIndex: 0 },
    { id: 42, user: 'DiversifySpend', avatar: '/avatars/ross-cameron.png', body: 'Hyperscalers diversifying. $AMD beneficiary.', time: '1d', comments: 7, reposts: 1, likes: 49, topicIndex: 1 },
    { id: 43, user: 'UpsideGuide', avatar: '/avatars/michael-bolling.png', body: 'Full year guide has upside. Data center strong.', time: '1d 1h', comments: 11, reposts: 3, likes: 80, topicIndex: 2 },
    { id: 44, user: 'OperationalLean', avatar: '/avatars/user-avatar.png', body: 'Operationally lean. Margins expanding.', time: '1d 2h', comments: 6, reposts: 1, likes: 43, topicIndex: 3 },
    { id: 45, user: 'SecondSource', avatar: '/avatars/top-voice-1.png', body: 'Only real second source for AI accelerators.', time: '1d 3h', comments: 13, reposts: 4, likes: 94, topicIndex: 0 },
    { id: 46, user: 'InferenceWedge', avatar: '/avatars/top-voice-2.png', body: 'Inference wedge opening. $AMD positioned.', time: '1d 4h', comments: 8, reposts: 2, likes: 57, topicIndex: 1 },
    { id: 47, user: 'RaiseAgain', avatar: '/avatars/top-voice-3.png', body: 'Will raise guide again. Pattern continues.', time: '1d 5h', comments: 10, reposts: 2, likes: 70, topicIndex: 2 },
    { id: 48, user: 'ExecutionBias', avatar: '/avatars/howard-lindzon.png', body: 'Execution bias positive. No stumbles.', time: '1d 6h', comments: 7, reposts: 1, likes: 50, topicIndex: 3 },
    { id: 49, user: 'DemandStrong', avatar: '/avatars/michele-steele.png', body: 'MI300 demand strong. Allocation tight.', time: '1d 7h', comments: 12, reposts: 3, likes: 88, topicIndex: 0 },
    { id: 50, user: 'ShareStory', avatar: '/avatars/ross-cameron.png', body: 'Share gain story in inference. Multi-year.', time: '1d 8h', comments: 9, reposts: 2, likes: 65, topicIndex: 1 },
    { id: 51, user: 'GuideConservative', avatar: '/avatars/michael-bolling.png', body: 'Guide always beatable. Sandbagging.', time: '1d 9h', comments: 11, reposts: 3, likes: 79, topicIndex: 2 },
    { id: 52, user: 'MarginStory', avatar: '/avatars/user-avatar.png', body: 'Margin expansion from data center mix.', time: '1d 10h', comments: 6, reposts: 1, likes: 44, topicIndex: 3 },
    { id: 53, user: 'VolumeRamp', avatar: '/avatars/top-voice-1.png', body: 'MI300 volume ramp on track. No delays.', time: '1d 11h', comments: 10, reposts: 2, likes: 73, topicIndex: 0 },
    { id: 54, user: 'DCGrowth', avatar: '/avatars/top-voice-2.png', body: 'Data center growth 50%+. Key driver.', time: '1d 12h', comments: 8, reposts: 2, likes: 59, topicIndex: 1 },
    { id: 55, user: 'BeatRaise', avatar: '/avatars/top-voice-3.png', body: 'Beat and raise quarter. Same as prior.', time: '1d 13h', comments: 12, reposts: 3, likes: 85, topicIndex: 2 },
    { id: 56, user: 'AllSegments', avatar: '/avatars/howard-lindzon.png', body: 'All segments solid. Balanced growth.', time: '1d 14h', comments: 5, reposts: 1, likes: 38, topicIndex: 3 },
    { id: 57, user: 'HypserscaleDC', avatar: '/avatars/michele-steele.png', body: 'Hyperscaler data center penetration growing.', time: '1d 15h', comments: 9, reposts: 2, likes: 67, topicIndex: 0 },
    { id: 58, user: 'InferenceTAM', avatar: '/avatars/ross-cameron.png', body: 'Inference TAM growing faster than training.', time: '1d 16h', comments: 7, reposts: 1, likes: 51, topicIndex: 1 },
    { id: 59, user: 'FullYearUp', avatar: '/avatars/michael-bolling.png', body: 'Full year guide will go up. Data center.', time: '1d 17h', comments: 10, reposts: 2, likes: 71, topicIndex: 2 },
    { id: 60, user: 'CostDiscipline', avatar: '/avatars/user-avatar.png', body: 'Cost discipline. Op efficiency.', time: '1d 18h', comments: 6, reposts: 1, likes: 45, topicIndex: 3 },
  ],
  AMZN: [
    { id: 1, user: 'CloudBull', avatar: '/avatars/top-voice-1.png', body: 'AWS growth reaccelerating. $AMZN still cheap vs growth.', time: '4m', comments: 33, reposts: 9, likes: 187, topicIndex: 0 },
    { id: 2, user: 'RetailWatcher', avatar: '/avatars/top-voice-2.png', body: 'Ads and cloud driving margins. This is a hold for the long term.', time: '9m', comments: 7, reposts: 1, likes: 52, topicIndex: 1 },
    { id: 3, user: 'FAANGBull', avatar: '/avatars/top-voice-3.png', body: 'Free cash flow generation is back. Ads + AWS = margin expansion.', time: '14m', comments: 22, reposts: 7, likes: 128, topicIndex: 3 },
    { id: 4, user: 'LogisticsPro', avatar: '/avatars/howard-lindzon.png', body: 'Retail margins improving. Prime stickiness remains high.', time: '25m', comments: 5, reposts: 1, likes: 34, topicIndex: 1 },
    { id: 5, user: 'AdRevenue', avatar: '/avatars/michele-steele.png', body: 'Advertising revenue up 25% YoY. $AMZN becoming an ad company too.', time: '33m', comments: 18, reposts: 5, likes: 116, topicIndex: 2 },
    { id: 6, user: 'CapExWatcher', avatar: '/avatars/ross-cameron.png', body: 'Infrastructure spend disciplined. AWS margins expanding.', time: '44m', comments: 8, reposts: 2, likes: 55, topicIndex: 0 },
    { id: 7, user: 'PrimeSub', avatar: '/avatars/michael-bolling.png', body: 'Prime membership growth steady. Streaming + delivery = sticky.', time: '56m', comments: 10, reposts: 3, likes: 71, topicIndex: 1 },
    { id: 8, user: 'EcommerceBull', avatar: '/avatars/user-avatar.png', body: '3P seller growth accelerating. Marketplace take rate improving.', time: '1h', comments: 6, reposts: 1, likes: 39, topicIndex: 3 },
    { id: 9, user: 'AWSAccel', avatar: '/avatars/top-voice-1.png', body: 'GenAI workloads driving AWS. Bedrock and Inferentia adoption growing.', time: '1h 18m', comments: 21, reposts: 6, likes: 154, topicIndex: 0 },
    { id: 10, user: 'AdGrowth', avatar: '/avatars/top-voice-2.png', body: 'Sponsored products and display ads. Under-monetized vs opportunity.', time: '1h 35m', comments: 12, reposts: 3, likes: 88, topicIndex: 2 },
    { id: 11, user: 'RetailMargin', avatar: '/avatars/top-voice-3.png', body: 'Regional fulfillment efficiency improving. Last-mile costs coming down.', time: '1h 52m', comments: 8, reposts: 1, likes: 51, topicIndex: 1 },
    { id: 12, user: 'FCFStory', avatar: '/avatars/howard-lindzon.png', body: 'Op cash flow back to growth. CapEx efficiency improving.', time: '2h 8m', comments: 15, reposts: 4, likes: 108, topicIndex: 3 },
    { id: 13, user: 'CloudShare', avatar: '/avatars/michele-steele.png', body: 'AWS still 32% of cloud. Taking share from smaller players.', time: '2h 25m', comments: 10, reposts: 2, likes: 73, topicIndex: 0 },
    { id: 14, user: 'VideoAds', avatar: '/avatars/ross-cameron.png', body: 'Thursday Night Football ads. Video ad inventory growing.', time: '2h 42m', comments: 9, reposts: 2, likes: 62, topicIndex: 2 },
    { id: 15, user: 'PrimeValue', avatar: '/avatars/michael-bolling.png', body: 'Prime price increase absorbed. Churn didn\'t spike.', time: '2h 58m', comments: 11, reposts: 3, likes: 79, topicIndex: 1 },
    { id: 16, user: 'CapitalReturn', avatar: '/avatars/user-avatar.png', body: 'Buying back stock. Cash flow supports it.', time: '3h 15m', comments: 7, reposts: 1, likes: 48, topicIndex: 3 },
    { id: 17, user: 'AIWorkloads', avatar: '/avatars/top-voice-1.png', body: 'Trainium and Inferentia for AI. Custom silicon paying off.', time: '3h 32m', comments: 16, reposts: 5, likes: 121, topicIndex: 0 },
    { id: 18, user: 'AdMonetization', avatar: '/avatars/top-voice-2.png', body: 'CTR and CPM improving. Ad load still has room to grow.', time: '3h 48m', comments: 6, reposts: 1, likes: 42, topicIndex: 2 },
    { id: 19, user: 'Fulfillment', avatar: '/avatars/top-voice-3.png', body: 'Robotics in warehouses. Labor efficiency gains.', time: '4h', comments: 13, reposts: 4, likes: 94, topicIndex: 1 },
    { id: 20, user: 'CashGeneration', avatar: '/avatars/howard-lindzon.png', body: 'Operating leverage from scale. Margins have room to expand.', time: '4h 18m', comments: 9, reposts: 2, likes: 66, topicIndex: 3 },
    { id: 21, user: 'AWSSpeed', avatar: '/avatars/top-voice-1.png', body: 'AWS growth reaccelerating. GenAI workloads.', time: '4h 50m', comments: 16, reposts: 5, likes: 112, topicIndex: 0 },
    { id: 22, user: 'AdCTR', avatar: '/avatars/top-voice-2.png', body: 'Ad CTR improving. Monetization opportunity.', time: '5h 25m', comments: 10, reposts: 2, likes: 68, topicIndex: 1 },
    { id: 23, user: 'FulfillmentCost', avatar: '/avatars/top-voice-3.png', body: 'Fulfillment cost per unit down. Efficiency gains.', time: '6h', comments: 8, reposts: 1, likes: 52, topicIndex: 2 },
    { id: 24, user: 'FCFStrong', avatar: '/avatars/howard-lindzon.png', body: 'Operating cash flow strong. CapEx efficient.', time: '6h 40m', comments: 12, reposts: 3, likes: 84, topicIndex: 3 },
    { id: 25, user: 'CloudShare', avatar: '/avatars/michele-steele.png', body: 'AWS 32% of cloud. Taking share.', time: '7h 25m', comments: 11, reposts: 3, likes: 76, topicIndex: 0 },
    { id: 26, user: 'SponsoredProducts', avatar: '/avatars/ross-cameron.png', body: 'Sponsored products revenue up 25%. Under-monetized.', time: '8h 15m', comments: 9, reposts: 2, likes: 62, topicIndex: 1 },
    { id: 27, user: 'RegionalFulfill', avatar: '/avatars/michael-bolling.png', body: 'Regional fulfillment centers. Faster delivery.', time: '9h 10m', comments: 7, reposts: 1, likes: 48, topicIndex: 2 },
    { id: 28, user: 'CapExEfficiency', avatar: '/avatars/user-avatar.png', body: 'CapEx efficiency improving. ROI on infra.', time: '10h', comments: 10, reposts: 2, likes: 70, topicIndex: 3 },
    { id: 29, user: 'BedrockGrowth', avatar: '/avatars/top-voice-1.png', body: 'Bedrock adoption growing. AI workload driver.', time: '10h 55m', comments: 13, reposts: 4, likes: 92, topicIndex: 0 },
    { id: 30, user: 'VideoAds', avatar: '/avatars/top-voice-2.png', body: 'Prime Video ads. New revenue stream.', time: '11h 55m', comments: 8, reposts: 2, likes: 56, topicIndex: 1 },
    { id: 31, user: 'LastMile', avatar: '/avatars/top-voice-3.png', body: 'Last-mile efficiency. Robotics helping.', time: '13h', comments: 6, reposts: 1, likes: 42, topicIndex: 2 },
    { id: 32, user: 'CashFlow', avatar: '/avatars/howard-lindzon.png', body: 'Cash flow generation. Buyback support.', time: '14h 10m', comments: 11, reposts: 3, likes: 78, topicIndex: 3 },
    { id: 33, user: 'GenAIWorkload', avatar: '/avatars/michele-steele.png', body: 'GenAI workloads on AWS. Inferentia, Trainium.', time: '15h 25m', comments: 14, reposts: 4, likes: 98, topicIndex: 0 },
    { id: 34, user: 'AdInventory', avatar: '/avatars/ross-cameron.png', body: 'Ad inventory growing. Prime, Fire TV.', time: '16h 45m', comments: 7, reposts: 1, likes: 49, topicIndex: 1 },
    { id: 35, user: 'MarginImprove', avatar: '/avatars/michael-bolling.png', body: 'Retail margins improving. Mix shift.', time: '18h 10m', comments: 9, reposts: 2, likes: 64, topicIndex: 2 },
    { id: 36, user: 'OpCashFlow', avatar: '/avatars/user-avatar.png', body: 'Operating cash flow growth. Sustainable.', time: '19h 40m', comments: 10, reposts: 2, likes: 72, topicIndex: 3 },
    { id: 37, user: 'EnterpriseCloud', avatar: '/avatars/top-voice-1.png', body: 'Enterprise cloud adoption. Migration ongoing.', time: '21h 15m', comments: 8, reposts: 2, likes: 55, topicIndex: 0 },
    { id: 38, user: 'Programmatic', avatar: '/avatars/top-voice-2.png', body: 'Programmatic ads growing. High margin.', time: '22h 55m', comments: 6, reposts: 1, likes: 41, topicIndex: 1 },
    { id: 39, user: 'LogisticsOpt', avatar: '/avatars/top-voice-3.png', body: 'Logistics optimization. Algorithm improvements.', time: '1d', comments: 8, reposts: 2, likes: 58, topicIndex: 2 },
    { id: 40, user: 'ReturnCapital', avatar: '/avatars/howard-lindzon.png', body: 'Returning capital. Buyback accelerating.', time: '1d 1h', comments: 9, reposts: 2, likes: 65, topicIndex: 3 },
    { id: 41, user: 'AWSMargin', avatar: '/avatars/michele-steele.png', body: 'AWS margins expanding. Scale benefits.', time: '1d 2h', comments: 12, reposts: 3, likes: 86, topicIndex: 0 },
    { id: 42, user: 'Monetization', avatar: '/avatars/ross-cameron.png', body: 'Ad monetization early. Big runway.', time: '1d 3h', comments: 7, reposts: 1, likes: 50, topicIndex: 1 },
    { id: 43, user: 'UnitEconomics', avatar: '/avatars/michael-bolling.png', body: 'Unit economics improving. Per-unit cost down.', time: '1d 4h', comments: 6, reposts: 1, likes: 44, topicIndex: 2 },
    { id: 44, user: 'FCFGrowth', avatar: '/avatars/user-avatar.png', body: 'FCF growth reaccelerating. Story intact.', time: '1d 5h', comments: 11, reposts: 3, likes: 79, topicIndex: 3 },
    { id: 45, user: 'CloudAccel', avatar: '/avatars/top-voice-1.png', body: 'Cloud growth accelerating. AI tailwind.', time: '1d 6h', comments: 10, reposts: 2, likes: 69, topicIndex: 0 },
    { id: 46, user: 'DisplayAds', avatar: '/avatars/top-voice-2.png', body: 'Display ads in more places. Inventory growth.', time: '1d 7h', comments: 5, reposts: 1, likes: 38, topicIndex: 1 },
    { id: 47, user: 'PrimeMargin', avatar: '/avatars/top-voice-3.png', body: 'Prime membership margin improving. Sticky.', time: '1d 8h', comments: 7, reposts: 1, likes: 51, topicIndex: 2 },
    { id: 48, user: 'Buyback', avatar: '/avatars/howard-lindzon.png', body: 'Buyback program. Cash flow supports.', time: '1d 9h', comments: 8, reposts: 2, likes: 57, topicIndex: 3 },
    { id: 49, user: 'Inferentia', avatar: '/avatars/michele-steele.png', body: 'Inferentia for AI. Custom silicon payoff.', time: '1d 10h', comments: 9, reposts: 2, likes: 63, topicIndex: 0 },
    { id: 50, user: 'AdRevenue', avatar: '/avatars/ross-cameron.png', body: 'Ad revenue growth 20%+. Key driver.', time: '1d 11h', comments: 6, reposts: 1, likes: 46, topicIndex: 1 },
    { id: 51, user: 'DeliverySpeed', avatar: '/avatars/michael-bolling.png', body: 'Delivery speed improving. Same-day expanding.', time: '1d 12h', comments: 8, reposts: 2, likes: 59, topicIndex: 2 },
    { id: 52, user: 'CashMachine', avatar: '/avatars/user-avatar.png', body: 'Cash flow machine. Ads + AWS = margin.', time: '1d 13h', comments: 10, reposts: 2, likes: 73, topicIndex: 3 },
    { id: 53, user: 'CloudTAM', avatar: '/avatars/top-voice-1.png', body: 'Cloud TAM expanding. AI driving.', time: '1d 14h', comments: 7, reposts: 1, likes: 52, topicIndex: 0 },
    { id: 54, user: 'TNFAds', avatar: '/avatars/top-voice-2.png', body: 'Thursday Night Football ads. Video inventory.', time: '1d 15h', comments: 5, reposts: 1, likes: 37, topicIndex: 1 },
    { id: 55, user: '3PSeller', avatar: '/avatars/top-voice-3.png', body: '3P seller growth. Marketplace take rate.', time: '1d 16h', comments: 9, reposts: 2, likes: 67, topicIndex: 2 },
    { id: 56, user: 'OperatingLeverage', avatar: '/avatars/howard-lindzon.png', body: 'Operating leverage from scale. Margins up.', time: '1d 17h', comments: 8, reposts: 2, likes: 61, topicIndex: 3 },
    { id: 57, user: 'AWSGenAI', avatar: '/avatars/michele-steele.png', body: 'AWS GenAI products. Bedrock adoption.', time: '1d 18h', comments: 11, reposts: 3, likes: 81, topicIndex: 0 },
    { id: 58, user: 'CTRGrowth', avatar: '/avatars/ross-cameron.png', body: 'CTR growth in ads. Optimization.', time: '1d 19h', comments: 4, reposts: 1, likes: 35, topicIndex: 1 },
    { id: 59, user: 'FulfillmentOpt', avatar: '/avatars/michael-bolling.png', body: 'Fulfillment optimization. Robotics.', time: '1d 20h', comments: 7, reposts: 1, likes: 53, topicIndex: 2 },
    { id: 60, user: 'MarginExpand', avatar: '/avatars/user-avatar.png', body: 'Margin expansion from ads + AWS. Multi-year.', time: '1d 21h', comments: 9, reposts: 2, likes: 68, topicIndex: 3 },
  ],
}

/** Fake "new" messages to prepend when user clicks blue New Posts pill (load-in effect) */
const LOAD_IN_MESSAGES = {
  TSLA: [
    { id: 90001, user: 'LiveTrader', avatar: '/avatars/top-voice-1.png', body: 'Just saw the move. $TSLA breaking out. New high incoming.', time: 'Just now', comments: 2, reposts: 0, likes: 12, topicIndex: 0 },
    { id: 90002, user: 'FSDUpdate', avatar: '/avatars/top-voice-2.png', body: 'FSD v12.5 rolling out to more users. This is the one.', time: '30s', comments: 5, reposts: 1, likes: 34, topicIndex: 1 },
    { id: 90003, user: 'MomentumRider', avatar: '/avatars/top-voice-3.png', body: 'Cybertruck sighting at the mall. Lines still long.', time: '1m', comments: 8, reposts: 2, likes: 45, topicIndex: 0 },
    { id: 90004, user: 'RobotaxiWatch', avatar: '/avatars/howard-lindzon.png', body: 'Robotaxi permits expanding. California leading the way.', time: '1m', comments: 3, reposts: 0, likes: 21, topicIndex: 1 },
    { id: 90005, user: 'EnergyBull', avatar: '/avatars/michele-steele.png', body: 'Megapack order from utility. Storage demand insane.', time: '2m', comments: 4, reposts: 1, likes: 28, topicIndex: 0 },
    { id: 90006, user: 'SemiFleet', avatar: '/avatars/ross-cameron.png', body: 'Pepsi just added 50 more Semis. Fleet expansion accelerating.', time: '2m', comments: 6, reposts: 2, likes: 39, topicIndex: 2 },
  ],
  NVDA: [
    { id: 90001, user: 'AIBull', avatar: '/avatars/top-voice-1.png', body: 'Data center demand update. Another hyperscaler increasing spend.', time: 'Just now', comments: 4, reposts: 1, likes: 28, topicIndex: 0 },
    { id: 90002, user: 'ChipWatcher', avatar: '/avatars/top-voice-2.png', body: 'Blackwell sampling feedback positive. Ramp on track.', time: '45s', comments: 6, reposts: 2, likes: 42, topicIndex: 1 },
    { id: 90003, user: 'EarningsFocus', avatar: '/avatars/top-voice-3.png', body: 'Street raising estimates again. Consensus catching up.', time: '1m', comments: 3, reposts: 0, likes: 19, topicIndex: 3 },
    { id: 90004, user: 'CapexBull', avatar: '/avatars/howard-lindzon.png', body: 'AI capex cycle has 2+ years. $NVDA at the center.', time: '1m', comments: 5, reposts: 1, likes: 31, topicIndex: 2 },
    { id: 90005, user: 'HyperscaleSpend', avatar: '/avatars/michele-steele.png', body: 'MSFT guide beat. More AI spend. $NVDA wins.', time: '2m', comments: 7, reposts: 2, likes: 48, topicIndex: 0 },
    { id: 90006, user: 'SupplyChain', avatar: '/avatars/ross-cameron.png', body: 'CoWoS capacity expanding. Supply no longer constraint.', time: '2m', comments: 2, reposts: 0, likes: 15, topicIndex: 1 },
  ],
  AAPL: [
    { id: 90001, user: 'AppleLong', avatar: '/avatars/top-voice-1.png', body: 'Services growth accelerating. Margin story intact.', time: 'Just now', comments: 3, reposts: 0, likes: 22, topicIndex: 0 },
    { id: 90002, user: 'ChinaWatcher', avatar: '/avatars/top-voice-2.png', body: 'China data points improving. Stimulus working.', time: '30s', comments: 5, reposts: 1, likes: 35, topicIndex: 1 },
    { id: 90003, user: 'BuybackBull', avatar: '/avatars/top-voice-3.png', body: '$90B buyback pace. Share count shrinking.', time: '1m', comments: 2, reposts: 0, likes: 18, topicIndex: 2 },
    { id: 90004, user: 'EcosystemLock', avatar: '/avatars/howard-lindzon.png', body: 'iPhone retention 92%. Ecosystem stickier than ever.', time: '1m', comments: 4, reposts: 1, likes: 27, topicIndex: 3 },
    { id: 90005, user: 'ServicesMargin', avatar: '/avatars/michele-steele.png', body: 'App Store margins expanding. Recurring rev growing.', time: '2m', comments: 3, reposts: 0, likes: 21, topicIndex: 0 },
    { id: 90006, user: 'DividendYield', avatar: '/avatars/ross-cameron.png', body: 'Yield plus buyback. Total return compelling.', time: '2m', comments: 6, reposts: 2, likes: 41, topicIndex: 2 },
  ],
  AMD: [
    { id: 90001, user: 'ChipFan', avatar: '/avatars/top-voice-1.png', body: 'MI300 adoption update. Another hyperscaler testing.', time: 'Just now', comments: 4, reposts: 1, likes: 29, topicIndex: 0 },
    { id: 90002, user: 'DataCenterShare', avatar: '/avatars/top-voice-2.png', body: 'Inference share gains. Taking business from NVDA.', time: '45s', comments: 5, reposts: 1, likes: 36, topicIndex: 1 },
    { id: 90003, user: 'GuideRaise', avatar: '/avatars/top-voice-3.png', body: 'Full year guide will be raised. Data center strong.', time: '1m', comments: 6, reposts: 2, likes: 44, topicIndex: 2 },
    { id: 90004, user: 'ExecutionPro', avatar: '/avatars/howard-lindzon.png', body: 'Lisa Su delivery. Another beat and raise.', time: '1m', comments: 3, reposts: 0, likes: 24, topicIndex: 3 },
    { id: 90005, user: 'InstinctDemand', avatar: '/avatars/michele-steele.png', body: 'MI300X allocations sold out. Demand > supply.', time: '2m', comments: 4, reposts: 1, likes: 31, topicIndex: 0 },
    { id: 90006, user: 'BeatExpect', avatar: '/avatars/ross-cameron.png', body: 'Quarter will beat. Guide raised again.', time: '2m', comments: 7, reposts: 2, likes: 52, topicIndex: 2 },
  ],
  AMZN: [
    { id: 90001, user: 'CloudBull', avatar: '/avatars/top-voice-1.png', body: 'AWS growth reaccelerating. GenAI workloads driving.', time: 'Just now', comments: 5, reposts: 1, likes: 38, topicIndex: 0 },
    { id: 90002, user: 'AdRevenue', avatar: '/avatars/top-voice-2.png', body: 'Sponsored products CTR up. Monetization improving.', time: '30s', comments: 3, reposts: 0, likes: 22, topicIndex: 1 },
    { id: 90003, user: 'FCFStory', avatar: '/avatars/top-voice-3.png', body: 'Operating cash flow beat. CapEx discipline.', time: '1m', comments: 4, reposts: 1, likes: 28, topicIndex: 3 },
    { id: 90004, user: 'PrimeGrowth', avatar: '/avatars/howard-lindzon.png', body: 'Prime membership steady. Churn at record low.', time: '1m', comments: 2, reposts: 0, likes: 16, topicIndex: 2 },
    { id: 90005, user: 'BedrockAdoption', avatar: '/avatars/michele-steele.png', body: 'Bedrock adoption accelerating. Enterprise AI.', time: '2m', comments: 6, reposts: 2, likes: 45, topicIndex: 0 },
    { id: 90006, user: 'MarginExpand', avatar: '/avatars/ross-cameron.png', body: 'Ads + AWS margin expansion. Multi-year trend.', time: '2m', comments: 3, reposts: 0, likes: 21, topicIndex: 3 },
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
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: 6.46, pct: 3.21 },
  { ticker: 'AMD', name: 'AMD', price: 156.43, change: 14.3, pct: 9.2 },
  { ticker: 'MSFT', name: 'Microsoft', price: 348.90, change: 1.8, pct: 0.5 },
  { ticker: 'GOOGL', name: 'Alphabet', price: 142.30, change: -0.5, pct: -0.35 },
  { ticker: 'PLTR', name: 'Palantir', price: 28.45, change: 11.5, pct: 4.2 },
  { ticker: 'GME', name: 'GameStop', price: 29.96, change: 2.1, pct: 7.5 },
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

function TrendMiniChart({ values = [], isUp = true, width = 180, height = 64 }) {
  const padding = { left: 4, right: 4, top: 6, bottom: 6 }
  if (!values?.length || values.length < 2) {
    return (
      <div className="rounded border border-border bg-surface-muted/30 flex items-center justify-center shrink-0" style={{ width, height }}>
        <span className="text-xs text-text-muted">—</span>
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * chartW
    const y = padding.top + (1 - (v - min) / range) * chartH
    return { x, y }
  })
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`
  const priorCloseY = padding.top + (1 - (values[0] - min) / range) * chartH
  const strokeColor = isUp ? '#22c55e' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="shrink-0" style={{ width, height }}>
      <defs>
        <linearGradient id="home3ChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#home3ChartFill)" />
      <line x1={padding.left} y1={priorCloseY} x2={width - padding.right} y2={priorCloseY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={strokeColor} opacity="0.8" />
    </svg>
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
  const up = isUp !== undefined ? isUp : (values[values.length - 1] >= values[0])
  const color = up ? 'var(--color-success)' : 'var(--color-danger)'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-6 shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Homepage3() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTicker, setSelectedTicker] = useState(TRENDING_NOW[0].ticker)
  const [newPostCount, setNewPostCount] = useState(0)
  const [homeTab, setHomeTab] = useState('trending') // 'trending' | 'market-overview' | 'following'
  const [followingFeedSort, setFollowingFeedSort] = useState('recommended') // 'recommended' | 'latest'
  const [streamFilter, setStreamFilter] = useState(0) // 0 = first topic (default on /home) | 'latest' | 1 | 2 | 3 (topic index)
  const [marketOverviewTrendingTicker, setMarketOverviewTrendingTicker] = useState(MARKET_OVERVIEW_TRENDING[0].ticker)
  const [latestStreamNewCount, setLatestStreamNewCount] = useState(0)
  const [prependedLatestMessages, setPrependedLatestMessages] = useState([])
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const incrementIndexRef = useRef(0)
  const latestIncrementIndexRef = useRef(0)
  const trendingCardsScrollRef = useRef(null)
  const { getQuote } = useLiveQuotesContext()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isHome2 = location.pathname === '/home2'
  const isHome3 = location.pathname === '/home' || location.pathname === '/home3' // Homepage3 now renders on /home
  const selectedItem = TRENDING_NOW.find((s) => s.ticker === selectedTicker) ?? TRENDING_NOW[0]

  const NEW_POST_INCREMENTS = [10, 8, 3, 9, 12]
  const LATEST_PILL_INCREMENTS = [2, 4, 3, 1, 6, 2, 3]
  useEffect(() => {
    const interval = setInterval(() => {
      const next = NEW_POST_INCREMENTS[incrementIndexRef.current % NEW_POST_INCREMENTS.length]
      incrementIndexRef.current += 1
      setNewPostCount((c) => c + next)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const next = LATEST_PILL_INCREMENTS[latestIncrementIndexRef.current % LATEST_PILL_INCREMENTS.length]
      latestIncrementIndexRef.current += 1
      setLatestStreamNewCount((c) => c + next)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const popularTopics = POPULAR_TOPICS[selectedTicker] ?? POPULAR_TOPICS.TSLA
  useEffect(() => {
    setStreamFilter(selectedTicker === 'AAPL' ? 'latest' : 0)
    setPrependedLatestMessages([])
  }, [selectedTicker])

  const SPARK_FALLBACK = {
    TSLA: [194, 195, 196, 197, 198, 199, 200, 201],
    NVDA: [860, 865, 870, 875, 880, 885, 888, 889],
    AAPL: [184, 183.5, 183, 182.8, 182.5, 182.3, 182.6, 182.51],
    AMD: [154, 155, 155.5, 156, 155.8, 156.2, 156.4, 156.43],
    AMZN: [171, 171.5, 172, 172.2, 172.5, 172.4, 172.6, 172.65],
    META: [408, 410, 411, 412, 411.5, 412.2, 412.4, 412.5],
    MSFT: [346, 347, 347.5, 348, 348.5, 348.8, 348.9, 348.9],
    GOOGL: [141, 141.5, 142, 142.2, 142.1, 142.3, 142.25, 142.3],
    PLTR: [27, 27.5, 28, 28.2, 28.3, 28.4, 28.45, 28.45],
    GME: [28.5, 29, 29.2, 29.5, 29.8, 29.9, 29.95, 29.96],
  }
  const mergeQuote = (staticItem) => {
    const q = getQuote(staticItem.ticker)
    if (!q) return { ...staticItem, spark: staticItem.spark ?? SPARK_FALLBACK[staticItem.ticker] }
    const livePct = q.changePercent ?? staticItem.pct
    // On /home trending: enforce min |pct| >= 5%; use static when live quote is in (-5, 5)
    const pct = (staticItem.rank != null && livePct > -5 && livePct < 5) ? staticItem.pct : livePct
    return { ...staticItem, price: q.price, change: q.change ?? staticItem.change, pct, spark: q.spark?.length ? q.spark : (staticItem.spark ?? SPARK_FALLBACK[staticItem.ticker]) }
  }
  const selectedMerged = mergeQuote(selectedItem)
  const chartValues = selectedMerged.spark ?? SPARK_FALLBACK[selectedTicker] ?? [100, 101, 102, 101.5, 103, 102.5, 104, 105]
  const chartIsUp = (selectedMerged.pct ?? 0) >= 0

  const allMessages = STREAM_MESSAGES[selectedTicker] ?? STREAM_MESSAGES.NVDA
  const baseMessages = streamFilter === 'latest' ? allMessages : allMessages.filter((m) => (m.topicIndex ?? 0) === streamFilter)
  const messages = streamFilter === 'latest' && prependedLatestMessages.length > 0
    ? [...prependedLatestMessages, ...baseMessages]
    : baseMessages

  return (
    <div className="min-h-screen bg-background text-text">
      {isLoggedIn && (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
          <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
          <div className="font-semibold">Home</div>
          <div className="h-9 w-9" />
        </div>
      )}
      {isLoggedIn && (
        <LeftSidebar
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          watchlist={watchlist}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((p) => !p)}
          leftPadding={50}
        />
      )}
      <div className={clsx(!isHome2 && isLoggedIn && 'lg:pl-[350px]')}>
      <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />

      <div className={clsx('flex max-w-[1400px] mx-auto', !isHome2 && !isLoggedIn && 'pl-[50px]')}>
        {/* Column 1: New to Stocktwits + Unlock Watchlist — only when not logged in */}
        {!isLoggedIn && (
        <aside className="hidden lg:flex w-[300px] shrink-0 flex-col border-r border-border p-4 gap-6">
          <section className="rounded-xl border border-border bg-surface-muted/30 p-4">
            <h2 className="text-sm font-bold text-text mb-2">New to Stocktwits?</h2>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Get access to real-time conversations, investor sentiment, price predictions and customized watchlists.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsLoggedIn(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-surface hover:bg-surface-muted transition-colors text-left"
              >
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
              Track your stocks and get key price alerts and sentiment updates.
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
        )}

        {/* Middle + Right (3-column layout on /home like /symbol); 2-column on /home2 */}
        <div className={clsx('flex-1 min-w-0 flex', !isHome2 && 'gap-6')}>
        <main className={clsx('flex-1 min-w-0 flex flex-col p-4 lg:p-6 gap-4', !isHome2 && (homeTab === 'trending' || homeTab === 'following') && 'max-w-[660px]', (isHome2 || homeTab === 'market-overview') && 'max-w-[660px]')}>
          {/* Header: Trending + Market Overview (on /home) / Market Overview only (on /home2) + Following / Watchlist (locked, sign-up to unlock) */}
          <div className="flex items-center gap-6 border-b-2 border-border pb-2 shrink-0">
            {isHome2 ? (
              <span className="text-base font-bold text-black border-b-2 border-black pb-0.5 -mb-0.5" style={{ borderBottomWidth: 2 }}>
                Market Overview
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setHomeTab('market-overview')}
                  className={clsx(
                    'text-base font-bold pb-0.5 -mb-0.5 transition-colors',
                    homeTab === 'market-overview'
                      ? 'text-black border-b-2 border-black'
                      : 'text-text-muted border-b-2 border-transparent hover:text-text'
                  )}
                  style={homeTab === 'market-overview' ? { borderBottomWidth: 2 } : {}}
                >
                  Market Overview
                </button>
                <button
                  type="button"
                  onClick={() => setHomeTab('trending')}
                  className={clsx(
                    'text-base font-bold pb-0.5 -mb-0.5 transition-colors inline-flex items-center gap-1',
                    homeTab === 'trending'
                      ? 'text-black border-b-2 border-black'
                      : 'text-text-muted border-b-2 border-transparent hover:text-text'
                  )}
                  style={homeTab === 'trending' ? { borderBottomWidth: 2 } : {}}
                >
                  {homeTab === 'trending' && <span className="text-orange-500" aria-hidden>🔥</span>}
                  Trending
                </button>
              </>
            )}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setHomeTab('following')}
                className={clsx(
                  'text-base font-bold pb-0.5 -mb-0.5 transition-colors',
                  homeTab === 'following'
                    ? 'text-black border-b-2 border-black'
                    : 'text-text-muted border-b-2 border-transparent hover:text-text'
                )}
                style={homeTab === 'following' ? { borderBottomWidth: 2 } : {}}
              >
                Following
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setHomeTab('following')}
                className={clsx(
                  'flex items-center gap-1.5 text-base font-bold pb-0.5 -mb-0.5 transition-colors',
                  homeTab === 'following'
                    ? 'text-black border-b-2 border-black'
                    : 'text-text-muted border-b-2 border-transparent hover:text-text'
                )}
                style={homeTab === 'following' ? { borderBottomWidth: 2 } : {}}
              >
                Following
              </button>
            )}
          </div>
          {(isHome2 || (!isHome2 && homeTab === 'market-overview')) && homeTab !== 'following' && (
          /* Market cards — full width row (tight layout); prices/pct from live quotes when available */
          <div className="w-full flex gap-2 overflow-x-auto pb-1 shrink-0">
            {MARKET_CARDS.map((card) => {
              const q = getQuote(card.symbol)
              const price = q?.price ?? card.price
              const change = q?.change ?? card.change
              const pct = q?.changePercent ?? card.pct
              return (
              <div
                key={card.symbol}
                className="w-[180px] shrink-0 rounded-lg border border-border bg-white dark:bg-surface px-2.5 py-2 flex flex-col"
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
          )}

          {/* Following feed — logged-out: Who to Follow; logged-in: feed */}
          {!isHome2 && homeTab === 'following' && !isLoggedIn && (
          <div className="shrink-0 space-y-5">
            {/* CTA banner */}
            <div className="rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 border border-primary/20 p-5">
              <h2 className="text-lg font-bold text-text">Unlock the power of the community</h2>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">
                Sign up to follow top traders, analysts, and investors. See their posts, predictions, and market calls — all in one personalized feed tailored to your watchlist.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link to="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                  Sign Up Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <span className="text-xs text-text-muted">It only takes 30 seconds</span>
              </div>
            </div>
            {/* Who to follow grid */}
            <div>
              <h3 className="text-sm font-bold text-text uppercase tracking-wide mb-3">Who to Follow</h3>
              <div className="space-y-3">
                {[
                  { handle: 'howardlindzon', displayName: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', bio: 'Co-Founder & CEO @Stocktwits. Managing Partner of Social Leverage. Angel investor in Robinhood, Etoro, Koyfin.', verified: true, followers: '376.2K', tickers: ['TSLA', 'BTC', 'HOOD'] },
                  { handle: 'rosscameron', displayName: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', bio: 'Founder @WarriorTrading. Day trading educator with $10M+ in verified profits.', verified: true, followers: '128.5K', tickers: ['SPY', 'AMD', 'NVDA'] },
                  { handle: 'Steeletwits', displayName: 'Michele Steele', avatar: '/avatars/michele-steele.png', bio: 'Head of Content @Stocktwits. Former ESPN reporter covering the intersection of sports & finance.', verified: true, followers: '42.1K', tickers: ['DKNG', 'DIS'] },
                  { handle: 'michaelbolling', displayName: 'Michael Bolling', avatar: '/avatars/michael-bolling.png', bio: 'VP of Content @Stocktwits. Covering markets, macro, and momentum. Formerly @FoxBusiness.', verified: true, followers: '85.3K', tickers: ['AAPL', 'MSFT', 'QQQ'] },
                  { handle: 'AIBull', displayName: 'AI Bull', avatar: '/avatars/top-voice-1.png', bio: 'Full-time AI/semiconductor analyst. Long $NVDA since $12. Data center thesis > hype.', verified: false, followers: '18.7K', tickers: ['NVDA', 'AMD'] },
                  { handle: 'CryptoKing', displayName: 'Crypto King', avatar: '/avatars/who-follow-1.png', bio: 'Full-time crypto trader since 2017. DeFi, Layer 1s, and macro.', verified: false, followers: '52.8K', tickers: ['BTC', 'ETH', 'SOL'] },
                  { handle: 'MomentumKing', displayName: 'Momentum King', avatar: '/avatars/who-follow-2.png', bio: 'Swing trading momentum setups. Relative strength and volume breakouts.', verified: false, followers: '31.6K', tickers: ['TSLA', 'PLTR'] },
                  { handle: 'MacroMaven', displayName: 'Macro Maven', avatar: '/avatars/who-follow-4.png', bio: 'Global macro strategist. Bonds, currencies, commodities. Former institutional PM.', verified: false, followers: '22.4K', tickers: ['GLD', 'TLT'] },
                ].map((user) => (
                  <div key={user.handle} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface hover:shadow-sm transition-shadow">
                    <img src={user.avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-border shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-text truncate">{user.displayName}</span>
                        {user.verified && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 shrink-0" aria-label="Verified">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                        )}
                        <span className="text-xs text-text-muted">@{user.handle}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{user.bio}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-text-muted">{user.followers} followers</span>
                        <span className="text-text-muted">·</span>
                        <div className="flex gap-1">
                          {user.tickers.map((t) => (
                            <span key={t} className="text-[10px] font-semibold text-primary">${t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/onboarding"
                      className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity mt-0.5"
                    >
                      Follow
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom CTA */}
            <div className="text-center pt-2 pb-4">
              <Link to="/onboarding" className="text-sm font-semibold text-primary hover:underline">
                Sign up to see more →
              </Link>
            </div>
          </div>
          )}
          {!isHome2 && homeTab === 'following' && isLoggedIn && (
          <div className="shrink-0">
            <div className="flex items-center gap-4 border-b border-border pb-2 mb-3">
              <button
                type="button"
                onClick={() => setFollowingFeedSort('recommended')}
                className={clsx(
                  'text-sm font-semibold transition-colors',
                  followingFeedSort === 'recommended' ? 'text-black border-b-2 border-black pb-0.5 -mb-0.5' : 'text-text-muted hover:text-text'
                )}
                style={followingFeedSort === 'recommended' ? { borderBottomWidth: 2 } : {}}
              >
                Recommended
              </button>
              <button
                type="button"
                onClick={() => setFollowingFeedSort('latest')}
                className={clsx(
                  'text-sm font-semibold transition-colors',
                  followingFeedSort === 'latest' ? 'text-black border-b-2 border-black pb-0.5 -mb-0.5' : 'text-text-muted hover:text-text'
                )}
                style={followingFeedSort === 'latest' ? { borderBottomWidth: 2 } : {}}
              >
                Latest
              </button>
            </div>
            <div className="divide-y divide-border">
              {(followingFeedSort === 'recommended' ? FOLLOWING_RECOMMENDED : FOLLOWING_LATEST).map((msg, idx) => (
                <div key={msg.id} className="flex gap-3 py-4">
                  <img src={msg.avatar || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-text">{msg.user}</span>
                      <span className="text-xs text-text-muted">{msg.time}</span>
                    </div>
                    <p className="text-sm text-text mt-0.5 leading-snug"><TickerLinkedText text={msg.body} /></p>
                    {idx % 3 === 1 && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-sm">
                        <img src={FEED_IMAGES[idx % FEED_IMAGES.length]} alt="" className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {msg.comments ?? 0}
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          {msg.reposts ?? 0}
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {msg.likes ?? 0}
                        </button>
                        <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button type="button" onClick={() => toggleBookmark(msg)} className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')} aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}>
                          <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
                        </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Trending: header above (only on /home2), then symbol tabs + content — show when Trending tab (on /home) or on /home2 */}
          {(isHome2 || homeTab === 'trending') && (
          <div className="shrink-0">
            {isHome2 && !isHome3 && (
            <h2 className="flex items-center gap-2 text-lg font-bold text-text mb-1.5">
              <span className="text-orange-500" aria-hidden>🔥</span>
              Trending &gt;
            </h2>
            )}
          <div className="flex flex-col gap-0 rounded-2xl border border-border overflow-hidden bg-surface-muted/10">
            <div className={clsx('relative group flex w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent', !isHome3 && 'border-b border-border bg-surface-muted/30')} style={{ scrollbarWidth: 'thin' }} ref={trendingCardsScrollRef}>
              {TRENDING_NOW.map((s, idx) => {
                const item = mergeQuote(s)
                const rank = idx + 1
                const isSelected = selectedTicker === item.ticker
                const isLive = item.ticker === 'AAPL'
                const pctNum = typeof item.pct === 'number' ? item.pct : 0
                const cardMinW = isHome3 ? 132 : 152
                return (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => { setSelectedTicker(item.ticker); setNewPostCount(0); if (item.ticker === 'AAPL') setStreamFilter('latest'); }}
                    className={clsx(
                      'relative flex flex-col items-center gap-1 shrink-0 transition-colors',
                      isHome3 ? 'px-4 py-3 min-w-[132px] border-r border-border' : 'px-4 py-3 text-base font-semibold border-r border-border min-w-[152px]',
                      isSelected && !isLive && 'bg-[rgba(254,215,170,0.5)] dark:bg-[rgba(254,215,170,0.25)] text-text',
                      isSelected && isLive && 'bg-[rgba(221,214,254,0.25)] text-text',
                      !isSelected && isLive && 'text-text-muted hover:bg-[rgba(221,214,254,0.15)]',
                      !isSelected && !isLive && (isHome3 ? 'text-text-muted hover:bg-surface-muted/50' : 'text-text-muted hover:bg-surface-muted/50'),
                      isHome3 && isSelected && 'border-b-2 border-b-black -mb-px',
                      !isHome3 && isSelected && 'border-b-2 -mb-px',
                      !isHome3 && isSelected && !isLive && 'border-b-amber-500',
                      !isHome3 && isSelected && isLive && 'border-b-[#7c3aed]'
                    )}
                  >
                    <span className="absolute left-2 top-2 text-base font-bold text-text-muted">#{rank}</span>
                    <div className={clsx('relative shrink-0', isHome3 ? 'w-20 h-20' : 'w-14 h-14')}>
                      <div className={clsx('rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0', isHome3 ? 'w-20 h-20' : 'w-14 h-14')}>
                        {getTickerLogo(item.ticker) ? (
                          <img src={getTickerLogo(item.ticker)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className={clsx('font-bold text-text-muted', isHome3 ? 'text-sm' : 'text-sm')}>{item.ticker[0]}</span>
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
                    {isHome3 ? (
                      isSelected ? (
                        <span className="text-xl font-bold text-text">{item.ticker}</span>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold text-text">{item.ticker}</span>
                          <span className={clsx('text-xs font-semibold tabular-nums', pctNum >= 0 ? 'text-success' : 'text-danger')}>
                            {pctNum >= 0 ? '+' : ''}{pctNum.toFixed(2)}%
                          </span>
                        </div>
                      )
                    ) : (
                      <>
                        <span
                          role="link"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); navigate('/symbol'); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); navigate('/symbol'); } }}
                          className="font-semibold text-primary hover:underline cursor-pointer focus:outline-none focus:underline text-base"
                        >
                          ${item.ticker}
                        </span>
                        <span className="text-text-muted text-sm tabular-nums">
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : '--'}
                        </span>
                        <span className={clsx('text-sm font-semibold tabular-nums', pctNum >= 0 ? 'text-success' : 'text-danger')}>
                          {pctNum >= 0 ? '+' : ''}{pctNum.toFixed(2)}%
                        </span>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Sentiment</span>
                          <span className={clsx('text-[11px] font-semibold', (item.sentiment ?? 50) >= 50 ? 'text-success' : 'text-danger')}>
                            {item.sentiment ?? 50}% bullish
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted tabular-nums">
                          <svg className="w-3.5 h-3.5 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span>{item.followers ?? '—'}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate('/symbol'); }}
                            className="w-6 h-6 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0"
                            aria-label="Add to watchlist"
                          >
                            <span className="text-sm font-bold leading-none">+</span>
                          </button>
                        </div>
                      </>
                    )}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  const el = trendingCardsScrollRef.current
                  if (el) el.scrollBy({ left: isHome3 ? 132 : 152, behavior: 'smooth' })
                }}
                className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                aria-label="Scroll to next"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </button>
            </div>

            {/* Home3: expanded section for selected symbol — matches mock (no logo, has metrics row) */}
            {isHome3 && (
            <div className="border-t border-border bg-white dark:bg-surface p-5">
              {/* Row 1: Ticker+name | Price block | Chart */}
              <div className="flex items-start gap-6 flex-wrap">
                <div className="min-w-0 shrink-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-text">{selectedItem.name}</span>
                  </div>
                  <div className="text-3xl font-bold text-text tabular-nums mt-1">
                    ${typeof selectedMerged.price === 'number' ? selectedMerged.price.toFixed(2) : '--'}
                  </div>
                  <div className={clsx('text-sm font-semibold mt-0.5', (selectedMerged.pct ?? 0) >= 0 ? 'text-success' : 'text-danger')}>
                    {(selectedMerged.pct ?? 0) >= 0 ? '↑' : '↓'} ${Math.abs(selectedMerged.change ?? 0).toFixed(2)} ({(selectedMerged.pct ?? 0).toFixed(2)}%) Today
                  </div>
                  <p className="text-xs text-text-muted mt-1">Updated: 5:00 PM EST</p>
                </div>
                <div className="flex-1 min-w-[220px] flex justify-center">
                  <TrendMiniChart values={chartValues} isUp={chartIsUp} width={240} height={80} />
                </div>
              </div>
              {/* Row 2: Metrics — followers pill, Sentiment with green circle */}
              {(() => {
                const sent = selectedItem.sentiment ?? 88
                const sentimentLabel = sent >= 80 ? 'Extremely Bullish' : sent >= 60 ? 'Bullish' : sent >= 50 ? 'Neutral' : sent >= 40 ? 'Bearish' : 'Extremely Bearish'
                const isBullish = sent >= 50
                return (
              <div className="flex flex-nowrap items-center gap-3 mt-4 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5 border border-border bg-surface-muted/30 shrink-0">
                  <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="font-medium text-text tabular-nums whitespace-nowrap">{selectedItem.followers ?? '—'}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/symbol')}
                    className="w-8 h-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0"
                    aria-label="Add to watchlist"
                  >
                    <span className="text-lg font-bold leading-none">+</span>
                  </button>
                </div>
                <span className="text-text-muted shrink-0">|</span>
                <span className="text-text flex items-center gap-2 whitespace-nowrap shrink-0">
                  <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: 40, height: 40 }}>
                    <svg width={40} height={40} className="rotate-[-90deg]" style={{ position: 'absolute', inset: 0 }}>
                      <circle cx={20} cy={20} r={16} fill="none" stroke="#e2e8f0" strokeWidth={4} />
                      <circle
                        cx={20}
                        cy={20}
                        r={16}
                        fill="none"
                        stroke={isBullish ? 'var(--color-success)' : 'var(--color-danger)'}
                        strokeWidth={4}
                        strokeDasharray={100.5}
                        strokeDashoffset={100.5 - (sent / 100) * 100.5}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={clsx('text-sm font-bold relative z-10', isBullish ? 'text-success' : 'text-danger')}>{sent}</span>
                  </span>
                  <span className={clsx('font-semibold', isBullish ? 'text-success' : 'text-danger')}>{sentimentLabel}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/symbol')}
                    className="ml-2 py-2 px-4 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-95 active:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md shadow-primary/30 shrink-0"
                  >
                    View ${selectedTicker} Stream
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </span>
              </div>
                )
              })()}
            </div>
            )}

            {/* Content: Why it's trending + Popular Topics + messages. On /home2: fixed container. On /home: full stream like /symbol */}
          {isHome2 ? (
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
              {/* AAPL: Live earnings call; others: Why it's trending */}
              {selectedTicker === 'AAPL' ? (
              <div className="w-full flex flex-col gap-2 px-4 pt-1.5 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-base font-bold text-text">Q1 &apos;26 Earnings Call</h3>
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#7c3aed' }}>Live</span>
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
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span>2.1K Listeners</span>
                  <span className="text-border">|</span>
                  <span>Started 21m ago</span>
                </div>
                {/* Compact earnings snippet */}
                <div className="rounded-lg border border-border bg-surface-muted/30 p-2.5 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-text">$AAPL Q1 &apos;26 Earnings Recap</p>
                    <button
                      type="button"
                      onClick={() => navigate('/symbol?ticker=AAPL&expandSummary=1')}
                      className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-text hover:bg-surface-muted transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View full
                    </button>
                  </div>
                  <p className="text-xs text-black font-medium mb-0">
                    GAAP EPS of $0.33 up <span className="text-success">94.12% YoY</span> / Revenue of $177.09M up <span className="text-success">7.16% YoY</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-3 px-4 pt-1.5 pb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wide">Why ${selectedTicker} Is Trending</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2 pr-2" title={selectedItem.whyBlurb}>
                    {selectedItem.whyBlurb}
                  </p>
                </div>
                <button type="button" onClick={() => navigate(`/symbol?ticker=${selectedTicker}&expandSummary=1`)} className="shrink-0 text-sm font-semibold text-primary hover:underline whitespace-nowrap" aria-label="View full summary">
                  View Full Summary →
                </button>
              </div>
            )}
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
              <div className="mb-2 shrink-0 flex items-center gap-2 min-w-0">
                {isHome2 ? (
                  <>
                    <div className="shrink-0">
                      <h3 className="text-sm font-semibold text-text">Popular Community Topics</h3>
                      <p className="text-xs text-text-muted">What the Community&apos;s Saying</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto overflow-y-hidden py-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
                      {popularTopics.map((t, i) => {
                        const slug = t.label.toLowerCase().replace(/\s+/g, '-')
                        const pillClass = 'inline-flex items-center gap-2 rounded-full border border-border bg-white dark:bg-surface px-3 py-1.5 text-xs font-medium text-text shrink-0'
                        if (selectedTicker === 'TSLA') {
                          return (
                            <Link
                              key={i}
                              to={`/symbol?topic=${slug}`}
                              className={clsx(pillClass, 'hover:border-border-strong hover:bg-surface-muted transition-colors')}
                            >
                              <span className="text-sm" aria-hidden>{t.emoji}</span>
                              {t.label}
                            </Link>
                          )
                        }
                        return (
                          <span key={i} className={pillClass}>
                            <span className="text-sm" aria-hidden>{t.emoji}</span>
                            {t.label}
                          </span>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStreamFilter('latest')}
                      className={clsx(
                        'text-sm font-semibold shrink-0 transition-colors',
                        streamFilter === 'latest' ? 'text-text border-b-2 border-text pb-0.5 -mb-0.5' : 'text-text-muted hover:text-text'
                      )}
                    >
                      Latest
                    </button>
                    <span className="text-sm font-semibold text-text-muted shrink-0">Popular Community Topics</span>
                    <div className="flex gap-2 overflow-x-auto overflow-y-hidden py-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollbarWidth: 'thin' }}>
                      {popularTopics.map((t, i) => {
                        const slug = t.label.toLowerCase().replace(/\s+/g, '-')
                        const pillClass = 'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shrink-0 transition-colors'
                        const isSelected = streamFilter === i
                        return selectedTicker === 'TSLA' ? (
                          <Link
                            key={i}
                            to={`/symbol?topic=${slug}`}
                            className={clsx(pillClass, isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white dark:bg-surface text-text hover:border-border-strong hover:bg-surface-muted')}
                          >
                            <span className="text-sm" aria-hidden>{t.emoji}</span>
                            {t.label}
                          </Link>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setStreamFilter(i)}
                            className={clsx(pillClass, isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white dark:bg-surface text-text hover:border-border-strong hover:bg-surface-muted')}
                          >
                            <span className="text-sm" aria-hidden>{t.emoji}</span>
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              {isHome2 ? (
              <>
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
              {messages.map((msg, idx) => {
                const topic = popularTopics[msg.topicIndex ?? 0]
                return (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
                  <img src={msg.avatar || DEFAULT_AVATAR} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
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
                    {idx % 4 === 0 && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-sm">
                        <img src={FEED_IMAGES[idx % FEED_IMAGES.length]} alt="" className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                      <div className="flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {msg.comments ?? 0}
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          {msg.reposts ?? 0}
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {msg.likes ?? 0}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button type="button" onClick={() => toggleBookmark(msg)} className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')} aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}>
                          <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
              </div>
              </div>
              <div className="flex-[0.1] min-h-0 shrink-0" aria-hidden />
            </>
              ) : (
              <div className="space-y-3">
              {newPostCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setNewPostCount(0); navigate('/symbol'); }}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity mb-3"
                  style={{ backgroundColor: '#4285F4' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {newPostCount} New Post{newPostCount === 1 ? '' : 's'}
                </button>
              )}
              {messages.map((msg, idx) => {
                const topic = popularTopics[msg.topicIndex ?? 0]
                return (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
                  <img src={msg.avatar || DEFAULT_AVATAR} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
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
                    {idx % 4 === 0 && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-sm">
                        <img src={FEED_IMAGES[idx % FEED_IMAGES.length]} alt="" className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {msg.comments ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {msg.reposts ?? 0}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {msg.likes ?? 0}
                      </button>
                      <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                      <button type="button" onClick={() => toggleBookmark(msg)} className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')} aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}>
                        <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                )
              })}
              </div>
              )}
            </div>
          </div>
          ) : (
          /* /home: full stream like /symbol — no container, infinite scroll */
          <>
            <div
              className="w-full px-4 pt-3 pb-2 rounded-b-2xl overflow-hidden shrink-0"
              style={selectedTicker === 'AAPL'
                ? { backgroundColor: 'rgba(221, 214, 254, 0.5)' }
                : { background: 'linear-gradient(to right, rgba(254, 215, 170, 0.6), rgba(250, 204, 211, 0.5), rgba(221, 214, 254, 0.5))' }
              }
            >
              {selectedTicker === 'AAPL' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-base font-bold text-text">Q1 &apos;26 Earnings Call</h3>
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#7c3aed' }}>Live</span>
                  </div>
                  <button type="button" onClick={() => navigate('/symbol')} className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Join
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span>2.1K Listeners</span>
                  <span className="text-border">|</span>
                  <span>Started 21m ago</span>
                </div>
                {/* Compact earnings snippet */}
                <div className="rounded-lg border border-border bg-surface-muted/30 p-2.5 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-text">$AAPL Q1 &apos;26 Earnings Recap</p>
                    <button
                      type="button"
                      onClick={() => navigate('/symbol?ticker=AAPL&expandSummary=1')}
                      className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-text hover:bg-surface-muted transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View full
                    </button>
                  </div>
                  <p className="text-xs text-black font-medium mb-0">
                    GAAP EPS of $0.33 up <span className="text-success">94.12% YoY</span> / Revenue of $177.09M up <span className="text-success">7.16% YoY</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wide">Why ${selectedTicker} Is Trending</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2 pr-2" title={selectedItem.whyBlurb}>{selectedItem.whyBlurb}</p>
                </div>
                <button type="button" onClick={() => navigate(`/symbol?ticker=${selectedTicker}&expandSummary=1`)} className="shrink-0 text-sm font-semibold text-primary hover:underline">View Full Summary →</button>
              </div>
            )}
            </div>
            <div className="px-4 py-2 flex gap-2 overflow-x-auto min-w-0 border-b border-border bg-background scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
              <button
                type="button"
                onClick={() => setStreamFilter('latest')}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shrink-0 transition-colors',
                  streamFilter === 'latest' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white dark:bg-surface text-text hover:border-border-strong'
                )}
              >
                Latest
                <span className="font-semibold text-[#4285F4]">· {latestStreamNewCount} New Post{latestStreamNewCount === 1 ? '' : 's'}</span>
              </button>
              {popularTopics.map((t, i) => {
                const isSelected = streamFilter === i
                const pillClass = 'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shrink-0 transition-colors'
                return (
                  <button key={i} type="button" onClick={() => setStreamFilter(i)} className={clsx(pillClass, isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white dark:bg-surface text-text hover:border-border-strong')}>
                    <span className="text-sm" aria-hidden>{t.emoji}</span>
                    {t.label}
                  </button>
                )
              })}
            </div>
            {streamFilter === 'latest' && latestStreamNewCount > 0 && (
              <div className="flex justify-center pt-3 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setLatestStreamNewCount(0)
                    setPrependedLatestMessages(LOAD_IN_MESSAGES[selectedTicker] ?? LOAD_IN_MESSAGES.TSLA)
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#4285F4' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  {latestStreamNewCount} New Post{latestStreamNewCount === 1 ? '' : 's'}
                </button>
              </div>
            )}
            {typeof streamFilter === 'number' && (() => {
              const summaries = TOPIC_AI_SUMMARIES[selectedTicker] ?? TOPIC_AI_SUMMARIES.TSLA
              const ai = summaries[streamFilter]
              if (!ai) return null
              return (
                <div className="px-4 py-3 border-b border-border bg-surface-muted/20">
                  <p className="text-sm font-medium text-text leading-relaxed">{ai.summary}</p>
                  <p className="text-xs text-text-muted mt-1">{ai.posts} posts · {ai.recency}</p>
                </div>
              )
            })()}
            <div className="divide-y divide-border">
              {messages.map((msg, idx) => {
                const topic = popularTopics[msg.topicIndex ?? 0]
                return (
                  <article key={msg.id} className="flex gap-3 pt-4 pb-4 px-4">
                    <img src={msg.avatar || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text">{msg.user}</span>
                        <span className="text-xs text-text-muted">{msg.time}</span>
                        {topic && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted/50 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                            <span aria-hidden>{topic.emoji}</span>
                            {topic.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text leading-snug"><TickerLinkedText text={msg.body} /></p>
                      {idx % 3 === 0 && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-sm">
                          <img src={FEED_IMAGES[idx % FEED_IMAGES.length]} alt="" className="w-full aspect-video object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full mt-3 text-sm text-text-muted">
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>{msg.comments ?? 0}</button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>{msg.reposts ?? 0}</button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-text transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>{msg.likes ?? 0}</button>
                        <button type="button" className="p-1 hover:text-text transition-colors" aria-label="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button type="button" onClick={() => toggleBookmark(msg)} className={clsx('p-1 transition-colors', isBookmarked(msg.id) ? 'text-primary' : 'hover:text-text')} aria-label={isBookmarked(msg.id) ? 'Remove bookmark' : 'Bookmark'}>
                          <svg className="w-4 h-4" fill={isBookmarked(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
          )}
          </div>
          </div>
          )}

          {(isHome2 || (!isHome2 && homeTab === 'market-overview')) && homeTab !== 'following' && (
          <>
          {/* Trending: pills + why it's trending (no stream) */}
          <section className="shrink-0">
            <h2 className="text-lg font-bold text-text mb-3">Trending &gt;</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent mb-3" style={{ scrollbarWidth: 'thin' }}>
              {MARKET_OVERVIEW_TRENDING.map((s) => {
                const item = mergeQuote(s)
                const isSelected = marketOverviewTrendingTicker === item.ticker
                return (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => setMarketOverviewTrendingTicker(item.ticker)}
                    className={clsx(
                      'flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-white dark:bg-surface text-text hover:border-border-strong'
                    )}
                  >
                    {getTickerLogo(item.ticker) ? (
                      <img src={getTickerLogo(item.ticker)} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold">{item.ticker[0]}</span>
                    )}
                    <span className="font-semibold text-sm">{item.ticker}</span>
                    <span className={clsx('text-xs font-medium tabular-nums', (item.pct ?? 0) >= 0 ? 'text-success' : 'text-danger')}>
                      {(item.pct ?? 0) >= 0 ? '+' : ''}{(item.pct ?? 0).toFixed(2)}%
                    </span>
                  </button>
                )
              })}
            </div>
            <div
              className="w-full rounded-xl p-4"
              style={{
                background: 'linear-gradient(to right, rgba(254, 215, 170, 0.6), rgba(250, 204, 211, 0.5), rgba(221, 214, 254, 0.5))',
              }}
            >
              {(() => {
                const item = MARKET_OVERVIEW_TRENDING.find((s) => s.ticker === marketOverviewTrendingTicker) ?? MARKET_OVERVIEW_TRENDING[0]
                const merged = mergeQuote(item)
                const ticker = merged.ticker
                const topPost = (LOAD_IN_MESSAGES[ticker] ?? LOAD_IN_MESSAGES.TSLA)?.[0]
                const topics = POPULAR_TOPICS[ticker] ?? POPULAR_TOPICS.TSLA
                return (
                  <>
                    <h3 className="text-sm font-bold text-text uppercase tracking-wide">Why ${ticker} Is Trending</h3>
                    <p className="text-sm text-text-muted mt-1 leading-relaxed">
                      {merged.whyBlurb}
                      {' '}
                      <button type="button" onClick={() => navigate(`/symbol?ticker=${ticker}`)} className="text-sm font-medium text-black hover:underline inline">
                        View Stream &rarr;
                      </button>
                    </p>

                    <h3 className="text-sm font-bold text-text uppercase tracking-wide mt-4 mb-2">Top Post</h3>
                    {topPost && (
                      <div className="rounded-lg border border-border bg-background p-3 flex gap-3">
                        <img src={topPost.avatar || DEFAULT_AVATAR} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-text">{topPost.user}</span>
                            <span className="text-xs text-text-muted">{topPost.time}</span>
                          </div>
                          <p className="text-sm text-text mt-1 leading-snug"><TickerLinkedText text={topPost.body} /></p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">{topPost.comments ?? 0} replies</span>
                            <span className="flex items-center gap-1">{topPost.reposts ?? 0} reshares</span>
                            <span className="flex items-center gap-1">{topPost.likes ?? 0} likes</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="text-sm font-bold text-text uppercase tracking-wide mt-4 mb-2">Top Community Topics</h3>
                    <div className="flex flex-nowrap gap-2 overflow-hidden">
                      {(topics.length <= 3 ? topics : topics.slice(0, 3)).map((t) => (
                        <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-text shrink-0">
                          <span aria-hidden>{t.emoji}</span>
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          </section>

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
                  <img src={p.avatar || DEFAULT_AVATAR} alt="" className="w-12 h-12 rounded-full object-cover border border-border mb-3" />
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
          </>
          )}
        </main>

        {!isHome2 && (
          <aside className="w-[280px] shrink-0 hidden lg:block space-y-6 pl-0 pr-4 pt-4 pb-4">
            <LatestNews />
            <TopDiscussions />
            <RelatedSymbols title="Top Watchlist Additions" />
            <PredictionLeaderboard />
          </aside>
        )}
        </div>
      </div>
      </div>
    </div>
  )
}
