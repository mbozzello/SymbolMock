import React from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function LargeGauge({ score = 0, size = 80, strokeWidth = 8, color = 'var(--color-success)' }) {
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
    <svg viewBox={`0 0 ${size} ${size}`} className="h-16 w-16">
      <path d={baseArc} stroke="currentColor" opacity="0.1" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <path d={valueArc} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
        {clamped}
      </text>
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

function getSentimentColor(score) {
  if (score >= 75) return 'var(--color-success)'
  if (score >= 55) return 'var(--color-success)'
  if (score >= 45) return 'var(--color-warning)'
  if (score >= 25) return 'var(--color-danger)'
  return 'var(--color-danger)'
}

export default function FearAndGreed({ sentimentScore = 89, marketIndices = [] }) {
  const sentimentLabel = getSentimentLabel(sentimentScore)
  const sentimentColor = getSentimentColor(sentimentScore)

  return (
    <div className="card-surface h-80 flex flex-col p-4 border-2 border-dashed border-border bg-surface-muted/30">
      {/* Sentiment Meter Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-bold">
          Sentiment: <span className="font-semibold">{sentimentLabel}</span>
        </div>
        <div>
          <LargeGauge score={sentimentScore} color={sentimentColor} />
        </div>
      </div>

      {/* Market Indices Table */}
      <div className="flex-1 overflow-hidden">
        <div className="text-xs font-semibold uppercase tracking-wide muted mb-2">Market Indices</div>
        <div className="space-y-1.5">
          {marketIndices.map((index) => (
            <div
              key={index.ticker}
              className="flex items-center justify-between py-1 border-b border-border last:border-b-0"
            >
              <div className="font-semibold text-sm">{index.ticker}</div>
              <div
                className={clsx(
                  'text-sm font-semibold',
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
    </div>
  )
}
