import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import IOSBottomNav from '../components/IOSBottomNav'

function clsx(...v) { return v.filter(Boolean).join(' ') }

export default function IOSSearch() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState('top')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [afterDate, setAfterDate] = useState('')
  const [beforeDate, setBeforeDate] = useState('')
  const [fromProfile, setFromProfile] = useState('')
  const [withTicker, setWithTicker] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const TABS = ['Top', 'Latest', 'People', 'Media']
  
  // Mock search results
  const MOCK_MESSAGES = [
    {
      id: '1',
      username: 'howardlindzon',
      displayName: 'Howard Lindzon',
      avatar: '/avatars/howard-lindzon.png',
      verified: true,
      body: 'This is exactly why I\'ve been bullish on $HOOD for months. The retail trading revolution is just getting started.',
      time: '2h',
      comments: 45,
      reposts: 12,
      likes: 234,
      tags: ['bullish'],
      ticker: 'HOOD',
      pctChange: 2.35,
    },
    {
      id: '2',
      username: 'steeletwits',
      displayName: 'Michele Steele',
      avatar: '/avatars/michele-steele.png',
      verified: true,
      body: 'Breaking: Major news coming out of $NVDA headquarters. This could change everything for AI chips.',
      time: '4h',
      comments: 89,
      reposts: 34,
      likes: 456,
      tags: ['breakingnews'],
      ticker: 'NVDA',
      pctChange: 3.87,
    },
    {
      id: '3',
      username: 'techtrader',
      displayName: 'Tech Trader',
      avatar: '/avatars/ross-cameron.png',
      verified: false,
      body: 'Chart looking absolutely incredible here. The setup is perfect for a breakout.',
      time: '6h',
      comments: 23,
      reposts: 8,
      likes: 145,
      tags: ['technicalanalysis'],
    },
    {
      id: '4',
      username: 'marketwizard',
      displayName: 'Market Wizard',
      avatar: '/avatars/michael-bolling.png',
      verified: false,
      body: 'The key levels to watch this week: 450 support, 475 resistance. Will we finally break through?',
      time: '8h',
      comments: 34,
      reposts: 15,
      likes: 189,
    },
    {
      id: '5',
      username: 'cryptoqueen',
      displayName: 'Crypto Queen',
      avatar: '/avatars/top-voice-3.png',
      verified: true,
      body: '$BTC forming a bullish flag pattern. If we break above 105k, next stop is 120k IMO.',
      time: '10h',
      comments: 67,
      reposts: 28,
      likes: 312,
      tags: ['bullish', 'crypto'],
      ticker: 'BTC',
      pctChange: 1.24,
    },
  ]

  const MOCK_PEOPLE = [
    {
      handle: 'howardlindzon',
      displayName: 'Howard Lindzon',
      avatar: '/avatars/howard-lindzon.png',
      verified: true,
      bio: 'Co-founder & CEO @Stocktwits. Investor. Podcaster.',
      following: true,
    },
    {
      handle: 'steeletwits',
      displayName: 'Michele Steele',
      avatar: '/avatars/michele-steele.png',
      verified: true,
      bio: 'Chief Markets Correspondent @Stocktwits. CNBC contributor.',
      following: true,
    },
    {
      handle: 'techtrader',
      displayName: 'Tech Trader',
      avatar: '/avatars/ross-cameron.png',
      verified: false,
      bio: 'Day trader focused on tech stocks. Sharing my journey.',
      following: false,
    },
    {
      handle: 'marketwizard',
      displayName: 'Market Wizard',
      avatar: '/avatars/michael-bolling.png',
      verified: false,
      bio: 'Technical analyst. Swing trader. Chart patterns.',
      following: false,
    },
  ]

  // Filter messages based on filters
  const filteredMessages = useMemo(() => {
    let filtered = [...MOCK_MESSAGES]
    
    if (fromProfile) {
      filtered = filtered.filter(m => m.username.toLowerCase().includes(fromProfile.toLowerCase()))
    }
    
    if (withTicker) {
      filtered = filtered.filter(m => m.ticker && m.ticker.toLowerCase() === withTicker.toLowerCase())
    }
    
    if (priceFilter === 'gainers') {
      filtered = filtered.filter(m => m.pctChange && m.pctChange > 0)
    } else if (priceFilter === 'losers') {
      filtered = filtered.filter(m => m.pctChange && m.pctChange < 0)
    }
    
    if (tagFilter) {
      filtered = filtered.filter(m => m.tags && m.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())))
    }
    
    return filtered
  }, [fromProfile, withTicker, priceFilter, tagFilter])

  const filteredPeople = useMemo(() => {
    return MOCK_PEOPLE.filter(p => 
      p.displayName.toLowerCase().includes(query.toLowerCase()) ||
      p.handle.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const hasActiveFilters = Boolean(afterDate || beforeDate || fromProfile || withTicker || priceFilter || tagFilter)

  const clearFilters = () => {
    setAfterDate('')
    setBeforeDate('')
    setFromProfile('')
    setWithTicker('')
    setPriceFilter('')
    setTagFilter('')
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white h-screen max-w-[430px] mx-auto relative overflow-hidden">
      
      {/* ── Header with back button and search ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <button type="button" onClick={() => navigate('/exploreios')} className="p-1 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        
        <div className="flex-1 relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/10 rounded-full pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#2196F3]/50"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('p-1.5 rounded-full shrink-0 transition-colors', showFilters || hasActiveFilters ? 'bg-[#2196F3] text-white' : 'bg-white/10 text-white/60')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="shrink-0 flex border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={clsx(
              'flex-1 py-2.5 text-sm font-semibold text-center transition-colors border-b-2',
              activeTab === tab.toLowerCase() ? 'text-white border-white' : 'text-white/40 border-transparent'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Filters Modal ── */}
      {showFilters && (
        <div className="absolute top-[105px] left-0 right-0 bg-[#1a1a1a] z-50 border-b border-white/10 shadow-lg">
          <div className="px-4 py-3 space-y-3 max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Filters</h3>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="text-xs text-[#2196F3] font-semibold">
                  Clear all
                </button>
              )}
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/40 block mb-1">After date</label>
                <input type="date" value={afterDate} onChange={e => setAfterDate(e.target.value)} className="w-full bg-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#2196F3]/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Before date</label>
                <input type="date" value={beforeDate} onChange={e => setBeforeDate(e.target.value)} className="w-full bg-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#2196F3]/50" />
              </div>
            </div>

            {/* From profile */}
            <div>
              <label className="text-xs text-white/40 block mb-1">From profile</label>
              <input type="text" value={fromProfile} onChange={e => setFromProfile(e.target.value)} placeholder="e.g. howardlindzon" className="w-full bg-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#2196F3]/50" />
            </div>

            {/* With ticker */}
            <div>
              <label className="text-xs text-white/40 block mb-1">With $ticker</label>
              <input type="text" value={withTicker} onChange={e => setWithTicker(e.target.value.toUpperCase())} placeholder="e.g. NVDA" className="w-full bg-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#2196F3]/50" />
            </div>

            {/* Price since post */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Price since post</label>
              <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#2196F3]/50">
                <option value="">Any</option>
                <option value="gainers">Gainers only</option>
                <option value="losers">Losers only</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Tags</label>
              <input type="text" value={tagFilter} onChange={e => setTagFilter(e.target.value)} placeholder="e.g. bullish, breakingnews" className="w-full bg-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#2196F3]/50" />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: showFilters ? 0 : 80 }}>
        
        {/* Top & Latest Tabs */}
        {(activeTab === 'top' || activeTab === 'latest') && (
          <div className="px-3 py-3 space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-white/40">No results found{hasActiveFilters ? ' with current filters' : ''}</p>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div key={msg.id} className="border border-white/10 rounded-xl p-3 bg-white/5">
                  <div className="flex items-start gap-2.5 mb-2">
                    <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold truncate">{msg.displayName}</span>
                        {msg.verified && (
                          <svg className="w-3.5 h-3.5 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                        <span>@{msg.username}</span>
                        <span>·</span>
                        <span>{msg.time}</span>
                      </div>
                    </div>
                    {msg.ticker && msg.pctChange != null && (
                      <span className={clsx('text-xs font-semibold shrink-0', msg.pctChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {msg.pctChange >= 0 ? '+' : ''}{msg.pctChange}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-2">{msg.body}</p>
                  
                  {msg.tags && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {msg.tags.map(tag => (
                        <span key={tag} className="inline-block px-2 py-0.5 rounded-full bg-[#2196F3]/20 text-[#2196F3] text-[10px] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-white/40 text-xs">
                    <button type="button" className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      <span>{msg.comments}</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      <span>{msg.reposts}</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      <span>{msg.likes}</span>
                    </button>
                    <button type="button">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div className="px-3 py-3 space-y-2">
            {filteredPeople.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-white/40">No people found for "{query}"</p>
              </div>
            ) : (
              filteredPeople.map(person => (
                <div key={person.handle} className="flex items-center gap-3 p-3 border border-white/10 rounded-xl bg-white/5">
                  <img src={person.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate">{person.displayName}</span>
                      {person.verified && (
                        <svg className="w-3.5 h-3.5 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      )}
                    </div>
                    <p className="text-xs text-white/40">@{person.handle}</p>
                    {person.bio && <p className="text-xs text-white/60 mt-1 line-clamp-1">{person.bio}</p>}
                  </div>
                  <button
                    type="button"
                    className={clsx('px-4 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0', person.following ? 'bg-white/10 text-white/60 border border-white/20' : 'bg-[#2196F3] text-white')}
                  >
                    {person.following ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="text-center py-8">
            <p className="text-sm text-white/40">Media results for "{query}"</p>
            <p className="text-xs text-white/20 mt-2">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {!showFilters && <IOSBottomNav />}
    </div>
  )
}
