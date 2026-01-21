import { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function MessagePostBox() {
  const [message, setMessage] = useState('')

  const handlePost = () => {
    if (message.trim()) {
      // Handle post submission
      console.log('Posting:', { message })
      setMessage('')
    }
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full border border-border flex-shrink-0 flex items-center justify-center bg-surface-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Input area with Post button */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share an idea (use $ before ticker: eg $SYMBOL)"
            className="flex-1 border-0 bg-transparent text-lg text-text placeholder-muted focus:outline-none focus:ring-0"
          />
          <button
            onClick={handlePost}
            disabled={!message.trim()}
            className={clsx(
              'btn px-6 py-2 rounded-full font-semibold text-sm transition-all flex-shrink-0',
              message.trim()
                ? 'btn-primary cursor-pointer'
                : 'bg-surface-muted text-muted cursor-not-allowed opacity-50'
            )}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
