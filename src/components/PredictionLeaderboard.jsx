import React, { useMemo, useState } from 'react'
import PredictionCreatorModal from './PredictionCreatorModal.jsx'

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

function InitialsAvatar({ initials }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted border border-border font-semibold">
      {initials}
    </div>
  )
}

function LeaderRow({ rank, initials, name, handle, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-6 shrink-0 text-sm tabular-nums muted">{rank}</div>
        <InitialsAvatar initials={initials} />
        <div className="min-w-0">
          <div className="truncate font-medium">{name}</div>
          <div className="truncate text-sm muted">@{handle}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-orange-500">
        <span role="img" aria-label="streak">🔥</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  )
}

export default function PredictionLeaderboard() {
  const [open, setOpen] = useState(true)
  const [metric, setMetric] = useState('Streaks') // 'Streaks' | 'Win rate'
  const [scope, setScope] = useState('Overall') // 'Overall' | 'Following'
  const [creatorOpen, setCreatorOpen] = useState(false)

  const rows = useMemo(
    () => [
      { rank: 1, initials: 'AC', name: 'Ava Chen', handle: 'avacharts', value: '18d' },
      { rank: 2, initials: 'MT', name: 'Mike Torres', handle: 'miket', value: '16d' },
      { rank: 3, initials: 'QP', name: 'Quincy Park', handle: 'qpark', value: '14d' },
      { rank: 4, initials: 'RG', name: 'Rhea Gupta', handle: 'rheag', value: '12d' },
      { rank: 5, initials: 'NL', name: 'Noah L.', handle: 'nloffredo', value: '11d' },
      { rank: 6, initials: 'JK', name: 'Jae Kim', handle: 'jae_k', value: '10d' },
    ],
    []
  )

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-base font-semibold">Leaderboard</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse leaderboard' : 'Expand leaderboard'}
          aria-expanded={open}
          className="rounded-md p-1 hover:bg-white/5"
        >
          <Chevron open={open} />
        </button>
      </div>

      <div
        className={clsx(
          'px-4 pb-4 transition-all duration-300 ease-in-out',
          open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ overflow: 'hidden' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {['Streaks', 'Win rate'].map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm transition-all duration-200',
                  metric === m ? 'bg-text text-surface font-semibold' : 'bg-surface-muted text-text hover:bg-border'
                )}
                aria-pressed={metric === m}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['Overall', 'Following'].map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm transition-all duration-200',
                  scope === s ? 'bg-text text-surface font-semibold' : 'bg-surface-muted text-text hover:bg-border'
                )}
                aria-pressed={scope === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border">
          <div className="px-3">
            {rows.map((r, idx) => (
              <div key={r.rank} className={clsx('px-1', idx !== rows.length - 1 && 'border-b border-border')}>
                <LeaderRow {...r} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button className="btn px-3">Share top</button>
          <button className="btn btn-primary" onClick={() => setCreatorOpen(true)}>Make a Prediction</button>
        </div>
      </div>
      <PredictionCreatorModal open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </div>
  )
}


