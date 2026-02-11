import { useState, useEffect } from 'react'
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
  { key: 'predict', label: 'Predict', color: '#2563eb' },
  { key: 'marketTags', label: 'Tags', color: '#eab308' },
  { key: 'reaction', label: 'Debate', color: '#16a34a' },
]

export default function MessagePostBox({ placeholder = "What're your thoughts on $TSLA?", onPost }) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
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
  const [selectedTags, setSelectedTags] = useState([])

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
    selectedTags.length > 0

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
      onPost?.({ body, visibility, hasReaction, poll, scheduledAt, tags })
      setMessage('')
      setHasReaction(false)
      setIsScheduled(false)
      setSelectedTags([])
      if (showPoll) {
        setShowPoll(false)
        setPollChoices(['', ''])
        setPollLength({ days: 1, hours: 0, minutes: 0 })
      }
    }
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
    if (!showTagsModal) return
    const onEsc = (e) => { if (e.key === 'Escape') setShowTagsModal(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showTagsModal])

  const [sentiment, setSentiment] = useState(null)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS_IN_MONTH = (month, year) => new Date(year, month + 1, 0).getDate()
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear + 1, currentYear + 2]
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone

  const actionIcons = {
    // Bullseye target (concentric circles)
    predict: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
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
    reaction: <span className="text-lg leading-none" aria-hidden>⚖️</span>,
  }

  return (
    <div className="px-0 py-4">
      <div
          className={clsx(
            'rounded-2xl bg-surface border-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] overflow-hidden transition-colors',
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
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-full bg-[#F5F5F7] dark:bg-surface-muted border-0 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
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
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowScheduleModal(true)}
                    className="ml-auto flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity shrink-0"
                    style={{ color: '#c2410c' }}
                    aria-label="Schedule"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Schedule</span>
                  </button>
                </div>
              )}
              {showPredictionModal && (
                <div className="mt-3 rounded-xl border border-border bg-surface-muted/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15" style={{ color: 'var(--color-primary)' }} aria-hidden>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="7" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
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
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted border border-border text-text"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="p-0.5 -mr-0.5 rounded-full hover:bg-surface text-muted hover:text-text"
                        aria-label={`Remove ${tag}`}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </span>
                  ))}
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
                    : action.key === 'scheduler'
                    ? () => setShowScheduleModal(true)
                    : action.key === 'marketTags'
                    ? () => setShowTagsModal(true)
                    : undefined
                }
                className="flex items-center gap-1.5 text-sm font-medium text-text hover:opacity-80 transition-opacity shrink-0"
                style={{ color: action.color }}
                aria-label={action.label}
              >
                {actionIcons[action.key]}
                {(action.key === 'predict' || action.key === 'marketTags' || action.key === 'reaction') && <span>{action.label}</span>}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <div className="flex rounded-full bg-[#F2F2F2] dark:bg-surface-muted border border-border overflow-hidden" role="group" aria-label="Sentiment">
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
              <button
                type="button"
                onClick={handlePost}
                className={clsx(
                  'px-6 py-2.5 rounded-full text-sm font-bold transition-colors min-w-[88px] border-0 focus:outline-none focus:ring-0',
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
