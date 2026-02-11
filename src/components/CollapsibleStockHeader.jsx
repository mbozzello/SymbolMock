import React, { useState, useEffect, useRef } from 'react'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function formatNum(n) {
  return Number(n).toLocaleString()
}

function parseWatchers(w) {
  if (typeof w === 'number' && !isNaN(w)) return w
  const s = String(w || '0').replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*[Kk]$/i)
  if (m) return Math.round(parseFloat(m[1]) * 1000)
  return parseInt(s, 10) || 0
}

function parseMsgVol(v) {
  if (typeof v === 'number' && !isNaN(v)) return v
  const s = String(v || '0').replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*[Kk]$/i)
  if (m) return Math.round(parseFloat(m[1]) * 1000)
  return parseInt(s, 10) || 0
}

function MiniSparkline({ values = [], width = 144, height = 56, large = false, isUp }) {
  const padding = 2
  const sizeClass = large ? 'h-[130px] w-full max-w-[420px]' : 'h-14 w-36'
  const svgW = large ? 420 : width
  const svgH = large ? 130 : height
  if (values.length < 2) {
    return <div className={clsx('rounded bg-surface-muted border border-border', sizeClass)} />
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (svgW - padding * 2)
    const y = padding + (1 - (v - min) / range) * (svgH - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const up = isUp !== undefined ? isUp : (values[values.length - 1] >= values[0])
  const priorClose = values[0]
  const chartHeight = svgH - padding * 2
  const priorCloseY = padding + (1 - (priorClose - min) / range) * chartHeight
  const lineY = priorCloseY - 0.25 * chartHeight // shift up ~25%
  const [lastX, lastY] = points[points.length - 1].split(',').map(Number)
  const areaPoints = `${points.join(' ')} ${svgW - padding},${svgH - padding} ${padding},${svgH - padding}`
  const gradId = `miniSparkGrad-${up ? 'up' : 'dn'}`
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className={sizeClass}>
      {large && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={up ? 'var(--color-success)' : 'var(--color-danger)'} stopOpacity="0.25" />
            <stop offset="100%" stopColor={up ? 'var(--color-success)' : 'var(--color-danger)'} stopOpacity="0.02" />
          </linearGradient>
        </defs>
      )}
      {/* Yesterday's close: light grey dashed line */}
      <line
        x1={padding}
        y1={lineY}
        x2={svgW - padding}
        y2={lineY}
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="4 2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {large && (
        <polygon
          fill={`url(#${gradId})`}
          points={areaPoints}
        />
      )}
      <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth={large ? '2.5' : '2.5'}
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={large ? 4 : 5}
        fill={up ? '#86efac' : '#fca5a5'}
        className="animate-pulse"
      />
    </svg>
  )
}

