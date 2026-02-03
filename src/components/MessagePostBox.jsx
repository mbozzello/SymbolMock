import { useState, useEffect } from 'react'

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

const POST_ACTIONS = [
  { key: 'images', label: 'Images', color: '#dc2626' },
  { key: 'video', label: 'Video', color: '#16a34a' },
  { key: 'gifs', label: 'GIFs', color: '#7c3aed' },
  { key: 'polls', label: 'Polls', color: '#0d9488' },
  { key: 'scheduler', label: 'Schedule', color: '#c2410c' },
  { key: 'emoji', label: 'Emoji', color: '#ea580c' },
  { key: 'predict', label: 'Predict', color: '#2563eb' },
  { key: 'marketTags', label: 'Tags', color: '#eab308' },
]

export default function MessagePostBox({ placeholder = "What're your thoughts on $TSLA?" }) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [visibility, setVisibility] = useState('everyone')
  const [showPrivateInfoModal, setShowPrivateInfoModal] = useState(false)
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const hasInteracted =
    message.trim() !== '' ||
    visibility === 'private' ||
    showPredictionModal ||
    targetPrice !== '' ||
    targetDate !== ''

  const isReadyToPost = isFocused && hasInteracted

  const handlePost = () => {
    if (message.trim()) {
      console.log('Posting:', { message, visibility })
      setMessage('')
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

  const [sentiment, setSentiment] = useState('bullish')

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
    // Green circle with white play triangle
    video: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M10 8l6 4-6 4V8z" fill="white" />
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
  }

  return (
    <div className="p-4">
      <div className="rounded-2xl bg-surface border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] overflow-hidden">
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
                      <label className="block text-[10px] font-medium text-muted mb-1">Target Date</label>
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
                onClick={action.key === 'predict' ? () => setShowPredictionModal((v) => !v) : undefined}
                className="flex items-center gap-1.5 text-sm font-medium text-text hover:opacity-80 transition-opacity shrink-0"
                style={{ color: action.color }}
                aria-label={action.label}
              >
                {actionIcons[action.key]}
                {(action.key === 'predict' || action.key === 'marketTags') && <span>{action.label}</span>}
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

    </div>
  )
}
