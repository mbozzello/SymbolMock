import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function GlobeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function LockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const PRIVATE_JOURNAL_MODAL_TEXT =
  'Posts will appear in your private journal on your user profile only you can see. Posts can not be made public later.'

const TRADING_TAGS = [
  'Long-term', 'Short-term', 'Swing trading', 'Day trading', 'Scalping', 'Position trading',
  'Technical', 'Fundamental', 'Momentum', 'Value investing', 'Growth', 'Dividend',
  'Options', 'Futures', 'Crypto', 'Forex', 'Macro', 'Earnings', 'IPO',
  'Breakout', 'Breakdown', 'Support', 'Resistance', 'Trend following', 'Mean reversion',
  'Small cap', 'Large cap', 'Sector rotation', 'Risk-on', 'Risk-off', 'Hedge',
]

const POST_ACTIONS = [
  { key: 'images', label: 'Images', color: '#dc2626' },
  { key: 'gifs', label: 'GIFs', color: '#7c3aed' },
  { key: 'polls', label: 'Polls', color: '#0d9488' },
  { key: 'emoji', label: 'Emoji', color: '#ea580c' },
  { key: 'chart', label: 'Chart', color: '#0891b2' },
  { key: 'predict', label: 'Predict', color: '#2563eb' },
  { key: 'reaction', label: 'Debate', color: '#16a34a' },
]

const FAKE_DRAFTS = [
  {
    id: 'd1',
    text: '26% odds still feels too high. My base case is one cut late in Q4 if labor cools further.',
    updated: 'Edited 8m ago',
  },
  {
    id: 'd2',
    text: '$TSLA watchers are diverging from price action again. Sentiment is cooling while volume stays elevated.',
    updated: 'Edited 42m ago',
  },
  {
    id: 'd3',
    text: 'If CPI comes in hot again, risk assets likely fade and rate-cut expectations reprice lower.',
    updated: 'Edited 2h ago',
  },
]

