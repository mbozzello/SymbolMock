import React, { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [] }) {
  const width = 72
  const height = 28
  const padding = 2
  if (values.length < 2) {
    return <div className="h-7 w-20 rounded bg-surface-muted border border-border" />
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
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-20">
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

  return (
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
          "flex w-full items-center justify-between gap-4 p-4 text-left transition-colors relative",
          !headerAction && "rounded-t-xl",
          !open && "rounded-b-xl"
        )}
        aria-expanded={open}
        aria-controls="stock-header-panel"
      >
        <div className="absolute inset-0 bg-surface-muted opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-inherit" />
        <div className="min-w-0 relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold md:text-xl">{title}</h1>
            <span className="badge font-semibold">${ticker}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <div className="text-2xl font-bold md:text-3xl">${price.toFixed(2)}</div>
            <div className={clsx('text-sm font-bold', isUp ? 'text-success' : 'text-danger')}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <MiniSparkline values={sparkValues} />
          <div className="rounded-md border border-border px-3 py-1 text-xs font-bold uppercase tracking-wide hover:border-border-strong transition-colors bg-surface">
            {open ? 'Hide' : 'Show'} details
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

          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border bg-surface-muted p-2">
                <div className="text-[10px] uppercase tracking-wide muted font-semibold">{stat.label}</div>
                <div className="mt-0.5 text-sm font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
