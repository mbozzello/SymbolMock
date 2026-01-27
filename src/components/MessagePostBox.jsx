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
    <div className="p-4">
      <div className="flex items-center gap-3 rounded-lg bg-surface-muted px-4 py-3">
        {/* Avatar */}
        <img
          src="/avatars/user-avatar.png"
          alt=""
          className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
        />

        {/* Input area */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your idea on $GME"
          className="flex-1 border-0 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none focus:ring-0"
        />

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={!message.trim()}
          className={clsx(
            'px-4 py-2 rounded-full font-semibold text-sm transition-all flex-shrink-0',
            message.trim()
              ? 'bg-surface text-text hover:bg-surface-muted cursor-pointer'
              : 'bg-surface-muted text-muted cursor-not-allowed opacity-50'
          )}
        >
          Post
        </button>
      </div>
    </div>
  )
}
