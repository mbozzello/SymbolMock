import React from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function FeaturedPosts({ posts = [] }) {
  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Featured Takes</h3>
        <button className="btn px-2 py-1 text-xs">Curate</button>
      </div>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="muted rounded-md border border-white/5 px-3 py-6 text-center text-sm">
            No featured posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={clsx(
                'rounded-md border border-primary/30 bg-primary/10 p-3',
                post.featured ? 'shadow-[0_0_0_1px_rgba(42,166,255,0.3)]' : ''
              )}
            >
              <div className="flex items-start gap-3">
                <img
                  src={post.avatar}
                  alt={post.user}
                  className="h-9 w-9 rounded-full border border-white/10"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{post.user}</span>
                    <span className="text-xs muted">{post.time}</span>
                  </div>
                  <div className="mt-1 text-sm">{post.body}</div>
                  <div className="mt-2 flex gap-2 text-xs muted">
                    <span>💬 {post.comments}</span>
                    <span>👍 {post.likes}</span>
                    <span>🔁 {post.reposts}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
