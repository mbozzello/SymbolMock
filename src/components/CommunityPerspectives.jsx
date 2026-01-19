import React, { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('h-5 w-5 transition-transform duration-300', open ? 'rotate-180' : 'rotate-0')}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function CommunityPerspectives() {
  const [open, setOpen] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">Community Perspectives</h3>
          <div className="relative flex items-center">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="flex items-center justify-center rounded-md p-1 hover:bg-surface-muted transition-colors muted"
              aria-label="Information about Community Perspectives"
            >
              <InfoIcon />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-md border border-border bg-surface p-3 shadow-lg text-sm">
                A quick AI summary of what the community is saying about this symbol.
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse Community Perspectives' : 'Expand Community Perspectives'}
          aria-expanded={open}
          className="flex items-center justify-center rounded-md p-1 hover:bg-surface-muted transition-colors"
        >
          <Chevron open={open} />
        </button>
      </div>

      <div
        className={clsx(
          'px-4 pb-4 transition-all duration-300 ease-in-out',
          open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ overflow: 'hidden' }}
      >
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-success/20 bg-success/5 p-3">
              <div className="font-bold text-success">Bullish</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>Momentum traders noting higher lows and strong volume into strength</li>
                <li>Growing institutional interest and positive options flow</li>
                <li>Product pipeline and contracts cited as near-term catalysts</li>
              </ul>
            </div>
            <div className="rounded-md border border-danger/20 bg-danger/5 p-3">
              <div className="font-bold text-danger">Bearish</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>Concerns about valuation versus peers after recent run-up</li>
                <li>Execution risks around ramp and potential delays</li>
                <li>Macro risk and tighter financial conditions weighing on risk appetite</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs muted">Updated 1h ago</div>
            <div className="flex gap-2">
              <button className="btn px-2 py-1">🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}