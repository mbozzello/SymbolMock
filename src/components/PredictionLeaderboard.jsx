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

function LeaderRow({ rank, initials, handle, value, avatar }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
      <div className="w-6 shrink-0 text-sm tabular-nums muted">#{rank}</div>
      <div className="flex min-w-0 items-center gap-3">
        {avatar ? (
          <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
        ) : (
          <InitialsAvatar initials={initials} />
        )}
        <div className="min-w-0 truncate font-medium text-sm">@{handle}</div>
      </div>
      <span className="font-semibold tabular-nums text-sm text-green-600 shrink-0 text-right">+{value}</span>
    </div>
  )
}

export default function PredictionLeaderboard() {
  const [predictionType, setPredictionType] = useState('Price') // 'Price' | 'Market'
  const [timeframe, setTimeframe] = useState('All time') // 'Daily' | 'Weekly' | 'Monthly' | 'All time'
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const priceRows = useMemo(
    () => [
      { rank: 1, handle: 'EmperorFox', value: '124.32%', avatar: '/avatars/user-avatar.png' },
      { rank: 2, handle: 'TheBullishPenguin', value: '98.71%', avatar: '/avatars/top-voice-2.png' },
      { rank: 3, handle: 'howardlindzon', value: '82.98%', avatar: '/avatars/howard-lindzon.png' },
      { rank: 4, handle: 'SkipperBullDolphin', value: '76.45%', avatar: '/avatars/top-voice-1.png' },
      { rank: 5, handle: 'BitcoinBear', value: '68.22%', avatar: '/avatars/top-voice-2.png' },
    ],
    []
  )
  const marketRows = useMemo(
    () => [
      { rank: 1, handle: 'CryptoOracle', value: '156.2%', avatar: '/avatars/user-avatar.png' },
      { rank: 2, handle: 'FedWatcher', value: '112.8%', avatar: '/avatars/top-voice-2.png' },
      { rank: 3, handle: 'howardlindzon', value: '94.5%', avatar: '/avatars/howard-lindzon.png' },
      { rank: 4, handle: 'ElectionEdge', value: '87.3%', avatar: '/avatars/top-voice-1.png' },
      { rank: 5, handle: 'MacroMaven', value: '79.1%', avatar: '/avatars/top-voice-2.png' },
    ],
    []
  )
  const rows = predictionType === 'Price' ? priceRows : marketRows
  const totalParticipants = predictionType === 'Price' ? 66000 : 155000
  const participantLabel = totalParticipants >= 1000 ? `${(totalParticipants / 1000).toFixed(0)}k` : totalParticipants
  const timeframeOptions = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: `All time (${participantLabel} Participants)`, value: 'All time' },
  ]

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

      <div className="flex gap-1 mb-2">
        {['Price', 'Market'].map((t) => (
          <button
            key={t}
            onClick={() => setPredictionType(t)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
              predictionType === t ? 'bg-black text-white' : 'bg-surface-muted text-text hover:bg-border'
            )}
            aria-pressed={predictionType === t}
          >
            {t === 'Price' ? 'Price Targets' : 'Market Events'}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted mb-2">
        {predictionType === 'Price' ? (
          <>Top traders using the <span className="underline">Price Prediction tool</span></>
        ) : (
          'Top traders predicting Market Event Outcomes'
        )}
      </p>
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-text hover:bg-border"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span>{timeframe === 'All time' ? `All time (${participantLabel} Participants)` : timeframe}</span>
          <svg className={clsx('w-4 h-4 text-muted transition-transform', dropdownOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setDropdownOpen(false)} />
            <ul
              role="listbox"
              className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-surface py-1 shadow-lg"
            >
              {timeframeOptions.map((opt) => (
                <li key={opt.value} role="option">
                  <button
                    type="button"
                    onClick={() => { setTimeframe(opt.value); setDropdownOpen(false); }}
                    className={clsx('w-full px-3 py-2 text-left text-sm', timeframe === opt.value ? 'bg-black text-white' : 'text-text hover:bg-surface-muted')}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="space-y-0 border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 text-xs font-medium text-muted border-b border-border bg-surface-muted/50">
          <span className="w-6">Rank</span>
          <span>Username</span>
          <span>ROI</span>
        </div>
        {rows.map((r, idx) => (
          <div key={r.rank} className={clsx(idx !== rows.length - 1 && 'border-b border-border')}>
            <LeaderRow {...r} />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button className="btn btn-primary w-full text-sm" onClick={() => setCreatorOpen(true)}>
          {predictionType === 'Market' ? 'View Prediction Markets' : 'Make a Prediction'}
        </button>
      </div>
      <PredictionCreatorModal open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </div>
  )
}


