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

function HeadphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M3 18v-6a9 9 0 0 1 18 0v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WhatsHappening() {
  const [open, setOpen] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">What's Happening</h3>
          <div className="relative flex items-center">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="flex items-center justify-center rounded-md p-1 hover:bg-surface-muted transition-colors muted"
              aria-label="Information about What's Happening"
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
          aria-label={open ? "Collapse What's Happening" : "Expand What's Happening"}
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
        {/* Horizontal Carousel Container */}
        <div 
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Earnings Call Card - First Card */}
          <div className="flex-shrink-0 w-[85%] snap-start">
            <div className="overflow-hidden border-t-4 rounded-md h-32 flex flex-col" style={{ borderTopColor: '#8b5cf6' }}>
              <div className="flex items-start justify-between p-4 flex-1">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold mb-2">UAL Q4 '25 Earnings Call</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: '#8b5cf6' }}>
                      <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }} />
                      Live
                    </span>
                    <span className="flex items-center gap-1.5 muted">
                      <HeadphoneIcon />
                      8
                    </span>
                    <button className="flex items-center gap-1.5 hover:text-text transition-colors muted">
                      <LinkIcon />
                      Share
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary rounded-full px-4 py-2 ml-4 shrink-0"
                  style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' }}
                >
                  Join
                </button>
              </div>
              <div className="px-4 py-2 text-center text-sm" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                Live event started: 10m ago
              </div>
            </div>
          </div>

          {/* News Article Card - Second Card (Half Visible) */}
          <div className="flex-shrink-0 w-[70%] snap-start">
            <div className="overflow-hidden border-t-4 rounded-md h-32 flex" style={{ borderTopColor: '#3b82f6' }}>
              <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-base font-bold line-clamp-2">
                    United Airlines Reports Record Revenue Despite Rising Fuel Costs
                  </h3>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="muted">Reuters • 2h ago</span>
                  <button className="flex items-center gap-1.5 hover:text-text transition-colors muted">
                    <LinkIcon />
                    Read
                  </button>
                </div>
              </div>
              <div className="w-24 h-full flex-shrink-0 bg-surface-muted flex items-center justify-center">
                <div className="text-xs muted">Image</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
