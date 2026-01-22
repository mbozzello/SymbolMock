import { useEffect, useMemo, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MarketIndices from '../components/MarketIndices.jsx'
import LiveEventPlayer from '../components/LiveEventPlayer.jsx'
import TopDiscussions from '../components/TopDiscussions.jsx'

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

function getSentimentLabel(score) {
  if (score >= 75) return 'Extremely Bullish'
  if (score >= 55) return 'Bullish'
  if (score >= 45) return 'Neutral'
  if (score >= 25) return 'Bearish'
  return 'Extreme Fear'
}

function MiniGauge({ score = 0, size = 48, strokeWidth = 6, color = 'var(--color-success)' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 180
  const endAngle = 180 - (180 * clamped) / 100

  function polarToCartesian(centerX, centerY, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    }
  }

  function describeArc(x, y, r, start, end) {
    const startPoint = polarToCartesian(x, y, r, end)
    const endPoint = polarToCartesian(x, y, r, start)
    const largeArcFlag = Math.abs(end - start) <= 180 ? 0 : 1
    const sweepFlag = 1
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`
  }

  const baseArc = describeArc(cx, cy, radius, 180, 0)
  const valueArc = describeArc(cx, cy, radius, startAngle, endAngle)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-12 w-12">
      <path d={baseArc} stroke="currentColor" opacity="0.1" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <path d={valueArc} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
        {clamped}
      </text>
    </svg>
  )
}

function SentimentGauge({ score = 0, size = 44, strokeWidth = 5, color = 'var(--color-success)' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 180
  const endAngle = 180 - (180 * clamped) / 100

  function polarToCartesian(centerX, centerY, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    }
  }

  function describeArc(x, y, r, start, end) {
    const startPoint = polarToCartesian(x, y, r, end)
    const endPoint = polarToCartesian(x, y, r, start)
    const largeArcFlag = Math.abs(end - start) <= 180 ? 0 : 1
    const sweepFlag = 1
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`
  }

  const baseArc = describeArc(cx, cy, radius, 180, 0)
  const valueArc = describeArc(cx, cy, radius, startAngle, endAngle)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-10 w-10">
      <path d={baseArc} stroke="currentColor" opacity="0.1" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <path d={valueArc} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
        {clamped}
      </text>
    </svg>
  )
}

function SentimentMeterCard({ label, headline, score, color }) {
  return (
    <div className="card-surface flex items-center justify-between p-2 transition-all duration-200 hover:border-border-strong">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted">{label}</div>
        <div className="mt-0.5 text-sm font-bold flex items-center gap-1">
          <span>{headline}</span>
          <span className="text-muted">›</span>
        </div>
      </div>
      <SentimentGauge score={score} color={color} />
    </div>
  )
}

function CNNStyleMeter({ score = 0 }) {
  const clamped = Math.max(0, Math.min(100, score))
  const width = 240
  const height = 80
  const barHeight = 20
  const barY = 30
  const barX = 20
  const barWidth = width - 40
  
  // Calculate filled width based on score
  const filledWidth = (barWidth * clamped) / 100

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-60 h-20">
        {/* Background bar */}
        <rect
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          fill="currentColor"
          opacity="0.15"
          rx="10"
        />
        
        {/* Filled bar */}
        <rect
          x={barX}
          y={barY}
          width={filledWidth}
          height={barHeight}
          fill="var(--color-success)"
          rx="10"
        />
        
        {/* Score text */}
        <text x={width / 2} y={barY - 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="currentColor">
          {clamped}
        </text>
      </svg>
    </div>
  )
}