export default function MessagePostBox({ placeholder = "What're your thoughts on $TSLA?", onPost }) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showDraftsMenu, setShowDraftsMenu] = useState(false)
  const [visibility, setVisibility] = useState('everyone')
  const [showPrivateInfoModal, setShowPrivateInfoModal] = useState(false)
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [hasReaction, setHasReaction] = useState(false)
  const [showPoll, setShowPoll] = useState(false)
  const [pollChoices, setPollChoices] = useState(['', ''])
  const [pollLength, setPollLength] = useState({ days: 1, hours: 0, minutes: 0 })
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    d.setHours(16, 29, 0, 0)
    return {
      month: d.getMonth(),
      day: d.getDate(),
      year: d.getFullYear(),
      hour: 4,
      minute: 29,
      ampm: 'PM',
    }
  })
  const [isScheduled, setIsScheduled] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [shareToX, setShareToX] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [showChartModal, setShowChartModal] = useState(false)
  const [chartTool, setChartTool] = useState('free')
  const [chartStrokes, setChartStrokes] = useState([])
  const [currentStroke, setCurrentStroke] = useState([])
  const [chartTrendlines, setChartTrendlines] = useState([])
  const [trendlineStart, setTrendlineStart] = useState(null)
  const [trendlinePreview, setTrendlinePreview] = useState(null)
  const [chartTextLabels, setChartTextLabels] = useState([])
  const [chartIndicators, setChartIndicators] = useState([])
  const [chartSnapshotUrl, setChartSnapshotUrl] = useState(null)
  const [chartPriceSinceStamp, setChartPriceSinceStamp] = useState(null)
  const [stampDragging, setStampDragging] = useState(false)
  const stampDragStart = useRef({ clientX: 0, clientY: 0, stampX: 0, stampY: 0 })
  const chartCanvasRef = useRef(null)
  const chartContainerRef = useRef(null)
  const postBoxRef = useRef(null)
  const inputRef = useRef(null)
  const chartSize = { w: 560, h: 320 }
  const STAMP_PADDING = 50
  const PRICE_SINCE_LABEL = '$TSLA +3.52%'
  const PRICE_SINCE_TICKER = '$TSLA '
  const PRICE_SINCE_PCT = '+3.52%'
  const clampStamp = (x, y) => ({
    x: Math.max(STAMP_PADDING, Math.min(chartSize.w - STAMP_PADDING, x)),
    y: Math.max(14, Math.min(chartSize.h - 14, y)),
  })

  const POLL_CHOICE_MAX = 4
  const TAGS_MAX = 3
  const POLL_CHOICE_LIMIT = 25

  const hasInteracted =
    message.trim() !== '' ||
    visibility === 'private' ||
    showPredictionModal ||
    targetPrice !== '' ||
    targetDate !== '' ||
    hasReaction ||
    (showPoll && pollChoices.some((c) => c.trim())) ||
    isScheduled ||
    selectedTags.length > 0 ||
    chartSnapshotUrl ||
    showChartModal

  const isReadyToPost = hasInteracted

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < TAGS_MAX ? [...prev, tag] : prev
    )
  }

  const removeTag = (tag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const addPollChoice = () => {
    if (pollChoices.length < POLL_CHOICE_MAX) {
      setPollChoices((c) => [...c, ''])
    }
  }

  const removePollChoice = (index) => {
    if (pollChoices.length > 2) {
      setPollChoices((c) => c.filter((_, i) => i !== index))
    }
  }

  const setPollChoice = (index, value) => {
    if (value.length <= POLL_CHOICE_LIMIT) {
      setPollChoices((c) => {
        const next = [...c]
        next[index] = value
        return next
      })
    }
  }

  const scheduledDateToDate = () => {
    const h24 = scheduledDate.ampm === 'PM'
      ? (scheduledDate.hour === 12 ? 12 : scheduledDate.hour + 12)
      : (scheduledDate.hour === 12 ? 0 : scheduledDate.hour)
    return new Date(scheduledDate.year, scheduledDate.month, scheduledDate.day, h24, scheduledDate.minute, 0, 0)
  }

  const scheduledPreview = (() => {
    const d = scheduledDateToDate()
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  })()

  const handlePost = () => {
    const body = message.trim()
    if (body) {
      const poll = showPoll && pollChoices.some((c) => c.trim())
        ? {
            choices: pollChoices.filter((c) => c.trim()),
            length: pollLength,
          }
        : undefined
      const scheduledAt = isScheduled ? scheduledDateToDate().toISOString() : undefined
      const tags = selectedTags.length > 0 ? selectedTags : undefined
      onPost?.({ body, visibility, hasReaction, poll, scheduledAt, tags, chartSnapshotUrl: chartSnapshotUrl || undefined })
      setMessage('')
      setHasReaction(false)
      setIsScheduled(false)
      setSelectedTags([])
      setChartSnapshotUrl(null)
      if (showPoll) {
        setShowPoll(false)
        setPollChoices(['', ''])
        setPollLength({ days: 1, hours: 0, minutes: 0 })
      }
    }
  }

  const applyDraft = (draftText) => {
    setMessage(draftText)
    setShowDraftsMenu(false)
    setIsFocused(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  useEffect(() => {
    if (!showPrivateInfoModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowPrivateInfoModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showPrivateInfoModal])

  useEffect(() => {
    if (!showPredictionModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowPredictionModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showPredictionModal])

  useEffect(() => {
    if (!showScheduleModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowScheduleModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showScheduleModal])

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (postBoxRef.current && !postBoxRef.current.contains(e.target)) {
        setIsFocused(false)
        setShowDraftsMenu(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useEffect(() => {
    if (!showTagsModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowTagsModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showTagsModal])

  useEffect(() => {
    if (!showChartModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowChartModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showChartModal])

  useEffect(() => {
    if (!stampDragging || !chartContainerRef.current) return
    const el = chartContainerRef.current
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const start = stampDragStart.current
      const deltaX = ((e.clientX - start.clientX) / rect.width) * chartSize.w
      const deltaY = ((e.clientY - start.clientY) / rect.height) * chartSize.h
      const next = clampStamp(start.stampX + deltaX, start.stampY + deltaY)
      setChartPriceSinceStamp(next)
      stampDragStart.current = { clientX: e.clientX, clientY: e.clientY, stampX: next.x, stampY: next.y }
    }
    const onUp = () => setStampDragging(false)
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup', onUp, { capture: true })
    window.addEventListener('pointercancel', onUp, { capture: true })
    return () => {
      window.removeEventListener('pointermove', onMove, { capture: true })
      window.removeEventListener('pointerup', onUp, { capture: true })
      window.removeEventListener('pointercancel', onUp, { capture: true })
    }
  }, [stampDragging])

  useEffect(() => {
    if (!showChartModal || !chartCanvasRef.current) return
    const canvas = chartCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = chartSize
    ctx.clearRect(0, 0, w, h)
    const drawStrokes = (strokes) => {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      strokes.forEach((stroke) => {
        if (stroke.length < 2) return
        ctx.beginPath()
        ctx.moveTo(stroke[0].x, stroke[0].y)
        stroke.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
        ctx.stroke()
      })
    }
    drawStrokes(chartStrokes)
    drawStrokes(currentStroke.length ? [currentStroke] : [])
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.95)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    chartTrendlines.forEach(({ x1, y1, x2, y2 }) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })
    if (trendlineStart && trendlinePreview) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(trendlineStart.x, trendlineStart.y)
      ctx.lineTo(trendlinePreview.x, trendlinePreview.y)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 2
    chartTextLabels.forEach(({ x, y, text }) => {
      ctx.strokeText(text, x, y)
      ctx.fillText(text, x, y)
    })
    if (chartIndicators.length > 0) {
      const colors = { ma20: 'rgba(234, 179, 8, 0.9)', ma50: 'rgba(168, 85, 247, 0.9)' }
      chartIndicators.forEach((key) => {
        const color = colors[key] || 'rgba(100, 116, 139, 0.9)'
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.setLineDash([4, 2])
        ctx.beginPath()
        const pts = key === 'ma20' ? 8 : 6
        for (let j = 0; j <= pts; j++) {
          const t = j / pts
          const x = 40 + t * (w - 80)
          const y = h - 60 - (h - 100) * (0.3 + 0.5 * t + 0.1 * Math.sin(t * 8))
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
  }, [showChartModal, chartStrokes, currentStroke, chartTrendlines, chartTextLabels, chartIndicators, trendlineStart, trendlinePreview])

  useEffect(() => {
    if (!showDraftsMenu) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowDraftsMenu(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showDraftsMenu])

  const [sentiment, setSentiment] = useState(null)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS_IN_MONTH = (month, year) => new Date(year, month + 1, 0).getDate()
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear + 1, currentYear + 2]
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone

  const getChartCoords = (e) => {
    const canvas = chartCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const captureChartSnapshot = () => {
    const { w, h } = chartSize
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const temp = document.createElement('canvas')
      temp.width = w
      temp.height = h
      const ctx = temp.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)
      if (chartCanvasRef.current) ctx.drawImage(chartCanvasRef.current, 0, 0, w, h)
      if (chartPriceSinceStamp) {
        const sx = chartPriceSinceStamp.x
        const sy = chartPriceSinceStamp.y
        ctx.font = 'bold 14px system-ui, sans-serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        const tickerW = ctx.measureText(PRICE_SINCE_TICKER).width
        const pctW = ctx.measureText(PRICE_SINCE_PCT).width
        const totalW = tickerW + pctW
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 2
        ctx.strokeText(PRICE_SINCE_TICKER, sx - totalW / 2 + tickerW / 2, sy)
        ctx.fillText(PRICE_SINCE_TICKER, sx - totalW / 2 + tickerW / 2, sy)
        ctx.fillStyle = '#16a34a'
        ctx.strokeText(PRICE_SINCE_PCT, sx - totalW / 2 + tickerW + pctW / 2, sy)
        ctx.fillText(PRICE_SINCE_PCT, sx - totalW / 2 + tickerW + pctW / 2, sy)
      }
      const watermarkW = 130
      const watermarkH = 32
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fillRect(w - watermarkW - 8, 8, watermarkW, watermarkH)
      ctx.font = '600 14px system-ui, sans-serif'
      ctx.fillStyle = '#000000'
      ctx.fillText('Stocktwits', w - watermarkW, 29)
      setChartSnapshotUrl(temp.toDataURL('image/png'))
      setShowChartModal(false)
    }
    img.src = '/images/chart-draw.png'
  }

  const actionIcons = {
    chart: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 2 5-6" />
      </svg>
    ),
    predict: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <line x1="22" y1="2" x2="12" y2="12" />
        <path d="M22 2l-5.5 1.5L18 5z" fill="currentColor" stroke="none" />
        <line x1="22" y1="2" x2="16.5" y2="3.5" />
        <line x1="22" y1="2" x2="18" y2="5" />
      </svg>
    ),
    // Red picture frame with white mountains and sun
    images: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
        <path d="M2 20l6-8 4 4 4-6 6 8H2z" fill="white" fillOpacity="0.9" />
        <circle cx="18" cy="6" r="2.5" fill="white" />
      </svg>
    ),
    // Purple rounded square with "GIF" in white
    gifs: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">GIF</text>
      </svg>
    ),
    polls: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="4" y="14" width="4" height="6" rx="1" />
        <rect x="10" y="8" width="4" height="12" rx="1" />
        <rect x="16" y="11" width="4" height="9" rx="1" />
      </svg>
    ),
    // Calendar / schedule icon
    scheduler: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    // Orange outlined smiley (circle outline, dots for eyes, curve for mouth)
    emoji: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1.25" fill="currentColor" />
        <circle cx="15" cy="10" r="1.25" fill="currentColor" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
      </svg>
    ),
    // Label / tag icon
    marketTags: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    reaction: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11h2V6H3a1 1 0 00-1 1v3a1 1 0 001 1z" />
        <path d="M5 6l2.5-3a1 1 0 011.8.6V6h2.2a1 1 0 011 1.2l-.8 3.8H5V6z" />
        <path d="M21 13h-2v5h2a1 1 0 001-1v-3a1 1 0 00-1-1z" />
        <path d="M19 18l-2.5 3a1 1 0 01-1.8-.6V18h-2.2a1 1 0 01-1-1.2l.8-3.8H19v5z" />
      </svg>
    ),
  }

  return (
    <div ref={postBoxRef} className="px-0 py-4">
      <div
          className={clsx(
            'relative rounded-2xl bg-surface border-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] overflow-hidden transition-colors',
            sentiment === 'bullish' ? 'border-success' : sentiment === 'bearish' ? 'border-danger' : 'border-border'
          )}
        >
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <img
              src="/avatars/user-avatar.png"
              alt=""
              className="h-10 w-10 rounded-full flex-shrink-0 object-cover border border-border"
            />
            <div className="flex-1 min-w-0 flex flex-col">
              <div
                className={clsx(
                  'rounded-2xl transition-all relative',
                  isFocused ? 'bg-[#F5F5F7] dark:bg-surface-muted p-3' : ''
                )}
              >
                {isFocused && (
                  <div className="absolute top-2 right-2 z-20">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowDraftsMenu((v) => !v)}
                      className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                      aria-label="Open drafts"
                    >
                      Drafts
                    </button>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder={placeholder}
                  className={clsx(
                    'w-full border-0 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-0',
                    isFocused ? 'px-2 py-2 pr-24 bg-transparent' : 'px-4 py-3 rounded-full bg-[#F5F5F7] dark:bg-surface-muted focus:ring-2 focus:ring-primary/30'
                  )}
                />
                {isFocused && (
                  <div className="mt-2 pt-2 flex flex-wrap items-center gap-1.5 border-t border-border/50">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowTagsModal(true)}
                      className="flex items-center gap-1.5 text-sm font-medium shrink-0"
                      style={{ color: '#eab308' }}
                      aria-label="Tags"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span>Tags</span>
                    </button>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface dark:bg-surface-muted border border-border text-text"
                      >
                        {tag}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => removeTag(tag)}
                          className="p-0.5 -mr-0.5 rounded-full hover:bg-surface-muted dark:hover:bg-surface text-muted hover:text-text"
                          aria-label={`Remove ${tag}`}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isFocused && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setVisibility((v) => (v === 'everyone' ? 'private' : 'everyone'))}
                    className="flex items-center gap-2 text-sm font-medium text-left hover:opacity-90 transition-opacity"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {visibility === 'everyone' ? (
                      <GlobeIcon className="w-4 h-4 shrink-0" />
                    ) : (
                      <LockIcon className="w-4 h-4 shrink-0" />
                    )}
                    <span>{visibility === 'everyone' ? 'Everyone can see' : 'Private Journal'}</span>
                  </button>
                  {visibility === 'private' && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPrivateInfoModal(true)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current opacity-80 hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-label="About Private Journal"
                    >
                      <span className="text-[10px] font-bold leading-none">i</span>
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center justify-center w-7 h-7 rounded-full text-muted hover:text-text transition-colors"
                      aria-label="Schedule"
                      title="Schedule"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShareToX((v) => !v)}
                      className={clsx(
                        'flex items-center justify-center w-7 h-7 rounded-full border transition-all overflow-hidden',
                        shareToX
                          ? 'border-black'
                          : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-600 dark:text-gray-500 hover:border-gray-400 hover:text-gray-500'
                      )}
                      aria-label={shareToX ? 'Sharing to X (enabled)' : 'Share to X'}
                      title="Share to X"
                    >
                      {shareToX ? (
                        <img src="/icons/x-logo.png" alt="X" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {showPredictionModal && (
                <div className="mt-3 rounded-xl border border-border bg-surface-muted/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6" aria-hidden>
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                          <line x1="22" y1="2" x2="12" y2="12" />
                          <path d="M22 2l-5.5 1.5L18 5z" fill="currentColor" stroke="none" />
                          <line x1="22" y1="2" x2="16.5" y2="3.5" />
                          <line x1="22" y1="2" x2="18" y2="5" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-text">Create Price Prediction</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPredictionModal(false)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text"
                      aria-label="Close"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                  <div className="p-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-medium text-muted mb-1">Symbol</label>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-surface border border-border">
                        <span className="font-semibold text-xs text-text">PLTR</span>
                        <span className="text-xs text-text tabular-nums">$158.06</span>
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                          7.77%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-medium text-muted mb-1">Target Price</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder=""
                          className="w-full pl-5 pr-2.5 py-2 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-medium text-muted mb-1">Good Till</label>
                      <select
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-no-repeat bg-[length:10px] bg-[right_10px_center]"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                      >
                        <option value="">Select</option>
                        <option value="1d">1 Day</option>
                        <option value="1w">1 Week</option>
                        <option value="custom">Custom</option>
                      </select>
                      <p className="mt-0.5 text-[10px] text-muted">at Market Close</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-medium text-muted mb-1">Stop Loss (optional)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder=""
                          className="w-full pl-5 pr-2.5 py-2 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex justify-end">
                    <p className="inline-flex items-center gap-1 text-[10px] italic text-muted">
                      Prediction can be closed at anytime
                      <button
                        type="button"
                        className="w-4 h-4 rounded-full flex items-center justify-center border border-current opacity-80 hover:opacity-100"
                        aria-label="More info"
                      >
                        <span className="text-[8px] font-bold leading-none">i</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
              {chartSnapshotUrl && (
                <div className="mt-3 relative inline-block rounded-xl overflow-hidden border border-border max-w-full">
                  <img src={chartSnapshotUrl} alt="Chart snapshot" className="block max-w-full h-auto max-h-64 object-contain" />
                  <button
                    type="button"
                    onClick={() => setChartSnapshotUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                    aria-label="Remove chart"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              )}
              {hasReaction && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
                    ⚖️ Users can debate this message
                  </span>
                  <button type="button" onClick={() => setHasReaction(false)} className="p-0.5 rounded-full hover:bg-surface-muted text-muted hover:text-text" aria-label="Remove debate">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )}
              {isScheduled && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                    📅 Scheduled for {scheduledPreview}
                  </span>
                  <button type="button" onClick={() => setIsScheduled(false)} className="p-0.5 rounded-full hover:bg-surface-muted text-muted hover:text-text" aria-label="Remove schedule">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )}
              {showPoll && (
                <div className="mt-3 rounded-xl border border-border bg-surface-muted/50 overflow-hidden">
                  <div className="p-3 flex flex-col gap-3">
                    {pollChoices.map((choice, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg border border-dashed border-border flex items-center justify-center shrink-0 text-muted/60">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 16l5-5 4 4 5-6 4 4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => setPollChoice(i, e.target.value)}
                          placeholder={`Choice ${i + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-muted shrink-0 tabular-nums w-12 text-right">{choice.length} / {POLL_CHOICE_LIMIT}</span>
                        {pollChoices.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removePollChoice(i)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text shrink-0"
                            aria-label={`Remove choice ${i + 1}`}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        {i === pollChoices.length - 1 && pollChoices.length < POLL_CHOICE_MAX && (
                          <button
                            type="button"
                            onClick={addPollChoice}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-primary hover:bg-primary/10"
                            aria-label="Add choice"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <div>
                      <div className="text-[10px] font-medium text-muted mb-1.5">Poll length</div>
                      <div className="flex gap-2">
                        <select
                          value={pollLength.days}
                          onChange={(e) => setPollLength((p) => ({ ...p, days: +e.target.value }))}
                          className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-no-repeat bg-[length:10px] bg-[right_8px_center]"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>{d}d</option>
                          ))}
                        </select>
                        <select
                          value={pollLength.hours}
                          onChange={(e) => setPollLength((p) => ({ ...p, hours: +e.target.value }))}
                          className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-no-repeat bg-[length:10px] bg-[right_8px_center]"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => (
                            <option key={h} value={h}>{h}h</option>
                          ))}
                        </select>
                        <select
                          value={pollLength.minutes}
                          onChange={(e) => setPollLength((p) => ({ ...p, minutes: +e.target.value }))}
                          className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-no-repeat bg-[length:10px] bg-[right_8px_center]"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                        >
                          {[0, 5, 10, 15, 20, 25, 30, 45, 60].map((m) => (
                            <option key={m} value={m}>{m}m</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowPoll(false); setPollChoices(['', '']); setPollLength({ days: 1, hours: 0, minutes: 0 }) }}
                      className="text-sm font-medium text-danger hover:underline"
                    >
                      Remove poll
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-nowrap">
            <div className="flex rounded-full bg-[#F2F2F2] dark:bg-surface-muted border border-border overflow-hidden shrink-0" role="group" aria-label="Sentiment">
              <button
                type="button"
                onClick={() => setSentiment('bullish')}
                className={clsx('px-3 py-1.5 text-xs font-medium transition-colors', sentiment === 'bullish' ? 'bg-success/15 text-success' : 'text-success hover:bg-surface')}
              >
                Bullish
              </button>
              <div className="w-px bg-border shrink-0" aria-hidden />
              <button
                type="button"
                onClick={() => setSentiment('bearish')}
                className={clsx('px-3 py-1.5 text-xs font-medium transition-colors', sentiment === 'bearish' ? 'bg-danger/15 text-danger' : 'text-danger hover:bg-surface')}
              >
                Bearish
              </button>
            </div>
            {POST_ACTIONS.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={
                  action.key === 'predict'
                    ? () => setShowPredictionModal((v) => !v)
                    : action.key === 'reaction'
                    ? () => setHasReaction((v) => !v)
                    : action.key === 'polls'
                    ? () => setShowPoll((v) => !v)
                    : action.key === 'chart'
                    ? () => setShowChartModal(true)
                    : action.key === 'scheduler'
                    ? () => setShowScheduleModal(true)
                    : undefined
                }
                className="group flex items-center gap-1.5 text-sm font-medium text-text hover:opacity-80 transition-all shrink-0"
                style={{ color: action.color }}
                aria-label={action.label}
              >
                {actionIcons[action.key]}
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">{action.label}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePost}
                className={clsx(
                  'px-6 py-2.5 rounded-full text-sm font-bold transition-colors min-w-[70px] border-0 focus:outline-none focus:ring-0',
                  isReadyToPost
                    ? 'bg-black text-white hover:opacity-90'
                    : 'bg-[#E5E5E5] text-white dark:bg-surface-muted dark:text-white'
                )}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDraftsMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDraftsMenu(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Saved drafts"
        >
          <div
            className="w-full max-w-[420px] rounded-xl border border-border bg-white dark:bg-surface shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Saved Drafts
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowDraftsMenu(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
                aria-label="Close drafts"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {FAKE_DRAFTS.map((draft) => (
                <button
                  key={draft.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyDraft(draft.text)}
                  className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
                >
                  <p className="text-sm text-text line-clamp-2">{draft.text}</p>
                  <p className="text-xs text-text-muted mt-1">{draft.updated}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrivateInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPrivateInfoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="private-journal-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-sm w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="private-journal-modal-title" className="text-sm text-text leading-snug">
              {PRIVATE_JOURNAL_MODAL_TEXT}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivateInfoModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-primary text-white hover:opacity-90 transition-opacity"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showChartModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowChartModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chart-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 id="chart-modal-title" className="text-base font-bold text-text">Draw on chart</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setChartStrokes([]); setCurrentStroke([]); setChartTrendlines([]); setChartTextLabels([]); setChartPriceSinceStamp(null); setTrendlineStart(null) }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-surface-muted"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={captureChartSnapshot}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setShowChartModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
            <div className="px-4 pb-2 flex flex-wrap items-center gap-2 border-b border-border">
              <span className="text-xs font-medium text-muted mr-1">Tools:</span>
              <button
                type="button"
                onClick={() => setChartTool('free')}
                className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors', chartTool === 'free' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted')}
                title="Free draw"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
                Free draw
              </button>
              <button
                type="button"
                onClick={() => { setChartTool('trendline'); setTrendlineStart(null) }}
                className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors', chartTool === 'trendline' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted')}
                title="Trendline"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19L19 5M5 5l14 14" /></svg>
                Trendline
              </button>
              <button
                type="button"
                onClick={() => setChartTool('text')}
                className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors', chartTool === 'text' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted')}
                title="Text"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                Text
              </button>
              <button
                type="button"
                onClick={() => { if (chartPriceSinceStamp == null) setChartPriceSinceStamp({ x: chartSize.w / 2 - 45, y: chartSize.h / 2 - 10 }) }}
                className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors', chartPriceSinceStamp ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted')}
                title="Price Since"
              >
                Price Since
              </button>
              <span className="text-xs font-medium text-muted mx-1">Indicators:</span>
              {['ma20', 'ma50'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChartIndicators((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])}
                  className={clsx('px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors', chartIndicators.includes(key) ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted')}
                >
                  MA {key === 'ma20' ? '20' : '50'}
                </button>
              ))}
            </div>
            <div className="p-4">
              <div
                ref={chartContainerRef}
                className="relative rounded-lg overflow-hidden border border-border bg-surface-muted mx-auto"
                style={{ width: '100%', maxWidth: chartSize.w, aspectRatio: `${chartSize.w} / ${chartSize.h}` }}
              >
                <img
                  src="/images/chart-draw.png"
                  alt="Stock chart"
                  className="block w-full h-full absolute inset-0 object-cover"
                />
                <div
                  className="absolute top-0 left-0 right-0 h-[10%] min-h-[28px] bg-white pointer-events-none dark:bg-surface"
                  style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
                  aria-hidden
                />
                <canvas
                  ref={chartCanvasRef}
                  width={chartSize.w}
                  height={chartSize.h}
                  className="absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => {
                    const p = getChartCoords(e)
                    if (!p) return
                    if (chartTool === 'free') setCurrentStroke([p])
                    if (chartTool === 'trendline') {
                      if (trendlineStart) {
                        setChartTrendlines((prev) => [...prev, { x1: trendlineStart.x, y1: trendlineStart.y, x2: p.x, y2: p.y }])
                        setTrendlineStart(null)
                      } else setTrendlineStart(p)
                    }
                    if (chartTool === 'text') {
                      const text = window.prompt('Enter text label:', '')
                      if (text != null && text.trim()) setChartTextLabels((prev) => [...prev, { x: p.x, y: p.y, text: text.trim() }])
                    }
                  }}
                  onPointerMove={(e) => {
                    const p = getChartCoords(e)
                    if (chartTool === 'trendline' && trendlineStart && p) setTrendlinePreview(p)
                    if (chartTool === 'free' && currentStroke.length > 0 && p) setCurrentStroke((prev) => [...prev, p])
                  }}
                  onPointerUp={() => {
                    if (chartTool === 'free' && currentStroke.length > 0) {
                      setChartStrokes((prev) => [...prev, currentStroke])
                      setCurrentStroke([])
                    }
                  }}
                  onPointerLeave={() => {
                    if (chartTool === 'free' && currentStroke.length > 0) {
                      setChartStrokes((prev) => [...prev, currentStroke])
                      setCurrentStroke([])
                    }
                    if (chartTool === 'trendline') setTrendlinePreview(null)
                  }}
                />
                {chartPriceSinceStamp && (
                  <div
                    className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                    style={{
                      left: `${(chartPriceSinceStamp.x / chartSize.w) * 100}%`,
                      top: `${(chartPriceSinceStamp.y / chartSize.h) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setStampDragging(true)
                      stampDragStart.current = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        stampX: chartPriceSinceStamp.x,
                        stampY: chartPriceSinceStamp.y,
                      }
                    }}
                    role="button"
                    aria-label="Drag to move Price Since stamp"
                  >
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/95 shadow border border-black/10 text-sm font-semibold whitespace-nowrap dark:bg-surface dark:border-border">
                      <span className="text-gray-900 dark:text-text">{PRICE_SINCE_TICKER}</span>
                      <span className="text-green-600">{PRICE_SINCE_PCT}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowScheduleModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-muted hover:text-text"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <h2 id="schedule-modal-title" className="text-lg font-bold text-text">Schedule</h2>
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(true)
                  setShowScheduleModal(false)
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-black text-white hover:opacity-90"
              >
                Confirm
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-text">
                <svg className="w-5 h-5 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" />
                </svg>
                <span>Will send on {scheduledPreview}</span>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1.5">Date</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={scheduledDate.month}
                    onChange={(e) => {
                      const m = +e.target.value
                      setScheduledDate((s) => {
                        const maxDay = DAYS_IN_MONTH(m, s.year)
                        return { ...s, month: m, day: Math.min(s.day, maxDay) }
                      })
                    }}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    {MONTHS.map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>
                  <select
                    value={scheduledDate.day}
                    onChange={(e) => setScheduledDate((s) => ({ ...s, day: +e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    {Array.from({ length: DAYS_IN_MONTH(scheduledDate.month, scheduledDate.year) }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={scheduledDate.year}
                    onChange={(e) => {
                      const y = +e.target.value
                      setScheduledDate((s) => {
                        const maxDay = DAYS_IN_MONTH(s.month, y)
                        return { ...s, year: y, day: Math.min(s.day, maxDay) }
                      })
                    }}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center shrink-0 text-muted">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1.5">Time</label>
                <div className="flex gap-2">
                  <select
                    value={scheduledDate.hour}
                    onChange={(e) => setScheduledDate((s) => ({ ...s, hour: +e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={scheduledDate.minute}
                    onChange={(e) => setScheduledDate((s) => ({ ...s, minute: +e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select
                    value={scheduledDate.ampm}
                    onChange={(e) => setScheduledDate((s) => ({ ...s, ampm: e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-lg bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa9b2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Time zone</label>
                <p className="text-sm font-semibold text-text">{timeZoneName}</p>
              </div>
              <Link
                to="/scheduled"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setShowScheduleModal(false)}
              >
                Scheduled posts
              </Link>
            </div>
          </div>
        </div>
      )}

      {showTagsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowTagsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-tags-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h2 id="add-tags-modal-title" className="text-lg font-bold text-text">Add tags</h2>
              <span className="text-sm text-muted">{selectedTags.length}/{TAGS_MAX} selected</span>
            </div>
            <p className="px-4 pt-2 text-sm text-muted">Choose up to 3 trading tags for your post.</p>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRADING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={clsx(
                      'px-3 py-2 rounded-full text-sm font-medium border transition-colors text-left',
                      selectedTags.includes(tag)
                        ? 'bg-primary/15 border-primary/50 text-primary'
                        : 'bg-surface border-border text-text hover:bg-surface-muted'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowTagsModal(false)}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-black text-white hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
