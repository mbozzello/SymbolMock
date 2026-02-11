import { useState, useMemo } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import RelatedSymbols from '../components/RelatedSymbols.jsx'
import PredictionLeaderboard from '../components/PredictionLeaderboard.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

// Raw notification events (like X: each like, reshare, follow, mention is one event; we group for display)
const RAW_NOTIFICATIONS = [
  { id: 1, type: 'like', actor: { handle: 'TechTrader', avatar: '/avatars/top-voice-1.png' }, targetId: 'msg-101', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '2m' },
  { id: 2, type: 'like', actor: { handle: 'QuantQueen', avatar: '/avatars/top-voice-2.png' }, targetId: 'msg-101', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '5m' },
  { id: 3, type: 'like', actor: { handle: 'BullMarket', avatar: '/avatars/top-voice-3.png' }, targetId: 'msg-101', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '8m' },
  { id: 4, type: 'like', actor: { handle: 'ChartKing', avatar: '/avatars/user-avatar.png' }, targetId: 'msg-101', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '12m' },
  { id: 5, type: 'reshare', actor: { handle: 'AlphaSeeker', avatar: '/avatars/top-voice-1.png' }, targetId: 'msg-99', targetPreview: 'Adding $TSLA on any dip. Robotaxi narrative intact.', time: '15m' },
  { id: 6, type: 'reshare', actor: { handle: 'MomentumMike', avatar: '/avatars/top-voice-2.png' }, targetId: 'msg-99', targetPreview: 'Adding $TSLA on any dip. Robotaxi narrative intact.', time: '18m' },
  { id: 7, type: 'follow', actor: { handle: 'NewFollower', avatar: '/avatars/top-voice-3.png' }, targetId: null, targetPreview: null, time: '25m' },
  { id: 8, type: 'mention', actor: { handle: 'StockTwitsUser', avatar: '/avatars/howard-lindzon.png' }, targetId: 'msg-200', targetPreview: 'What do you think @michaelbozzello about $AAPL here?', time: '1h' },
  { id: 9, type: 'like', actor: { handle: 'ValueViking', avatar: '/avatars/top-voice-2.png' }, targetId: 'msg-102', targetPreview: 'China headwinds are real but iPhone demand holding strong.', time: '1h' },
  { id: 10, type: 'mention', actor: { handle: 'CryptoBull', avatar: '/avatars/user-avatar.png' }, targetId: 'msg-201', targetPreview: 'Hey @michaelbozzello agree that macro is the main driver now?', time: '2h' },
  { id: 11, type: 'follow', actor: { handle: 'TraderJane', avatar: '/avatars/top-voice-1.png' }, targetId: null, targetPreview: null, time: '3h' },
  { id: 12, type: 'follow', actor: { handle: 'OptionsGuy', avatar: '/avatars/top-voice-3.png' }, targetId: null, targetPreview: null, time: '3h' },
  { id: 13, type: 'quote', actor: { handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png' }, targetId: 'msg-stream', targetPreview: 'Have you checked out Stream Topics now rolling out on @Stocktwits? Easily see what everyone is talking about grouped by the most popular topics. Rolling out on top tickers to start. We also just added Emojis cause who doesn\'t love emojis? 🎅', time: '45m', quoteText: 'Ticker stream topics now on @stocktwits', quotedMedia: true },
  { id: 14, type: 'quote', actor: { handle: 'AlphaSeeker', avatar: '/avatars/top-voice-1.png' }, targetId: 'msg-nvda', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '1h', quoteText: 'Same. Holding through earnings.', quotedMedia: false },
]

function groupNotifications(raw) {
  const byKey = new Map()
  raw.forEach((n) => {
    const key = n.type === 'follow' ? `follow-${n.actor.handle}-${n.id}` : n.type === 'mention' ? `mention-${n.id}` : n.type === 'quote' ? `quote-${n.id}` : `${n.type}-${n.targetId}`
    if (!byKey.has(key)) {
      const group = { type: n.type, actors: [], targetId: n.targetId, targetPreview: n.targetPreview, time: n.time, id: n.id }
      if (n.type === 'quote') {
        group.quoteText = n.quoteText
        group.quotedMedia = n.quotedMedia ?? false
      }
      byKey.set(key, group)
    }
    const group = byKey.get(key)
    if (!group.actors.some((a) => a.handle === n.actor.handle)) {
      group.actors.push(n.actor)
    }
    if (n.time < group.time) group.time = n.time
  })
  return Array.from(byKey.values()).sort((a, b) => {
    const t = { '2m': 0, '5m': 1, '8m': 2, '12m': 3, '15m': 4, '18m': 5, '25m': 6, '45m': 6.5, '1h': 7, '2h': 8, '3h': 9 }
    return (t[a.time] ?? 10) - (t[b.time] ?? 10)
  })
}

function formatActorText(actors, type) {
  if (actors.length === 0) return ''
  if (actors.length === 1) return actors[0].handle
  if (actors.length === 2) return `${actors[0].handle} and ${actors[1].handle}`
  return `${actors[0].handle} and ${actors.length - 1} others`
}

function notificationVerb(type) {
  switch (type) {
    case 'like': return 'liked your post'
    case 'reshare': return 'reposted your post'
    case 'quote': return 'quoted your post'
    case 'follow': return 'started following you'
    case 'mention': return 'mentioned you in a post'
    default: return 'interacted with you'
  }
}

function NotificationTypeIcon({ type, className = 'w-6 h-6' }) {
  const base = 'shrink-0 ' + className
  switch (type) {
    case 'like':
      return (
        <div className={base} aria-hidden>
          <svg viewBox="0 0 24 24" className="w-full h-full text-pink-500" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )
    case 'reshare':
    case 'quote':
      return (
        <div className={base} aria-hidden>
          <svg viewBox="0 0 24 24" className="w-full h-full text-green-500" fill="currentColor">
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
          </svg>
        </div>
      )
    case 'follow':
      return (
        <div className={base} aria-hidden>
          <svg viewBox="0 0 24 24" className="w-full h-full text-text-muted" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )
    case 'mention':
      return (
        <div className={base} aria-hidden>
          <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </div>
      )
    default:
      return null
  }
}

export default function Notifications() {
  const { watchlist } = useWatchlist()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'mentions'
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

  const [followingBack, setFollowingBack] = useState(() => new Set()) // handles we've followed back from this page

  const grouped = useMemo(() => groupNotifications(RAW_NOTIFICATIONS), [])
  const allItems = grouped
  const mentionItems = grouped.filter((g) => g.type === 'mention')
  const displayItems = activeTab === 'mentions' ? mentionItems : allItems

  const toggleFollowBack = (handle) => {
    setFollowingBack((prev) => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Notifications</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode((p) => !p)}
      />

      <main className="lg:pl-[300px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />
        <TickerTape />

        <div className="flex max-w-[1400px] mx-auto justify-center lg:justify-start">
          <div className="w-full max-w-[660px] min-w-0 shrink-0 border-x border-border min-h-[60vh]">
          <h1 className="text-xl font-bold text-text p-4 pb-0">Notifications</h1>
          <div className="flex border-b border-border mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={clsx('flex-1 py-3 text-sm font-semibold transition-colors', activeTab === 'all' ? 'text-text border-b-2 border-primary' : 'text-text-muted hover:text-text hover:bg-surface-muted/50')}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentions')}
              className={clsx('flex-1 py-3 text-sm font-semibold transition-colors', activeTab === 'mentions' ? 'text-text border-b-2 border-primary' : 'text-text-muted hover:text-text hover:bg-surface-muted/50')}
            >
              Mentions
            </button>
          </div>

          <div className="divide-y divide-border">
            {displayItems.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                {activeTab === 'mentions' ? "You don't have any mentions yet." : "You don't have any notifications yet."}
              </div>
            ) : (
              displayItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-surface-muted/30 transition-colors">
                  <div className="flex gap-3">
                    <NotificationTypeIcon type={item.type} className="w-8 h-8 mt-0.5" />
                    <div className="flex shrink-0 -space-x-2">
                      {item.actors.slice(0, 3).map((a, i) => (
                        <div key={a.handle} className="relative" style={{ zIndex: 3 - i }}>
                          <img src={a.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-background object-cover bg-surface-muted" />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-text">
                          <span className="font-semibold">{formatActorText(item.actors, item.type)}</span>
                          {' '}
                          <span className="text-text-muted">{notificationVerb(item.type)}</span>
                          {item.type !== 'follow' && item.type !== 'quote' && item.targetPreview && (
                            <>
                              {' '}
                              <span className="text-text-muted">·</span>
                              <span className="text-text-muted block mt-1 truncate">{item.targetPreview}</span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
                      </div>
                      {item.type === 'follow' && item.actors.length > 0 && (
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {item.actors.map((actor) => {
                            const isFollowing = followingBack.has(actor.handle)
                            return (
                              <button
                                key={actor.handle}
                                type="button"
                                onClick={() => toggleFollowBack(actor.handle)}
                                className={clsx(
                                  'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors border',
                                  isFollowing
                                    ? 'bg-transparent text-text-muted border-border hover:border-danger hover:text-danger hover:bg-danger/10'
                                    : 'bg-black text-white border-black hover:bg-gray-800'
                                )}
                              >
                                {isFollowing ? 'Following' : 'Follow back'}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.type === 'quote' && (
                    <div className="mt-3 ml-11 rounded-xl border border-border overflow-hidden bg-surface-muted/30">
                      <div className="p-3">
                        <p className="text-sm text-text">{item.quoteText}</p>
                      </div>
                      <div className="border-t border-border mx-3 mb-3 mt-0 rounded-lg border bg-background overflow-hidden">
                        <div className="p-3 flex gap-2">
                          <img src="/avatars/user-avatar.png" alt="" className="w-8 h-8 rounded-full shrink-0 object-cover bg-surface-muted" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-text-muted font-medium">You</p>
                            <p className="text-sm text-text mt-0.5">{item.targetPreview}</p>
                            {item.quotedMedia && (
                              <div className="mt-2 rounded-lg bg-surface-muted aspect-video max-h-48 flex items-center justify-center text-text-muted text-xs border border-border">
                                Video / link preview
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          </div>

          <aside className="hidden lg:flex w-[280px] shrink-0 flex-col gap-6 pl-6 pr-4">
            <RelatedSymbols />
            <PredictionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  )
}
