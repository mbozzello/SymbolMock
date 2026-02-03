import React, { useMemo, useState } from 'react'
import PredictionCreatorModal from './PredictionCreatorModal.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function InitialsAvatar({ initials }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted border border-border font-semibold">
      {initials}
    </div>
  )
}

function LeaderRow({ rank, initials, name, handle, value, avatar }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-5 shrink-0 text-sm tabular-nums muted">{rank}</div>
        {avatar ? (
          <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
        ) : (
          <InitialsAvatar initials={initials} />
        )}
        <div className="min-w-0">
          <div className="truncate font-medium text-sm">{name}</div>
          <div className="truncate text-xs muted">@{handle}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-semibold tabular-nums text-sm">{value}</span>
        <span role="img" aria-label="streak" className="text-orange-500">🔥</span>
      </div>
    </div>
  )
}

export default function PredictionLeaderboard() {
  const [metric, setMetric] = useState('Streaks') // 'Overall' | 'Win Rate' | 'Streaks'
  const [creatorOpen, setCreatorOpen] = useState(false)

  const rows = useMemo(
    () => [
      { rank: 1, name: 'EmpererFox', handle: 'EmperorFox', value: '31d', avatar: '/avatars/user-avatar.png' },
      { rank: 2, name: 'The Bullish Penguin', handle: 'TheBullishPenguin', value: '29d', avatar: '/avatars/top-voice-2.png' },
      { rank: 3, name: 'ProfessorShiba', handle: 'professorShiba', value: '28d', avatar: '/avatars/top-voice-3.png' },
      { rank: 4, name: 'SkipperBullDolphin', handle: 'SkipperBullDolphin', value: '25d', avatar: '/avatars/top-voice-1.png' },
      { rank: 5, name: 'BitcoinBear', handle: 'BitcoinBear', value: '24d', avatar: '/avatars/top-voice-2.png' },
    ],
    []
  )

  const tabs = ['Overall', 'Win Rate', 'Streaks']

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="trophy" className="text-lg">🏆</span>
          <h3 className="text-base font-semibold text-text">Prediction Leaderboard</h3>
        </div>
        <button type="button" className="p-1 rounded hover:bg-surface-muted text-muted" aria-label="View all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setMetric(t)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
              metric === t ? 'bg-black text-white' : 'bg-surface-muted text-text hover:bg-border'
            )}
            aria-pressed={metric === t}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-0 border border-border rounded-lg overflow-hidden">
        {rows.map((r, idx) => (
          <div key={r.rank} className={clsx('px-3', idx !== rows.length - 1 && 'border-b border-border')}>
            <LeaderRow {...r} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button className="btn px-3 text-sm">Share top</button>
        <button className="btn btn-primary text-sm" onClick={() => setCreatorOpen(true)}>Make a Prediction</button>
      </div>
      <PredictionCreatorModal open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </div>
  )
}


