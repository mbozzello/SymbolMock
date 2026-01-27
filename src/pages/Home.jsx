import { useEffect, useMemo, useState, useRef } from 'react'
import { getTickerLogo } from '../constants/tickerLogos'
import LeftSidebar from '../components/LeftSidebar.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import MarketIndices from '../components/MarketIndices.jsx'
import LiveEventPlayer from '../components/LiveEventPlayer.jsx'
import CommunityPredictions from '../components/CommunityPredictions.jsx'
import TopPredictors from '../components/TopPredictors.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

// Animated message count component that increments to show live activity
function AnimatedMessageCount({ initialCount }) {
  const [count, setCount] = useState(initialCount)
  const increments = [2, 3, 5, 10]
  const incrementIndexRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const increment = increments[incrementIndexRef.current]
        incrementIndexRef.current = (incrementIndexRef.current + 1) % increments.length
        return prev + increment
      })
    }, 1500 + Math.random() * 1000) // Random interval between 1.5-2.5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(27, 102, 231, 0.15)', border: '1px solid rgba(27, 102, 231, 0.3)', boxShadow: '0 0 12px rgba(27, 102, 231, 0.4)' }}>
      <svg 
        className="w-3.5 h-3.5" 
        fill="none" 
        stroke="#1B66E7" 
        viewBox="0 0 24 24"
        style={{ filter: 'drop-shadow(0 0 3px rgba(27, 102, 231, 0.6))' }}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
      <span className="text-xs font-extrabold tabular-nums leading-none" style={{ color: '#1B66E7' }}>
        {count.toLocaleString()}
      </span>
    </div>
  )
}

