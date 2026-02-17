import { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const BULL_AVATARS = ['/avatars/top-voice-1.png', '/avatars/top-voice-2.png', '/avatars/top-voice-3.png']
const BEAR_AVATARS = ['/avatars/user-avatar.png', '/avatars/top-voice-1.png', '/avatars/top-voice-2.png']

function AvatarImg({ src, alt = '', className }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div
        className={clsx('rounded-full bg-surface-muted flex items-center justify-center shrink-0', className)}
        role="img"
        aria-hidden
      >
        <span className="text-xs font-medium text-muted">?</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      onError={() => setError(true)}
    />
  )
}

export default function ReactionPoll({
  bullsCount = 0,
  bearsCount = 0,
  userVote = null,
  onVote,
  bullAvatars = BULL_AVATARS,
  bearAvatars = BEAR_AVATARS,
}) {
  const total = bullsCount + bearsCount
  const bullsPct = total > 0 ? (bullsCount / total) * 100 : 50
  const bearsPct = total > 0 ? (bearsCount / total) * 100 : 50

  return (
    <div className="mt-3 rounded-xl border border-border bg-white dark:bg-surface overflow-hidden max-w-[90%]">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm font-bold text-text">Do you agree?</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onVote?.('bull')}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors',
              userVote === 'bull'
                ? 'bg-success/15 border-success text-success'
                : 'bg-surface border-border text-text hover:bg-surface-muted'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
            Bull
          </button>
          <button
            type="button"
            onClick={() => onVote?.('bear')}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors',
              userVote === 'bear'
                ? 'bg-danger/15 border-danger text-danger'
                : 'bg-surface border-border text-text hover:bg-surface-muted'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
            Bear
          </button>
        </div>
      </div>
      {(userVote || total > 0) && (
        <>
          <div className="border-t border-border" />
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {bullAvatars.slice(0, 3).map((src, i) => (
                  <AvatarImg key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface object-cover" />
                ))}
              </div>
              <span className="text-sm font-medium text-text">{bullsCount} Bulls</span>
            </div>
            <div className="flex items-center gap-3 sm:flex-row-reverse">
              <div className="flex -space-x-2 sm:space-x-reverse sm:space-x-2">
                {bearAvatars.slice(0, 3).map((src, i) => (
                  <AvatarImg key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface object-cover" />
                ))}
              </div>
              <span className="text-sm font-medium text-text">{bearsCount} Bears</span>
            </div>
          </div>
          <div className="h-2 flex overflow-hidden">
            <div className="bg-success transition-all" style={{ width: `${bullsPct}%` }} />
            <div className="bg-danger transition-all" style={{ width: `${bearsPct}%` }} />
          </div>
        </>
      )}
    </div>
  )
}
