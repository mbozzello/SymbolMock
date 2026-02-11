import { useState, useEffect, useMemo, useRef } from 'react'
import LeftSidebar from '../components/LeftSidebar.jsx'
import { useTickerTape } from '../contexts/TickerTapeContext.jsx'
import { useLiveQuotesContext } from '../contexts/LiveQuotesContext.jsx'
import { useWatchlist } from '../contexts/WatchlistContext.jsx'
import TopNavigation from '../components/TopNavigation.jsx'
import TickerTape from '../components/TickerTape.jsx'
import { getTickerLogo } from '../constants/tickerLogos.js'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const WATCHLIST = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 201.12, change: -0.54, spark: [16, 15, 15.5, 16.2, 15.8, 16.5, 16.1, 15.9] },
  { ticker: 'AAPL', name: 'Apple Inc', price: 254.92, change: -2.34, spark: [20, 21, 21.5, 21.1, 22, 21.8, 22.5, 23] },
  { ticker: 'ABNB', name: 'Airbnb', price: 142.50, change: 1.20, spark: [18, 18.4, 18.2, 18.9, 19.4, 19.1, 19.9, 20.2] },
  { ticker: 'AMC', name: 'AMC Entertainment', price: 4.21, change: -0.15, spark: [12, 12.2, 12.5, 12.8, 13.1, 12.9, 13.3, 12.67] },
]

const parseNum = (s) => {
  if (typeof s === 'number') return s
  const m = String(s).match(/^([\d.]+)([KMBT])?$/)
  if (!m) return 0
  let n = parseFloat(m[1])
  const u = m[2]
  if (u === 'K') n *= 1e3
  else if (u === 'M') n *= 1e6
  else if (u === 'B') n *= 1e9
  else if (u === 'T') n *= 1e12
  return n
}

