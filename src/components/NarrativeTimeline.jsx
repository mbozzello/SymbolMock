import React, { useMemo, useState } from 'react'

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
  News: { color: '#3b82f6', icon: '📰' },
  Earnings: { color: '#a855f7', icon: '💰' },
  Sentiment: { color: '#17c964', icon: '💬' },
  'Price/Volume': { color: '#f59e0b', icon: '📈' },
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
      style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
    >
      {type}
    </span>
  )
}

function EventRow({ event, isLast }) {
  const { type, date, title, details, source, link } = event
  const meta = TYPE_META[type] ?? { color: '#9aa9b2', icon: '•' }
  return (
    <div className="grid grid-cols-[1rem_1fr] gap-3">
      <div className="relative flex flex-col items-center">
        <Dot type={type} />
        {!isLast && <div className="absolute top-3 left-1/2 -ml-px h-[calc(100%-0.75rem)] w-px bg-white/10" aria-hidden="true" />}
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 text-xs muted">
          <span>{meta.icon}</span>
          <span className="tabular-nums">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <TypeBadge type={type} />
          {source && <span className="rounded bg-white/5 px-1.5 py-0.5">{source}</span>}
        </div>
        <div className="mt-1 font-medium leading-snug">
          {title}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="ml-2 align-middle text-sm text-primary hover:underline"
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

function SectionFilterChips({ selectedTypes, onToggle }) {
  const entries = Object.keys(TYPE_META)
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map((t) => {
        const active = selectedTypes[t]
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={clsx(
              'rounded-full px-3 py-1 text-sm',
              active ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'
            )}
            aria-pressed={active}
          >
            {TYPE_META[t].icon} {t}
          </button>
        )
      })}
    </div>
  )
}

function RangeChips({ rangeDays, onChange }) {
  const ranges = [30, 60, 90]
  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={clsx(
            'rounded-full px-2.5 py-1 text-sm',
            rangeDays === r ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'
          )}
          aria-pressed={rangeDays === r}
        >
          {r}d
        </button>
      ))}
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
    'Price/Volume': true,
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
        title: 'Defense contract awarded; backlog expands',
        details: 'Multi-year award increases visibility; aligns with pipeline commentary.',
        source: 'Bloomberg',
        link: '#',
      },
      {
        id: 2,
        type: 'Price/Volume',
        date: daysAgo(7),
        title: 'Gap up +9% on open with 2.4x volume',
        details: 'Follow-through into close after pre-market news.',
        source: 'Tape',
      },
      {
        id: 3,
        type: 'Earnings',
        date: daysAgo(18),
        title: 'Q2 beat; FY guide raised',
        details: 'Rev +6% vs. cons; GM +120bps; FCF guide +$25M.',
        source: 'Company',
        link: '#',
      },
      {
        id: 4,
        type: 'Sentiment',
        date: daysAgo(20),
        title: 'Message volume spike 3.1x vs 30d baseline',
        details: 'Tone skewed bullish; options chatter elevated.',
        source: 'Platform',
      },
      {
        id: 5,
        type: 'News',
        date: daysAgo(33),
        title: 'Analyst upgrade to Outperform; PT +18%',
        details: 'Cites execution and improving margin profile.',
        source: 'Barron’s',
      },
      {
        id: 6,
        type: 'Price/Volume',
        date: daysAgo(45),
        title: 'Outside day; closes +5.4% on 1.8x volume',
        details: 'Breakout watch as price clears recent range.',
        source: 'Tape',
      },
      {
        id: 7,
        type: 'News',
        date: daysAgo(52),
        title: 'Product milestone reached ahead of schedule',
        details: 'Validation reduces execution risk on roadmap.',
        source: 'Company',
      },
      {
        id: 8,
        type: 'Sentiment',
        date: daysAgo(63),
        title: 'Bullish sentiment surges to 92/100',
        details: 'Retail inflows observed across platforms.',
        source: 'Platform',
      },
      {
        id: 9,
        type: 'Earnings',
        date: daysAgo(74),
        title: 'Pre-ann: narrows range, reiterates FY targets',
        details: 'Signals confidence into the quarter.',
        source: 'Company',
      },
      {
        id: 10,
        type: 'Price/Volume',
        date: daysAgo(82),
        title: 'Down gap −7% on 2.2x volume; fills after hours',
        details: 'Volatility elevated; liquidity intact.',
        source: 'Tape',
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
        <h3 className="text-base font-semibold">Narrative ({rangeDays}d)</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse narrative timeline' : 'Expand narrative timeline'}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionFilterChips selectedTypes={selectedTypes} onToggle={toggleType} />
            <RangeChips rangeDays={rangeDays} onChange={setRangeDays} />
          </div>

          <div className="mt-1">
            {filteredSorted.length === 0 ? (
              <div className="muted px-1 py-6 text-center text-sm">No events in range</div>
            ) : (
              <div className={clsx('space-y-3', variant === 'embedded' && 'overflow-y-auto max-h-72')}
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