function MarketIndicesChart({ marketIndices = [] }) {
  const width = 400
  const height = 150
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Calculate percent change from first value for each index
  const normalizedData = marketIndices.map(index => {
    if (!index.spark || index.spark.length === 0) return null
    const firstValue = index.spark[0]
    return {
      ticker: index.ticker,
      change: index.change,
      values: index.spark.map(v => ((v - firstValue) / firstValue) * 100)
    }
  }).filter(Boolean).sort((a, b) => b.change - a.change)
  
  // Scale: -2.5% to +2.5%
  const minY = -2.5
  const maxY = 2.5
  const rangeY = maxY - minY
  
  // Map percent to y coordinate
  const percentToY = (percent) => {
    const clamped = Math.max(minY, Math.min(maxY, percent))
    return padding.top + chartHeight - ((clamped - minY) / rangeY) * chartHeight
  }
  
  // Map index to x coordinate
  const indexToX = (i, total) => {
    if (total === 1) return padding.left + chartWidth / 2
    return padding.left + (i / (total - 1)) * chartWidth
  }
  
  // Colors for each index
  const colors = [
    'var(--color-primary)',
    'var(--color-success)',
    'var(--color-danger)',
    '#f59e0b',
    '#8b5cf6'
  ]
  
  return (
    <div className="w-full">
      <div className="px-1" style={{ paddingBottom: '7px' }}>
        {/* Legend above chart as horizontal row */}
        <div className="flex gap-4 items-center flex-wrap" style={{ marginBottom: '7px' }}>
          {normalizedData.map((data, idx) => {
            const color = colors[idx % colors.length]
            const isPositive = data.change >= 0
            return (
              <div key={data.ticker} className="flex items-center gap-1.5">
                <span className="text-xs font-medium">{data.ticker}</span>
                <span className={clsx(
                  'text-xs font-semibold',
                  isPositive ? 'text-success' : 'text-danger'
                )}>
                  {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
        
        {/* Chart */}
        <div className="w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto" style={{ maxHeight: '200px', width: '100%' }}>
              {/* Grid lines */}
              <g opacity="0.2">
                {/* Zero line (baseline) */}
                <line
                  x1={padding.left}
                  y1={percentToY(0)}
                  x2={padding.left + chartWidth}
                  y2={percentToY(0)}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="none"
                />
                {/* +2.5% line */}
                <line
                  x1={padding.left}
                  y1={percentToY(2.5)}
                  x2={padding.left + chartWidth}
                  y2={percentToY(2.5)}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                {/* -2.5% line */}
                <line
                  x1={padding.left}
                  y1={percentToY(-2.5)}
                  x2={padding.left + chartWidth}
                  y2={percentToY(-2.5)}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                {/* +1.25% line */}
                <line
                  x1={padding.left}
                  y1={percentToY(1.25)}
                  x2={padding.left + chartWidth}
                  y2={percentToY(1.25)}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="1,3"
                />
                {/* -1.25% line */}
                <line
                  x1={padding.left}
                  y1={percentToY(-1.25)}
                  x2={padding.left + chartWidth}
                  y2={percentToY(-1.25)}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="1,3"
                />
              </g>
              
              {/* Y-axis labels */}
              <g fontSize="10" fill="currentColor" opacity="0.6">
                <text x={padding.left - 5} y={percentToY(2.5)} textAnchor="end" dominantBaseline="middle">+2.5%</text>
                <text x={padding.left - 5} y={percentToY(1.25)} textAnchor="end" dominantBaseline="middle">+1.25%</text>
                <text x={padding.left - 5} y={percentToY(0)} textAnchor="end" dominantBaseline="middle">0%</text>
                <text x={padding.left - 5} y={percentToY(-1.25)} textAnchor="end" dominantBaseline="middle">-1.25%</text>
                <text x={padding.left - 5} y={percentToY(-2.5)} textAnchor="end" dominantBaseline="middle">-2.5%</text>
              </g>
              
              {/* Plot lines for each index */}
              {normalizedData.map((data, idx) => {
                if (!data.values || data.values.length === 0) return null
                
                const points = data.values.map((v, i) => {
                  const x = indexToX(i, data.values.length)
                  const y = percentToY(v)
                  return `${x},${y}`
                }).join(' ')
                
                const color = colors[idx % colors.length]
                const isPositive = data.change >= 0
                
                return (
                  <g key={data.ticker}>
                    <polyline
                      fill="none"
                      stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
                      strokeWidth="2"
                      points={points}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                )
              })}
            </svg>
          </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showStreamingBanner, setShowStreamingBanner] = useState(true)
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
        logo: 'https://placehold.co/32x32?text=NVDA',
        price: 889.42, 
        change: 21.79,
        changePercent: 2.45,
        rank: 1,
        topics: ['🤖 AI Chip Demand', '💻 Data Center Growth'],
        timestamp: '1h ago',
        spark: [30, 32, 31, 33, 35, 34, 33, 32],
        userPost: {
          user: 'quantqueen',
          avatar: 'https://placehold.co/24x24?text=QQ',
          message: 'Data center demand is insane. $NVDA breaking out on volume.',
          time: '25m ago',
          likes: 42,
          comments: 8
        }
      },
      { 
        ticker: 'AAPL', 
        name: 'Apple Inc.', 
        logo: 'https://placehold.co/32x32?text=AAPL',
        price: 182.51, 
        change: -1.50,
        changePercent: -0.82,
        rank: 2,
        topics: ['📱 iPhone Sales', '🇨🇳 China Headwinds'],
        timestamp: '2h ago',
        spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23],
        userPost: {
          user: 'valueviking',
          avatar: 'https://placehold.co/24x24?text=VV',
          message: 'China headwinds are real but iPhone demand holding strong.',
          time: '1h ago',
          likes: 28,
          comments: 5
        }
      },
      { 
        ticker: 'TSLA', 
        name: 'Tesla, Inc.', 
        logo: 'https://placehold.co/32x32?text=TSLA',
        price: 201.12, 
        change: 6.46,
        changePercent: 3.21,
        rank: 3,
        topics: ['🚗 Cybertruck Ramp', '⚡ Energy Storage'],
        timestamp: '45m ago',
        spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9],
        userPost: {
          user: 'spacebull',
          avatar: 'https://placehold.co/24x24?text=SB',
          message: 'Cybertruck deliveries ramping up faster than expected. $TSLA',
          time: '30m ago',
          likes: 67,
          comments: 12
        }
      },
      { 
        ticker: 'MSFT', 
        name: 'Microsoft Corp.', 
        logo: 'https://placehold.co/32x32?text=MSFT',
        price: 414.63, 
        change: 4.77,
        changePercent: 1.15,
        rank: 4,
        topics: ['☁️ Azure Growth', '🤖 Copilot AI'],
        timestamp: '1h ago',
        spark: [25, 24, 24.5, 25.2, 25.1, 25.6, 26, 26.2],
        userPost: {
          user: 'astrotrader',
          avatar: 'https://placehold.co/24x24?text=AT',
          message: 'Azure growth accelerating. Enterprise AI adoption is real.',
          time: '45m ago',
          likes: 35,
          comments: 7
        }
      },
      { 
        ticker: 'AMZN', 
        name: 'Amazon.com', 
        logo: 'https://placehold.co/32x32?text=AMZN',
        price: 171.05, 
        change: -2.29,
        changePercent: -1.34,
        rank: 5,
        topics: ['🛒 Prime Day Sales', '☁️ AWS Optimization'],
        timestamp: '3h ago',
        spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2],
        userPost: {
          user: 'optionsowl',
          avatar: 'https://placehold.co/24x24?text=OO',
          message: 'AWS optimization cycle continues but retail segment strong.',
          time: '2h ago',
          likes: 19,
          comments: 4
        }
      },
      { 
        ticker: 'META', 
        name: 'Meta Platforms', 
        logo: 'https://placehold.co/32x32?text=META',
        price: 497.88, 
        change: 3.34,
        changePercent: 0.67,
        rank: 6,
        topics: ['📱 Reels Monetization', '🥽 Quest 3 Sales'],
        timestamp: '2h ago',
        spark: [40, 39.5, 39.8, 40.6, 40.1, 41, 41.2, 40.7],
        userPost: {
          user: 'rocketman',
          avatar: 'https://placehold.co/24x24?text=RM',
          message: 'Quest 3 sales momentum building. VR adoption accelerating.',
          time: '1h ago',
          likes: 51,
          comments: 9
        }
      },
      { 
        ticker: 'GOOGL', 
        name: 'Alphabet Inc.', 
        logo: 'https://placehold.co/32x32?text=GOOGL',
        price: 150.25, 
        change: 2.84,
        changePercent: 1.89,
        rank: 7,
        topics: ['🔍 Search Dominance', '☁️ Cloud Market Share'],
        timestamp: '1h ago',
        spark: [22, 22.5, 22.2, 22.8, 23, 22.9, 23.2, 23.1],
        userPost: {
          user: 'quantqueen',
          avatar: 'https://placehold.co/24x24?text=QQ',
          message: 'Google Cloud gaining share. AI services attracting enterprises.',
          time: '50m ago',
          likes: 33,
          comments: 6
        }
      },
      { 
        ticker: 'AMD', 
        name: 'Advanced Micro Devices', 
        logo: 'https://placehold.co/32x32?text=AMD',
        price: 150.00, 
        change: -3.17,
        changePercent: -2.11,
        rank: 8,
        topics: ['💻 Data Center Pressure', '🎮 Console Weakness'],
        timestamp: '4h ago',
        spark: [15, 14.8, 14.5, 14.7, 14.3, 14.6, 14.2, 14.7],
        userPost: {
          user: 'valueviking',
          avatar: 'https://placehold.co/24x24?text=VV',
          message: 'Competitive pressure mounting but data center pipeline strong.',
          time: '3h ago',
          likes: 15,
          comments: 3
        }
      },
      { 
        ticker: 'NFLX', 
        name: 'Netflix, Inc.', 
        logo: 'https://placehold.co/32x32?text=NFLX',
        price: 500.00, 
        change: 21.60,
        changePercent: 4.32,
        rank: 9,
        topics: ['📺 Subscriber Growth', '🎬 Hit Content'],
        timestamp: '30m ago',
        spark: [45, 46, 45.5, 47, 47.5, 47.2, 48, 48.3],
        userPost: {
          user: 'spacebull',
          avatar: 'https://placehold.co/24x24?text=SB',
          message: 'Subscriber growth exceeding expectations. Password crackdown working.',
          time: '20m ago',
          likes: 58,
          comments: 11
        }
      },
      { 
        ticker: 'DIS', 
        name: 'Walt Disney Co.', 
        logo: 'https://placehold.co/32x32?text=DIS',
        price: 100.00, 
        change: -0.45,
        changePercent: -0.45,
        rank: 10,
        topics: ['📺 Streaming Recovery', '🎢 Park Attendance'],
        timestamp: '5h ago',
        spark: [10, 10.2, 10.1, 10.3, 10.2, 10.4, 10.3, 10.0],
        userPost: {
          user: 'astrotrader',
          avatar: 'https://placehold.co/24x24?text=AT',
          message: 'Streaming losses narrowing. Theme parks remain strong.',
          time: '4h ago',
          likes: 22,
          comments: 5
        }
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
    Object.entries(grouped).forEach(([dateKey, callsForDate]) => {
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

  const marketIndices = useMemo(
    () => [
      { ticker: 'SPY', change: 0.85, spark: [100, 100.2, 100.5, 100.3, 100.8, 100.6, 100.9, 100.85] },
      { ticker: 'QQQ', change: 1.23, spark: [95, 95.5, 96, 95.8, 96.2, 96.5, 96.8, 96.23] },
      { ticker: 'Bitcoin', change: 3.12, spark: [45000, 45200, 45500, 45300, 45800, 45600, 46000, 46312] },
      { ticker: 'Gold', change: -0.34, spark: [2050, 2048, 2045, 2047, 2043, 2046, 2042, 2043.34] },
    ].sort((a, b) => b.change - a.change),
    []
  )

  const topWatchers = useMemo(
    () => [
      { ticker: 'PLTR', change: 2.45, spark: [18, 18.2, 18.5, 18.3, 18.8, 18.6, 18.9, 18.45] },
      { ticker: 'SOFI', change: -1.23, spark: [8.5, 8.4, 8.3, 8.6, 8.2, 8.4, 8.1, 8.23] },
      { ticker: 'RIVN', change: 4.67, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
      { ticker: 'LCID', change: -0.89, spark: [3.2, 3.1, 3.0, 3.3, 3.1, 3.2, 3.0, 3.11] },
      { ticker: 'GME', change: 5.12, spark: [15, 15.5, 16, 15.8, 16.2, 16.5, 16.8, 15.12] },
    ],
    []
  )

  const upNextVideos = useMemo(
    () => [
      {
        id: 1,
        title: 'NVDA Q4 Earnings Call',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&q=80',
        duration: '45:30',
        time: '5:30 PM ET'
      },
      {
        id: 2,
        title: 'Fed Rate Decision Analysis',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop&q=80',
        duration: '32:15',
        time: '6:00 PM ET'
      },
      {
        id: 3,
        title: 'Market Close Recap',
        thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=225&fit=crop&q=80',
        duration: '15:45',
        time: '6:30 PM ET'
      },
    ],
    []
  )

  const latestNews = useMemo(
    () => [
      {
        headline: 'NVIDIA Reports Record Q4 Earnings, Stock Surges 5%',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=64&h=64&fit=crop&q=80',
        url: '#'
      },
      {
        headline: 'Fed Holds Rates Steady, Signals Potential Cuts Ahead',
        thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=64&h=64&fit=crop&q=80',
        url: '#'
      },
      {
        headline: 'Tesla Cybertruck Production Ramps Up, Deliveries Begin',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&q=80',
        url: '#'
      },
      {
        headline: 'Apple Faces Regulatory Challenges in Key Markets',
        thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=64&h=64&fit=crop&q=80',
        url: '#'
      },
      {
        headline: 'Microsoft Azure Growth Accelerates as AI Demand Soars',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=64&h=64&fit=crop&q=80',
        url: '#'
      },
    ],
    []
  )

  const myCommunityPosts = useMemo(
    () => [
      {
        id: 1,
        user: 'quantqueen',
        avatar: 'https://placehold.co/40x40?text=QQ',
        time: '15m ago',
        message: 'Data center demand is insane. $NVDA breaking out on volume. The technical setup looks very promising for continued upside momentum.',
        likes: 142,
        comments: 28,
        reposts: 12,
        tickers: ['NVDA'],
        engagement: 182
      },
      {
        id: 2,
        user: 'spacebull',
        avatar: 'https://placehold.co/40x40?text=SB',
        time: '32m ago',
        message: 'Cybertruck deliveries ramping up faster than expected. $TSLA production numbers are impressive. Energy storage segment also showing strong growth.',
        likes: 89,
        comments: 15,
        reposts: 7,
        tickers: ['TSLA'],
        engagement: 111
      },
      {
        id: 3,
        user: 'valueviking',
        avatar: 'https://placehold.co/40x40?text=VV',
        time: '1h ago',
        message: 'China headwinds are real but iPhone demand holding strong. $AAPL valuation looks attractive at these levels. Services revenue continues to grow.',
        likes: 67,
        comments: 12,
        reposts: 5,
        tickers: ['AAPL'],
        engagement: 84
      },
      {
        id: 4,
        user: 'astrotrader',
        avatar: 'https://placehold.co/40x40?text=AT',
        time: '1h ago',
        message: 'Azure growth accelerating. Enterprise AI adoption is real. $MSFT positioning well for the next wave of cloud infrastructure demand.',
        likes: 95,
        comments: 18,
        reposts: 9,
        tickers: ['MSFT'],
        engagement: 122
      },
      {
        id: 5,
        user: 'optionsowl',
        avatar: 'https://placehold.co/40x40?text=OO',
        time: '2h ago',
        message: 'AWS optimization cycle continues but retail segment strong. $AMZN Prime Day sales exceeded expectations. Logistics efficiency improving.',
        likes: 54,
        comments: 9,
        reposts: 4,
        tickers: ['AMZN'],
        engagement: 67
      },
      {
        id: 6,
        user: 'rocketman',
        avatar: 'https://placehold.co/40x40?text=RM',
        time: '2h ago',
        message: 'Quest 3 sales momentum building. VR adoption accelerating. $META Reels monetization also showing strong results. Bullish on the metaverse play.',
        likes: 112,
        comments: 22,
        reposts: 11,
        tickers: ['META'],
        engagement: 145
      },
      {
        id: 7,
        user: 'quantqueen',
        avatar: 'https://placehold.co/40x40?text=QQ',
        time: '3h ago',
        message: 'Google Cloud gaining share. AI services attracting enterprises. $GOOGL Search dominance remains strong. YouTube ad recovery continues.',
        likes: 78,
        comments: 14,
        reposts: 6,
        tickers: ['GOOGL'],
        engagement: 98
      },
      {
        id: 8,
        user: 'spacebull',
        avatar: 'https://placehold.co/40x40?text=SB',
        time: '4h ago',
        message: 'Subscriber growth exceeding expectations. Password crackdown working. $NFLX content pipeline looks strong for Q2. International expansion on track.',
        likes: 91,
        comments: 16,
        reposts: 8,
        tickers: ['NFLX'],
        engagement: 115
      },
    ],
    []
  )

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
        <TopNavigation />
        <TickerTape />
        
        {/* STREAMING NOW Banner */}
        {showStreamingBanner && (
          <div className="px-4 pt-4">
            <div className="card-surface p-2.5 border-2 relative" style={{ borderColor: '#8b5cf6' }}>
              <div className="flex items-center">
                {/* Title and description */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5">STREAMING NOW</h3>
                  <p className="text-xs muted leading-relaxed">
                    Join us for live market analysis and real-time earnings call coverage as we break down today's key financial updates.
                  </p>
                </div>
                {/* Close button */}
                <button
                  onClick={() => setShowStreamingBanner(false)}
                  className="ml-3 flex-shrink-0 p-1 hover:bg-surface-muted rounded transition-colors"
                  aria-label="Close banner"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-muted hover:text-text"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Banner Row */}
        <div className="px-4 border-b border-border" style={{ paddingTop: '13.5px', paddingBottom: '0' }}>
          <div className="grid items-start" style={{ gridTemplateColumns: '0.8fr 1fr 0.8fr', gap: '14px' }}>
            {/* First Section: Sentiment Meter */}
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-muted px-1" style={{ marginBottom: '7px' }}>Community Sentiment</div>
              <div className="flex flex-col" style={{ gap: '7px' }}>
                {/* US Equities Meter */}
                <SentimentMeterCard 
                  label="US Equities"
                  headline={getSentimentLabel(89)} 
                  score={89} 
                  color="var(--color-success)" 
                />
                {/* Crypto Meter */}
                <SentimentMeterCard 
                  label="Crypto"
                  headline={getSentimentLabel(72)} 
                  score={72} 
                  color="var(--color-success)" 
                />
              </div>
            </div>
            
            {/* Second Section: Market Indices Chart */}
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-muted px-1" style={{ marginBottom: '7px' }}>Market Performance</div>
              <MarketIndicesChart marketIndices={marketIndices} />
            </div>

            {/* Third Section: Latest News */}
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-muted px-1" style={{ marginBottom: '7px' }}>Latest News</div>
              <div className="flex flex-col" style={{ gap: '7px' }}>
                {latestNews.slice(0, 3).map((article, index) => (
                  <a
                    key={index}
                    href={article.url || '#'}
                    className={`text-sm font-semibold leading-tight hover:text-primary transition-colors line-clamp-2 ${
                      index < 2 ? 'pb-2 border-b border-border' : ''
                    }`}
                  >
                    {article.headline}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex p-4">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0">
            {/* Live Event Player and Top Discussions Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Live Event Player - takes most space */}
              <div className="flex-1 min-w-0">
                <LiveEventPlayer />
              </div>
              
              {/* Top Discussions - on the right */}
              <div className="w-full lg:w-[360px] shrink-0">
                <TopDiscussions />
              </div>
            </div>

            {/* Trending Symbols Carousel */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-lg">Trending Symbols</h2>
                <button className="text-sm text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="p-4 bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {trendingSymbols.map((symbol, idx) => {
                    const isPositive = symbol.changePercent >= 0
                    return (
                      <div key={idx} className="w-[300px] h-[280px] rounded-xl bg-surface p-4 flex flex-col gap-3 shrink-0">
                        {/* Header: Logo, Symbol, Rank */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={symbol.logo} 
                              alt={symbol.ticker}
                              className="w-8 h-8 rounded"
                            />
                            <span className="font-semibold text-sm">{symbol.ticker}</span>
                          </div>
                          <span className="badge badge-sm">#{symbol.rank}</span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-lg">${symbol.price.toFixed(2)}</span>
                          <span className={clsx(
                            'text-sm font-medium',
                            isPositive ? 'text-success' : 'text-danger'
                          )}>
                            {isPositive ? '+' : ''}${symbol.change.toFixed(2)}
                          </span>
                          <span className={clsx(
                            'text-sm font-medium',
                            isPositive ? 'text-success' : 'text-danger'
                          )}>
                            ({isPositive ? '+' : ''}{symbol.changePercent.toFixed(2)}%)
                          </span>
                        </div>

                        {/* Topics Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {symbol.topics.map((topic, topicIdx) => (
                            <span key={topicIdx} className="badge badge-sm text-[10px]">
                              {topic}
                            </span>
                          ))}
                        </div>

                        {/* User Post */}
                        {symbol.userPost && (
                          <div className="flex gap-2 p-2 border border-border rounded">
                            <img
                              src={symbol.userPost.avatar}
                              alt={symbol.userPost.user}
                              className="h-6 w-6 rounded-full border border-border flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-xs font-semibold">{symbol.userPost.user}</span>
                                <span className="text-[10px] muted">{symbol.userPost.time}</span>
                              </div>
                              <p className="text-[10px] leading-relaxed line-clamp-2 mb-1.5">
                                {symbol.userPost.message}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] muted">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {symbol.userPost.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {symbol.userPost.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer: Timestamp and Watchlist Button */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] muted">{symbol.timestamp}</span>
                          <button 
                            className="w-6 h-6 rounded-full border border-border bg-surface-muted hover:bg-surface flex items-center justify-center transition-colors"
                            aria-label={`Add ${symbol.ticker} to watchlist`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="10" y1="5" x2="10" y2="15" />
                              <line x1="5" y1="10" x2="15" y2="10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Top Earnings Carousel */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="font-semibold text-base">Top Earnings</h2>
                <button className="text-sm text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="px-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {(() => {
                    const allCalls = earningsCallsGrouped.filter(item => item.type === 'call')
                    // Ensure AAPL is first, then take top 5 for carousel
                    const aaplCall = allCalls.find(call => call.ticker === 'AAPL')
                    const otherCalls = allCalls.filter(call => call.ticker !== 'AAPL')
                    const topEarnings = aaplCall ? [aaplCall, ...otherCalls].slice(0, 5) : allCalls.slice(0, 5)
                    
                    return topEarnings.map((item, index) => {
                      const isLive = item.ticker === 'AAPL'
                      const purpleColor = '#8b5cf6'
                      
                      return (
                        <div
                          key={`${item.ticker}-${index}`}
                          className={`shrink-0 rounded-lg border px-3 py-2 flex items-center gap-2.5 ${
                            isLive ? 'bg-surface border-2' : 'bg-surface border border-border'
                          }`}
                          style={isLive ? { borderColor: purpleColor } : {}}
                        >
                          <span className="badge badge-sm font-semibold">{item.ticker}</span>
                          <div className="flex flex-col min-w-0">
                            <div className="text-xs font-semibold leading-tight truncate max-w-[120px]">
                              {item.name}
                            </div>
                            <div className="text-[10px] muted">{item.time}</div>
                          </div>
                          {isLive && (
                            <>
                              <span className="flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap shrink-0" style={{ color: purpleColor }}>
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: purpleColor }} />
                                Live
                              </span>
                              <button
                                className="rounded-full px-2.5 py-1 text-[10px] font-semibold shrink-0"
                                style={{ backgroundColor: purpleColor, borderColor: purpleColor, color: 'white' }}
                              >
                                Join
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>

            {/* My Community Carousel */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-lg">My Community</h2>
                <button className="text-sm text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="p-4 bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {myCommunityPosts.map((post, idx) => (
                    <div key={post.id} className="w-[300px] h-[280px] rounded-xl bg-surface p-4 flex flex-col gap-3 shrink-0">
                      {/* Header: User Avatar and Name */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={post.avatar} 
                            alt={post.user}
                            className="w-8 h-8 rounded-full border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{post.user}</span>
                            <span className="text-[10px] muted">{post.time}</span>
                          </div>
                        </div>
                        <span className="badge badge-sm">{post.engagement}</span>
                      </div>

                      {/* Post Message */}
                      <p className="text-xs leading-relaxed line-clamp-4 flex-1">
                        {post.message}
                      </p>

                      {/* Ticker Tags */}
                      {post.tickers && post.tickers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tickers.map((ticker, tickerIdx) => (
                            <span key={tickerIdx} className="badge badge-sm text-[10px]">
                              ${ticker}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Engagement Metrics */}
                      <div className="flex items-center gap-4 text-xs muted pt-2 border-t border-border">
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments}
                        </span>
                        {post.reposts > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {post.reposts}
                          </span>
                        )}
                      </div>

                      {/* Footer: Action Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <button className="text-[10px] text-primary hover:underline font-medium">
                          View post
                        </button>
                        <button 
                          className="w-6 h-6 rounded-full border border-border bg-surface-muted hover:bg-surface flex items-center justify-center transition-colors"
                          aria-label={`Follow ${post.user}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