const SCREENER_ROWS_BASE = [
  { rank: 1, ticker: 'HOOD', name: 'Robinhood Market...', price: 90.25, pctChange: -9.24, volume: '59.74M', volumeNum: 59.74e6, watchers: '112.30K', watchersNum: 112300, followers: '94.20K', followersNum: 94200, sentiment: 'bearish', sentimentScore: -100, marketCap: '$89.45B', marketCapNum: 89.45e9, watched: false, type: 'equity', spark: [92, 91, 90.5, 91, 90.2, 89.8, 90, 90.25] },
  { rank: 2, ticker: 'XRP', name: 'Ripple', price: 2.34, pctChange: 8.33, volume: '5.60B', volumeNum: 5.6e9, watchers: '278.00K', watchersNum: 278000, followers: '456.00K', followersNum: 456000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$134.00B', marketCapNum: 134e9, watched: false, type: 'crypto', spark: [2.1, 2.15, 2.2, 2.25, 2.28, 2.32, 2.33, 2.34] },
  { rank: 3, ticker: 'PLTR', name: 'Palantir Technologi...', price: 158.06, pctChange: 7.77, volume: '72.81M', volumeNum: 72.81e6, watchers: '145.20K', watchersNum: 145200, followers: '89.50K', followersNum: 89500, sentiment: 'bullish', sentimentScore: 100, marketCap: '$349.39B', marketCapNum: 349.39e9, watched: false, type: 'equity', spark: [145, 148, 152, 154, 156, 157, 157.5, 158.06] },
  { rank: 4, ticker: 'DOGE', name: 'Dogecoin', price: 0.1842, pctChange: 7.22, volume: '2.10B', volumeNum: 2.1e9, watchers: '342.00K', watchersNum: 342000, followers: '890.00K', followersNum: 890000, sentiment: 'bullish', sentimentScore: 100, marketCap: '$26.50B', marketCapNum: 26.5e9, watched: true, type: 'crypto', spark: [0.17, 0.171, 0.175, 0.178, 0.18, 0.182, 0.183, 0.1842] },
  { rank: 5, ticker: 'BTC', name: 'Bitcoin', price: 97842.50, pctChange: 2.25, volume: '45.20B', volumeNum: 45.2e9, watchers: '892.00K', watchersNum: 892000, followers: '1.25M', followersNum: 1.25e6, sentiment: 'bullish', sentimentScore: 100, marketCap: '$1.92T', marketCapNum: 1.92e12, watched: true, type: 'crypto', spark: [95500, 96000, 96500, 97000, 97200, 97600, 97800, 97842.5] },
  { rank: 6, ticker: 'ETH', name: 'Ethereum', price: 3245.80, pctChange: -2.67, volume: '18.90B', volumeNum: 18.9e9, watchers: '645.00K', watchersNum: 645000, followers: '890.00K', followersNum: 890000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$390.00B', marketCapNum: 390e9, watched: false, type: 'crypto', spark: [3320, 3300, 3280, 3260, 3255, 3248, 3246, 3245.8] },
  { rank: 7, ticker: 'TSLA', name: 'Tesla Inc', price: 248.92, pctChange: -4.76, volume: '92.30M', volumeNum: 92.3e6, watchers: '485.00K', watchersNum: 485000, followers: '620.00K', followersNum: 620000, sentiment: 'bearish', sentimentScore: -100, marketCap: '$792.00B', marketCapNum: 792e9, watched: true, type: 'equity', spark: [260, 255, 252, 250, 249, 248.5, 249, 248.92] },
  { rank: 8, ticker: 'AAPL', name: 'Apple Inc', price: 178.25, pctChange: 1.05, volume: '58.20M', volumeNum: 58.2e6, watchers: '425.00K', watchersNum: 425000, followers: '520.00K', followersNum: 520000, sentiment: 'neutral', sentimentScore: 0, marketCap: '$2.78T', marketCapNum: 2.78e12, watched: true, type: 'equity', spark: [176, 176.5, 177, 177.5, 177.8, 178, 178.2, 178.25] },
]

const COLUMN_METRICS = [
  { id: 'rank', label: 'Rank', category: 'Core' },
  { id: 'symbol', label: 'Symbol', category: 'Core' },
  { id: 'chart', label: 'Chart', category: 'Charts' },
  { id: 'lastPrice', label: 'Last Price', category: 'Price' },
  { id: 'pctChange', label: '24h %', category: 'Price Change' },
  { id: 'volume', label: 'Volume(24h)', category: 'Volume' },
  { id: 'watchers', label: 'Watchers', category: 'Stocktwits Data' },
  { id: 'followers', label: 'Followers', category: 'Stocktwits Data' },
  { id: 'sentiment', label: 'Sentiment', category: 'Stocktwits Data' },
  { id: 'marketCap', label: 'Market Cap', category: 'Market Cap' },
  { id: 'watch', label: 'Watch', category: 'Core' },
  { id: 'messageVolume', label: 'Message Volume', category: 'Stocktwits Data' },
  { id: '1hPct', label: '1h %', category: 'Price Change' },
  { id: '7dPct', label: '7d %', category: 'Price Change' },
  { id: '30dPct', label: '30d %', category: 'Price Change' },
  { id: 'fullyDilutedMcap', label: 'Fully Diluted Mcap', category: 'Market Cap' },
  { id: 'volume7d', label: 'Volume(7d)', category: 'Volume' },
  { id: 'volume30d', label: 'Volume(30d)', category: 'Volume' },
]

const DEFAULT_VISIBLE_COLUMNS = ['rank', 'symbol', 'watch', 'chart', 'lastPrice', 'pctChange', 'volume', 'watchers', 'followers', 'sentiment', 'marketCap']
const MAX_COLUMNS = 12

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending', icon: 'trend' },
  { key: 'mostActive', label: 'Most Active', icon: null },
  { key: 'watchers', label: 'Watchers', icon: 'eye' },
  { key: 'mostBullish', label: 'Most Bullish', icon: 'thumbUp' },
  { key: 'mostBearish', label: 'Most Bearish', icon: 'thumbDown' },
  { key: 'topGainers', label: 'Top Gainers', icon: 'arrowUp' },
  { key: 'topLosers', label: 'Top Losers', icon: 'arrowDown' },
]

// Heatmap data — rich dataset across sectors for proper treemap
const HEATMAP_DATA = [
  // Technology
  { ticker: 'NVDA', sector: 'Technology', pctChange: -0.75, sentimentScore: 80, messageVolumeNum: 280000, marketCapNum: 3100e9 },
  { ticker: 'AAPL', sector: 'Technology', pctChange: -0.30, sentimentScore: 10, messageVolumeNum: 95000, marketCapNum: 2780e9 },
  { ticker: 'MSFT', sector: 'Technology', pctChange: -0.06, sentimentScore: 40, messageVolumeNum: 88000, marketCapNum: 2900e9 },
  { ticker: 'AVGO', sector: 'Technology', pctChange: -1.04, sentimentScore: -30, messageVolumeNum: 42000, marketCapNum: 800e9 },
  { ticker: 'AMD', sector: 'Technology', pctChange: -1.11, sentimentScore: -40, messageVolumeNum: 76000, marketCapNum: 280e9 },
  { ticker: 'PLTR', sector: 'Technology', pctChange: -2.39, sentimentScore: 100, messageVolumeNum: 67000, marketCapNum: 250e9 },
  { ticker: 'INTC', sector: 'Technology', pctChange: -6.17, sentimentScore: -90, messageVolumeNum: 54000, marketCapNum: 120e9 },
  { ticker: 'QCOM', sector: 'Technology', pctChange: 0.89, sentimentScore: 20, messageVolumeNum: 28000, marketCapNum: 200e9 },
  { ticker: 'TXN', sector: 'Technology', pctChange: 0.99, sentimentScore: 30, messageVolumeNum: 12000, marketCapNum: 170e9 },
  // Communication Services
  { ticker: 'GOOGL', sector: 'Communication Services', pctChange: -1.78, sentimentScore: -10, messageVolumeNum: 120000, marketCapNum: 2000e9 },
  { ticker: 'META', sector: 'Communication Services', pctChange: -0.94, sentimentScore: 60, messageVolumeNum: 110000, marketCapNum: 1200e9 },
  { ticker: 'NFLX', sector: 'Communication Services', pctChange: 0.90, sentimentScore: 50, messageVolumeNum: 48000, marketCapNum: 300e9 },
  { ticker: 'DIS', sector: 'Communication Services', pctChange: 0.65, sentimentScore: 10, messageVolumeNum: 32000, marketCapNum: 200e9 },
  // Consumer Cyclical
  { ticker: 'AMZN', sector: 'Consumer Cyclical', pctChange: -0.83, sentimentScore: -20, messageVolumeNum: 72000, marketCapNum: 1850e9 },
  { ticker: 'TSLA', sector: 'Consumer Cyclical', pctChange: 1.87, sentimentScore: -100, messageVolumeNum: 320000, marketCapNum: 792e9 },
  { ticker: 'HD', sector: 'Consumer Cyclical', pctChange: 2.26, sentimentScore: 40, messageVolumeNum: 18000, marketCapNum: 370e9 },
  { ticker: 'WMT', sector: 'Consumer Cyclical', pctChange: -1.75, sentimentScore: 0, messageVolumeNum: 22000, marketCapNum: 490e9 },
  // Healthcare
  { ticker: 'LLY', sector: 'Healthcare', pctChange: -1.90, sentimentScore: 30, messageVolumeNum: 38000, marketCapNum: 750e9 },
  { ticker: 'JNJ', sector: 'Healthcare', pctChange: -0.14, sentimentScore: 5, messageVolumeNum: 15000, marketCapNum: 400e9 },
  { ticker: 'ABBV', sector: 'Healthcare', pctChange: -0.39, sentimentScore: -10, messageVolumeNum: 12000, marketCapNum: 300e9 },
  { ticker: 'MRK', sector: 'Healthcare', pctChange: -0.47, sentimentScore: -20, messageVolumeNum: 11000, marketCapNum: 280e9 },
  // Financial Services
  { ticker: 'V', sector: 'Financial Services', pctChange: 0.78, sentimentScore: 50, messageVolumeNum: 22000, marketCapNum: 550e9 },
  { ticker: 'MA', sector: 'Financial Services', pctChange: 0.93, sentimentScore: 45, messageVolumeNum: 18000, marketCapNum: 400e9 },
  { ticker: 'JPM', sector: 'Financial Services', pctChange: -1.24, sentimentScore: 20, messageVolumeNum: 34000, marketCapNum: 550e9 },
  { ticker: 'BAC', sector: 'Financial Services', pctChange: -1.79, sentimentScore: -30, messageVolumeNum: 28000, marketCapNum: 300e9 },
  { ticker: 'WFC', sector: 'Financial Services', pctChange: -2.83, sentimentScore: -50, messageVolumeNum: 18000, marketCapNum: 200e9 },
  { ticker: 'GS', sector: 'Financial Services', pctChange: 0.51, sentimentScore: 30, messageVolumeNum: 14000, marketCapNum: 150e9 },
  { ticker: 'HOOD', sector: 'Financial Services', pctChange: -9.24, sentimentScore: -100, messageVolumeNum: 12500, marketCapNum: 89e9 },
  // Energy
  { ticker: 'XOM', sector: 'Energy', pctChange: 0.25, sentimentScore: 15, messageVolumeNum: 20000, marketCapNum: 440e9 },
  { ticker: 'CVX', sector: 'Energy', pctChange: -0.20, sentimentScore: 5, messageVolumeNum: 14000, marketCapNum: 280e9 },
  // Industrials
  { ticker: 'CAT', sector: 'Industrials', pctChange: 0.04, sentimentScore: 25, messageVolumeNum: 9000, marketCapNum: 170e9 },
  { ticker: 'GE', sector: 'Industrials', pctChange: -0.15, sentimentScore: 35, messageVolumeNum: 11000, marketCapNum: 190e9 },
  { ticker: 'RTX', sector: 'Industrials', pctChange: -0.52, sentimentScore: 10, messageVolumeNum: 7000, marketCapNum: 140e9 },
  // Digital Assets
  { ticker: 'BTC', sector: 'Digital Assets', pctChange: 2.25, sentimentScore: 100, messageVolumeNum: 450000, marketCapNum: 1920e9 },
  { ticker: 'ETH', sector: 'Digital Assets', pctChange: -2.67, sentimentScore: 0, messageVolumeNum: 180000, marketCapNum: 390e9 },
  { ticker: 'XRP', sector: 'Digital Assets', pctChange: 8.33, sentimentScore: 100, messageVolumeNum: 89000, marketCapNum: 134e9 },
  { ticker: 'DOGE', sector: 'Digital Assets', pctChange: 7.22, sentimentScore: 100, messageVolumeNum: 210000, marketCapNum: 26e9 },
]

function MiniSparkline({ values = [], isUp }) {
  const width = 72
  const height = 28
  const padding = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const up = isUp !== undefined ? isUp : (values[values.length - 1] >= values[0])
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-7 shrink-0">
      <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Treemap color: vibrant red/green on dark background, matching the reference image
function getTreemapColor(metric, value, absMax) {
  if (metric === 'messageVolume') {
    const t = Math.min(1, value / Math.max(1, absMax))
    const r = Math.round(20 + 15 * t)
    const g = Math.round(30 + 100 * t)
    const b = Math.round(50 + 150 * t)
    return `rgb(${r},${g},${b})`
  }
  // For price and sentiment: red (negative) / green (positive), dark near zero
  const t = absMax > 0 ? value / absMax : 0
  const clamped = Math.max(-1, Math.min(1, t))
  if (clamped < 0) {
    const s = -clamped
    const r = Math.round(30 + 195 * s)
    const g = Math.round(20 + 10 * (1 - s))
    const b = Math.round(20 + 10 * (1 - s))
    return `rgb(${r},${g},${b})`
  }
  const s = clamped
  const r = Math.round(20 + 10 * (1 - s))
  const g = Math.round(30 + 170 * s)
  const b = Math.round(20 + 10 * (1 - s))
  return `rgb(${r},${g},${b})`
}

// Squarified treemap layout algorithm
function squarifyLayout(items, rect) {
  if (items.length === 0) return []
  if (items.length === 1) return [{ ...items[0], x: rect.x, y: rect.y, w: rect.w, h: rect.h }]
  const total = items.reduce((s, d) => s + d.value, 0)
  if (total <= 0) return []
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const results = []
  let remaining = sorted
  let cur = { ...rect }
  while (remaining.length > 0) {
    const isWide = cur.w >= cur.h
    const side = isWide ? cur.h : cur.w
    const remTotal = remaining.reduce((s, d) => s + d.value, 0)
    const area = cur.w * cur.h
    let row = [remaining[0]]
    let rowVal = remaining[0].value
    let best = worstAR(row, rowVal, side, area, remTotal)
    for (let i = 1; i < remaining.length; i++) {
      const next = [...row, remaining[i]]
      const nextVal = rowVal + remaining[i].value
      const w = worstAR(next, nextVal, side, area, remTotal)
      if (w <= best) { row = next; rowVal = nextVal; best = w } else break
    }
    const rowArea = (rowVal / remTotal) * area
    const rowLen = rowArea / side
    let off = 0
    for (const item of row) {
      const itemLen = (item.value / rowVal) * side
      if (isWide) {
        results.push({ ...item, x: cur.x, y: cur.y + off, w: rowLen, h: itemLen })
      } else {
        results.push({ ...item, x: cur.x + off, y: cur.y, w: itemLen, h: rowLen })
      }
      off += itemLen
    }
    if (isWide) cur = { x: cur.x + rowLen, y: cur.y, w: cur.w - rowLen, h: cur.h }
    else cur = { x: cur.x, y: cur.y + rowLen, w: cur.w, h: cur.h - rowLen }
    remaining = remaining.slice(row.length)
  }
  return results
}
function worstAR(row, rowVal, side, totalArea, totalVal) {
  const rArea = (rowVal / totalVal) * totalArea
  const rLen = rArea / side
  let worst = 0
  for (const item of row) {
    const iLen = (item.value / rowVal) * side
    worst = Math.max(worst, Math.max(rLen / Math.max(0.01, iLen), iLen / Math.max(0.01, rLen)))
  }
  return worst
}

const TREEMAP_W = 1100
const TREEMAP_H = 620
const SECTOR_LABEL_H = 18

function ResearchHeatmap({ data, metric }) {
  const { absMax, getValue, formatLabel } = useMemo(() => {
    if (metric === 'price') {
      const vals = data.map((d) => Math.abs(d.pctChange))
      return {
        absMax: Math.max(...vals, 1),
        getValue: (d) => d.pctChange,
        formatLabel: (v) => (v >= 0 ? '' : '') + v.toFixed(2),
      }
    }
    if (metric === 'sentiment') {
      return {
        absMax: 100,
        getValue: (d) => d.sentimentScore,
        formatLabel: (v) => (v > 0 ? 'Bull' : v < 0 ? 'Bear' : '—'),
      }
    }
    const vals = data.map((d) => d.messageVolumeNum)
    return {
      absMax: Math.max(...vals, 1),
      getValue: (d) => d.messageVolumeNum,
      formatLabel: (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(v)),
    }
  }, [data, metric])

  const tiles = useMemo(() => {
    // Group by sector
    const sectorMap = new Map()
    data.forEach((d) => {
      const s = d.sector || 'Other'
      if (!sectorMap.has(s)) sectorMap.set(s, [])
      sectorMap.get(s).push(d)
    })
    const sectors = Array.from(sectorMap.entries()).map(([name, items]) => ({
      name,
      items,
      value: items.reduce((s, d) => s + d.marketCapNum, 0),
    }))
    // Layout sectors in the full rect
    const sectorRects = squarifyLayout(
      sectors.map((s) => ({ id: s.name, value: s.value })),
      { x: 0, y: 0, w: TREEMAP_W, h: TREEMAP_H }
    )
    // For each sector, layout stocks inside (with space for label)
    const all = []
    sectorRects.forEach((sr) => {
      const sec = sectors.find((s) => s.name === sr.id)
      if (!sec) return
      all.push({ type: 'sector', name: sr.id, x: sr.x, y: sr.y, w: sr.w, h: sr.h })
      const innerRect = { x: sr.x + 1, y: sr.y + SECTOR_LABEL_H, w: sr.w - 2, h: sr.h - SECTOR_LABEL_H - 1 }
      if (innerRect.w <= 0 || innerRect.h <= 0) return
      const stockRects = squarifyLayout(
        sec.items.map((d) => ({ id: d.ticker, value: d.marketCapNum, data: d })),
        innerRect
      )
      stockRects.forEach((t) => {
        all.push({ type: 'stock', ...t })
      })
    })
    return all
  }, [data])

  return (
    <div className="overflow-x-auto">
      <div
        className="relative select-none"
        style={{ width: TREEMAP_W, height: TREEMAP_H, backgroundColor: '#111', borderRadius: 6, overflow: 'hidden' }}
      >
        {tiles.map((t) => {
          if (t.type === 'sector') {
            return (
              <div
                key={`sec-${t.name}`}
                className="absolute border border-[#333] overflow-hidden"
                style={{ left: t.x, top: t.y, width: t.w, height: t.h }}
              >
                <div
                  className="absolute top-0 left-0 right-0 flex items-center px-1.5 text-[11px] font-semibold text-white/80 truncate"
                  style={{ height: SECTOR_LABEL_H, backgroundColor: '#1a1a1a' }}
                >
                  {t.name}
                </div>
              </div>
            )
          }
          // Stock tile
          const d = t.data
          const value = getValue(d)
          const bg = getTreemapColor(metric, value, absMax)
          const area = t.w * t.h
          const showTicker = t.w > 30 && t.h > 20
          const showValue = t.w > 40 && t.h > 30
          const isLarge = t.w > 100 && t.h > 60
          const isMedium = t.w > 55 && t.h > 40
          return (
            <div
              key={`stk-${t.id}`}
              className="absolute overflow-hidden flex flex-col items-center justify-center text-center border border-[#222]"
              style={{
                left: t.x,
                top: t.y,
                width: t.w,
                height: t.h,
                backgroundColor: bg,
              }}
            >
              {showTicker && (
                <span
                  className="font-bold text-white leading-none truncate max-w-full px-0.5"
                  style={{
                    fontSize: isLarge ? 18 : isMedium ? 13 : 10,
                    textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                  }}
                >
                  {t.id}
                </span>
              )}
              {showValue && (
                <span
                  className="text-white/90 leading-none truncate max-w-full px-0.5"
                  style={{
                    fontSize: isLarge ? 16 : isMedium ? 11 : 9,
                    textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                    marginTop: 1,
                  }}
                >
                  {formatLabel(value)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Topics bubble map data — sourced from trending symbol topics on /home
const TOPICS_DATA = [
  // NVDA topics
  { id: 'datacenter', label: '🖥️ Data Center Demand', count: 52300, color: '#6366f1', symbols: ['NVDA', 'AMD', 'AVGO', 'MSFT', 'GOOGL'] },
  { id: 'blackwell', label: '🔮 Blackwell Ramp', count: 38100, color: '#8b5cf6', symbols: ['NVDA', 'AMD'] },
  { id: 'aicapex', label: '📈 AI Capex', count: 44600, color: '#06b6d4', symbols: ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN'] },
  { id: 'earningsbeat', label: '⚡ Earnings Beat', count: 35200, color: '#f59e0b', symbols: ['NVDA', 'AAPL', 'AMZN', 'TSLA', 'PLTR'] },
  // TSLA topics
  { id: 'merging', label: '🚀 Merging Ambitions', count: 28400, color: '#ef4444', symbols: ['TSLA'] },
  { id: 'robotaxi', label: '🤖 Robotaxi Dreams', count: 41200, color: '#22c55e', symbols: ['TSLA', 'NVDA', 'GOOGL'] },
  { id: 'semitruck', label: '🚚 Semi Truck Boost', count: 15800, color: '#84cc16', symbols: ['TSLA'] },
  { id: 'volatilerange', label: '📊 Volatile Range', count: 19600, color: '#fb923c', symbols: ['TSLA', 'GME', 'AMD'] },
  // AAPL topics
  { id: 'services', label: '📱 Services Growth', count: 22500, color: '#a855f7', symbols: ['AAPL', 'GOOGL', 'MSFT'] },
  { id: 'china', label: '🌏 China Sales', count: 18200, color: '#ec4899', symbols: ['AAPL', 'AMZN', 'TSLA'] },
  { id: 'capitalreturn', label: '💵 Capital Return', count: 14700, color: '#14b8a6', symbols: ['AAPL', 'MSFT', 'META', 'GOOGL'] },
  { id: 'ecosystem', label: '🔒 Ecosystem Lock-in', count: 12100, color: '#0ea5e9', symbols: ['AAPL'] },
  // AMD topics
  { id: 'mi300', label: '🔷 MI300 Adoption', count: 26800, color: '#3b82f6', symbols: ['AMD', 'NVDA'] },
  { id: 'dcshare', label: '🏢 Data Center Share', count: 20100, color: '#6d28d9', symbols: ['AMD', 'NVDA', 'AVGO', 'INTC'] },
  // AMZN topics
  { id: 'aws', label: '☁️ AWS Reacceleration', count: 31500, color: '#f97316', symbols: ['AMZN', 'MSFT', 'GOOGL'] },
  { id: 'advertising', label: '📢 Advertising', count: 16400, color: '#d946ef', symbols: ['AMZN', 'GOOGL', 'META'] },
  { id: 'retailmargins', label: '📦 Retail Margins', count: 13200, color: '#fbbf24', symbols: ['AMZN', 'WMT'] },
  { id: 'freecashflow', label: '💰 Free Cash Flow', count: 11800, color: '#10b981', symbols: ['AMZN', 'AAPL', 'MSFT'] },
]

function TopicsBubbleMap() {
  const [hoveredId, setHoveredId] = useState(null)
  const [addedAll, setAddedAll] = useState(new Set())
  const hideTimeout = useRef(null)
  const { addSymbol } = useWatchlist()

  const scheduleHide = () => {
    hideTimeout.current = setTimeout(() => setHoveredId(null), 350)
  }
  const cancelHide = () => {
    if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null }
  }
  const enterBubble = (id) => { cancelHide(); setHoveredId(id) }
  const leaveBubble = () => { scheduleHide() }
  const enterTooltip = () => { cancelHide() }
  const leaveTooltip = () => { scheduleHide() }

  const handleAddAll = (symbols, topicId) => {
    symbols.forEach((sym) => addSymbol(sym, sym))
    setAddedAll((prev) => new Set([...prev, topicId]))
  }

  const bubbles = useMemo(() => {
    const sorted = [...TOPICS_DATA].sort((a, b) => b.count - a.count)
    const maxCount = Math.max(...sorted.map((t) => t.count))
    const W = 1100
    const H = 600
    const GAP = 6
    const placed = []
    for (const topic of sorted) {
      const r = 30 + (topic.count / maxCount) * 80
      let bestX = W / 2
      let bestY = H / 2
      let found = false
      for (let angle = 0; angle < 800 && !found; angle += 0.2) {
        const spiral = 2 + angle * 1.4
        const cx = W / 2 + Math.cos(angle) * spiral
        const cy = H / 2 + Math.sin(angle) * spiral
        if (cx - r < 0 || cx + r > W || cy - r < 0 || cy + r > H) continue
        let overlaps = false
        for (const p of placed) {
          const dx = cx - p.cx
          const dy = cy - p.cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < r + p.r + GAP) { overlaps = true; break }
        }
        if (!overlaps) {
          bestX = cx
          bestY = cy
          found = true
        }
      }
      placed.push({ ...topic, cx: bestX, cy: bestY, r })
    }
    return placed
  }, [])

  const hovered = hoveredId ? bubbles.find((b) => b.id === hoveredId) : null

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">Most discussed topics across all symbols. Hover a bubble to see which tickers are talking about it.</p>
      <div className="relative overflow-x-auto">
        <svg
          viewBox="0 0 1100 600"
          className="w-full"
          style={{ minWidth: 700, maxHeight: 620, backgroundColor: '#111', borderRadius: 6 }}
        >
          <style>{`
            @keyframes bubbleBounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
          `}</style>
          {bubbles.map((b) => {
            const isHovered = hoveredId === b.id
            return (
              <g
                key={b.id}
                onMouseEnter={() => enterBubble(b.id)}
                onMouseLeave={leaveBubble}
                style={{
                  cursor: 'pointer',
                  transformOrigin: `${b.cx}px ${b.cy}px`,
                  animation: isHovered ? 'bubbleBounce 0.4s ease-in-out' : 'none',
                }}
              >
                <circle
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={b.color}
                  opacity={hoveredId && !isHovered ? 0.35 : 0.85}
                  stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                />
                {b.r > 35 && (
                  <text
                    x={b.cx}
                    y={b.cy - (b.r > 55 ? 6 : 2)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontWeight="700"
                    fontSize={b.r > 80 ? 14 : b.r > 55 ? 12 : 10}
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)', pointerEvents: 'none' }}
                  >
                    {b.label}
                  </text>
                )}
                {b.r > 45 && (
                  <text
                    x={b.cx}
                    y={b.cy + (b.r > 55 ? 14 : 10)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.7)"
                    fontSize={b.r > 80 ? 12 : 10}
                    style={{ pointerEvents: 'none' }}
                  >
                    {b.count >= 1000 ? `${(b.count / 1000).toFixed(1)}K posts` : `${b.count} posts`}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        {hovered && (
          <div
            className="absolute z-10 bg-surface border border-border rounded-lg shadow-xl p-3"
            style={{
              left: Math.min(hovered.cx, 900),
              top: Math.max(0, hovered.cy - hovered.r - 10),
              transform: 'translate(-50%, -100%)',
              minWidth: 200,
            }}
            onMouseEnter={enterTooltip}
            onMouseLeave={leaveTooltip}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: hovered.color }} />
              <span className="text-sm font-bold text-text">{hovered.label}</span>
            </div>
            <p className="text-xs text-text-muted mb-2">{hovered.count >= 1000 ? `${(hovered.count / 1000).toFixed(1)}K` : hovered.count} posts</p>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {hovered.symbols.map((sym) => (
                <a
                  key={sym}
                  href={`/symbol?t=${sym}`}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-surface-muted text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
                >
                  ${sym}
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddAll(hovered.symbols, hovered.id)}
              disabled={addedAll.has(hovered.id)}
              className={clsx(
                'w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                addedAll.has(hovered.id)
                  ? 'bg-surface-muted text-text-muted cursor-default'
                  : 'bg-black text-white hover:bg-gray-800'
              )}
            >
              {addedAll.has(hovered.id) ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Added to Watchlist
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add All to Watchlist
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Who to Follow data
const WHO_TO_FOLLOW = [
  // Influencer
  { handle: 'howardlindzon', displayName: 'Howard Lindzon', avatar: '/avatars/howard-lindzon.png', bio: 'Co-Founder & CEO @Stocktwits. Founder of Wallstrip (Acquired by CBS). Managing Partner of Social Leverage.', verified: true, followers: '376.2K', topTickers: ['TSLA', 'BTC', 'HOOD'], category: 'Influencer' },
  { handle: 'Steeletwits', displayName: 'Michele Steele', avatar: '/avatars/michele-steele.png', bio: 'Head of Content @Stocktwits. Former ESPN reporter. Market enthusiast covering the intersection of sports & finance.', verified: true, followers: '42.1K', topTickers: ['DKNG', 'ESPN', 'DIS'], category: 'Influencer' },
  { handle: 'FinanceBuzz', displayName: 'Finance Buzz', avatar: '/avatars/who-follow-3.png', bio: 'Breaking down complex market events into simple takes. 500K+ community across platforms.', verified: true, followers: '112.4K', topTickers: ['SPY', 'TSLA', 'AAPL'], category: 'Influencer' },
  { handle: 'MarketVibes', displayName: 'Market Vibes', avatar: '/avatars/who-follow-4.png', bio: 'Daily market recaps and pre-market analysis. Making Wall Street accessible for everyone.', verified: false, followers: '89.7K', topTickers: ['QQQ', 'NVDA', 'AMZN'], category: 'Influencer' },
  // Day Trader
  { handle: 'rosscameron', displayName: 'Ross Cameron', avatar: '/avatars/ross-cameron.png', bio: 'Founder @WarriorTrading. Day trading educator. $10M+ in verified profits. Sharing setups & lessons daily.', verified: true, followers: '128.5K', topTickers: ['SPY', 'AMD', 'NVDA'], category: 'Day Trader' },
  { handle: 'ScalpKing', displayName: 'Scalp King', avatar: '/avatars/top-voice-3.png', bio: 'ES and NQ futures scalper. 200+ trades/week. Sharing real-time entries in the chat.', verified: false, followers: '34.8K', topTickers: ['SPY', 'QQQ', 'ES'], category: 'Day Trader' },
  { handle: 'GapTrader', displayName: 'Gap Trader', avatar: '/avatars/who-follow-2.png', bio: 'Gap-and-go specialist. Small caps with volume. Pre-market scanner addict.', verified: false, followers: '19.2K', topTickers: ['AMC', 'GME', 'BBBY'], category: 'Day Trader' },
  { handle: 'LevelToLevel', displayName: 'Level to Level', avatar: '/avatars/who-follow-1.png', bio: 'Price action trader. No indicators, just levels. 8 years full-time.', verified: false, followers: '27.5K', topTickers: ['TSLA', 'AAPL', 'MSFT'], category: 'Day Trader' },
  // Analyst
  { handle: 'michaelbolling', displayName: 'Michael Bolling', avatar: '/avatars/michael-bolling.png', bio: 'VP of Content @Stocktwits. Covering markets, macro, and momentum. Formerly @FoxBusiness.', verified: true, followers: '85.3K', topTickers: ['AAPL', 'MSFT', 'QQQ'], category: 'Analyst' },
  { handle: 'EarningsEdge', displayName: 'Earnings Edge', avatar: '/avatars/top-voice-2.png', bio: 'Deep-dive earnings analysis. Breaking down 10-Ks so you don\'t have to. Former sell-side.', verified: false, followers: '38.1K', topTickers: ['AMZN', 'GOOGL', 'META'], category: 'Analyst' },
  { handle: 'StreetResearch', displayName: 'Street Research', avatar: '/avatars/who-follow-4.png', bio: 'Independent equity research. Institutional-quality analysis for retail traders.', verified: false, followers: '21.6K', topTickers: ['PLTR', 'SNOW', 'CRWD'], category: 'Analyst' },
  { handle: 'DataDrivenAlpha', displayName: 'Data Driven Alpha', avatar: '/avatars/ross-cameron.png', bio: 'Quantitative analysis meets fundamental research. Let the numbers tell the story.', verified: false, followers: '15.3K', topTickers: ['NVDA', 'AVGO', 'MRVL'], category: 'Analyst' },
  // Sector Expert
  { handle: 'AIBull', displayName: 'AI Bull', avatar: '/avatars/top-voice-1.png', bio: 'Full-time AI/semiconductor sector analyst. Long $NVDA since $12. Data center thesis > hype.', verified: false, followers: '18.7K', topTickers: ['NVDA', 'AMD', 'AVGO'], category: 'Sector Expert' },
  { handle: 'ChipWatcher', displayName: 'Chip Watcher', avatar: '/avatars/top-voice-3.png', bio: 'Semiconductor supply chain analyst. Tracking wafer starts, CoWoS, and AI chip demand globally.', verified: false, followers: '11.2K', topTickers: ['NVDA', 'TSM', 'ASML'], category: 'Sector Expert' },
  { handle: 'BiotechAlpha', displayName: 'Biotech Alpha', avatar: '/avatars/who-follow-3.png', bio: 'PhD in molecular biology. Translating clinical trial data into trade ideas since 2014.', verified: false, followers: '29.4K', topTickers: ['XBI', 'MRNA', 'LLY'], category: 'Sector Expert' },
  { handle: 'EnergyInsider', displayName: 'Energy Insider', avatar: '/avatars/michael-bolling.png', bio: 'Former oil & gas engineer turned full-time energy sector trader. Crude, nat gas, uranium.', verified: false, followers: '16.8K', topTickers: ['XLE', 'OXY', 'CCJ'], category: 'Sector Expert' },
  // Options Trader
  { handle: 'TechTrader', displayName: 'Tech Trader', avatar: '/avatars/top-voice-2.png', bio: 'Options flow & technicals on mega-cap tech. 15+ years in the game. Risk management first.', verified: false, followers: '24.3K', topTickers: ['AAPL', 'GOOGL', 'META'], category: 'Options Trader' },
  { handle: 'OptionsFlow', displayName: 'Options Flow', avatar: '/avatars/top-voice-1.png', bio: 'Real-time unusual options activity. Tracking smart money bets across 4,000+ names.', verified: false, followers: '67.1K', topTickers: ['SPY', 'QQQ', 'TSLA'], category: 'Options Trader' },
  { handle: 'ThetaGang', displayName: 'Theta Gang', avatar: '/avatars/who-follow-2.png', bio: 'Premium selling specialist. Wheel strategy, iron condors, and covered calls. Time decay is my edge.', verified: false, followers: '41.2K', topTickers: ['AAPL', 'MSFT', 'AMD'], category: 'Options Trader' },
  { handle: 'VolSurface', displayName: 'Vol Surface', avatar: '/avatars/michele-steele.png', bio: 'Volatility trader and former market maker. IV skew, term structure, and gamma scalping.', verified: false, followers: '13.7K', topTickers: ['VIX', 'SPX', 'UVXY'], category: 'Options Trader' },
  // Crypto
  { handle: 'CryptoKing', displayName: 'Crypto King', avatar: '/avatars/who-follow-1.png', bio: 'Full-time crypto trader since 2017. DeFi, Layer 1s, and macro. Not financial advice.', verified: false, followers: '52.8K', topTickers: ['BTC', 'ETH', 'SOL'], category: 'Crypto' },
  { handle: 'DeFiDegen', displayName: 'DeFi Degen', avatar: '/avatars/top-voice-3.png', bio: 'Yield farming, liquidity pools, and on-chain analysis. Finding alpha in DeFi since 2020.', verified: false, followers: '38.5K', topTickers: ['ETH', 'AAVE', 'UNI'], category: 'Crypto' },
  { handle: 'OnChainAlpha', displayName: 'On-Chain Alpha', avatar: '/avatars/who-follow-4.png', bio: 'Blockchain data analyst. Whale wallets, exchange flows, and network metrics.', verified: false, followers: '26.1K', topTickers: ['BTC', 'SOL', 'LINK'], category: 'Crypto' },
  { handle: 'AltSeason', displayName: 'Alt Season', avatar: '/avatars/howard-lindzon.png', bio: 'Altcoin specialist. Finding the next 10x before CT. Early in SOL, AVAX, and INJ.', verified: false, followers: '44.9K', topTickers: ['SOL', 'AVAX', 'SUI'], category: 'Crypto' },
  // Swing Trader
  { handle: 'MomentumKing', displayName: 'Momentum King', avatar: '/avatars/who-follow-2.png', bio: 'Swing trading momentum setups. Focus on relative strength and volume breakouts.', verified: false, followers: '31.6K', topTickers: ['TSLA', 'PLTR', 'MSTR'], category: 'Swing Trader' },
  { handle: 'SwingSetups', displayName: 'Swing Setups', avatar: '/avatars/top-voice-1.png', bio: 'Multi-day holds based on weekly charts and sector rotation. Patience > prediction.', verified: false, followers: '22.8K', topTickers: ['AMZN', 'NFLX', 'GOOGL'], category: 'Swing Trader' },
  { handle: 'TrendRider', displayName: 'Trend Rider', avatar: '/avatars/ross-cameron.png', bio: 'Riding trends until they bend. Moving averages and market structure. 12-year track record.', verified: false, followers: '19.5K', topTickers: ['SPY', 'NVDA', 'META'], category: 'Swing Trader' },
  { handle: 'BreakoutHunter', displayName: 'Breakout Hunter', avatar: '/avatars/who-follow-3.png', bio: 'Cup & handle, bull flags, and tight consolidations. Scanning for the next move daily.', verified: false, followers: '17.3K', topTickers: ['AMD', 'TSLA', 'COIN'], category: 'Swing Trader' },
  // Value Investor
  { handle: 'ValueHunter', displayName: 'Value Hunter', avatar: '/avatars/who-follow-3.png', bio: 'Deep value & contrarian plays. Buying what everyone else is selling. CFA charterholder.', verified: false, followers: '14.9K', topTickers: ['BRK.B', 'JPM', 'BAC'], category: 'Value Investor' },
  { handle: 'DividendKing', displayName: 'Dividend King', avatar: '/avatars/michael-bolling.png', bio: 'Building passive income one dividend at a time. 25-year DRIP portfolio. Yield + growth.', verified: false, followers: '33.7K', topTickers: ['O', 'JNJ', 'KO'], category: 'Value Investor' },
  { handle: 'BookValueBets', displayName: 'Book Value Bets', avatar: '/avatars/who-follow-4.png', bio: 'Graham and Dodd disciple. Margin of safety or no deal. Tracking insider buys weekly.', verified: false, followers: '11.4K', topTickers: ['BRK.B', 'FFH', 'MKL'], category: 'Value Investor' },
  { handle: 'FCFocus', displayName: 'Free Cash Flow Focus', avatar: '/avatars/top-voice-2.png', bio: 'Cash flow is king. Finding undervalued compounders with sustainable FCF yield.', verified: false, followers: '18.2K', topTickers: ['GOOGL', 'AAPL', 'MSFT'], category: 'Value Investor' },
  // Macro
  { handle: 'MacroMaven', displayName: 'Macro Maven', avatar: '/avatars/who-follow-4.png', bio: 'Global macro strategist. Bonds, currencies, commodities. Former institutional PM.', verified: false, followers: '22.4K', topTickers: ['GLD', 'TLT', 'DXY'], category: 'Macro' },
  { handle: 'FedWatcher', displayName: 'Fed Watcher', avatar: '/avatars/top-voice-2.png', bio: 'Tracking every Fed meeting, dot plot, and speech. Interest rate forecasting since 2010.', verified: false, followers: '35.6K', topTickers: ['TLT', 'SHY', 'SPY'], category: 'Macro' },
  { handle: 'GlobalFlows', displayName: 'Global Flows', avatar: '/avatars/who-follow-1.png', bio: 'Capital flows, EM vs DM, and currency dynamics. Connecting the dots across global markets.', verified: false, followers: '19.8K', topTickers: ['EEM', 'FXI', 'UUP'], category: 'Macro' },
  { handle: 'CommodityPulse', displayName: 'Commodity Pulse', avatar: '/avatars/ross-cameron.png', bio: 'Oil, gold, copper, and ags. Supply-demand fundamentals and geopolitical risk analysis.', verified: false, followers: '14.2K', topTickers: ['GLD', 'USO', 'COPX'], category: 'Macro' },
]

const WHO_TO_FOLLOW_CATEGORIES = ['All', 'Influencer', 'Day Trader', 'Analyst', 'Sector Expert', 'Options Trader', 'Crypto', 'Swing Trader', 'Value Investor', 'Macro']

function WhoToFollow() {
  const [followedHandles, setFollowedHandles] = useState(new Set())
  const [categoryFilter, setCategoryFilter] = useState('All')

  const toggleFollow = (handle) => {
    setFollowedHandles((prev) => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  const filtered = categoryFilter === 'All'
    ? WHO_TO_FOLLOW
    : WHO_TO_FOLLOW.filter((u) => u.category === categoryFilter)

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">Discover traders, analysts, and influencers to follow based on your interests.</p>
      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
        {WHO_TO_FOLLOW_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors border',
              categoryFilter === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-muted text-text border-border hover:bg-surface'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* User cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const isFollowing = followedHandles.has(user.handle)
          return (
            <div
              key={user.handle}
              className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <a href={`/profile/${user.handle}`} className="shrink-0">
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <a href={`/profile/${user.handle}`} className="font-semibold text-sm text-text hover:underline truncate">
                      {user.displayName}
                    </a>
                    {user.verified && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 shrink-0" aria-label="Verified">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">@{user.handle}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user.followers} followers</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(user.handle)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors',
                    isFollowing
                      ? 'border border-border bg-surface text-text hover:bg-danger/10 hover:border-danger hover:text-danger'
                      : 'bg-primary text-white hover:opacity-90'
                  )}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <p className="text-xs text-text leading-relaxed line-clamp-2">{user.bio}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">{user.category}</span>
                <span className="text-text-muted">·</span>
                <div className="flex items-center gap-1">
                  {user.topTickers.map((t) => (
                    <a
                      key={t}
                      href={`/symbol?t=${t}`}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-muted text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      {getTickerLogo(t) && <img src={getTickerLogo(t)} alt="" className="w-3 h-3 rounded object-cover" />}
                      ${t}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Sentiment Index chart data (mock 1M daily data from ~1/14 to 2/9)
const SENTIMENT_INDEX_DATA = {
  '1M': {
    dates: ['1/14','1/15','1/16','1/17','1/18','1/20','1/21','1/22','1/23','1/24','1/25','1/26','1/27','1/28','1/29','1/30','1/31','2/1','2/3','2/4','2/5','2/6','2/7','2/8','2/9'],
    sentiment: [1.02,1.0,1.01,1.05,1.08,1.1,1.12,1.14,1.18,1.28,1.32,1.28,1.24,1.18,1.15,1.2,1.18,1.12,1.08,1.05,1.02,1.08,1.12,1.14,1.18],
    spy: [0.52,0.48,0.45,0.5,0.54,0.58,0.62,0.65,0.68,0.72,0.74,0.76,0.78,0.8,0.82,0.84,0.86,0.88,0.85,0.87,0.9,0.92,0.94,0.96,0.98],
  },
  '3M': {
    dates: ['11/10','11/17','11/24','12/1','12/8','12/15','12/22','12/29','1/5','1/12','1/19','1/26','2/2','2/9'],
    sentiment: [0.85,0.92,0.98,1.05,1.1,0.95,0.88,0.92,1.0,1.08,1.15,1.28,1.12,1.18],
    spy: [0.42,0.48,0.52,0.58,0.62,0.56,0.5,0.54,0.6,0.68,0.74,0.82,0.88,0.98],
  },
  '6M': {
    dates: ['8/9','8/23','9/6','9/20','10/4','10/18','11/1','11/15','11/29','12/13','12/27','1/10','1/24','2/7'],
    sentiment: [1.15,1.08,0.92,0.85,0.78,0.82,0.9,0.95,1.02,1.08,0.95,1.05,1.28,1.16],
    spy: [0.8,0.75,0.65,0.58,0.52,0.55,0.6,0.65,0.7,0.72,0.68,0.78,0.88,0.96],
  },
  '1Y': {
    dates: ['2/9/25','4/9','6/9','8/9','10/9','12/9','2/9/26'],
    sentiment: [0.72,0.85,1.1,1.15,0.88,0.95,1.18],
    spy: [0.35,0.45,0.6,0.72,0.58,0.68,0.98],
  },
  'All': {
    dates: ['2022','Q2 22','Q3 22','Q4 22','2023','Q2 23','Q3 23','Q4 23','2024','Q2 24','Q3 24','Q4 24','2025','Q2 25','Q3 25','Q4 25','2026'],
    sentiment: [1.3,0.65,0.55,0.7,0.82,1.05,0.9,1.0,1.12,1.2,0.95,1.08,1.1,1.15,0.88,1.0,1.18],
    spy: [0.9,0.55,0.42,0.5,0.58,0.72,0.65,0.75,0.82,0.88,0.7,0.8,0.85,0.9,0.78,0.88,0.98],
  },
}

function SentimentIndexChart() {
  const [timeRange, setTimeRange] = useState('1M')
  const [showSpy, setShowSpy] = useState(true)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const data = SENTIMENT_INDEX_DATA[timeRange]
  const ranges = ['1M', '3M', '6M', '1Y', 'All']

  // Chart dimensions
  const W = 900
  const H = 400
  const PAD = { top: 30, right: 60, bottom: 50, left: 20 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  // Y axis: 0.3 to 1.5
  const yMin = 0.3
  const yMax = 1.5
  const yRange = yMax - yMin
  const yTicks = [0.3, 0.6, 0.9, 1.2, 1.5]

  const toX = (i) => PAD.left + (i / (data.dates.length - 1)) * chartW
  const toY = (v) => PAD.top + (1 - (v - yMin) / yRange) * chartH

  const sentimentPath = data.sentiment.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const spyPath = data.spy.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')

  // Baseline at 1.0
  const baselineY = toY(1.0)

  // Show ~8 date labels max
  const labelStep = Math.max(1, Math.floor(data.dates.length / 8))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Stocktwits Sentiment Index</h2>
        <button type="button" className="p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-muted transition-colors" aria-label="Info">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* SPY Price toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowSpy((v) => !v)}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            showSpy
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
              : 'border-border bg-surface text-text hover:bg-surface-muted'
          )}
        >
          <span className={clsx('w-2.5 h-2.5 rounded-full', showSpy ? 'bg-green-500' : 'bg-border')} />
          SPY Price
        </button>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ maxHeight: 420 }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              {tick === 1.0 ? (
                <line
                  x1={PAD.left} y1={toY(tick)} x2={W - PAD.right} y2={toY(tick)}
                  stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" className="text-text-muted" opacity="0.5"
                />
              ) : (
                <line
                  x1={PAD.left} y1={toY(tick)} x2={W - PAD.right} y2={toY(tick)}
                  stroke="currentColor" strokeWidth="0.5" className="text-border" opacity="0.4"
                />
              )}
              <text x={W - PAD.right + 10} y={toY(tick) + 4} fontSize="12" fill="currentColor" className="text-text-muted">
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X-axis date labels */}
          {data.dates.map((d, i) => {
            if (i % labelStep !== 0 && i !== data.dates.length - 1) return null
            return (
              <text key={i} x={toX(i)} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" className="text-text-muted">
                {d}
              </text>
            )
          })}

          {/* SPY line */}
          {showSpy && (
            <path d={spyPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Sentiment line */}
          <path d={sentimentPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover interaction zones */}
          {data.dates.map((_, i) => (
            <rect
              key={i}
              x={toX(i) - chartW / data.dates.length / 2}
              y={PAD.top}
              width={chartW / data.dates.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}

          {/* Hover crosshair + dots */}
          {hoveredIdx !== null && (
            <>
              <line
                x1={toX(hoveredIdx)} y1={PAD.top} x2={toX(hoveredIdx)} y2={PAD.top + chartH}
                stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" className="text-text-muted" opacity="0.4"
              />
              <circle cx={toX(hoveredIdx)} cy={toY(data.sentiment[hoveredIdx])} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
              {showSpy && (
                <circle cx={toX(hoveredIdx)} cy={toY(data.spy[hoveredIdx])} r="5" fill="#22c55e" stroke="white" strokeWidth="2" />
              )}
              {/* Tooltip */}
              <g>
                <rect
                  x={Math.min(toX(hoveredIdx) - 70, W - PAD.right - 150)}
                  y={PAD.top - 28}
                  width="150" height="24" rx="6"
                  fill="currentColor" className="text-surface" opacity="0.95"
                  stroke="currentColor" strokeWidth="0.5"
                />
                <text
                  x={Math.min(toX(hoveredIdx) - 70, W - PAD.right - 150) + 8}
                  y={PAD.top - 12}
                  fontSize="11" fontWeight="600" fill="currentColor" className="text-text"
                >
                  {data.dates[hoveredIdx]} — Sentiment: {data.sentiment[hoveredIdx].toFixed(2)}{showSpy ? ` · SPY: ${data.spy[hoveredIdx].toFixed(2)}` : ''}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Time range toggles */}
      <div className="flex items-center gap-1">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setTimeRange(r); setHoveredIdx(null) }}
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm font-semibold transition-colors',
              timeRange === r
                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                : 'text-text-muted hover:text-text hover:bg-surface-muted'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-red-500 rounded-full inline-block" />
          Sentiment Index
        </span>
        {showSpy && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-green-500 rounded-full inline-block" />
            SPY Price (normalized)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0 border-t border-dashed border-text-muted inline-block" />
          Baseline (1.0)
        </span>
      </div>
    </div>
  )
}

export default function Markets() {
  const { applyCustomTickers, clearCustomTickers, customTickers } = useTickerTape()
  const { getQuote } = useLiveQuotesContext()
  const { watchlist } = useWatchlist()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })
  const [activeSection, setActiveSection] = useState('socialScreener')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [assetFilter, setAssetFilter] = useState('All')
  const [activeSort, setActiveSort] = useState('trending')
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    priceMin: '',
    priceMax: '',
    volumeMin: '',
    volumeMax: '',
    marketCapMin: '',
    marketCapMax: '',
    watchersMin: '',
    watchersMax: '',
    followersMin: '',
    followersMax: '',
    sentimentScore: 0,
  })
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [showColumnsModal, setShowColumnsModal] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  const [columnsDraft, setColumnsDraft] = useState(null)
  const [heatmapMetric, setHeatmapMetric] = useState('price') // 'price' | 'sentiment' | 'messageVolume'

  const toggleColumn = (id) => {
    setVisibleColumns((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      if (prev.length >= MAX_COLUMNS) return prev
      return [...prev, id]
    })
  }

  const toggleColumnDraft = (id) => {
    setColumnsDraft((prev) => {
      if (!prev) return prev
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      if (prev.length >= MAX_COLUMNS) return prev
      return [...prev, id]
    })
  }

  useEffect(() => {
    if (showColumnsModal) setColumnsDraft([...visibleColumns])
    else setColumnsDraft(null)
  }, [showColumnsModal, visibleColumns])

  const reorderColumns = (draggedId, dropTargetId) => {
    if (draggedId === 'rank' || draggedId === 'symbol' || draggedId === 'watch' || dropTargetId === 'rank' || dropTargetId === 'symbol' || dropTargetId === 'watch') return
    const fixed = visibleColumns.filter((c) => c === 'rank' || c === 'symbol' || c === 'watch')
    const draggable = visibleColumns.filter((c) => c !== 'rank' && c !== 'symbol' && c !== 'watch')
    if (!draggable.includes(draggedId) || !draggable.includes(dropTargetId)) return
    const dragIdx = draggable.indexOf(draggedId)
    const dropIdx = draggable.indexOf(dropTargetId)
    const next = draggable.filter((c) => c !== draggedId)
    const adjustDrop = dragIdx < dropIdx ? dropIdx - 1 : dropIdx
    next.splice(adjustDrop, 0, draggedId)
    setVisibleColumns([...fixed, ...next])
  }

  const [dragOverCol, setDragOverCol] = useState(null)

  const sortedAndFilteredRows = useMemo(() => {
    const mergeQuote = (r) => {
      const q = getQuote(r.ticker)
      if (!q) return r
      return { ...r, price: q.price, pctChange: q.changePercent ?? r.pctChange, spark: q.spark?.length ? q.spark : r.spark }
    }
    let rows = SCREENER_ROWS_BASE.map(mergeQuote)
    if (assetFilter === 'Equities') rows = rows.filter((r) => r.type === 'equity')
    else if (assetFilter === 'Crypto') rows = rows.filter((r) => r.type === 'crypto')
    if (symbolFilter.trim()) {
      const q = symbolFilter.trim().toLowerCase()
      rows = rows.filter((r) => r.ticker.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      if (rows.length === 0) {
        const ticker = symbolFilter.trim().toUpperCase()
        rows = [{
          rank: 322,
          ticker,
          name: `${ticker} — located`,
          price: 98.50,
          pctChange: 1.25,
          volume: '45.20M',
          volumeNum: 45.2e6,
          watchers: '125.00K',
          watchersNum: 125000,
          followers: '98.50K',
          followersNum: 98500,
          sentiment: 'neutral',
          sentimentScore: 0,
          marketCap: '$412.00B',
          marketCapNum: 412e9,
          watched: false,
          type: 'equity',
          spark: [97, 97.5, 98, 98.2, 98.5, 98.3, 98.4, 98.5],
        }]
        return rows
      }
    }
    if (appliedFilters) {
      const f = appliedFilters
      if (f.priceMin !== '') rows = rows.filter((r) => r.price >= parseFloat(f.priceMin))
      if (f.priceMax !== '') rows = rows.filter((r) => r.price <= parseFloat(f.priceMax))
      if (f.volumeMin !== '') rows = rows.filter((r) => r.volumeNum >= parseNum(f.volumeMin))
      if (f.volumeMax !== '') rows = rows.filter((r) => r.volumeNum <= parseNum(f.volumeMax))
      if (f.marketCapMin !== '') rows = rows.filter((r) => r.marketCapNum >= parseNum(f.marketCapMin))
      if (f.marketCapMax !== '') rows = rows.filter((r) => r.marketCapNum <= parseNum(f.marketCapMax))
      if (f.watchersMin !== '') rows = rows.filter((r) => r.watchersNum >= parseNum(f.watchersMin))
      if (f.watchersMax !== '') rows = rows.filter((r) => r.watchersNum <= parseNum(f.watchersMax))
      if (f.followersMin !== '') rows = rows.filter((r) => r.followersNum >= parseNum(f.followersMin))
      if (f.followersMax !== '') rows = rows.filter((r) => r.followersNum <= parseNum(f.followersMax))
      if (f.sentimentScore !== undefined && f.sentimentScore !== 0) {
        rows = rows.filter((r) =>
          f.sentimentScore > 0 ? r.sentimentScore >= f.sentimentScore : r.sentimentScore <= f.sentimentScore
        )
      }
    }
    if (activeSort === 'mostActive') rows.sort((a, b) => b.volumeNum - a.volumeNum)
    else if (activeSort === 'watchers') rows.sort((a, b) => b.watchersNum - a.watchersNum)
    else if (activeSort === 'mostBullish') rows.sort((a, b) => b.sentimentScore - a.sentimentScore)
    else if (activeSort === 'mostBearish') rows.sort((a, b) => a.sentimentScore - b.sentimentScore)
    else if (activeSort === 'topGainers') rows.sort((a, b) => b.pctChange - a.pctChange)
    else if (activeSort === 'topLosers') rows.sort((a, b) => a.pctChange - b.pctChange)
    else rows.sort((a, b) => a.rank - b.rank)
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [getQuote, assetFilter, symbolFilter, appliedFilters, activeSort])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    if (!showFiltersModal) return
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowFiltersModal(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showFiltersModal])

  useEffect(() => {
    if (!showColumnsModal) return
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowColumnsModal(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showColumnsModal])

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="btn" aria-label="Open menu">☰</button>
        <div className="font-semibold">Markets</div>
        <div className="h-9 w-9" />
      </div>

      <LeftSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        watchlist={watchlist}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode((p) => !p)}
      />

      <main className="lg:pl-[300px]">
        <TopNavigation darkMode={darkMode} toggleDarkMode={() => setDarkMode((p) => !p)} />
        <TickerTape />

        <div className="max-w-[1400px] mx-auto px-4 py-4">
          {/* Section toggle: Social Screener | Research */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveSection('socialScreener')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'socialScreener' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Screener
            </button>
            <button
              onClick={() => setActiveSection('research')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'research' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Heatmaps
            </button>
            <button
              onClick={() => setActiveSection('topics')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'topics' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Topics
            </button>
            <button
              onClick={() => setActiveSection('whoToFollow')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'whoToFollow' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Who to Follow
            </button>
            <button
              onClick={() => setActiveSection('sentimentIndex')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                activeSection === 'sentimentIndex' ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface'
              )}
            >
              Sentiment Index
            </button>
          </div>

          {activeSection === 'socialScreener' && (
            <>
              {/* Sort toggles */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setActiveSort(opt.key)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                      activeSort === opt.key ? 'bg-primary/15 border-primary/50 text-primary' : 'bg-surface border-border text-text hover:bg-surface-muted'
                    )}
                  >
                    {opt.icon === 'trend' && (
                      <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      </svg>
                    )}
                    {opt.icon === 'eye' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                    {opt.icon === 'thumbUp' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    )}
                    {opt.icon === 'thumbDown' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                      </svg>
                    )}
                    {opt.icon === 'arrowUp' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                    {opt.icon === 'arrowDown' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Filters, Columns, Apply to Navigation */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnsModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Columns
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tickers = sortedAndFilteredRows.map((r) => ({ symbol: r.ticker, change: r.pctChange }))
                    applyCustomTickers(tickers)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Apply to Navigation
                </button>
                {customTickers && customTickers.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCustomTickers}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
                  >
                    Remove Custom
                  </button>
                )}
              </div>

              {/* Data table */}
              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {visibleColumns.map((colId) => {
                        const m = COLUMN_METRICS.find((c) => c.id === colId)
                        const isDraggable = colId !== 'rank' && colId !== 'symbol' && colId !== 'watch'
                        return m ? (
                          <th
                            key={colId}
                            className={clsx(
                              'text-left py-3 px-4 font-semibold text-text select-none',
                              isDraggable && 'cursor-grab active:cursor-grabbing',
                              isDraggable && dragOverCol === colId && 'bg-primary/10 ring-1 ring-primary/30 rounded'
                            )}
                            draggable={isDraggable}
                            onDragStart={(e) => {
                              if (!isDraggable) return
                              e.dataTransfer.setData('text/plain', colId)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            onDragOver={(e) => {
                              if (!isDraggable) return
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                              setDragOverCol(colId)
                            }}
                            onDragLeave={() => setDragOverCol(null)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setDragOverCol(null)
                              const draggedId = e.dataTransfer.getData('text/plain')
                              if (draggedId && draggedId !== colId) reorderColumns(draggedId, colId)
                            }}
                            onDragEnd={() => setDragOverCol(null)}
                          >
                            <span className="inline-flex items-center gap-1">
                              {colId === 'rank' && (
                                <>
                                  Rank
                                  <svg className="inline w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              )}
                              {colId !== 'rank' && m.label}
                              {isDraggable && (
                                <svg className="w-3.5 h-3.5 text-muted opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              )}
                            </span>
                          </th>
                        ) : null
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredRows.map((row) => (
                      <tr key={row.ticker} className="border-b border-border hover:bg-surface-muted/50 transition-colors">
                        {visibleColumns.map((colId) => {
                          if (colId === 'rank') return <td key={colId} className="py-3 px-4 text-muted">{row.rank}</td>
                          if (colId === 'symbol')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {getTickerLogo(row.ticker) ? (
                                    <img src={getTickerLogo(row.ticker)} alt="" className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-text">
                                      {row.ticker.slice(0, 1)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-text">{row.ticker}</div>
                                    <div className="text-xs text-muted">{row.name}</div>
                                  </div>
                                </div>
                              </td>
                            )
                          if (colId === 'chart')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <MiniSparkline values={row.spark} isUp={row.pctChange >= 0} />
                              </td>
                            )
                          if (colId === 'lastPrice')
                            return (
                              <td key={colId} className="py-3 px-4 font-medium text-text tabular-nums">
                                ${row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            )
                          if (colId === 'pctChange' || colId === '1hPct' || colId === '7dPct' || colId === '30dPct')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <span className={clsx('font-bold tabular-nums', row.pctChange >= 0 ? 'text-success' : 'text-danger')}>
                                  {row.pctChange >= 0 ? '↑' : '↓'}
                                  {Math.abs(row.pctChange)}%
                                </span>
                              </td>
                            )
                          if (colId === 'volume' || colId === 'volume7d' || colId === 'volume30d')
                            return (
                              <td key={colId} className="py-3 px-4 text-muted tabular-nums">
                                {row.volume}
                              </td>
                            )
                          if (colId === 'watchers') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">{row.watchers}</td>
                          if (colId === 'followers') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">{row.followers}</td>
                          if (colId === 'messageVolume') return <td key={colId} className="py-3 px-4 text-muted tabular-nums">—</td>
                          if (colId === 'sentiment')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <span
                                  className={clsx(
                                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    row.sentiment === 'bullish' && 'bg-success/15 text-success',
                                    row.sentiment === 'bearish' && 'bg-danger/15 text-danger',
                                    row.sentiment === 'neutral' && 'bg-surface-muted text-muted'
                                  )}
                                >
                                  {row.sentiment}
                                </span>
                              </td>
                            )
                          if (colId === 'marketCap' || colId === 'fullyDilutedMcap')
                            return (
                              <td key={colId} className="py-3 px-4 text-muted tabular-nums">
                                {row.marketCap}
                              </td>
                            )
                          if (colId === 'watch')
                            return (
                              <td key={colId} className="py-3 px-4">
                                <button className="p-1.5 rounded-full border border-border hover:bg-surface-muted transition-colors">
                                  {row.watched ? (
                                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <span className="text-lg font-bold text-muted">+</span>
                                  )}
                                </button>
                              </td>
                            )
                          return null
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === 'research' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-text mr-1">Heatmap by:</span>
                {[
                  { key: 'price', label: 'Price' },
                  { key: 'sentiment', label: 'Sentiment' },
                  { key: 'messageVolume', label: 'Message Volume' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setHeatmapMetric(opt.key)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      heatmapMetric === opt.key ? 'bg-primary text-white' : 'bg-surface-muted text-text hover:bg-surface border border-transparent',
                      heatmapMetric !== opt.key && 'border-border'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {heatmapMetric === 'sentiment' && (
                <div className="flex items-center gap-0 w-fit text-[10px]">
                  {[
                    { label: 'Extremely Bearish', value: -1 },
                    { label: 'Bearish', value: -0.5 },
                    { label: 'Neutral', value: 0 },
                    { label: 'Bullish', value: 0.5 },
                    { label: 'Extremely Bullish', value: 1 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1 px-2 py-1" style={{ backgroundColor: getTreemapColor('sentiment', s.value * 100, 100), color: '#fff', borderRadius: 0 }}>
                      <span className="whitespace-nowrap font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {heatmapMetric === 'messageVolume' && (
                <div className="flex items-center gap-0 w-fit text-[10px]">
                  {[
                    { label: 'Extremely Low', t: 0 },
                    { label: 'Low', t: 0.25 },
                    { label: 'Moderate', t: 0.5 },
                    { label: 'High', t: 0.75 },
                    { label: 'Extremely High', t: 1 },
                  ].map((s) => {
                    const r = Math.round(20 + 15 * s.t)
                    const g = Math.round(30 + 100 * s.t)
                    const b = Math.round(50 + 150 * s.t)
                    return (
                      <div key={s.label} className="flex items-center gap-1 px-2 py-1" style={{ backgroundColor: `rgb(${r},${g},${b})`, color: '#fff', borderRadius: 0 }}>
                        <span className="whitespace-nowrap font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <ResearchHeatmap data={HEATMAP_DATA} metric={heatmapMetric} />
            </div>
          )}

          {activeSection === 'topics' && (
            <TopicsBubbleMap />
          )}

          {activeSection === 'whoToFollow' && (
            <WhoToFollow />
          )}

          {activeSection === 'sentimentIndex' && (
            <SentimentIndexChart />
          )}
        </div>
      </main>

      {/* Advanced Filters modal */}
      {showFiltersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowFiltersModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="advanced-filters-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 id="advanced-filters-title" className="text-lg font-bold text-text">Advanced Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdvancedFilters({
                      priceMin: '',
                      priceMax: '',
                      volumeMin: '',
                      volumeMax: '',
                      marketCapMin: '',
                      marketCapMax: '',
                      watchersMin: '',
                      watchersMax: '',
                      followersMin: '',
                      followersMax: '',
                      sentimentScore: 0,
                    })
                  }}
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted hover:text-text"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.priceMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, priceMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.priceMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, priceMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Volume Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.volumeMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, volumeMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.volumeMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, volumeMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Market Cap Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.marketCapMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, marketCapMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.marketCapMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, marketCapMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Watchers Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.watchersMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, watchersMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.watchersMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, watchersMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Followers Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={advancedFilters.followersMin}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, followersMin: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="text"
                    value={advancedFilters.followersMax}
                    onChange={(e) => setAdvancedFilters((f) => ({ ...f, followersMax: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-text">Sentiment Score</label>
                  <span className="text-xs text-muted">-100 to 100</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={advancedFilters.sentimentScore}
                  onChange={(e) => setAdvancedFilters((f) => ({ ...f, sentimentScore: parseInt(e.target.value, 10) }))}
                  className="w-full h-2 rounded-full appearance-none bg-surface-muted accent-success"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ ...advancedFilters })
                  setShowFiltersModal(false)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-success text-white hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose Columns modal */}
      {showColumnsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowColumnsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="columns-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h2 id="columns-modal-title" className="text-lg font-bold text-text">
                Choose up to {(columnsDraft ?? visibleColumns).length}/{MAX_COLUMNS} metrics
              </h2>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted hover:text-text"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="px-4 py-2 text-sm text-muted">Add, delete and sort metrics just how you need it.</p>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {['Core', 'Stocktwits Data', 'Price', 'Price Change', 'Volume', 'Market Cap', 'Charts'].map((category) => {
                const items = COLUMN_METRICS.filter((m) => m.category === category)
                if (items.length === 0) return null
                return (
                  <div key={category}>
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map((m) => {
                        const draft = columnsDraft ?? visibleColumns
                        const isSelected = draft.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleColumnDraft(m.id)}
                            className={clsx(
                              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                              isSelected
                                ? 'bg-primary/15 border-primary/50 text-primary'
                                : 'bg-surface-muted border-border text-text hover:bg-surface'
                            )}
                          >
                            {m.label}
                            {isSelected && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleColumnDraft(m.id)
                                }}
                                className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/30"
                                aria-label={`Remove ${m.label}`}
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const draft = columnsDraft ?? visibleColumns
                  setVisibleColumns([...draft])
                  setShowColumnsModal(false)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
