import React from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function CreatorCard({ creator, featured }) {
  return (
    <div className={clsx('rounded-md border border-white/10 p-3', featured ? 'bg-primary/10' : 'bg-surface')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="h-10 w-10 rounded-full border border-white/10"
          />
          <div className="min-w-0">
            <div className="truncate font-semibold">{creator.name}</div>
            <div className="truncate text-xs muted">@{creator.handle}</div>
          </div>
        </div>
        <button className="btn px-2 py-1 text-xs">Follow</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="badge">🔥 {creator.streak}d streak</span>
        <span className="badge">Win {creator.winRate}%</span>
        <span className="badge">{creator.followers} followers</span>
      </div>
      <div className="mt-2 text-sm muted">
        Best call: {creator.highlight}
      </div>
    </div>
  )
}

export default function CreatorSpotlight({ creators }) {
  const data = creators ?? [
    {
      id: 1,
      name: 'Ava Chen',
      handle: 'avacharts',
      streak: 18,
      winRate: 68,
      followers: '24.1k',
      highlight: 'RKLB breakout @ $38',
      avatar: 'https://placehold.co/64x64?text=AC',
    },
    {
      id: 2,
      name: 'Mike Torres',
      handle: 'miket',
      streak: 16,
      winRate: 64,
      followers: '18.9k',
      highlight: 'Earnings beat call',
      avatar: 'https://placehold.co/64x64?text=MT',
    },
    {
      id: 3,
      name: 'Rhea Gupta',
      handle: 'rheag',
      streak: 12,
      winRate: 61,
      followers: '11.2k',
      highlight: 'Contract catalyst thread',
      avatar: 'https://placehold.co/64x64?text=RG',
    },
  ]

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Creator Spotlight</h3>
        <button className="btn px-2 py-1 text-xs">View all</button>
      </div>
      <div className="space-y-3">
        {data.map((creator, index) => (
          <CreatorCard key={creator.id} creator={creator} featured={index === 0} />
        ))}
      </div>
    </div>
  )
}
