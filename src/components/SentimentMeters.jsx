import React from 'react'

function Gauge({ score = 0, size = 72, strokeWidth = 8, color = '#17c964' }) {
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
      <path d={baseArc} stroke="currentColor" opacity="0.15" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <path d={valueArc} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
        {clamped}
      </text>
    </svg>
  )
}

function MeterCard({ label, headline, score, color }) {
  return (
    <div className="card-surface flex items-center justify-between p-4">
      <div>
        <div className="text-sm muted">{label}</div>
        <div className="mt-1 text-lg font-semibold flex items-center gap-1">
          <span>{headline}</span>
          <span className="muted">›</span>
        </div>
      </div>
      <Gauge score={score} color={color} />
    </div>
  )
}

export default function SentimentMeters() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MeterCard label="Sentiment" headline="Extremely Bullish" score={94} color="#17c964" />
      <MeterCard label="Message Volume" headline="Extremely High" score={86} color="#17c964" />
    </div>
  )
}


