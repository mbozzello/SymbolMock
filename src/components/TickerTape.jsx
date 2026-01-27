import React from 'react'
import { getTickerLogo } from '../constants/tickerLogos'
import './TickerTape.css'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

// Logo color by symbol (matches image: SPDR green, QQQ blue, BTC orange, etc.)
const LOGO_STYLE = {
  DIA: { bg: '#1e3a2a', initial: 'D' },
  SPY: { bg: '#1e3a2a', initial: 'S' },
  QQQ: { bg: '#1a56db', initial: 'Q' },
  BTC: { bg: '#f7931a', initial: '₿' },
  UAMY: { bg: '#dc2626', initial: 'U' },
  ALT: { bg: '#0ea5e9', initial: 'A' },
  SRPT: { bg: '#7c3aed', initial: 'S' },
  GME: { bg: '#dc2626', initial: 'G' },
  INTC: { bg: '#0ea5e9', initial: 'I' },
}
const FALLBACK_COLORS = ['#64748b', '#475569', '#334155', '#1e293b']

function getLogoStyle(symbol) {
  const s = LOGO_STYLE[symbol] || {
    bg: FALLBACK_COLORS[[...symbol].reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK_COLORS.length],
    initial: symbol[0] || '?',
  }
  return s
}

function TickerItem({ symbol, change }) {
  const isUp = change >= 0
  const logoSrc = getTickerLogo(symbol)
  const { bg, initial } = getLogoStyle(symbol)
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {logoSrc ? (
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0">
          <img src={logoSrc} alt="" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ backgroundColor: bg }}
        >
          {initial}
        </div>
      )}
      <span className="font-semibold text-sm">{symbol}</span>
      <span className={clsx('inline-flex items-center gap-0 shrink-0', isUp ? 'text-success' : 'text-danger')}>
        {isUp ? (
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 14l5-5 5 5H7z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        )}
        <span className="text-xs font-medium">
          {Math.abs(change).toFixed(2)}%
        </span>
      </span>
    </div>
  )
}

export default function TickerTape() {
  const scrollingSymbols = [
    { symbol: 'UAMY', change: 7.03 },
    { symbol: 'ALT', change: 4.59 },
    { symbol: 'SRPT', change: 7.1 },
    { symbol: 'GME', change: 0.7 },
    { symbol: 'INTC', change: -0.58 },
    { symbol: 'NVDA', change: 2.45 },
    { symbol: 'PLTR', change: 5.67 },
    { symbol: 'AAPL', change: -0.82 },
    { symbol: 'TSLA', change: 3.21 },
    { symbol: 'META', change: 0.67 },
  ]
  const duplicatedScroll = [...scrollingSymbols, ...scrollingSymbols]

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background overflow-hidden">
      <div className="flex items-center min-h-[40px] py-1.5">
        {/* Left: All + SPY + BTC (static) */}
        <div className="flex items-center gap-3 pl-4 pr-3 shrink-0 border-r border-border">
          <button
            type="button"
            className="px-3 py-1 rounded-full border border-border bg-surface font-bold text-sm text-text hover:bg-surface-muted transition-colors"
          >
            All
          </button>
          <TickerItem symbol="SPY" change={-0.14} />
          <TickerItem symbol="BTC" change={1.23} />
        </div>

        {/* TRENDING: label + 38% static; only the ticker strip scrolls */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center pl-4 pr-3 shrink-0">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Trending</span>
          </div>
          <div className="ticker-tape-scroll-wrap flex-1 min-w-0 overflow-hidden">
            <div className="ticker-tape-content">
              {duplicatedScroll.map((item, i) => (
                <div key={`${item.symbol}-${i}`} className="ticker-tape-item px-3">
                  <TickerItem symbol={item.symbol} change={item.change} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
