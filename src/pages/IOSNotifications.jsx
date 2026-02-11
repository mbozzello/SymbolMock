import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import IOSBottomNav from '../components/IOSBottomNav.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

/* ──────────── Notification data ──────────── */
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
  { id: 13, type: 'quote', actor: { handle: 'howardlindzon', avatar: '/avatars/howard-lindzon.png' }, targetId: 'msg-stream', targetPreview: 'Have you checked out Stream Topics now rolling out on @Stocktwits? Easily see what everyone is talking about grouped by the most popular topics.', time: '45m', quoteText: 'Ticker stream topics now on @stocktwits', quotedMedia: true },
  { id: 14, type: 'quote', actor: { handle: 'AlphaSeeker', avatar: '/avatars/top-voice-1.png' }, targetId: 'msg-nvda', targetPreview: 'NVDA at $875 and still not expensive given the growth.', time: '1h', quoteText: 'Same. Holding through earnings.', quotedMedia: false },
]

function groupNotifications(raw) {
  const byKey = new Map()
  raw.forEach((n) => {
    const key = n.type === 'follow' ? `follow-${n.actor.handle}-${n.id}` : n.type === 'mention' ? `mention-${n.id}` : n.type === 'quote' ? `quote-${n.id}` : `${n.type}-${n.targetId}`
    if (!byKey.has(key)) {
      const group = { type: n.type, actors: [], targetId: n.targetId, targetPreview: n.targetPreview, time: n.time, id: n.id }
      if (n.type === 'quote') { group.quoteText = n.quoteText; group.quotedMedia = n.quotedMedia ?? false }
      byKey.set(key, group)
    }
    const group = byKey.get(key)
    if (!group.actors.some((a) => a.handle === n.actor.handle)) group.actors.push(n.actor)
    if (n.time < group.time) group.time = n.time
  })
  return Array.from(byKey.values()).sort((a, b) => {
    const t = { '2m': 0, '5m': 1, '8m': 2, '12m': 3, '15m': 4, '18m': 5, '25m': 6, '45m': 6.5, '1h': 7, '2h': 8, '3h': 9 }
    return (t[a.time] ?? 10) - (t[b.time] ?? 10)
  })
}

function formatActorText(actors) {
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

function TypeIcon({ type }) {
  if (type === 'like') return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-500 shrink-0" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
  if (type === 'reshare' || type === 'quote') return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400 shrink-0" fill="currentColor">
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
  )
  if (type === 'follow') return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/40 shrink-0" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
  if (type === 'mention') return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2196F3] shrink-0" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
    </svg>
  )
  return null
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function IOSNotifications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [followingBack, setFollowingBack] = useState(() => new Set())

  const grouped = useMemo(() => groupNotifications(RAW_NOTIFICATIONS), [])
  const mentionItems = grouped.filter((g) => g.type === 'mention')
  const displayItems = activeTab === 'mentions' ? mentionItems : grouped

  const toggleFollowBack = (handle) => {
    setFollowingBack((prev) => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-[430px] h-screen flex flex-col overflow-hidden bg-black text-white relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>

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
        <span className="text-base font-bold">Notifications</span>
        <button type="button" className="p-1">
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>

      {/* ── All / Mentions Tabs ── */}
      <div className="shrink-0 flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
            activeTab === 'all' ? 'text-white border-white' : 'text-white/40 border-transparent'
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mentions')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
            activeTab === 'mentions' ? 'text-white border-white' : 'text-white/40 border-transparent'
          )}
        >
          Mentions
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm text-white/40">
              {activeTab === 'mentions' ? "You don't have any mentions yet." : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {displayItems.map((item) => (
              <div key={item.id} className="px-4 py-3 active:bg-white/5 transition-colors">
                <div className="flex gap-3">
                  {/* Type icon */}
                  <TypeIcon type={item.type} />

                  {/* Stacked avatars */}
                  <div className="flex shrink-0 -space-x-1.5">
                    {item.actors.slice(0, 3).map((a, i) => (
                      <div key={a.handle} className="relative" style={{ zIndex: 3 - i }}>
                        <img src={a.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-black object-cover bg-white/10" />
                      </div>
                    ))}
                  </div>

                  {/* Text content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold">{formatActorText(item.actors)}</span>
                      {' '}
                      <span className="text-white/50">{notificationVerb(item.type)}</span>
                    </p>
                    {item.type !== 'follow' && item.type !== 'quote' && item.targetPreview && (
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.targetPreview}</p>
                    )}
                    <p className="text-[11px] text-white/30 mt-0.5">{item.time}</p>

                    {/* Follow back button */}
                    {item.type === 'follow' && item.actors.map((actor) => {
                      const isFollowing = followingBack.has(actor.handle)
                      return (
                        <button
                          key={actor.handle}
                          type="button"
                          onClick={() => toggleFollowBack(actor.handle)}
                          className={clsx(
                            'mt-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                            isFollowing
                              ? 'border border-white/20 text-white/50'
                              : 'bg-[#2196F3] text-white'
                          )}
                        >
                          {isFollowing ? 'Following' : 'Follow back'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quote block */}
                {item.type === 'quote' && (
                  <div className="mt-2.5 ml-8 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                    <div className="p-3">
                      <p className="text-[13px] text-white/80">{item.quoteText}</p>
                    </div>
                    <div className="border-t border-white/10 mx-3 mb-3 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                      <div className="p-3 flex gap-2">
                        <img src="/avatars/user-avatar.png" alt="" className="w-6 h-6 rounded-full shrink-0 object-cover bg-white/10" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-white/40 font-medium">You</p>
                          <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{item.targetPreview}</p>
                          {item.quotedMedia && (
                            <div className="mt-2 rounded-lg bg-white/10 aspect-video max-h-32 flex items-center justify-center text-white/30 text-[10px] border border-white/10">
                              Video / link preview
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <IOSBottomNav />
    </div>
  )
}