// Animated sentiment meter with bull/bear split
function SentimentMeter({ initialBullish = 62.5 }) {
  const [bullish, setBullish] = useState(initialBullish)
  const bearish = 100 - bullish

  useEffect(() => {
    const interval = setInterval(() => {
      // Animate between 55% and 70% bullish to show live movement
      const minBullish = 55
      const maxBullish = 70
      const target = minBullish + Math.random() * (maxBullish - minBullish)
      
      setBullish(prev => {
        // Smooth transition towards target
        const diff = target - prev
        return prev + diff * 0.15 // Gradual movement
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const bullishPercent = Math.round(bullish * 10) / 10
  const bearishPercent = Math.round(bearish * 10) / 10
  const bullPosition = bullishPercent // Position of bull icon as percentage

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-7 rounded-full overflow-hidden bg-surface-muted border border-border">
        {/* Bullish segment (green) */}
        <div 
          className="absolute left-0 top-0 h-full bg-[#17c964] transition-all duration-1000 ease-out"
          style={{ width: `${bullishPercent}%` }}
        />
        {/* Bearish segment (red) */}
        <div 
          className="absolute right-0 top-0 h-full bg-[#f31260] transition-all duration-1000 ease-out"
          style={{ width: `${bearishPercent}%` }}
        />
        {/* Bull icon - moves along the bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
          style={{ left: `calc(${bullPosition}% - 12px)` }}
        >
          <div className="w-6 h-6 rounded-full border-2 border-[#17c964] bg-surface flex items-center justify-center shadow-md">
            {/* Bull head icon */}
            <svg className="w-4 h-4 text-[#17c964]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              {/* Bull head facing right */}
              <path d="M14 8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-4 4c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm6 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
              {/* Horns */}
              <path d="M10 6c-.28 0-.53.11-.71.29L8 7.59l-1.29-1.3c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29c-.39.39-.39 1.02 0 1.41L6.59 9l-1.3 1.29c-.39.39-.39 1.02 0 1.41.19.18.43.29.71.29s.53-.11.71-.29L8 10.41l1.29 1.3c.18.18.43.29.71.29s.53-.11.71-.29c.39-.39.39-1.02 0-1.41L9.41 9l1.3-1.29c.39-.39.39-1.02 0-1.41-.19-.18-.43-.29-.71-.29z" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </div>
      {/* Percentage labels */}
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-[#17c964]">{bullishPercent.toFixed(1)}%</span>
        <span className="text-[#f31260]">{bearishPercent.toFixed(1)}%</span>
      </div>
    </div>
  )
}

// Compact sentiment meter for inline use
function CompactSentimentMeter({ initialBullish = 62.5 }) {
  const [bullish, setBullish] = useState(initialBullish)
  const bearish = 100 - bullish

  useEffect(() => {
    const interval = setInterval(() => {
      // Animate between 55% and 70% bullish to show live movement
      const minBullish = 55
      const maxBullish = 70
      const target = minBullish + Math.random() * (maxBullish - minBullish)
      
      setBullish(prev => {
        // Smooth transition towards target
        const diff = target - prev
        return prev + diff * 0.15 // Gradual movement
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const bullishPercent = Math.round(bullish * 10) / 10
  const bearishPercent = Math.round(bearish * 10) / 10
  const bullPosition = bullishPercent

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-5 rounded-full overflow-hidden bg-surface-muted border border-border flex-1" style={{ minWidth: '120px' }}>
        {/* Bullish segment (green) */}
        <div 
          className="absolute left-0 top-0 h-full bg-[#17c964] transition-all duration-1000 ease-out"
          style={{ width: `${bullishPercent}%` }}
        />
        {/* Bearish segment (red) */}
        <div 
          className="absolute right-0 top-0 h-full bg-[#f31260] transition-all duration-1000 ease-out"
          style={{ width: `${bearishPercent}%` }}
        />
        {/* Bull icon - moves along the bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
          style={{ left: `calc(${bullPosition}% - 8px)` }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-[#17c964] bg-surface flex items-center justify-center shadow-sm">
            {/* Bull head icon - simplified */}
            <svg className="w-2.5 h-2.5 text-[#17c964]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
              <path d="M14 8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-4 4c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm6 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
            </svg>
          </div>
        </div>
      </div>
      {/* Percentage labels - inline */}
      <div className="flex items-center gap-1.5 text-[9px] font-bold shrink-0">
        <span className="text-[#17c964]">{bullishPercent.toFixed(1)}%</span>
        <span className="text-muted">/</span>
        <span className="text-[#f31260]">{bearishPercent.toFixed(1)}%</span>
      </div>
    </div>
  )
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

function MicroSparkline({ values = [], isUp }) {
  if (!values || values.length < 2) return null
  const width = 40
  const height = 14
  const padding = 1
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const up = isUp ?? values[values.length - 1] >= values[0]
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-10 h-3.5 shrink-0">
      <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="1.5"
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

function SentimentGauge({ score = 0, size = 44, strokeWidth = 5, color = 'var(--color-success)', className = 'h-10 w-10' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  function polarToCartesian(centerX, centerY, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    }
  }

  // Arc from start to end going clockwise; 0° = top (12 o'clock). SVG sweep-flag: 1 = clockwise.
  function describeArcCW(centerX, centerY, r, startDeg, endDeg) {
    const startPoint = polarToCartesian(centerX, centerY, r, startDeg)
    const endPoint = polarToCartesian(centerX, centerY, r, endDeg)
    const span = endDeg - startDeg
    const largeArcFlag = span >= 180 ? 1 : 0
    const sweepFlag = 1 // clockwise
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`
  }

  // valueSpan = score as a fraction of 360°: 89 → 320.4°, 72 → 259.2°
  const valueSpan = (360 * clamped) / 100
  const valueArc = clamped > 0 ? describeArcCW(cx, cy, radius, 0, valueSpan) : null

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className}>
      {/* Full grey track circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity={0.25}
        strokeLinecap="round"
      />
      {/* Green arc: score % of the circle, from top going clockwise */}
      {valueArc && (
        <path
          d={valueArc}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
        {clamped}
      </text>
    </svg>
  )
}

function SentimentMeterCard({ label, headline, score, color }) {
  return (
    <div className="card-surface flex flex-col items-center justify-start pt-1 px-3 pb-2 transition-all duration-200 hover:border-border-strong flex-1 min-h-0">
      <div className="text-[1.05rem] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2">
        <SentimentGauge score={score} color={color} className="h-[6.72rem] w-[6.72rem]" />
      </div>
      <div className="text-sm font-bold text-text mt-2">{headline}</div>
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
  const padding = { top: 20, right: 20, bottom: 10, left: 40 }
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
  const _colors = [
    'var(--color-primary)',
    'var(--color-success)',
    'var(--color-danger)',
    '#f59e0b',
    '#8b5cf6'
  ]
  
  return (
    <div className="w-full">
      <div className="px-1 pt-1 pb-2">
        {/* Chart */}
        <div className="w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto" style={{ maxHeight: '200px', width: '100%', display: 'flex', flexWrap: 'wrap' }}>
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
              {normalizedData.map((data) => {
                if (!data.values || data.values.length === 0) return null
                
                const points = data.values.map((v, i) => {
                  const x = indexToX(i, data.values.length)
                  const y = percentToY(v)
                  return `${x},${y}`
                }).join(' ')
                
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
        
        {/* Legend below chart as horizontal row */}
        <div className="flex gap-2 items-center flex-nowrap" style={{ marginTop: '2px' }}>
          {normalizedData.map((data) => {
            const isPositive = data.change >= 0
            return (
              <div key={data.ticker} className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="text-xs font-medium">{data.ticker}</span>
                <span className={clsx(
                  'text-xs font-semibold flex items-center gap-0',
                  isPositive ? 'text-success' : 'text-danger'
                )}>
                  {isPositive ? (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                  )}
                  {Math.abs(data.change).toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return false
  })
  const [streamingWatchers, setStreamingWatchers] = useState(1384)

  useEffect(() => {
    const t = setInterval(() => {
      setStreamingWatchers((n) => {
        const d = Math.random() < 0.55 ? (Math.random() < 0.6 ? 1 : 2) : -1
        return Math.max(1380, n + d)
      })
    }, 1800)
    return () => clearInterval(t)
  }, [])

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

  const _trendingTopics = useMemo(
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
        logo: getTickerLogo('NVDA'),
        price: 889.42, 
        change: 21.79,
        changePercent: 2.45,
        rank: 1,
        topics: ['🤖 AI Chip Demand', '💻 Data Center Growth'],
        timestamp: '1h ago',
        messageCount24h: 1247,
        spark: [30, 32, 31, 33, 35, 34, 33, 32],
        userPost: {
          user: 'quantqueen',
          avatar: '/avatars/top-voice-2.png',
          message: 'Data center demand is insane. $NVDA breaking out on volume.',
          time: '25m ago',
          likes: 42,
          comments: 8
        }
      },
      { 
        ticker: 'AAPL', 
        name: 'Apple Inc.', 
        logo: getTickerLogo('AAPL'),
        price: 182.51, 
        change: -1.50,
        changePercent: -0.82,
        rank: 2,
        topics: ['📱 iPhone Sales', '🇨🇳 China Headwinds'],
        timestamp: '2h ago',
        messageCount24h: 892,
        spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23],
        userPost: {
          user: 'valueviking',
          avatar: '/avatars/top-voice-3.png',
          message: 'China headwinds are real but iPhone demand holding strong.',
          time: '1h ago',
          likes: 28,
          comments: 5
        }
      },
      { 
        ticker: 'TSLA', 
        name: 'Tesla, Inc.', 
        logo: getTickerLogo('TSLA'),
        price: 201.12, 
        change: 6.46,
        changePercent: 3.21,
        rank: 3,
        topics: ['🚗 Cybertruck Ramp', '⚡ Energy Storage'],
        timestamp: '45m ago',
        messageCount24h: 2156,
        spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9],
        userPost: {
          user: 'spacebull',
          avatar: '/avatars/top-voice-1.png',
          message: 'Cybertruck deliveries ramping up faster than expected. $TSLA',
          time: '30m ago',
          likes: 67,
          comments: 12
        }
      },
      { 
        ticker: 'MSFT', 
        name: 'Microsoft Corp.', 
        logo: getTickerLogo('MSFT'),
        price: 414.63, 
        change: 4.77,
        changePercent: 1.15,
        rank: 4,
        topics: ['☁️ Azure Growth', '🤖 Copilot AI'],
        timestamp: '1h ago',
        messageCount24h: 743,
        spark: [25, 24, 24.5, 25.2, 25.1, 25.6, 26, 26.2],
        userPost: {
          user: 'astrotrader',
          avatar: '/avatars/top-voice-1.png',
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
        messageCount24h: 534,
        spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2],
        userPost: {
          user: 'optionsowl',
          avatar: '/avatars/top-voice-2.png',
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
        messageCount24h: 621,
        spark: [40, 39.5, 39.8, 40.6, 40.1, 41, 41.2, 40.7],
        userPost: {
          user: 'rocketman',
          avatar: '/avatars/top-voice-3.png',
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
        messageCount24h: 458,
        spark: [22, 22.5, 22.2, 22.8, 23, 22.9, 23.2, 23.1],
        userPost: {
          user: 'quantqueen',
          avatar: '/avatars/top-voice-2.png',
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
        messageCount24h: 389,
        spark: [15, 14.8, 14.5, 14.7, 14.3, 14.6, 14.2, 14.7],
        userPost: {
          user: 'valueviking',
          avatar: '/avatars/top-voice-3.png',
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
        messageCount24h: 312,
        spark: [45, 46, 45.5, 47, 47.5, 47.2, 48, 48.3],
        userPost: {
          user: 'spacebull',
          avatar: '/avatars/top-voice-1.png',
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
        messageCount24h: 267,
        spark: [10, 10.2, 10.1, 10.3, 10.2, 10.4, 10.3, 10.0],
        userPost: {
          user: 'astrotrader',
          avatar: '/avatars/top-voice-1.png',
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
      { 
        ticker: 'AAPL', 
        name: 'Apple Inc.', 
        time: '4:30 PM ET', 
        date: new Date(today),
        listeners: 1832,
        epsResult: 2.18,
        revenueResult: 119.58,
        isLive: true
      },
      { 
        ticker: 'MSFT', 
        name: 'Microsoft Corp.', 
        time: '5:00 PM ET', 
        date: new Date(today),
        listeners: 2145,
        epsResult: 2.82,
        revenueResult: 61.14,
        isLive: true
      },
      { 
        ticker: 'NVDA', 
        name: 'NVIDIA Corp.', 
        time: '5:30 PM ET', 
        date: new Date(today),
        listeners: 3421,
        epsResult: 5.58,
        revenueResult: 20.37,
        isLive: true
      },
      { 
        ticker: 'TSLA', 
        name: 'Tesla, Inc.', 
        time: '4:00 PM ET', 
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        listeners: 1876,
        epsResult: 0.73,
        revenueResult: 25.17,
        isLive: true
      },
      { 
        ticker: 'AMZN', 
        name: 'Amazon.com', 
        time: '4:30 PM ET', 
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        listeners: 2654,
        epsResult: 0.78,
        revenueResult: 165.96,
        isLive: true
      },
      { 
        ticker: 'META', 
        name: 'Meta Platforms', 
        time: '5:00 PM ET', 
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        listeners: 1923,
        epsResult: 4.94,
        revenueResult: 40.11,
        isLive: true
      },
      { 
        ticker: 'GOOGL', 
        name: 'Alphabet Inc.', 
        time: '4:00 PM ET', 
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        listeners: 1456,
        epsResult: 1.59,
        revenueResult: 85.33,
        isLive: true
      },
      { 
        ticker: 'RKLB', 
        name: 'Rocket Lab USA', 
        time: '8:00 AM ET', 
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        listeners: 892,
        epsResult: -0.05,
        revenueResult: 65.8,
        isLive: true
      },
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

  const topWatchlistActivity = useMemo(
    () => {
      const data = [
        { ticker: 'BNAI', name: 'Brand Engageme...', price: 58.54, changePercent: 345.52, spark: [12, 14, 18, 22, 28, 35, 45, 58.54], watchers: 8923, watchersChange24h: 234.8 },
        { ticker: 'QCLS', name: 'Q/C Technologies...', price: 5.96, changePercent: -3.2, spark: [6.2, 6.1, 6.0, 5.9, 5.95, 5.97, 5.98, 5.96], watchers: 2134, watchersChange24h: 67.2 },
        { ticker: 'ARAI', name: 'Arrive AI Inc', price: 3.34, changePercent: -1.5, spark: [3.4, 3.35, 3.33, 3.32, 3.34, 3.33, 3.35, 3.34], watchers: 1876, watchersChange24h: 45.3 },
        { ticker: 'VSA', name: 'VisionSys AI', price: 2.95, changePercent: 26.45, spark: [2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.85, 2.95], watchers: 2341, watchersChange24h: 38.9 },
        { ticker: 'GME', name: 'GameStop', price: 29.96, changePercent: -2.8, spark: [30.8, 30.5, 30.2, 30.0, 29.9, 29.95, 29.97, 29.96], watchers: 45678, watchersChange24h: 23.6 },
        { ticker: 'COPX', name: 'Global X Copper', price: 87.5, changePercent: 6.33, spark: [81, 82, 83, 84, 85, 86, 86.5, 87.5], watchers: 3456, watchersChange24h: 15.7 },
        { ticker: 'PLTR', name: 'Palantir', price: 18.45, changePercent: -1.2, spark: [18.7, 18.6, 18.5, 18.4, 18.45, 18.44, 18.46, 18.45], watchers: 34567, watchersChange24h: 14.2 },
        { ticker: 'DFTX', name: 'Definium Therap...', price: 17.22, changePercent: 1.5, spark: [16.8, 17, 16.9, 17.1, 17.05, 17.2, 17.15, 17.22], watchers: 1247, watchersChange24h: 12.5 },
        { ticker: 'RDW', name: 'Redwire Corp', price: 12.28, changePercent: -0.8, spark: [12.4, 12.35, 12.3, 12.25, 12.28, 12.27, 12.29, 12.28], watchers: 987, watchersChange24h: 9.4 },
        { ticker: 'SLV', name: 'iShares Silver Trust', price: 94.44, changePercent: 8.28, spark: [86, 87, 88, 89, 90, 91, 93, 94.44], watchers: 4567, watchersChange24h: 8.3 },
        { ticker: 'NVDA', name: 'NVIDIA Corp', price: 889.42, changePercent: -1.5, spark: [903, 900, 895, 890, 888, 889, 889.5, 889.42], watchers: 67890, watchersChange24h: 7.8 },
      ]
      
      // Filter out negative watcher changes and sort by watchersChange24h descending
      return data
        .filter(item => item.watchersChange24h > 0)
        .sort((a, b) => b.watchersChange24h - a.watchersChange24h)
    },
    []
  )

  const _topWatchers = useMemo(
    () => [
      { ticker: 'PLTR', change: 2.45, spark: [18, 18.2, 18.5, 18.3, 18.8, 18.6, 18.9, 18.45] },
      { ticker: 'SOFI', change: -1.23, spark: [8.5, 8.4, 8.3, 8.6, 8.2, 8.4, 8.1, 8.23] },
      { ticker: 'RIVN', change: 4.67, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
      { ticker: 'LCID', change: -0.89, spark: [3.2, 3.1, 3.0, 3.3, 3.1, 3.2, 3.0, 3.11] },
      { ticker: 'GME', change: 5.12, spark: [15, 15.5, 16, 15.8, 16.2, 16.5, 16.8, 15.12] },
    ],
    []
  )

  const _upNextVideos = useMemo(
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
        avatar: '/avatars/top-voice-1.png',
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
        avatar: '/avatars/top-voice-2.png',
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
        avatar: '/avatars/top-voice-3.png',
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
        avatar: '/avatars/user-avatar.png',
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
        avatar: '/avatars/top-voice-1.png',
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
        avatar: '/avatars/top-voice-2.png',
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
        avatar: '/avatars/top-voice-1.png',
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
        avatar: '/avatars/top-voice-2.png',
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
        
        {/* Streaming Live Banner */}
        <div className="px-4 pt-4">
          <div className="card-surface p-2.5 border-2 flex items-center gap-3" style={{ borderColor: '#8b5cf6' }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">Streaming Live: Powell Delivers Fed Interest Rate</h3>
              <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-surface-muted">
                <img
                  src="/images/powell-streaming.png"
                  alt="Jerome Powell"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Compact Sentiment Meter */}
              <div className="shrink-0" style={{ width: '180px' }}>
                <CompactSentimentMeter initialBullish={62.5} />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <svg className="w-4 h-4" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-extrabold tabular-nums" style={{ color: '#8b5cf6' }}>
                {streamingWatchers.toLocaleString()}
              </span>
              <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>watchers</span>
            </div>
            <button
              className="shrink-0 px-3 py-1.5 rounded font-bold text-xs text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              JOIN LIVE
            </button>
          </div>
        </div>
        
        {/* Top Banner Row */}
        <div className="px-4 border-b border-border" style={{ paddingTop: '13.5px', paddingBottom: '0' }}>
          <div className="grid items-start" style={{ gridTemplateColumns: '0.8fr 1fr 0.8fr', gap: '14px' }}>
            {/* First Section: Sentiment Meters - US Equities left, Crypto right; top-aligns with news */}
            <div className="flex flex-col min-w-0">
              <div className="flex flex-row gap-2">
                <SentimentMeterCard 
                  label="US Equities"
                  headline={getSentimentLabel(89)} 
                  score={89} 
                  color="var(--color-success)" 
                />
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
              <MarketIndicesChart marketIndices={marketIndices} />
            </div>

            {/* Third Section: Latest News */}
            <div className="flex flex-col min-w-0">
              <div className="flex flex-col pb-2" style={{ gap: '10px' }}>
                {latestNews.slice(0, 3).map((article, index) => (
                  <a
                    key={index}
                    href={article.url || '#'}
                    className={`flex items-start gap-3 text-sm font-semibold leading-normal hover:text-primary transition-colors line-clamp-2 py-1 ${
                      index < 2 ? 'pb-3 border-b border-border' : ''
                    }`}
                  >
                    <span className="text-2xl font-bold shrink-0" style={{ lineHeight: '1.2', color: '#ADADAD' }}>
                      {index + 1}
                    </span>
                    <span className="flex-1">{article.headline}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex p-4">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0">
            {/* Trending Symbols Carousel */}
            <div className="mb-4">
              <div className="mb-3 px-1">
                <h2 className="font-semibold text-lg">Trending Symbols &gt;</h2>
              </div>
              <div className="p-4 bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {trendingSymbols.map((symbol, idx) => {
                    const isPositive = symbol.changePercent >= 0
                    return (
                      <div key={idx} className="w-[300px] h-[280px] rounded-xl bg-surface border border-border p-4 flex flex-col gap-3 shrink-0">
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
                            'text-sm font-medium flex items-center gap-0',
                            isPositive ? 'text-success' : 'text-danger'
                          )}>
                            {isPositive ? (
                              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                            ) : (
                              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                            )}
                            ${Math.abs(symbol.change).toFixed(2)} ({Math.abs(symbol.changePercent).toFixed(2)}%)
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
                              className="h-10 w-10 rounded-full border-2 border-primary/30 ring-2 ring-primary/10 shadow-md flex-shrink-0 object-cover"
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

                        {/* Footer: Message Count and Watchlist Button */}
                        <div className="flex items-center justify-between pt-1">
                          {symbol.messageCount24h && (
                            <AnimatedMessageCount initialCount={symbol.messageCount24h} />
                          )}
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

            {/* Live Event Player and Community Predictions Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              {/* Left: Hero + 2 news cards under (fills to match Community bottom) */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-[280px] min-h-0 shrink-0">
                  <LiveEventPlayer />
                </div>
                <div className="flex-1 min-h-0 flex flex-row gap-2 items-start">
                  <a href="#" className="card-surface flex flex-1 min-w-0 overflow-hidden rounded-lg border-b border-border cursor-pointer hover:border-border-strong transition-colors">
                    <div className="flex min-h-0 w-full">
                      <div className="relative w-[32%] shrink-0 aspect-[16/9] bg-surface-muted">
                        <img src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=200&h=150&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 flex items-center gap-0.5">
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          <span className="text-[9px] text-white font-medium">01:25</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center p-2">
                        <h4 className="font-bold text-xs text-text leading-tight line-clamp-2 mb-0.5">
                          Greenland Drama Sparks Tariff Chaos
                        </h4>
                        <p className="text-[10px] text-muted mb-1">45 mins ago</p>
                        <span className="inline-flex items-center gap-0.5 w-fit rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px]">
                          <span className="font-semibold text-primary">SPY</span>
                          <span className="text-success font-medium">+0.85%</span>
                          <button type="button" className="ml-0.5 p-0.5 rounded hover:bg-surface-muted" aria-label="Add to watchlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          </button>
                        </span>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="card-surface flex flex-1 min-w-0 overflow-hidden rounded-lg border-b border-border cursor-pointer hover:border-border-strong transition-colors">
                    <div className="flex min-h-0 w-full">
                      <div className="relative w-[32%] shrink-0 aspect-[16/9] bg-surface-muted">
                        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 flex items-center gap-0.5">
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          <span className="text-[9px] text-white font-medium">02:41</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center p-2">
                        <h4 className="font-bold text-xs text-text leading-tight line-clamp-2 mb-0.5">
                          PLTR Announces New AI Contract with Defense Department
                        </h4>
                        <p className="text-[10px] text-muted mb-1">3 hrs ago</p>
                        <span className="inline-flex items-center gap-0.5 w-fit rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px]">
                          <span className="font-semibold text-primary">PLTR</span>
                          <span className="text-danger font-medium">-0.11%</span>
                          <button type="button" className="ml-0.5 p-0.5 rounded hover:bg-surface-muted" aria-label="Add to watchlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          </button>
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Community predictions + Top Predictors - side by side on the right */}
              <div className="w-full lg:w-[532px] shrink-0 flex flex-col lg:flex-row gap-3">
                <div className="min-w-0 lg:w-[320px] shrink-0">
                  <CommunityPredictions />
                </div>
                <div className="w-full lg:w-[200px] shrink-0 self-stretch">
                  <TopPredictors />
                </div>
              </div>
            </div>

            {/* Top Watchlist Activity - small pills carousel */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-lg">Top Watchlist Activity &gt;</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {topWatchlistActivity.map((s, idx) => {
                  const isUp = s.changePercent >= 0
                  const watchersUp = true // Always positive since we filter out negatives
                  return (
                    <div
                      key={`${s.ticker}-${idx}`}
                      className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-muted transition-colors shrink-0 min-w-[200px]"
                    >
                      {/* Top row: Logo, Ticker, Sparkline */}
                      <div className="flex items-center gap-2">
                        {getTickerLogo(s.ticker) && (
                          <img src={getTickerLogo(s.ticker)} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                        )}
                        <span className="font-bold text-sm text-text shrink-0">{s.ticker}</span>
                        <MicroSparkline values={s.spark} isUp={isUp} />
                      </div>
                      {/* Bottom row: Price change and Watcher info */}
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
                        {/* Price change */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted uppercase tracking-wide">Price</span>
                          <span className={clsx('text-xs font-bold shrink-0 flex items-center gap-0.5', isUp ? 'text-success' : 'text-danger')}>
                            {isUp ? (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                            ) : (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                            )}
                            {Math.abs(s.changePercent).toFixed(2)}%
                          </span>
                        </div>
                        {/* Watcher count and change */}
                        <div className="flex flex-col gap-0.5 items-end">
                          <span className="text-[9px] text-muted uppercase tracking-wide">Watchers</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-text tabular-nums">
                              {s.watchers.toLocaleString()}
                            </span>
                            <span className={clsx('text-[10px] font-bold shrink-0 flex items-center gap-0.5', watchersUp ? 'text-success' : 'text-danger')}>
                              {watchersUp ? (
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                              ) : (
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                              )}
                              {Math.abs(s.watchersChange24h).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Earnings Carousel */}
            <div className="mt-4">
              <div className="mb-2 px-1">
                <h2 className="font-semibold text-lg">Top Earnings &gt;</h2>
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
                      const purpleColor = '#8b5cf6'
                      // Different initial sentiment values for each call to show independent animation
                      const initialSentimentValues = [62.5, 58.3, 65.7, 54.2, 71.4]
                      const initialBullish = initialSentimentValues[index % initialSentimentValues.length]
                      
                      return (
                        <div
                          key={`${item.ticker}-${index}`}
                          className="shrink-0 rounded-lg border-2 px-3 py-2.5 flex flex-col gap-2 bg-surface"
                          style={{ borderColor: purpleColor }}
                        >
                          {/* Top row: Logo, Ticker, Time, Live badge */}
                          <div className="flex items-center gap-2.5">
                            {getTickerLogo(item.ticker) && (
                              <img src={getTickerLogo(item.ticker)} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            )}
                            <span className="badge badge-sm font-semibold">{item.ticker}</span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="text-xs font-semibold leading-tight truncate">
                                {item.name}
                              </div>
                              <div className="text-[10px] muted">{item.time}</div>
                            </div>
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
                          </div>
                          
                          {/* Bottom row: Listener count, Sentiment Meter, EPS and Revenue */}
                          <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
                            {/* Listener count - enhanced */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                              <svg className="w-4 h-4" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-extrabold tabular-nums" style={{ color: '#8b5cf6' }}>
                                {item.listeners?.toLocaleString()}
                              </span>
                              <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>listening</span>
                            </div>
                            {/* Sentiment Meter - each with different initial value */}
                            <SentimentMeter initialBullish={initialBullish} />
                            {/* EPS and Revenue Results */}
                            <div className="flex items-center gap-3 text-[10px]">
                              <div className="flex items-center gap-1">
                                <span className="text-muted">EPS:</span>
                                <span className="font-bold text-text">${item.epsResult?.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted">Revenue:</span>
                                <span className="font-bold text-text">${item.revenueResult?.toFixed(2)}B</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>

            {/* My Community Carousel */}
            <div className="mt-4">
              <div className="mb-3 px-1">
                <h2 className="font-semibold text-lg">My Community &gt;</h2>
              </div>
              <div className="p-4 bg-surface-muted/30">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {myCommunityPosts.map((post) => (
                    <div key={post.id} className="w-[300px] h-[280px] rounded-xl bg-surface border border-border p-4 flex flex-col gap-3 shrink-0">
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
