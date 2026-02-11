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
