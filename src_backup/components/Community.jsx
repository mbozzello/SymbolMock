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

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        stroke="currentColor"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function UserMessage({ user, message, likes, replies, reposts = 0, avatar }) {
  const isAvatarImg = avatar && (typeof avatar === 'string' && (avatar.startsWith('/') || avatar.includes('.')))
  return (
    <div className="flex gap-3 py-2">
      <div className="flex-shrink-0">
        {isAvatarImg ? (
          <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-border ring-offset-2 ring-offset-background shadow-sm" />
        ) : (
          <div className="h-11 w-11 rounded-full bg-surface-muted flex items-center justify-center ring-2 ring-border ring-offset-2 ring-offset-background shadow-sm">
            <PersonIcon />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text mb-1">{user}</div>
        <div className="text-sm line-clamp-2 mb-2">{message}</div>
        <div className="flex items-center gap-3 text-xs muted">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likes}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {replies}
          </span>
          {reposts > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {reposts}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const [open, setOpen] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  const bullishMessages = [
    {
      id: 1,
      user: 'astrotrader',
      avatar: '/avatars/top-voice-1.png',
      message: 'Momentum traders noting higher lows and strong volume into strength. The technical setup looks very promising for continued upside.',
      likes: 42,
      replies: 8,
      reposts: 3
    }
  ]

  const bearishMessages = [
    {
      id: 1,
      user: 'quantqueen',
      avatar: '/avatars/top-voice-2.png',
      message: 'Concerns about valuation versus peers after recent run-up. The stock looks overextended at these levels.',
      likes: 31,
      replies: 12,
      reposts: 4
    }
  ]

  return (
    <div className="overflow-hidden border-b border-border">
      <div className="flex items-center justify-between pt-2 px-4 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">Community Spotlight</h3>
          <div className="relative flex items-center">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="flex items-center justify-center rounded-md p-1 hover:bg-surface-muted transition-colors muted"
              aria-label="Information about Community Spotlight"
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
          aria-label={open ? "Collapse Community Spotlight" : "Expand Community Spotlight"}
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
        <div className="space-y-3">
          <div className="grid gap-4 grid-cols-1">
            <div className="rounded-md border border-success/20 bg-success/5 p-3">
              <div className="font-bold text-success mb-2">Bullish</div>
              <div className="space-y-1">
                {bullishMessages.map((msg) => (
                  <UserMessage
                    key={msg.id}
                    user={msg.user}
                    avatar={msg.avatar}
                    message={msg.message}
                    likes={msg.likes}
                    replies={msg.replies}
                    reposts={msg.reposts}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-md border border-danger/20 bg-danger/5 p-3">
              <div className="font-bold text-danger mb-2">Bearish</div>
              <div className="space-y-1">
                {bearishMessages.map((msg) => (
                  <UserMessage
                    key={msg.id}
                    user={msg.user}
                    avatar={msg.avatar}
                    message={msg.message}
                    likes={msg.likes}
                    replies={msg.replies}
                    reposts={msg.reposts}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
