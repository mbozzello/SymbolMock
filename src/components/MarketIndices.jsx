import React from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function SmallSparkline({ values = [] }) {
  if (!values || values.length === 0) return null
  
  const width = 48
  const height = 20
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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-12 h-5">
      <polyline
        fill="none"
        stroke={lastUp ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="1.5"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function MarketIndices({ marketIndices = [] }) {
  return (
    <div className="pt-2 px-4 pb-4 bg-surface-muted/30">
      <div className="text-xs font-semibold uppercase tracking-wide muted mb-2">Market Indices</div>
      <div className="space-y-1.5">
        {marketIndices.map((index) => (
          <div
            key={index.ticker}
            className="flex items-center justify-between py-1 border-b border-border last:border-b-0 gap-2"
          >
            <div className="font-semibold text-sm">{index.ticker}</div>
            {index.spark && (
              <div className="flex-1 flex justify-center">
                <SmallSparkline values={index.spark} />
              </div>
            )}
            <div
              className={clsx(
                'text-sm font-semibold shrink-0',
                index.change >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {index.change >= 0 ? '+' : ''}
              {index.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
