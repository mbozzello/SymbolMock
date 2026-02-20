import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MessagePostBox from '../components/MessagePostBox.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const CURRENT_USER = { id: 'you', name: 'howardlindzon', avatar: '/avatars/howard-lindzon.png' }

const CONVERSATIONS = [
  {
    id: 'group-tsla-bulls',
    type: 'group',
    name: 'TSLA Bulls Club',
    avatar: null,
    members: [
      { id: 'u1', name: 'EmperorFox', avatar: '/avatars/leader-1.png' },
      { id: 'u2', name: 'TeslaFanatic', avatar: '/avatars/leader-6.png' },
      { id: 'u3', name: 'ChartWizard', avatar: '/avatars/leader-5.png' },
      CURRENT_USER,
    ],
    messages: [
      { id: 'm1', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'Anyone else loading calls before earnings?', time: '2:41 PM' },
      { id: 'm2', sender: 'TeslaFanatic', avatar: '/avatars/leader-6.png', text: 'Already in. 450c for March looking juicy', time: '2:42 PM' },
      { id: 'm3', sender: 'ChartWizard', avatar: '/avatars/leader-5.png', text: 'The weekly chart is screaming breakout. Cup and handle on the monthly too.', time: '2:43 PM' },
      { id: 'm4', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'FSD v13 numbers are insane. This is a $600 stock by summer', time: '2:45 PM' },
      { id: 'm5', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: "I'm more cautious here but the momentum is undeniable", time: '2:47 PM', isYou: true },
      { id: 'm6', sender: 'TeslaFanatic', avatar: '/avatars/leader-6.png', text: 'Howard being Howard 😂 just buy the dip man', time: '2:48 PM' },
    ],
    lastMessage: 'Howard being Howard 😂 just buy the dip man',
    lastTime: '2:48 PM',
    unread: 3,
  },
  {
    id: 'dm-emperor',
    type: 'dm',
    name: 'EmperorFox',
    avatar: '/avatars/leader-1.png',
    members: [{ id: 'u1', name: 'EmperorFox', avatar: '/avatars/leader-1.png' }, CURRENT_USER],
    messages: [
      { id: 'd1', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'Hey Howard, saw your AAPL prediction. Bearish really?', time: '1:30 PM' },
      { id: 'd2', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'Yeah, the valuation is stretched. Services growth slowing.', time: '1:32 PM', isYou: true },
      { id: 'd3', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: "Interesting take. I'm still long but I see your point on the multiple", time: '1:35 PM' },
      { id: 'd4', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: "It's just risk/reward. At 30x I'd rather be elsewhere", time: '1:37 PM', isYou: true },
      { id: 'd5', sender: 'EmperorFox', avatar: '/avatars/leader-1.png', text: 'Fair. What are you buying instead?', time: '1:38 PM' },
    ],
    lastMessage: 'Fair. What are you buying instead?',
    lastTime: '1:38 PM',
    unread: 1,
  },
  {
    id: 'group-macro',
    type: 'group',
    name: 'Macro Traders',
    avatar: null,
    members: [
      { id: 'u4', name: 'FedWatcher', avatar: '/avatars/leader-2.png' },
      { id: 'u5', name: 'MacroMaven', avatar: '/avatars/leader-3.png' },
      { id: 'u6', name: 'BearishTruth', avatar: '/avatars/leader-6.png' },
      CURRENT_USER,
    ],
    messages: [
      { id: 'g1', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', text: 'Powell presser tomorrow. Everyone positioned?', time: '11:20 AM' },
      { id: 'g2', sender: 'MacroMaven', avatar: '/avatars/leader-3.png', text: 'Short duration, long gold. Classic defensive setup', time: '11:22 AM' },
      { id: 'g3', sender: 'BearishTruth', avatar: '/avatars/leader-6.png', text: "I think he stays hawkish. No cuts until they see real pain in labor market", time: '11:25 AM' },
      { id: 'g4', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'The market is pricing in 3 cuts this year which feels aggressive', time: '11:28 AM', isYou: true },
      { id: 'g5', sender: 'FedWatcher', avatar: '/avatars/leader-2.png', text: 'Exactly. The spread between market pricing and dot plot is massive', time: '11:30 AM' },
    ],
    lastMessage: 'The spread between market pricing and dot plot is massive',
    lastTime: '11:30 AM',
    unread: 0,
  },
  {
    id: 'dm-bullish',
    type: 'dm',
    name: 'TheBullishPenguin',
    avatar: '/avatars/leader-2.png',
    members: [{ id: 'u7', name: 'TheBullishPenguin', avatar: '/avatars/leader-2.png' }, CURRENT_USER],
    messages: [
      { id: 'b1', sender: 'TheBullishPenguin', avatar: '/avatars/leader-2.png', text: 'Nice call on the NVDA dip buy last week', time: '9:15 AM' },
      { id: 'b2', sender: 'howardlindzon', avatar: '/avatars/howard-lindzon.png', text: 'Thanks! AI capex cycle is just getting started', time: '9:18 AM', isYou: true },
      { id: 'b3', sender: 'TheBullishPenguin', avatar: '/avatars/leader-2.png', text: "Agreed. I'm eyeing AVGO too for the same thesis", time: '9:20 AM' },
    ],
    lastMessage: "Agreed. I'm eyeing AVGO too for the same thesis",
    lastTime: '9:20 AM',
    unread: 0,
  },
  {
    id: 'group-options',
    type: 'group',
    name: 'Options Flow Alerts',
    avatar: null,
    members: [
      { id: 'u8', name: 'OptionsFlow', avatar: '/avatars/top-voice-1.png' },
      { id: 'u9', name: 'GammaSqueeze', avatar: '/avatars/ross-cameron.png' },
      { id: 'u10', name: 'SwingKing', avatar: '/avatars/michael-bolling.png' },
      CURRENT_USER,
    ],
    messages: [
      { id: 'o1', sender: 'OptionsFlow', avatar: '/avatars/top-voice-1.png', text: '🚨 MASSIVE sweep: SPY 520P 3/21 — 45K contracts just hit the tape', time: 'Yesterday' },
      { id: 'o2', sender: 'GammaSqueeze', avatar: '/avatars/ross-cameron.png', text: "That's $12M in premium. Someone hedging hard", time: 'Yesterday' },
      { id: 'o3', sender: 'SwingKing', avatar: '/avatars/michael-bolling.png', text: 'Or they know something about FOMC', time: 'Yesterday' },
    ],
    lastMessage: 'Or they know something about FOMC',
    lastTime: 'Yesterday',
    unread: 0,
  },
]

const SUGGESTED_USERS = [
  { id: 's1', name: 'CryptoOracle', avatar: '/avatars/leader-1.png' },
  { id: 's2', name: 'ProfessorShiba', avatar: '/avatars/leader-4.png' },
  { id: 's3', name: 'ElectionEdge', avatar: '/avatars/leader-5.png' },
  { id: 's4', name: 'VolatilityKing', avatar: '/avatars/top-voice-1.png' },
  { id: 's5', name: 'SentimentPro', avatar: '/avatars/top-voice-2.png' },
  { id: 's6', name: 'EarningsWhisper', avatar: '/avatars/top-voice-3.png' },
  { id: 's7', name: 'TechCatalyst', avatar: '/avatars/michael-bolling.png' },
  { id: 's8', name: 'QuantSignal', avatar: '/avatars/ross-cameron.png' },
]

function GroupAvatar({ members, size = 'md' }) {
  const show = members.filter((m) => m.id !== 'you').slice(0, 3)
  const s = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
  const container = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
  return (
    <div className={clsx('relative rounded-full bg-surface-muted border border-border flex items-center justify-center shrink-0', container)}>
      {show.length >= 2 ? (
        <div className="grid grid-cols-2 gap-0.5 p-1">
          {show.slice(0, 4).map((m, i) => (
            <img key={m.id} src={m.avatar} alt="" className={clsx('rounded-full object-cover', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
          ))}
        </div>
      ) : (
        <img src={show[0]?.avatar} alt="" className="w-full h-full rounded-full object-cover" />
      )}
    </div>
  )
}

function ChatBubble({ msg, isGroup }) {
  if (msg.isYou) {
    return (
      <div className="flex justify-end gap-2 mb-3">
        <div className="max-w-[75%]">
          <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md">
            <p className="text-sm leading-relaxed">{msg.text}</p>
          </div>
          <div className="text-[10px] text-text-muted mt-1 text-right">{msg.time}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-2.5 mb-3">
      <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5" />
      <div className="max-w-[75%]">
        {isGroup && <div className="text-[11px] font-semibold text-text-muted mb-0.5">@{msg.sender}</div>}
        <div className="bg-surface-muted border border-border px-4 py-2.5 rounded-2xl rounded-bl-md">
          <p className="text-sm text-text leading-relaxed">{msg.text}</p>
        </div>
        <div className="text-[10px] text-text-muted mt-1">{msg.time}</div>
      </div>
    </div>
  )
}

export default function Chat() {
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [activeConvoId, setActiveConvoId] = useState(CONVERSATIONS[0].id)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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

  const activeConvo = conversations.find((c) => c.id === activeConvoId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvo?.messages?.length])

  const filteredConvos = searchQuery
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations

  const handleSend = () => {
    if (!inputText.trim() || !activeConvo) return
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isYou: true,
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvoId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastTime: newMsg.time }
          : c
      )
    )
    setInputText('')
    inputRef.current?.focus()
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return
    const newConvo = {
      id: `group-${Date.now()}`,
      type: 'group',
      name: newGroupName.trim(),
      avatar: null,
      members: [...selectedMembers, CURRENT_USER],
      messages: [],
      lastMessage: 'Group created',
      lastTime: 'now',
      unread: 0,
    }
    setConversations((prev) => [newConvo, ...prev])
    setActiveConvoId(newConvo.id)
    setShowCreateGroup(false)
    setNewGroupName('')
    setSelectedMembers([])
    setMemberSearch('')
  }

  const toggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    )
  }

  const filteredSuggested = memberSearch
    ? SUGGESTED_USERS.filter((u) => u.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : SUGGESTED_USERS

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Chat</div>
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

        <div className="max-w-[1100px] mx-auto flex h-[calc(100vh-120px)]">
          {/* Conversation list sidebar */}
          <div className="w-[340px] shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-text">Messages</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Group
                </button>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth={2}/><path strokeLinecap="round" strokeWidth={2} d="m21 21-4.35-4.35" /></svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-border bg-surface-muted/50 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvos.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => { setActiveConvoId(convo.id); setConversations((prev) => prev.map((c) => c.id === convo.id ? { ...c, unread: 0 } : c)) }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50',
                    activeConvoId === convo.id ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'
                  )}
                >
                  {convo.type === 'group' ? (
                    <GroupAvatar members={convo.members} />
                  ) : (
                    <img src={convo.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text truncate">{convo.name}</span>
                      <span className="text-[10px] text-text-muted shrink-0">{convo.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-text-muted truncate">{convo.lastMessage}</span>
                      {convo.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{convo.unread}</span>
                      )}
                    </div>
                    {convo.type === 'group' && (
                      <span className="text-[10px] text-text-muted">{convo.members.length} members</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {activeConvo ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
                {activeConvo.type === 'group' ? (
                  <GroupAvatar members={activeConvo.members} size="sm" />
                ) : (
                  <img src={activeConvo.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text">{activeConvo.name}</h3>
                  <p className="text-[11px] text-text-muted truncate">
                    {activeConvo.type === 'group'
                      ? activeConvo.members.filter((m) => m.id !== 'you').map((m) => m.name).join(', ')
                      : 'Online'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeConvo.type === 'group' && (
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors" aria-label="Add member">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </button>
                  )}
                  <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors" aria-label="More">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {activeConvo.type === 'group' && (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-muted border border-border text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {activeConvo.members.length} members in this group
                    </div>
                  </div>
                )}
                {activeConvo.messages.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} isGroup={activeConvo.type === 'group'} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-border shrink-0">
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder={activeConvo.type === 'group' ? `Message ${activeConvo.name}...` : `Message @${activeConvo.name}...`}
                      rows={1}
                      className="w-full px-4 py-2.5 text-sm rounded-2xl border border-border bg-surface-muted/50 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={clsx(
                      'p-2.5 rounded-full transition-all shrink-0',
                      inputText.trim() ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-muted text-text-muted cursor-not-allowed'
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateGroup(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-white dark:bg-surface rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-text">Create Group</h3>
              <button type="button" onClick={() => setShowCreateGroup(false)} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-text block mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. TSLA Trading Room"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text block mb-1.5">Add Members</label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-text">
                        <img src={m.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        {m.name}
                        <button type="button" onClick={() => toggleMember(m)} className="ml-0.5 text-text-muted hover:text-text">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                  {filteredSuggested
                    .filter((u) => !selectedMembers.some((m) => m.id === u.id))
                    .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleMember(user)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors text-left"
                    >
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
                      <span className="text-sm font-medium text-text">@{user.name}</span>
                      <svg className="w-5 h-5 ml-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedMembers.length === 0}
                className={clsx(
                  'w-full py-3 rounded-xl text-sm font-bold transition-opacity',
                  newGroupName.trim() && selectedMembers.length > 0
                    ? 'bg-primary text-white hover:opacity-90'
                    : 'bg-surface-muted text-text-muted cursor-not-allowed'
                )}
              >
                Create Group{selectedMembers.length > 0 ? ` with ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
