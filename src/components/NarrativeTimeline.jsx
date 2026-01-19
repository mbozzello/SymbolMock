import React, { useMemo, useState, useRef, useEffect } from 'react'

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

const TYPE_META = {
  News: { color: 'var(--color-text)', icon: '' },
  Earnings: { color: 'var(--color-success)', icon: '' },
  Sentiment: { color: '#2aa6ff', icon: '' },
  Trending: { color: 'var(--color-warning)', icon: '' },
}

function Dot({ type }) {
  const meta = TYPE_META[type] ?? { color: '#9aa9b2', icon: '•' }
  return (
    <div className="relative z-10 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
  )
}

function TypeBadge({ type }) {
  const meta = TYPE_META[type] ?? { color: '#9aa9b2' }
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color: meta.color }}
    >
      {type}
    </span>
  )
}

function EventRow({ event, isLast }) {
  const { type, date, title, details, link } = event
  const meta = TYPE_META[type] ?? { color: '#9aa9b2', icon: '•' }
  return (
    <div className="grid grid-cols-[1rem_1fr] gap-3">
      <div className="relative flex flex-col items-center">
        <Dot type={type} />
        {!isLast && <div className="absolute top-3 left-1/2 -ml-px h-[calc(100%-0.75rem)] w-px bg-border" aria-hidden="true" />}
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 text-xs muted">
          <span className="tabular-nums">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <TypeBadge type={type} />
        </div>
        <div className="mt-1 font-medium leading-snug">
          {title}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="ml-2 align-middle text-sm text-text font-semibold hover:underline"
            >
              Link ›
            </a>
          )}
        </div>
        {details && <div className="mt-1 text-sm muted">{details}</div>}
      </div>
    </div>
  )
}

function ConfigDropdown({ rangeDays, onRangeChange, selectedTypes, onToggleType }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activeCount = Object.values(selectedTypes).filter(Boolean).length
  const typeEntries = Object.keys(TYPE_META)
  const ranges = [30, 60, 90]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1.5 text-xs border border-border hover:border-border-strong"
        aria-label="Configure timeline filters"
        aria-expanded={isOpen}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>{rangeDays}d</span>
        <span className="text-muted">•</span>
        <span>{activeCount}/{typeEntries.length}</span>
        <Chevron open={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-surface p-2 shadow-lg backdrop-blur-sm">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs font-medium text-text-muted">Time Range</div>
              <div className="flex gap-1.5">
                {ranges.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRangeChange(r)
                      setIsOpen(false)
                    }}
                    className={clsx(
                      'flex-1 rounded px-2 py-1 text-xs transition-colors',
                      rangeDays === r ? 'bg-text text-surface' : 'bg-surface-muted hover:bg-border'
                    )}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-text-muted">Event Types</div>
              <div className="space-y-1">
                {typeEntries.map((type) => {
                  const meta = TYPE_META[type]
                  const active = selectedTypes[type]
                  return (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-surface-muted"
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => onToggleType(type)}
                        className="h-3.5 w-3.5 rounded border-border bg-surface text-primary focus:ring-1 focus:ring-border-strong"
                      />
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="text-xs">{type}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NarrativeTimeline({ variant = 'sidebar' }) {
  const [open, setOpen] = useState(true)
  const [rangeDays, setRangeDays] = useState(90)
  const [selectedTypes, setSelectedTypes] = useState({
    News: true,
    Earnings: true,
    Sentiment: true,
    Trending: true,
  })

  const allEvents = useMemo(() => {
    // Mock events over the last ~90 days
    const now = new Date()
    const daysAgo = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n)
    return [
      {
        id: 1,
        type: 'News',
        date: daysAgo(4),
          title: 'Defense contract chatter trending',
          details: 'Coverage picked up; stream sentiment skewed bullish.',
          source: 'Stocktwits',
          link: '#',
      },
      {
        id: 2,
        type: 'Trending',
        date: daysAgo(7),
          title: 'Ranked #1 Trending on Stocktwits',
          details: 'Gap up +9% on 2.4x volume drove a surge in mentions.',
          source: 'Stocktwits',
      },
      {
        id: 3,
        type: 'Earnings',
        date: daysAgo(18),
          title: 'Q2 beat; FY guide raised',
          details: 'Rev +6% vs. cons; GM +120bps; FCF guide +$25M. Live thread available.',
          source: 'Stocktwits',
          link: '#',
      },
      {
        id: 4,
        type: 'Sentiment',
        date: daysAgo(20),
        title: 'Message volume spike 3.1x vs 30d baseline',
          details: 'Tone skewed bullish; options chatter elevated.',
          source: 'Stocktwits',
      },
      {
        id: 5,
        type: 'News',
        date: daysAgo(33),
          title: 'Analyst upgrade; PT +18%',
          details: 'Aggregated; cites execution and margin profile.',
          source: 'Stocktwits',
      },
      {
        id: 6,
        type: 'Trending',
        date: daysAgo(45),
        title: 'Ranked #1 Trending on Stocktwits',
          details: 'Breakout action (+5.4% on 1.8x volume) pushed it to #1.',
          source: 'Stocktwits',
      },
      {
        id: 7,
        type: 'News',
        date: daysAgo(52),
          title: 'Company post: product milestone ahead of schedule',
          details: 'Verified via the company stream.',
          source: 'Stocktwits',
      },
      {
        id: 8,
        type: 'Sentiment',
        date: daysAgo(63),
        title: 'Bullish sentiment surges to 92/100',
          details: 'Reading from sentiment signals.',
          source: 'Stocktwits',
      },
      {
        id: 9,
        type: 'Earnings',
        date: daysAgo(74),
        title: 'Pre-ann: narrows range, reiterates FY targets',
          details: 'Signals confidence into the quarter; surfaced in news flow.',
          source: 'Stocktwits',
      },
      {
        id: 10,
        type: 'Trending',
        date: daysAgo(82),
        title: 'Ranked #1 Trending on Stocktwits',
          details: 'Volatility (−7% gap, heavy volume, AH reversal) spiked conversation.',
          source: 'Stocktwits',
      },
    ]
  }, [])

  const filteredSorted = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - rangeDays)
    return allEvents
      .filter((e) => selectedTypes[e.type] && e.date >= cutoff)
      .sort((a, b) => b.date - a.date)
  }, [allEvents, selectedTypes, rangeDays])

  function toggleType(type) {
    setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  const containerPadding = variant === 'sidebar' ? 'p-4' : 'p-6'

  return (
    <div className="card-surface">
      <div className={clsx('flex items-center justify-between', containerPadding)}>
        <h3 className="text-base font-semibold">RKLB Timeline</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse timeline' : 'Expand timeline'}
          aria-expanded={open}
          className="rounded-md p-1 hover:bg-white/5"
        >
          <Chevron open={open} />
        </button>
      </div>

      <div
        className={clsx(
          variant === 'sidebar' ? 'px-4 pb-4' : 'px-6 pb-6',
          open ? 'block' : 'hidden'
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-start">
            <ConfigDropdown
              rangeDays={rangeDays}
              onRangeChange={setRangeDays}
              selectedTypes={selectedTypes}
              onToggleType={toggleType}
            />
          </div>

          <div className="mt-1">
            {filteredSorted.length === 0 ? (
              <div className="muted px-1 py-6 text-center text-sm">No events in range</div>
            ) : (
              <div className={clsx('space-y-3', variant === 'embedded' && 'overflow-y-auto max-h-62')}
              >
                {filteredSorted.map((e, idx) => (
                  <EventRow key={e.id} event={e} isLast={idx === filteredSorted.length - 1} />)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}