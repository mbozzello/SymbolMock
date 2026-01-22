import React, { useEffect, useMemo, useRef, useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function PredictionCreatorModal({ open, onClose, defaultTicker = 'RKLB' }) {
  const [message, setMessage] = useState('')
  const [symbol, setSymbol] = useState(`$${defaultTicker}`)
  const [sentiment, setSentiment] = useState('Bullish') // 'Bullish' | 'Bearish'
  const [horizon, setHorizon] = useState('1D') // '1D' | '1W'
  const [customDate, setCustomDate] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showExplainer, setShowExplainer] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const rulesRef = useRef(null)

  // First-time explainer
  useEffect(() => {
    if (!open) return
    try {
      const seen = localStorage.getItem('hasSeenPredictionExplainer') === 'true'
      if (!seen) setShowExplainer(true)
    } catch {
      // localStorage may not be available
    }
  }, [open])

  const canPost = useMemo(() => {
    const hasMessage = message.trim().length > 0
    if (!hasMessage) return false
    if (showCustom) {
      const price = Number(customPrice)
      return Boolean(customDate) && !Number.isNaN(price) && price > 0
    }
    return true
  }, [message, showCustom, customDate, customPrice])

  useEffect(() => {
    function onEsc(e) {
      if (e.key === 'Escape' && open) onClose?.()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  useEffect(() => {
    function onClickAway(e) {
      if (!showRules) return
      if (rulesRef.current && !rulesRef.current.contains(e.target)) {
        setShowRules(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [showRules])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="card-surface w-full max-w-lg overflow-hidden">
          {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Make a Prediction</h3>
              <button
                type="button"
                className="rounded-md p-1 hover:bg-surface-muted"
                aria-label="Show prediction rules"
                onClick={() => setShowRules((v) => !v)}
              >
                <span className="text-sm font-bold text-text">Rules</span>
              </button>
              {showRules && (
                <div ref={rulesRef} className="absolute z-50 mt-10 w-80 rounded-lg border border-border-strong bg-surface p-3 text-sm shadow-xl">
                  <div className="font-semibold">Rules & Tips</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 muted">
                    <li>Pick a direction: Bullish expects higher price; Bearish expects lower.</li>
                    <li>Only 1D/1W predictions count towards streak.</li>
                    <li>Custom targets are allowed but do not count towards streak.</li>
                    <li>Predictions are visible to the community once posted.</li>
                  </ul>
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-surface-muted" aria-label="Close">
              ✕
            </button>
          </div>

          {/* First-time explainer */}
            {showExplainer && (
            <div className="mx-4 mt-3 rounded-lg border border-border bg-surface-muted p-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Welcome to Prediction Creator</div>
                  <div className="muted">
                    Make a directional call on {`$${defaultTicker}`} for a 1 day or 1 week horizon. Only 1D/1W predictions
                    count towards streak. Custom target dates are supported but do not count towards streak.
                  </div>
                </div>
                <button
                  className="rounded-md px-2 py-1 text-xs hover:bg-surface"
                  onClick={() => {
                    setShowExplainer(false)
                    try { 
                      localStorage.setItem('hasSeenPredictionExplainer', 'true')
                    } catch {
                      // localStorage may not be available
                    }
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-4">
            {/* Message composer */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share an idea (use $ before ticker: eg $SYMBL)"
              className="w-full resize-y rounded-lg border border-border bg-transparent p-3 text-sm outline-none focus:border-border-strong"
            />

            {/* Prediction block */}
            <div className="mt-4 rounded-lg border border-border bg-surface-muted">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="font-semibold">Create Price Prediction</div>
                <button type="button" className="rounded-md p-1 hover:bg-surface" aria-label="Remove prediction" onClick={() => { setShowCustom(false); setCustomPrice(''); setCustomDate('') }}>
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-3">
                {/* One-line primary controls */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Symbol */}
                  <div>
                    <div className="text-sm font-semibold">Symbol</div>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="Symbol Name"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
                    />
                  </div>

                  {/* Direction */}
                  <div>
                    <div className="text-sm font-semibold">Direction</div>
                    <div className="mt-1 inline-flex w-full overflow-hidden rounded-md border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => setSentiment('Bullish')}
                        className={clsx(
                          'w-1/2 px-3 py-2 text-sm transition-colors',
                          sentiment === 'Bullish' ? 'bg-success text-white' : 'hover:bg-surface-muted'
                        )}
                        aria-pressed={sentiment === 'Bullish'}
                      >
                        Bullish
                      </button>
                      <button
                        type="button"
                        onClick={() => setSentiment('Bearish')}
                        className={clsx(
                          'w-1/2 px-3 py-2 text-sm transition-colors',
                          sentiment === 'Bearish' ? 'bg-danger text-white' : 'hover:bg-surface-muted'
                        )}
                        aria-pressed={sentiment === 'Bearish'}
                      >
                        Bearish
                      </button>
                    </div>
                  </div>

                  {/* Target */}
                  <div>
                    <div className="text-sm font-semibold">Target</div>
                    <div className="mt-1 inline-flex w-full overflow-hidden rounded-md border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => { setHorizon('1D'); setShowCustom(false) }}
                        className={clsx(
                          'w-1/2 px-3 py-2 text-sm transition-colors',
                          horizon === '1D' ? 'bg-text text-surface' : 'hover:bg-surface-muted'
                        )}
                        aria-pressed={horizon === '1D'}
                      >
                        1D
                      </button>
                      <button
                        type="button"
                        onClick={() => { setHorizon('1W'); setShowCustom(false) }}
                        className={clsx(
                          'w-1/2 px-3 py-2 text-sm transition-colors',
                          horizon === '1W' ? 'bg-text text-surface' : 'hover:bg-surface-muted'
                        )}
                        aria-pressed={horizon === '1W'}
                      >
                        1W
                      </button>
                    </div>
                  </div>
                </div>

                {!showCustom && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="muted">Only 1D/1W predictions count towards streak.</div>
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:opacity-80 font-semibold"
                      aria-expanded={showCustom}
                      onClick={() => setShowCustom(true)}
                    >
                      Set custom target ⤵︎
                    </button>
                  </div>
                )}

                {showCustom && (
                  <div className="rounded-md border border-border bg-surface p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-sm font-semibold">Target price</div>
                        <input
                          id="custom-price"
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="e.g. 48.50"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Target date</div>
                        <input
                          id="custom-date"
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="muted">Note: Custom targets do not count towards streak.</div>
                      <button
                        type="button"
                        className="underline underline-offset-4 hover:opacity-80 font-semibold"
                        onClick={() => { setShowCustom(false); setCustomPrice(''); setCustomDate('') }}
                      >
                        Use 1D/1W instead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Composer footer */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: sentiment and add-ons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-1">
                  <button
                    type="button"
                    onClick={() => setSentiment('Bullish')}
                    className={clsx(
                      'rounded-sm px-2 py-1 text-xs font-semibold transition-colors',
                      sentiment === 'Bullish' ? 'bg-success text-white' : 'text-text'
                    )}
                  >
                    Bullish
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment('Bearish')}
                    className={clsx(
                      'rounded-sm px-2 py-1 text-xs font-semibold transition-colors',
                      sentiment === 'Bearish' ? 'bg-danger text-white' : 'text-text'
                    )}
                  >
                    Bearish
                  </button>
                </div>
                <button type="button" className="btn px-2 py-1 text-xs">Image</button>
                <button type="button" className="btn px-2 py-1 text-xs">GIF</button>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button type="button" onClick={onClose} className="btn px-3 py-1 text-sm">Cancel</button>
                <button
                  type="button"
                  disabled={!canPost}
                  className={clsx('btn btn-primary px-4 py-1', !canPost && 'opacity-50 cursor-not-allowed')}
                  onClick={() => {
                    onClose?.()
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


