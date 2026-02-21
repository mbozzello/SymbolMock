import { useState } from 'react'

function ThumbsUpIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function ThumbsDownIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}

export default function DebateBox({ postId, debate, onVote }) {
  const [justVoted, setJustVoted] = useState(false)
  const [localVote, setLocalVote] = useState(null)
  const {
    thumbsUp: thumbsUpCount,
    thumbsDown: thumbsDownCount,
    upVoters = [],
    downVoters = [],
  } = debate

  const baseUp = thumbsUpCount ?? upVoters.length
  const baseDown = thumbsDownCount ?? downVoters.length
  const thumbsUp = baseUp + (localVote === 'up' ? 1 : 0)
  const thumbsDown = baseDown + (localVote === 'down' ? 1 : 0)
  const total = thumbsUp + thumbsDown
  const upPct = total > 0 ? Math.round((thumbsUp / total) * 100) : 0
  const downPct = total > 0 ? Math.round((thumbsDown / total) * 100) : 0

  const userVote = localVote || (
    upVoters.some((v) => v.id === 'current')
      ? 'up'
      : downVoters.some((v) => v.id === 'current')
      ? 'down'
      : null
  )

  const hasVoted = userVote !== null

  const handleVote = (vote) => {
    const newVote = localVote === vote ? null : vote
    setLocalVote(newVote)
    onVote?.(postId, newVote)
    if (newVote) {
      setJustVoted(true)
      setTimeout(() => setJustVoted(false), 1200)
    }
  }


  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-muted/50 p-3 max-w-[90%]">
      <p className="text-sm font-medium text-text mb-2">
        Do you agree?
        {total > 0 && (
          <span className="ml-1.5 text-xs text-text-muted tabular-nums font-normal">
            {total} Voted{!hasVoted ? ' — Vote to see results' : ''}
          </span>
        )}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleVote('up')}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
            ${userVote === 'up'
              ? 'bg-success/15 border-success/50 text-success'
              : 'bg-surface border-border text-text hover:bg-surface-muted'}
          `}
        >
          <ThumbsUpIcon className="w-5 h-5" filled={userVote === 'up'} />
          <span className="text-sm font-medium">Yes</span>
        </button>
        <button
          type="button"
          onClick={() => handleVote('down')}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
            ${userVote === 'down'
              ? 'bg-danger/15 border-danger/50 text-danger'
              : 'bg-surface border-border text-text hover:bg-surface-muted'}
          `}
        >
          <ThumbsDownIcon className="w-5 h-5" filled={userVote === 'down'} />
          <span className="text-sm font-medium">No</span>
        </button>
      </div>
      {hasVoted && total > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex -space-x-1.5">
                {upVoters.slice(0, 5).map((v, i) => (
                  <img
                    key={`${v.id}-${i}`}
                    src={v.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                    title={v.username}
                  />
                ))}
              </div>
              <span className="text-xs text-muted whitespace-nowrap">{thumbsUp} agree</span>
              <span className="text-xs font-bold text-success tabular-nums">{upPct}%</span>
            </div>
            <div className="flex-1 min-w-0 h-2 rounded-full overflow-hidden flex bg-surface">
              <div
                className="h-full rounded-l-full bg-success transition-all duration-700 ease-out shrink-0"
                style={{ width: `${upPct}%` }}
              />
              <div
                className="h-full rounded-r-full bg-danger transition-all duration-700 ease-out shrink-0"
                style={{ width: `${downPct}%` }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-danger tabular-nums">{downPct}%</span>
              <span className="text-xs text-muted whitespace-nowrap">{thumbsDown} disagree</span>
              <div className="flex -space-x-1.5">
                {downVoters.slice(0, 5).map((v, i) => (
                  <img
                    key={`${v.id}-${i}`}
                    src={v.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                    title={v.username}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
