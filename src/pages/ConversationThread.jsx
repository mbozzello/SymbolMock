import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import DebateBox from '../components/DebateBox.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function PollWidget({ poll }) {
  const [voted, setVoted] = useState(null)
  const total = voted ? poll.totalVotes + 1 : poll.totalVotes

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2.5">
      <p className="text-sm font-semibold text-text">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const extraVote = voted === opt.label ? 1 : 0
          const votes = opt.votes + extraVote
          const pct = Math.round((votes / total) * 100)
          const isChosen = voted === opt.label
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => !voted && setVoted(opt.label)}
              disabled={!!voted}
              className={clsx(
                'relative w-full rounded-lg border overflow-hidden text-left transition-colors',
                voted
                  ? isChosen
                    ? 'border-primary'
                    : 'border-border'
                  : 'border-border hover:border-primary/50 cursor-pointer'
              )}
            >
              {/* Fill bar */}
              <span
                className={clsx(
                  'absolute inset-0 rounded-lg transition-all duration-500',
                  isChosen ? 'bg-primary/15' : 'bg-surface-muted/60'
                )}
                style={{ width: voted ? `${pct}%` : '0%' }}
              />
              <span className="relative flex items-center justify-between px-3 py-2">
                <span className={clsx('text-sm font-medium', isChosen ? 'text-primary' : 'text-text')}>
                  {opt.label}
                  {isChosen && (
                    <svg className="inline-block ml-1.5 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </span>
                {voted && (
                  <span className={clsx('text-xs font-bold', isChosen ? 'text-primary' : 'text-text-muted')}>{pct}%</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-text-muted">
        {total.toLocaleString()} votes
        {!voted && <span className="ml-1">· Tap to vote</span>}
      </p>
    </div>
  )
}

function clsx(...v) { return v.filter(Boolean).join(' ') }

const THREADS = {
  'BearCaseKing-debate-1': {
    id: 'debate-1',
    username: 'BearCaseKing',
    avatar: '/avatars/michael-bolling.png',
    time: '9m',
    body: 'I might just invest in a state-of-the-art AI assistant from their amazing robotics team!',
    ticker: 'TSLA',
    sentiment: 'bullish',
    likes: 186,
    reposts: 42,
    comments: 312,
    hasDebate: true,
    debate: {
      thumbsUp: 393,
      thumbsDown: 1919,
      upVoters: [
        { id: 'u1', username: 'EVSkeptic', avatar: '/avatars/top-voice-1.png' },
        { id: 'u2', username: 'ShortSeller', avatar: '/avatars/top-voice-2.png' },
        { id: 'u3', username: 'BearishDave', avatar: '/avatars/ross-cameron.png' },
      ],
      downVoters: [
        { id: 'd1', username: 'ElonFan', avatar: '/avatars/top-voice-2.png' },
        { id: 'd2', username: 'TeslaBull', avatar: '/avatars/howard-lindzon.png' },
        { id: 'd3', username: 'FSDLover', avatar: '/avatars/top-voice-3.png' },
      ],
    },
    replies: [
      { id: 'r1', username: 'TeslaBull', avatar: '/avatars/howard-lindzon.png', time: '7m', body: 'Optimus is the sleeper catalyst nobody is talking about. Full humanoid robot production by 2026. This changes everything.', likes: 89, reposts: 12 },
      { id: 'r2', username: 'RealityCheck', avatar: '/avatars/top-voice-1.png', time: '6m', body: "The robotics team is impressive but we're still years away from commercial scale. Don't confuse demo videos with actual revenue.", likes: 54, reposts: 8, sentiment: 'bearish' },
      { id: 'r3', username: 'AIBeliever', avatar: '/avatars/top-voice-2.png', time: '5m', body: 'Tesla AI day showed real progress. The neural net training on actual road data is unlike anything competitors have. Long term this is the moat.', likes: 112, reposts: 23, sentiment: 'bullish' },
      { id: 'r4', username: 'EVSkeptic', avatar: '/avatars/top-voice-3.png', time: '4m', body: "Every year it's \"robotics will be huge next year.\" Meanwhile legacy auto is catching up on EVs and margins keep shrinking.", likes: 67, reposts: 6, sentiment: 'bearish' },
      { id: 'r5', username: 'ChartWatcher', avatar: '/avatars/leader-1.png', time: '3m', body: 'Whatever you think about the fundamentals, the chart looks constructive right here. Tight consolidation above the 200MA.', likes: 43, reposts: 9 },
      { id: 'r6', username: 'MomentumKing', avatar: '/avatars/leader-2.png', time: '2m', body: 'Bought calls this morning. Robotaxi + Optimus + FSD = multi-trillion dollar company within 5 years. Fight me.', likes: 78, reposts: 15, sentiment: 'bullish' },
    ],
  },
  'TeslaWatcher-poll-1': {
    id: 'poll-1',
    username: 'TeslaWatcher',
    avatar: '/avatars/leader-4.png',
    time: '22m',
    ticker: 'TSLA',
    sentiment: null,
    body: 'Will TSLA hit $500 by year end?',
    likes: 214,
    reposts: 87,
    comments: 193,
    hasDebate: false,
    poll: {
      question: 'Will TSLA hit $500 by year end?',
      totalVotes: 3424,
      options: [
        { label: 'Yes', votes: 2191, pct: 64 },
        { label: 'No',  votes: 1233, pct: 36 },
      ],
    },
    replies: [
      { id: 'r1', username: 'BullRunKing', avatar: '/avatars/top-voice-1.png', time: '20m', body: 'Easy yes. Robotaxi launch + Optimus production ramp + FSD licensing deals. The catalysts are stacking up. $500 is conservative honestly.', likes: 97, reposts: 28, sentiment: 'bullish' },
      { id: 'r2', username: 'RealityCheck', avatar: '/avatars/top-voice-3.png', time: '18m', body: "Voted no. Current macro headwinds, margin compression, and Elon's political baggage are real overhangs. $500 would require a near-perfect setup.", likes: 54, reposts: 11, sentiment: 'bearish' },
      { id: 'r3', username: 'OptionsFlow', avatar: '/avatars/top-voice-2.png', time: '16m', body: 'The options market is pricing in a 28% probability of touching $500 by December. Market agrees it\'s possible but not a sure thing. I\'m long calls.', likes: 113, reposts: 34, sentiment: 'bullish' },
      { id: 'r4', username: 'MacroMike', avatar: '/avatars/leader-2.png', time: '14m', body: 'Depends entirely on whether the Fed cuts in Q3. Rate-sensitive growth names like TSLA have huge beta to rate expectations right now.', likes: 62, reposts: 17 },
      { id: 'r5', username: 'ChartWizard', avatar: '/avatars/leader-1.png', time: '11m', body: 'Chart-wise there\'s a clear path to 420 resistance first. Break that with volume and 500 becomes very realistic by Q4. Watching closely.', likes: 78, reposts: 22, sentiment: 'bullish' },
      { id: 'r6', username: 'BearishTruth', avatar: '/avatars/top-voice-3.png', time: '8m', body: 'People voting yes are forgetting that TSLA at $500 would put it at a 180x PE. Name one fundamental justification for that valuation today.', likes: 45, reposts: 9, sentiment: 'bearish' },
      { id: 'r7', username: 'RetailTrader42', avatar: '/avatars/leader-5.png', time: '5m', body: 'Been holding since $180 and voted yes obviously. Not financial advice but this thing has surprised everyone before and will again.', likes: 89, reposts: 19, sentiment: 'bullish' },
      { id: 'r8', username: 'GammaSqueeze', avatar: '/avatars/leader-3.png', time: '2m', body: 'Short gamma above $380 means dealer hedging flows could turbocharge any breakout. If we gap above that level, $500 could happen faster than people think.', likes: 67, reposts: 14 },
    ],
  },
  'OptionsFlow-toppost-1': {
    id: 'toppost-1',
    username: 'OptionsFlow',
    avatar: '/avatars/top-voice-2.png',
    time: '14m',
    ticker: 'TSLA',
    sentiment: 'bullish',
    body: 'TESLA boasts a massive, rapidly growing cash position, with approximately $60.6 billion in total cash and cash equivalents as of late 2025, driven by immense AI data center demand. The company is experiencing a "CASH GUSHER" effect, with free cash flow (ttm) exceeding $53 billion. Consequently, NVIDIA is aggressively returning capital, utilizing over $37 billion in the first nine months of fiscal 2026 for share repurchases and dividends.',
    likes: 43,
    reposts: 18,
    comments: 97,
    hasDebate: false,
    replies: [
      { id: 'r1', username: 'CashFlowKing', avatar: '/avatars/top-voice-1.png', time: '12m', body: "$53B FCF on a trailing basis is absolutely insane. That's more than most S&P 500 companies earn in total revenue. The compounding effect here is extraordinary.", likes: 34, reposts: 11, sentiment: 'bullish' },
      { id: 'r2', username: 'ValueHunter', avatar: '/avatars/leader-3.png', time: '11m', body: "Worth noting the $37B in buybacks is actually shrinking the float meaningfully. At this pace the share count drops 3-4% annually.", likes: 28, reposts: 7 },
      { id: 'r3', username: 'BearishTruth', avatar: '/avatars/top-voice-3.png', time: '10m', body: 'The NVIDIA comparison is a bit of a stretch here. These are two very different businesses. TSLA cash flows are more cyclical and tied to auto delivery cycles.', likes: 19, reposts: 4, sentiment: 'bearish' },
      { id: 'r4', username: 'MacroMike', avatar: '/avatars/leader-2.png', time: '8m', body: 'Cash position this strong means they could fund Optimus, Robotaxi, and a new Gigafactory simultaneously without touching debt markets. Optionality is underpriced.', likes: 51, reposts: 14, sentiment: 'bullish' },
      { id: 'r5', username: 'DividendWatch', avatar: '/avatars/leader-1.png', time: '6m', body: 'When does TSLA initiate a dividend? At $60B cash and growing, shareholders should start asking this question louder.', likes: 22, reposts: 5 },
      { id: 'r6', username: 'QuantTrader', avatar: '/avatars/leader-5.png', time: '4m', body: 'My DCF adds $85/share for the cash position alone. Market is not fully pricing this balance sheet strength.', likes: 39, reposts: 10, sentiment: 'bullish' },
      { id: 'r7', username: 'ShortSqueeze', avatar: '/avatars/ross-cameron.png', time: '2m', body: "Short interest has been declining steadily as bears realize they're fighting a company that can literally fund its own competition into oblivion.", likes: 31, reposts: 8 },
    ],
  },
}

export default function ConversationThread() {
  const { username, messageId } = useParams()
  const navigate = useNavigate()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [debateState, setDebateState] = useState(null)
  const [likedReplies, setLikedReplies] = useState({})
  const [repostedReplies, setRepostedReplies] = useState({})
  const [mainLiked, setMainLiked] = useState(false)
  const [mainReposted, setMainReposted] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const key = `${username}-${messageId}`
  const thread = THREADS[key]

  const handleDebateVote = (postId, vote) => {
    setDebateState((prev) => {
      const base = prev || thread.debate
      const wasUp = base.upVoters?.some(v => v.id === 'current')
      const wasDown = base.downVoters?.some(v => v.id === 'current')
      let up = base.thumbsUp
      let down = base.thumbsDown
      const upVoters = base.upVoters.filter(v => v.id !== 'current')
      const downVoters = base.downVoters.filter(v => v.id !== 'current')
      if (vote === 'up') {
        if (wasDown) down--
        if (!wasUp) up++
        return { ...base, thumbsUp: up, thumbsDown: down, upVoters: [...upVoters, { id: 'current', username: 'you', avatar: '/avatars/user-avatar.png' }], downVoters }
      } else {
        if (wasUp) up--
        if (!wasDown) down++
        return { ...base, thumbsUp: up, thumbsDown: down, upVoters, downVoters: [...downVoters, { id: 'current', username: 'you', avatar: '/avatars/user-avatar.png' }] }
      }
    })
  }

  const debate = debateState || thread?.debate

  if (!thread) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-text mb-2">Message not found</p>
          <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline">← Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Post</div>
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

        <div className="max-w-[1200px] mx-auto pl-0 pr-0 py-4 flex gap-0">
          {/* Main content column */}
          <div className="flex-1 min-w-0 max-w-[660px] pl-0 pr-0">

            {/* Back nav */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-muted transition-colors text-text"
                aria-label="Back"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="font-bold text-base text-text">Post</span>
            </div>

            {/* Original message */}
            <article className="px-4 pt-5 pb-4 border-b border-border">
              <div className="flex items-start gap-3">
                <img src={thread.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text">@{thread.username}</span>
                    <span className="text-xs text-text-muted">{thread.time} ago</span>
                    {thread.ticker && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-muted border border-border text-text">
                        ${thread.ticker}
                      </span>
                    )}
                    {thread.sentiment && (
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        thread.sentiment === 'bullish' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      )}>
                        {thread.sentiment === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-text leading-relaxed">{thread.body}</p>

                  {thread.hasDebate && debate && (
                    <DebateBox postId={thread.id} debate={debate} onVote={handleDebateVote} />
                  )}
                  {thread.poll && (
                    <PollWidget poll={thread.poll} />
                  )}
                </div>
              </div>

              {/* Engagement row for main post */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border text-sm text-text-muted">
                <button className="flex items-center gap-1.5 hover:text-text transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{thread.comments}</span>
                </button>
                <button
                  onClick={() => setMainReposted(v => !v)}
                  className={clsx('flex items-center gap-1.5 transition-colors', mainReposted ? 'text-success' : 'hover:text-text')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{thread.reposts + (mainReposted ? 1 : 0)}</span>
                </button>
                <button
                  onClick={() => setMainLiked(v => !v)}
                  className={clsx('flex items-center gap-1.5 transition-colors', mainLiked ? 'text-danger' : 'hover:text-text')}
                >
                  <svg className="w-4 h-4" fill={mainLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{thread.likes + (mainLiked ? 1 : 0)}</span>
                </button>
                <button className="ml-auto hover:text-text transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </article>

            {/* Replies header */}
            <div className="px-4 py-2.5 border-b border-border bg-surface-muted/30">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
              </span>
            </div>

            {/* Replies */}
            <div className="divide-y divide-border">
              {thread.replies.map((reply) => (
                <article key={reply.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <img src={reply.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-text">@{reply.username}</span>
                        <span className="text-xs text-text-muted">{reply.time} ago</span>
                        {reply.sentiment && (
                          <span className={clsx(
                            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                            reply.sentiment === 'bullish' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          )}>
                            {reply.sentiment === 'bullish' ? '▲' : '▼'} {reply.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text leading-snug">{reply.body}</p>
                      <div className="flex items-center gap-5 mt-2 text-xs text-text-muted">
                        <button className="flex items-center gap-1 hover:text-text transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Reply
                        </button>
                        <button
                          onClick={() => setRepostedReplies(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                          className={clsx('flex items-center gap-1 transition-colors', repostedReplies[reply.id] ? 'text-success' : 'hover:text-text')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {reply.reposts + (repostedReplies[reply.id] ? 1 : 0)}
                        </button>
                        <button
                          onClick={() => setLikedReplies(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                          className={clsx('flex items-center gap-1 transition-colors', likedReplies[reply.id] ? 'text-danger' : 'hover:text-text')}
                        >
                          <svg className="w-3.5 h-3.5" fill={likedReplies[reply.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {reply.likes + (likedReplies[reply.id] ? 1 : 0)}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>

          {/* Right sidebar — matches Home.jsx pattern */}
          <aside className="hidden xl:block w-[340px] shrink-0 pl-8 pt-0">
            <div className="sticky top-[80px] space-y-5">
              {/* Who to follow */}
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-bold text-text mb-3">Who to follow</h3>
                <ul className="space-y-3">
                  {[
                    { username: 'TeslaBull', handle: '@TeslaBull', avatar: '/avatars/top-voice-1.png' },
                    { username: 'OptionsFlow', handle: '@OptionsFlow', avatar: '/avatars/top-voice-2.png' },
                    { username: 'ChartWizard', handle: '@ChartWizard', avatar: '/avatars/top-voice-3.png' },
                  ].map((person) => (
                    <li key={person.username} className="flex items-center gap-3">
                      <img src={person.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{person.username}</p>
                        <p className="text-xs text-text-muted truncate">{person.handle}</p>
                      </div>
                      <button className="shrink-0 px-3 py-1 rounded-full text-xs font-bold border border-border bg-surface hover:bg-surface-muted text-text transition-colors">
                        Follow
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trending on stream */}
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-bold text-text mb-3">Trending on stream</h3>
                <ul className="space-y-3">
                  {[
                    { ticker: 'TSLA', label: 'Tesla', change: '+3.2%', up: true },
                    { ticker: 'NVDA', label: 'Nvidia', change: '+1.8%', up: true },
                    { ticker: 'AAPL', label: 'Apple', change: '-0.6%', up: false },
                    { ticker: 'MSTR', label: 'MicroStrategy', change: '+5.1%', up: true },
                  ].map((item) => (
                    <li key={item.ticker} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text">${item.ticker}</p>
                        <p className="text-xs text-text-muted">{item.label}</p>
                      </div>
                      <span className={clsx('text-xs font-bold', item.up ? 'text-success' : 'text-danger')}>
                        {item.change}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}
