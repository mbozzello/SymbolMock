import React, { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function MiniSparkline({ values = [] }) {
  const width = 72
  const height = 28
  const padding = 2
  if (values.length < 2) {
    return <div className="h-7 w-20 rounded bg-white/5" />
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
        stroke={lastUp ? '#17c964' : '#f31260'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
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
  chartSrc,
  sparkValues = [],
  headerAction,
  isUnregistered = false,
}) {
  const [open, setOpen] = useState(false)
  const isUp = change >= 0

  return (
    <div className="card-surface">
      {headerAction && (
        <div className="border-b border-white/5 p-4">
          {headerAction}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={open}
        aria-controls="stock-header-panel"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
            <span className="badge">${ticker}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <div className="text-2xl font-bold md:text-3xl">${price.toFixed(2)}</div>
            <div className={clsx('text-sm font-semibold', isUp ? 'text-success' : 'text-danger')}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MiniSparkline values={sparkValues} />
          <div className="rounded-md border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {open ? 'Hide' : 'Show'} details
          </div>
        </div>
      </button>

      <div
        id="stock-header-panel"
        className={clsx(
          'border-t border-white/5 px-4 pb-4 transition-all duration-300 ease-in-out',
          open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ overflow: 'hidden' }}
      >
        <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-3">
            <img
              src={chartSrc}
              alt="Chart placeholder"
              className="h-52 w-full rounded-md object-cover md:h-64"
            />
            <div className="flex flex-wrap gap-2">
              {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((t) => (
                <button key={t} className="btn px-2 py-1 text-xs">{t}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-white/5 bg-surface p-3">
                <div className="text-xs uppercase tracking-wide muted">{stat.label}</div>
                <div className="mt-1 text-lg font-semibold">{stat.value}</div>
              </div>
            ))}
            <button className="btn btn-primary w-full">
              {isUnregistered ? 'Register to view fundamentals' : 'View fundamentals'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
