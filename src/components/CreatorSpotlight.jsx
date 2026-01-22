import React from 'react'

function FeaturedTake({ post }) {
  if (!post) {
    return (
      <div className="muted rounded-md border border-border px-3 py-4 text-sm">
        No featured take yet.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-start gap-3">
        <img
          src={post.avatar}
          alt={post.user}
          className="h-9 w-9 rounded-full border border-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{post.user}</span>
            <span className="text-xs muted">{post.time}</span>
          </div>
          <div className="mt-1 text-sm line-clamp-3">{post.body}</div>
          <div className="mt-2 flex gap-3 text-xs muted">
            <span className="flex items-center gap-1">💬 {post.comments}</span>
            <span className="flex items-center gap-1">👍 {post.likes}</span>
            <span className="flex items-center gap-1">🔁 {post.reposts}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ creator }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3 transition-all duration-200">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="h-10 w-10 rounded-full border border-border"
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
      </div>
    </div>
  )
}

export default function CreatorSpotlight({ creators, featuredPost }) {
  const data = creators ?? [
    {
      id: 1,
      name: 'Ava Chen',
      handle: 'avacharts',
      streak: 18,
      winRate: 68,
      avatar: 'https://placehold.co/64x64?text=AC',
    },
    {
      id: 2,
      name: 'Mike Torres',
      handle: 'miket',
      streak: 16,
      winRate: 64,
      avatar: 'https://placehold.co/64x64?text=MT',
    },
    {
      id: 3,
      name: 'Rhea Gupta',
      handle: 'rheag',
      streak: 12,
      winRate: 61,
      avatar: 'https://placehold.co/64x64?text=RG',
    },
  ]

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Top Creators</h3>
          <span className="badge badge-sm">{data.length}</span>
        </div>
        <button className="btn px-2 py-1 text-xs">View all</button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="text-xs uppercase tracking-wide muted font-semibold">
          Featured take
        </div>
        <FeaturedTake post={featuredPost} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs uppercase tracking-wide muted font-semibold">
          Top creators
        </div>
        <div className="space-y-3">
          {data.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </div>
    </div>
  )
}
