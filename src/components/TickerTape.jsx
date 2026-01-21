import React from 'react'
import './TickerTape.css'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function TickerTape() {
  const trendingSymbols = [
    { symbol: 'NVDA', change: 2.45 },
    { symbol: 'AAPL', change: -0.82 },
    { symbol: 'TSLA', change: 3.21 },
    { symbol: 'MSFT', change: 1.15 },
    { symbol: 'AMZN', change: -1.34 },
    { symbol: 'META', change: 0.67 },
    { symbol: 'GOOGL', change: 1.89 },
    { symbol: 'AMD', change: -2.11 },
    { symbol: 'NFLX', change: 4.32 },
    { symbol: 'DIS', change: -0.45 },
    { symbol: 'RKLB', change: 3.45 },
    { symbol: 'PLTR', change: 5.67 },
  ]

  // Duplicate the array to create seamless loop
  const duplicatedSymbols = [...trendingSymbols, ...trendingSymbols]

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface overflow-hidden">
      <div className="ticker-tape-container py-1.5">
        <div className="ticker-tape-content">
          {duplicatedSymbols.map((item, index) => (
            <div 
              key={`${item.symbol}-${index}`}
              className="ticker-tape-item flex items-center gap-1.5 px-4"
            >
              <span className="font-semibold text-sm">{item.symbol}</span>
              <span 
                className={clsx(
                  'text-xs font-medium',
                  item.change >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
