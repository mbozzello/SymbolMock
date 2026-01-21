import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [], width = 144, height = 56 }) {
  const padding = 2
  if (values.length < 2) {
    return <div className="h-14 w-36 rounded bg-surface-muted border border-border" />
  }
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
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-36">
      <polyline
        fill="none"
        stroke={lastUp ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2.5"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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
      <div className="h-52 w-full md:h-64 rounded-md bg-surface-muted border border-border flex items-center justify-center">
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
    <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full md:h-64 rounded-md border border-border bg-surface-muted" preserveAspectRatio="none">
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

function WatcherTooltipContent({ data }) {
  const { change7d, change7dPct, change30d, change30dPct, sectorRank, sector } = data
  const is7dUp = change7d >= 0
  const is30dUp = change30d >= 0

  return (
    <div className="space-y-2 p-2">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-text">7D Change</div>
        <div className={clsx('text-xs font-bold', is7dUp ? 'text-success' : 'text-danger')}>
          {is7dUp ? '+' : ''}{change7d.toLocaleString()} ({is7dUp ? '+' : ''}{change7dPct.toFixed(1)}%)
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold text-text">30D Change</div>
        <div className={clsx('text-xs font-bold', is30dUp ? 'text-success' : 'text-danger')}>
          {is30dUp ? '+' : ''}{change30d.toLocaleString()} ({is30dUp ? '+' : ''}{change30dPct.toFixed(1)}%)
        </div>
      </div>
      <div className="pt-1 border-t border-border">
        <div className="text-xs font-semibold text-text">
          #{sectorRank} in {sector}
        </div>
      </div>
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
  isUnregistered = false,
}) {
  const [open, setOpen] = useState(false)
  const isUp = change >= 0
  const sentimentStat = stats.find((stat) => stat.label === 'Sentiment')
  const messageVolumeStat = stats.find((stat) => stat.label === 'Msg Vol (24h)')
  const fundamentalStats = [
    { label: 'Market Cap', value: '2.1T' },
  ]

  // Mock data for watcher tooltip
  const watcherTooltipData = {
    current: 1200,
    change7d: 145,
    change7dPct: 13.8,
    change30d: 320,
    change30dPct: 36.4,
    sectorRank: 1,
    sector: "Aerospace"
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="card-surface">
      {headerAction && (
        <div className="border-b border-border p-4">
          {headerAction}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between gap-4 p-4 text-left transition-colors relative pb-5",
          !headerAction && "rounded-t-xl",
          !open && "rounded-b-xl"
        )}
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
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 min-w-0">
              {/* Symbol Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={`https://placehold.co/40x40?text=${ticker[0]}`} 
                  alt={`${ticker} logo`} 
                  className="w-10 h-10 rounded-full border border-border bg-surface shadow-sm" 
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
                    <div className="flex items-center gap-2">
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className="flex items-baseline gap-1 cursor-help">
                            <span className="font-semibold text-text">1.2K</span>
                            <span className="text-[10px] uppercase tracking-wide muted font-semibold">Watchers</span>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="rounded-md border border-border bg-surface shadow-lg z-50 max-w-xs"
                            sideOffset={5}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WatcherTooltipContent data={watcherTooltipData} />
                            <Tooltip.Arrow className="fill-surface" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                      <button 
                        type="button"
                        className="p-1 rounded-md border border-border hover:bg-surface-muted transition-colors flex items-center justify-center bg-surface"
                        aria-label="Add to watchlist"
                        onClick={(e) => { e.stopPropagation(); console.log('Add to watchlist'); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <div className="text-xl font-bold md:text-2xl">${price.toFixed(2)}</div>
                  <div className={clsx('text-xs font-bold sm:text-sm', isUp ? 'text-success' : 'text-danger')}>
                    {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
                  </div>
                  
                  {/* Mobile version of stats */}
                  <div className="flex items-center gap-3 text-[10px] sm:hidden">
                    <div className="flex items-center gap-1.5">
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <span className="font-bold text-text">1.2K</span>
                            <span className="muted font-semibold uppercase">Watch</span>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="rounded-md border border-border bg-surface shadow-lg z-50 max-w-xs"
                            sideOffset={5}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WatcherTooltipContent data={watcherTooltipData} />
                            <Tooltip.Arrow className="fill-surface" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
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

            <div className="flex items-center gap-4 shrink-0">
              <div>
                <MiniSparkline values={sparkValues} />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 border-t border-border pt-2 text-[11px] sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
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
            {fundamentalStats.map((stat, index) => (
              <div key={stat.label} className="flex items-baseline gap-1 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">{stat.label}</span>
                <span className="font-semibold text-text">{stat.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <span className="muted uppercase tracking-wide font-semibold text-[10px]">Sentiment</span>
              <span className={clsx('px-2 py-0.5 rounded-full border text-[11px] font-semibold', sentimentStat ? 'border-border bg-surface' : 'border-border bg-surface-muted')}>
                {sentimentStat?.value ?? 'Neutral'}
              </span>
            </div>
            {messageVolumeStat && (
              <div className="flex items-baseline gap-1 border-l border-border pl-3">
                <span className="muted uppercase tracking-wide font-semibold text-[10px]">{messageVolumeStat.label}</span>
                <span className="font-semibold text-text">{messageVolumeStat.value}</span>
              </div>
            )}
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
        <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-3">
            <ChartSparkline values={chartValues} isUp={isUp} />
            <div className="flex flex-wrap gap-2">
              {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((t) => (
                <button key={t} className="btn px-2 py-1 text-xs font-semibold">{t}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border bg-surface-muted p-1.5 sm:p-2">
                <div className="text-[9px] uppercase tracking-wide muted font-semibold">{stat.label}</div>
                <div className="mt-0.5 text-xs sm:text-sm font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Tooltip.Provider>
  )
}