function VolumeGauge({ score = 0, size = 80, strokeWidth = 6, color = 'var(--color-success)', className = 'h-20 w-20' }) {
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

  function describeArcCW(centerX, centerY, r, startDeg, endDeg) {
    const startPoint = polarToCartesian(centerX, centerY, r, startDeg)
    const endPoint = polarToCartesian(centerX, centerY, r, endDeg)
    const span = endDeg - startDeg
    const largeArcFlag = span >= 180 ? 1 : 0
    const sweepFlag = 1
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`
  }

  const valueSpan = (360 * clamped) / 100
  const valueArc = clamped > 0 ? describeArcCW(cx, cy, radius, 0, valueSpan) : null

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className}>
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
      {valueArc && (
        <path
          d={valueArc}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
        {clamped}
      </text>
    </svg>
  )
}

function ChartSparkline({ values = [], isUp = true }) {
  const width = 600
  const height = 200
  const paddingLeft = 50
  const paddingRight = 10
  const paddingTop = 10
  const paddingBottom = 20

  if (values.length < 2) {
    return (
      <div className="h-52 w-full md:h-64 rounded-md border border-border flex items-center justify-center">
        <span className="muted text-sm">No chart data</span>
      </div>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Generate points for the line
  const points = values.map((v, i) => {
    const x = paddingLeft + (i / (values.length - 1)) * chartWidth
    const y = paddingTop + (1 - (v - min) / range) * chartHeight
    return { x, y, value: v }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  
  // Create area path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${paddingLeft} ${height - paddingBottom} Z`

  // Generate Y-axis labels (5 labels)
  const yLabels = []
  for (let i = 0; i <= 4; i++) {
    const value = min + (range * (4 - i)) / 4
    const y = paddingTop + (i / 4) * chartHeight
    yLabels.push({ value: value.toFixed(2), y })
  }

  const strokeColor = isUp ? 'var(--color-success)' : 'var(--color-danger)'
  const gradientId = isUp ? 'chartGradientUp' : 'chartGradientDown'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full md:h-80 rounded-md border border-border" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartGradientUp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="chartGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {yLabels.map((label, i) => (
        <g key={i}>
          <text
            x={paddingLeft - 8}
            y={label.y + 4}
            textAnchor="end"
            className="fill-current text-[10px] muted"
            style={{ fontSize: '10px' }}
          >
            ${label.value}
          </text>
          <line
            x1={paddingLeft}
            y1={label.y}
            x2={width - paddingRight}
            y2={label.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </g>
      ))}

      {/* Gradient fill area */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />

      {/* Main line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* End point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill={strokeColor}
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="6"
        fill={strokeColor}
        opacity="0.3"
      />
    </svg>
  )
}

const WATCHERS_HOVER_DEFAULTS = {
  change7d: { watchers: 273, percent: 7.8 },
  dailyChanges: [23, 47, 89, 83, -17, 31, 17],
  rank: { position: 1, total: 17, category: 'Specialty Retail' },
  underTheRadar: '#3 least followed symbol at a 52W high',
}

function WatchersHoverPanel({ ticker, change7d, dailyChanges, rank, underTheRadar, children }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)
  const c7d = change7d ?? WATCHERS_HOVER_DEFAULTS.change7d
  const days = dailyChanges ?? WATCHERS_HOVER_DEFAULTS.dailyChanges
  const r = rank ?? WATCHERS_HOVER_DEFAULTS.rank
  const utr = underTheRadar ?? WATCHERS_HOVER_DEFAULTS.underTheRadar

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const maxBar = Math.max(...days.map(Math.abs))

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-[300px] max-w-[360px] rounded-xl border border-border bg-white dark:bg-surface shadow-xl overflow-hidden"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="p-4 space-y-4">
            {/* 7D CHANGE */}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">7D Change</div>
              <p className="text-sm text-text font-medium mb-3">
                +{c7d.watchers} Watchers <span className="text-green-600 font-semibold">(+{c7d.percent}%)</span>
              </p>
              <div className="flex items-end gap-1.5 h-16 mb-3">
                {days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center min-h-0">
                    <span className={`text-[10px] font-semibold shrink-0 mb-1 ${d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {d >= 0 ? `+${d}` : d}
                    </span>
                    <div className="flex-1 flex flex-col justify-end w-full min-h-[24px]">
                      <div
                        className="w-full rounded-t flex-shrink-0"
                        style={{
                          height: `${Math.max(4, (Math.abs(d) / (maxBar || 1)) * 32)}px`,
                          backgroundColor: d >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="w-full py-2 rounded-lg bg-surface-muted text-text font-medium text-sm hover:bg-surface-muted/80 transition-colors">
                Full Watchers Chart
              </button>
            </div>
            {/* WATCHERS RANK */}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">Watchers Rank</div>
              <p className="text-sm text-text font-medium">#{r.position} of {r.total} in {r.category}</p>
            </div>
            {/* UNDER THE RADAR */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">
                Under the Radar
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-hidden />
              </div>
              <p className="text-sm text-text font-medium">{utr}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CollapsibleStockHeader({
  title,
  ticker,
  price,
  change,
  changePct,
  stats = [],
  chartValues = [],
  sparkValues = [],
  headerAction,
  watchers = '1.2K',
}) {
  const { isWatched, toggleWatch } = useWatchlist()
  const [open, setOpen] = useState(false)
  const messageVolumeStat = stats.find((s) => s.label === 'Msg Vol (24h)')
  const [watchersCount, setWatchersCount] = useState(() => parseWatchers(watchers))
  const [msgVol, setMsgVol] = useState(() => parseMsgVol(messageVolumeStat?.value ?? 1234))
  const [floatingWatchers, setFloatingWatchers] = useState(null)

  useEffect(() => {
    const tMsg = setInterval(() => setMsgVol((prev) => prev + 5), 2500)
    const tWatchers = setInterval(() => {
      const d = [1, 2, 3, 4][Math.floor(Math.random() * 4)]
      setWatchersCount((prev) => prev + d)
      setFloatingWatchers({ value: d, key: Date.now() })
    }, 1500)
    return () => {
      clearInterval(tMsg)
      clearInterval(tWatchers)
    }
  }, [])

  const isUp = change >= 0
  const marketCapStat = stats.find((s) => s.label === 'Mkt Cap' || s.label === 'Market Cap')
  const high52Stat = stats.find((stat) => stat.label === '52W High')
  const low52Stat = stats.find((stat) => stat.label === '52W Low')
  return (
    <div className="border-b border-border">
      {headerAction && (
        <div className="border-b border-border p-4">
          {headerAction}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 pt-2 px-4 pb-5 text-left transition-colors relative"
        aria-expanded={open}
        aria-controls="stock-header-panel"
      >
        <div className="absolute inset-0 bg-surface-muted opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-inherit" />
        
        {/* Expandable indicator arrow */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={clsx(
              "w-4 h-4 transition-transform duration-200",
              "text-muted",
              open && "rotate-180"
            )}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div className="flex w-full flex-col gap-3 relative z-10">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 shrink-0" style={{ maxWidth: '55%' }}>
              {/* Symbol Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={ticker === 'GME' ? '/images/logos/gme.png' : `https://placehold.co/40x40?text=${ticker[0]}`}
                  alt={`${ticker} logo`}
                  className="w-10 h-10 rounded-full border border-border bg-surface shadow-sm object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold md:text-xl truncate">{ticker}</h1>
                    <span className="badge font-semibold shrink-0">{title}</span>
                  </div>
                  
                  {/* Stats Bar (Always visible) */}
                  <div className="flex items-center gap-3 text-xs border-l border-border pl-3 hidden sm:flex">
                    <WatchersHoverPanel ticker={ticker}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <div className="flex items-baseline gap-1">
                          <span className="relative inline-flex items-baseline">
                            <span className="font-semibold text-text">{formatNum(watchersCount)}</span>
                            {floatingWatchers && (
                              <span
                                key={floatingWatchers.key}
                                className="absolute left-full ml-0.5 bottom-0 text-success text-[10px] font-bold animate-float-watchers whitespace-nowrap"
                                onAnimationEnd={() => setFloatingWatchers(null)}
                              >
                                +{floatingWatchers.value}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide muted font-semibold">Watchers</span>
                        </div>
                        <button 
                          type="button"
                          className="p-1 rounded-md border border-border hover:bg-surface-muted transition-colors flex items-center justify-center bg-surface"
                          aria-label={isWatched(ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleWatch(ticker, title); }}
                        >
                        {isWatched(ticker) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        )}
                        </button>
                      </div>
                    </WatchersHoverPanel>
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <div className="text-xl font-bold md:text-2xl">${price.toFixed(2)}</div>
                  <div className={clsx('text-xs font-bold sm:text-sm flex items-center gap-0', isUp ? 'text-success' : 'text-danger')}>
                    {isUp ? (
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 14l5-5 5 5H7z" /></svg>
                    ) : (
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 10l5 5 5-5H7z" /></svg>
                    )}
                    {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                  </div>
                  
                  {/* Mobile version of stats */}
                  <div className="flex items-center gap-3 text-[10px] sm:hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="relative inline-flex items-baseline">
                        <span className="font-bold text-text">{formatNum(watchersCount)}</span>
                        {floatingWatchers && (
                          <span
                            key={floatingWatchers.key}
                            className="absolute left-full ml-0.5 bottom-0 text-success text-[10px] font-bold animate-float-watchers whitespace-nowrap"
                            onAnimationEnd={() => setFloatingWatchers(null)}
                          >
                            +{floatingWatchers.value}
                          </span>
                        )}
                      </span>
                      <span className="muted font-semibold uppercase">Watch</span>
                      <button 
                        type="button"
                        className="ml-0.5 p-0.5 rounded border border-border bg-surface"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] muted font-medium">
                  Last updated: Jan 21, 10:45 AM ET
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-end min-w-0">
              <MiniSparkline values={sparkValues} large isUp={isUp} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 border-t border-border pt-2 text-[11px] sm:text-xs">
            {/* Row 1: Trending, Market Cap, 52W High, 52W Low */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {(ticker === 'TSLA' || ticker === 'AAPL') && <span className="text-base">🔥</span>}
                <span className="font-bold text-text">Trending #2 Overall</span>
                <button 
                  type="button"
                  className="flex items-center gap-1 text-[#FF8C42] hover:text-[#FF7629] font-semibold transition-colors"
                  onClick={(e) => { e.stopPropagation(); console.log('See Why clicked'); }}
                >
                  See Why
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div className="flex items-baseline gap-1 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">{marketCapStat?.label ?? 'Mkt Cap'}</span>
                <span className="font-semibold text-text">{marketCapStat?.value ?? '—'}</span>
              </div>
              <div className="flex items-baseline gap-1 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">{high52Stat?.label ?? '52W High'}</span>
                <span className="font-semibold text-text">{high52Stat?.value ?? '—'}</span>
              </div>
              <div className="flex items-baseline gap-1 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">{low52Stat?.label ?? '52W Low'}</span>
                <span className="font-semibold text-text">{low52Stat?.value ?? '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">Earnings</span>
                <span className="font-semibold text-text">March 14</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 text-muted" fill="currentColor" aria-label="After market close">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </div>
            {/* Row 2: Top Bullish and Bearish Voices */}
            <div className="flex flex-col gap-2">
              {/* Top Bullish Voice */}
              <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <img
                  src="/avatars/top-voice-1.png"
                  alt="Top bullish voice"
                  className="w-6 h-6 rounded-full border border-border object-cover shrink-0"
                />
                <span className="text-sm text-text flex-1 min-w-0">
                  <span className="font-semibold text-success">Top bullish voice:</span>{' '}
                  <span className="text-text">Bullish on GME's long term value with Michael Burry buying in</span>
                  <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform ml-1">&gt;</span>
                </span>
              </a>
              {/* Top Bearish Voice */}
              <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <img
                  src="/avatars/top-voice-2.png"
                  alt="Top bearish voice"
                  className="w-6 h-6 rounded-full border border-border object-cover shrink-0"
                />
                <span className="text-sm text-text flex-1 min-w-0">
                  <span className="font-semibold text-danger">Top bearish voice:</span>{' '}
                  <span className="text-text">Concerned this is a Bull Trap from Michael Burry</span>
                  <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform ml-1">&gt;</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </button>

      <div
        id="stock-header-panel"
        className={clsx(
          'border-t border-border px-4 pb-4 transition-all duration-300 ease-in-out overflow-hidden',
          open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0',
          !open && 'border-t-0'
        )}
      >
        <div className="flex flex-col gap-4 pt-4">
          {/* Chart — full width, taller */}
          <div className="space-y-3">
            <ChartSparkline values={chartValues} isUp={isUp} />
            <div className="flex flex-wrap gap-2">
              {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((t) => (
                <button key={t} className="btn px-2 py-1 text-xs font-semibold">{t}</button>
              ))}
            </div>
          </div>

          {/* Stats row — below chart */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border p-1.5 sm:p-2">
                <div className="text-[9px] uppercase tracking-wide muted font-semibold">{stat.label}</div>
                <div className="mt-0.5 text-xs sm:text-sm font-bold">
                  {stat.label === 'Msg Vol (24h)' ? formatNum(msgVol) : stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
