import { useEffect, useMemo, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [] }) {
  const width = 72
  const height = 28
  const padding = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const lastUp = values[values.length - 1] >= values[0]
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7">
      <polyline
        fill="none"
        stroke={lastUp ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return true
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const watchlist = useMemo(
    () => [
      { ticker: 'CELH', name: 'Celsius Holdings', sector: 'Beverages', price: 92.31, change: 2.18, spark: [12, 13, 12.6, 12.9, 13.2, 12.8, 13.6, 14] },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semis', price: 889.42, change: -1.12, spark: [30, 32, 31, 33, 35, 34, 33, 32] },
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Hardware', price: 182.51, change: 0.84, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
      { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Auto', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Software', price: 414.63, change: 1.02, spark: [25, 24, 24.5, 25.2, 25.1, 25.6, 26, 26.2] },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'E-Comm', price: 171.05, change: 0.31, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Social', price: 497.88, change: -0.23, spark: [40, 39.5, 39.8, 40.6, 40.1, 41, 41.2, 40.7] },
      { ticker: 'RKLB', name: 'Rocket Lab USA Inc.', sector: 'Aerospace', price: 44.21, change: 3.45, spark: [10, 10.5, 10.2, 10.8, 11, 11.6, 11.2, 12.5] },
    ],
    []
  )

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const trendingTopics = useMemo(
    () => [
      {
        title: 'Fed Rate Decision',
        summary: 'Markets await Federal Reserve policy announcement expected to impact tech stocks and bond yields.',
        users: [
          { avatar: 'https://placehold.co/24x24?text=1', name: 'User1' },
          { avatar: 'https://placehold.co/24x24?text=2', name: 'User2' },
          { avatar: 'https://placehold.co/24x24?text=3', name: 'User3' },
        ],
        messageVolume: '1.2K'
      },
      {
        title: 'AI Chip Demand Surge',
        summary: 'Growing demand for AI chips drives semiconductor stocks higher as companies expand data center capacity.',
        users: [
          { avatar: 'https://placehold.co/24x24?text=4', name: 'User4' },
          { avatar: 'https://placehold.co/24x24?text=5', name: 'User5' },
        ],
        messageVolume: '856'
      },
      {
        title: 'EV Market Consolidation',
        summary: 'Electric vehicle manufacturers face pricing pressure as competition intensifies and production scales up.',
        users: [
          { avatar: 'https://placehold.co/24x24?text=6', name: 'User6' },
          { avatar: 'https://placehold.co/24x24?text=7', name: 'User7' },
          { avatar: 'https://placehold.co/24x24?text=8', name: 'User8' },
          { avatar: 'https://placehold.co/24x24?text=9', name: 'User9' },
        ],
        messageVolume: '2.4K'
      },
      {
        title: 'Cloud Infrastructure Growth',
        summary: 'Enterprise migration to cloud services accelerates, benefiting major cloud providers and infrastructure companies.',
        users: [
          { avatar: 'https://placehold.co/24x24?text=A', name: 'UserA' },
          { avatar: 'https://placehold.co/24x24?text=B', name: 'UserB' },
        ],
        messageVolume: '642'
      },
      {
        title: 'Space Economy Expansion',
        summary: 'Commercial space sector sees increased investment and contract wins from government and private customers.',
        users: [
          { avatar: 'https://placehold.co/24x24?text=C', name: 'UserC' },
          { avatar: 'https://placehold.co/24x24?text=D', name: 'UserD' },
          { avatar: 'https://placehold.co/24x24?text=E', name: 'UserE' },
        ],
        messageVolume: '923'
      },
    ],
    []
  )

  const trendingSymbols = useMemo(
    () => [
      { 
        ticker: 'NVDA', 
        name: 'NVIDIA Corp.', 
        sector: 'Semis', 
        price: 889.42, 
        change: 2.18, 
        spark: [30, 32, 31, 33, 35, 34, 33, 32],
        users: [
          { avatar: 'https://placehold.co/24x24?text=1', name: 'User1' },
          { avatar: 'https://placehold.co/24x24?text=2', name: 'User2' },
          { avatar: 'https://placehold.co/24x24?text=3', name: 'User3' },
        ],
        messageVolume: '1.2K'
      },
      { 
        ticker: 'AAPL', 
        name: 'Apple Inc.', 
        sector: 'Hardware', 
        price: 182.51, 
        change: 1.84, 
        spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23],
        users: [
          { avatar: 'https://placehold.co/24x24?text=4', name: 'User4' },
          { avatar: 'https://placehold.co/24x24?text=5', name: 'User5' },
        ],
        messageVolume: '856'
      },
      { 
        ticker: 'TSLA', 
        name: 'Tesla, Inc.', 
        sector: 'Auto', 
        price: 201.12, 
        change: -0.54, 
        spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9],
        users: [
          { avatar: 'https://placehold.co/24x24?text=6', name: 'User6' },
          { avatar: 'https://placehold.co/24x24?text=7', name: 'User7' },
          { avatar: 'https://placehold.co/24x24?text=8', name: 'User8' },
          { avatar: 'https://placehold.co/24x24?text=9', name: 'User9' },
        ],
        messageVolume: '2.4K'
      },
      { 
        ticker: 'MSFT', 
        name: 'Microsoft Corp.', 
        sector: 'Software', 
        price: 414.63, 
        change: 1.02, 
        spark: [25, 24, 24.5, 25.2, 25.1, 25.6, 26, 26.2],
        users: [
          { avatar: 'https://placehold.co/24x24?text=A', name: 'UserA' },
          { avatar: 'https://placehold.co/24x24?text=B', name: 'UserB' },
        ],
        messageVolume: '642'
      },
      { 
        ticker: 'AMZN', 
        name: 'Amazon.com', 
        sector: 'E-Comm', 
        price: 171.05, 
        change: 0.31, 
        spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2],
        users: [
          { avatar: 'https://placehold.co/24x24?text=C', name: 'UserC' },
          { avatar: 'https://placehold.co/24x24?text=D', name: 'UserD' },
          { avatar: 'https://placehold.co/24x24?text=E', name: 'UserE' },
        ],
        messageVolume: '923'
      },
      { 
        ticker: 'META', 
        name: 'Meta Platforms', 
        sector: 'Social', 
        price: 497.88, 
        change: -0.23, 
        spark: [40, 39.5, 39.8, 40.6, 40.1, 41, 41.2, 40.7],
        users: [
          { avatar: 'https://placehold.co/24x24?text=F', name: 'UserF' },
          { avatar: 'https://placehold.co/24x24?text=G', name: 'UserG' },
        ],
        messageVolume: '1.1K'
      },
    ],
    []
  )

  const earningsCallsGrouped = useMemo(() => {
    const today = new Date()
    const calls = [
      { ticker: 'AAPL', name: 'Apple Inc.', time: '4:30 PM ET', date: new Date(today) },
      { ticker: 'MSFT', name: 'Microsoft Corp.', time: '5:00 PM ET', date: new Date(today) },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', time: '5:30 PM ET', date: new Date(today) },
      { ticker: 'TSLA', name: 'Tesla, Inc.', time: '4:00 PM ET', date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      { ticker: 'AMZN', name: 'Amazon.com', time: '4:30 PM ET', date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      { ticker: 'META', name: 'Meta Platforms', time: '5:00 PM ET', date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', time: '4:00 PM ET', date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) },
      { ticker: 'RKLB', name: 'Rocket Lab USA', time: '8:00 AM ET', date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) },
    ]
    
    const sorted = calls.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime()
      if (dateDiff !== 0) return dateDiff
      return a.time.localeCompare(b.time)
    })

    // Group by date
    const grouped = sorted.reduce((acc, call) => {
      const dateKey = call.date.toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(call)
      return acc
    }, {})

    // Convert to array with date separators
    const todayStr = today.toDateString()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = tomorrow.toDateString()

    const result = []
    Object.entries(grouped).forEach(([dateKey, callsForDate], index) => {
      // Add date separator
      let dateLabel
      if (dateKey === todayStr) {
        dateLabel = 'Today'
      } else if (dateKey === tomorrowStr) {
        dateLabel = 'Tomorrow'
      } else {
        const date = new Date(dateKey)
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      
      result.push({ type: 'separator', label: dateLabel, dateKey })
      result.push(...callsForDate.map(call => ({ type: 'call', ...call })))
    })

    return result
  }, [])

  const formatDate = (date) => {
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Home</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="lg:pl-[269px]">
        <div className="mx-auto max-w-[1200px] p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Live Stream - spans 2 columns on desktop */}
            <div className="lg:col-span-2">
              <div className="card-surface h-64 flex items-center justify-center border-2 border-dashed border-border bg-surface-muted/30">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="font-semibold text-lg">Live Event / Stream</div>
                  <div className="text-sm muted">Video player placeholder</div>
                </div>
              </div>
            </div>

            {/* Fear & Greed Sentiment Meter */}
            <div className="lg:col-span-1">
              <div className="card-surface h-64 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border bg-surface-muted/30">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="font-semibold text-lg">Fear & Greed</div>
                  <div className="text-sm muted">Sentiment meter placeholder</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Symbols and Topics Carousels */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Symbols Carousel */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-lg">Trending Symbols</h2>
                <button className="text-sm text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="card-surface p-4 border-2 border-dashed border-border bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {trendingSymbols.map((symbol) => (
                    <div key={symbol.ticker} className="w-[200px] h-[180px] rounded-xl bg-surface border border-border p-4 flex flex-col justify-between shrink-0">
                      <div className="flex flex-col gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{symbol.ticker}</span>
                            <span className="badge badge-sm">{symbol.sector}</span>
                          </div>
                          <div className="truncate text-xs muted mt-0.5">{symbol.name}</div>
                        </div>
                        <MiniSparkline values={symbol.spark} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="font-semibold">${symbol.price.toFixed(2)}</div>
                        <div className={clsx('text-sm font-medium', symbol.change >= 0 ? 'text-success' : 'text-danger')}>
                          {symbol.change >= 0 ? '+' : ''}{symbol.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending Topics Carousel */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-lg">Trending Topics</h2>
                <button className="text-sm text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="card-surface p-4 border-2 border-dashed border-border bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {trendingTopics.map((topic, idx) => (
                    <div key={idx} className="w-[200px] h-[180px] rounded-xl bg-surface border border-border p-4 flex flex-col gap-2 shrink-0">
                      <h3 className="font-semibold text-sm leading-tight">{topic.title}</h3>
                      <p className="text-[10px] muted leading-relaxed">{topic.summary}</p>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border mt-auto">
                        <div className="flex items-center -space-x-2">
                          {topic.users.slice(0, 4).map((user, userIdx) => (
                            <div
                              key={userIdx}
                              className="w-6 h-6 rounded-full border-2 border-surface bg-surface-muted flex items-center justify-center"
                              title={user.name}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 muted" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ))}
                          {topic.users.length > 4 && (
                            <div className="w-6 h-6 rounded-full border-2 border-surface bg-surface-muted flex items-center justify-center text-xs font-semibold">
                              +{topic.users.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="text-xs muted font-medium">{topic.messageVolume}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Calls Carousel */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-semibold text-lg">Earnings Calls</h2>
              <button className="text-sm text-primary hover:underline font-medium">View calendar</button>
            </div>
            <div className="card-surface p-4 border-2 border-dashed border-border bg-surface-muted/30">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {earningsCallsGrouped.map((item, index) => {
                  if (item.type === 'separator') {
                    return (
                      <div key={`separator-${item.dateKey}`} className="flex items-center gap-4 shrink-0">
                        <div className="h-16 w-px bg-border" />
                        <div className="text-xs uppercase tracking-wide muted font-semibold whitespace-nowrap py-2">
                          {item.label}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={`${item.ticker}-${index}`} className="min-w-[200px] rounded-xl bg-surface border border-border p-4 flex flex-col gap-2 shrink-0">
                      <div className="flex items-center justify-end">
                        <span className="badge badge-sm">{item.ticker}</span>
                      </div>
                      <div className="font-semibold text-sm leading-tight">{item.name}</div>
                      <div className="text-xs muted">{item.time}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
