import React from 'react'
import { getTickerLogo } from '../constants/tickerLogos'
import { useTickerTape } from '../contexts/TickerTapeContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
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

const DEFAULT_TRENDING = [
  { symbol: 'TSLA', change: 4.02 },
  { symbol: 'BTC', change: 11.8 },
  { symbol: 'PZZA', change: 0.72 },
  { symbol: 'SPOT', change: 3.44 },
  { symbol: 'ETH', change: 9.0 },
  { symbol: 'AMD', change: -0.88 },
  { symbol: 'SNAP', change: 0 },
  { symbol: 'NVDA', change: 2.45 },
  { symbol: 'AAPL', change: -0.82 },
  { symbol: 'META', change: 0.67 },
]

export default function TickerTape({ symbols, static: isStatic }) {
  const { customTickers, clearCustomTickers } = useTickerTape()
  const { getQuote } = useLiveQuotesContext()
  const scrollingSymbols = customTickers && customTickers.length > 0 ? customTickers : DEFAULT_TRENDING
  const duplicatedScroll = [...scrollingSymbols, ...scrollingSymbols]
  const isCustom = customTickers && customTickers.length > 0

  const getChange = (symbol, fallback) => {
    const q = getQuote(symbol)
    return q?.changePercent ?? fallback ?? 0
  }

  if (isStatic && symbols) {
    return (
      <div className="border-b border-border bg-background overflow-hidden shrink-0">
        <div className="flex items-center gap-4 min-h-[40px] py-1.5 px-1">
          {symbols.map((sym) => (
            <TickerItem key={sym} symbol={sym} change={getChange(sym, 0)} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background overflow-hidden">
      <div className="flex items-center min-h-[40px] py-1.5">
        {/* Left: All/Custom + SPY + QQQ + Trending (static) */}
        <div className="flex items-center gap-3 pl-4 pr-3 shrink-0 border-r border-border">
          {isCustom ? (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border bg-primary/15 font-bold text-sm text-primary">
              <span>Custom</span>
              <button
                type="button"
                onClick={clearCustomTickers}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                aria-label="Remove custom tickers"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="px-3 py-1 rounded-full border border-border bg-surface font-bold text-sm text-text hover:bg-surface-muted transition-colors"
            >
              All
            </button>
          )}
          <TickerItem symbol="SPY" change={getChange('SPY', 0.72)} />
          <TickerItem symbol="QQQ" change={getChange('QQQ', -0.49)} />
          <div className="flex items-center pl-2 pr-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Trending</span>
          </div>
        </div>

        {/* Scrolling ticker strip */}
        <div className="ticker-tape-scroll-wrap flex-1 min-w-0 overflow-hidden">
          <div className="ticker-tape-content">
            {duplicatedScroll.map((item, i) => (
              <div key={`${item.symbol}-${i}`} className="ticker-tape-item px-3">
                <TickerItem symbol={item.symbol} change={getChange(item.symbol, item.change)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
