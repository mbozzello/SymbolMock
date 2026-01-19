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

export default function EarningsRecap() {
  const [open, setOpen] = useState(true)

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-base font-bold">Earnings Recap</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse earnings recap' : 'Expand earnings recap'}
          aria-expanded={open}
          className="rounded-md p-1 hover:bg-surface-muted transition-colors"
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
          <p className="leading-relaxed text-sm font-medium">
            The company delivered solid top-line growth with improving margins as AI and defense demand
            continued to lift results. Management reiterated full-year guidance and highlighted a healthy
            order pipeline into the next quarter.
          </p>
          <p className="leading-relaxed text-sm font-medium">
            While near-term volatility remains, the business is executing against key initiatives and
            expanding capacity to meet demand. Liquidity remains strong, providing flexibility to invest in
            growth.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-success/20 bg-success/5 p-3">
              <div className="font-bold text-success">Bullish</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>Revenue beat on stronger-than-expected demand and backlog conversion</li>
                <li>Gross margin expansion from mix and operational efficiencies</li>
                <li>Raised FY outlook for bookings and free cash flow</li>
              </ul>
            </div>
            <div className="rounded-md border border-danger/20 bg-danger/5 p-3">
              <div className="font-bold text-danger">Bearish</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>Guided to higher near-term opex as investments ramp</li>
                <li>Supply chain constraints may limit upside in the next quarter</li>
                <li>Valuation remains rich relative to historical averages</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs muted">Updated 2h ago</div>
            <div className="flex gap-2">
              <button className="btn px-2 py-1">🔗 Share</button>
              <button className="btn px-2 py-1">💬 Comment 12</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


