import { useState } from 'react'

function Poll({ 
  question = "How will the S&P 500 perform in 2026?",
  options = [
    "Up 10% or more",
    "0% to up 9%",
    "Down 1% to 9%",
    "Down 10% or more"
  ],
  voteCount = "11.8k",
  timeRemaining = "1d",
  commentCount = 8
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="p-4 border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-semibold">Poll</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-surface-muted rounded transition-colors"
          aria-label={isCollapsed ? "Expand poll" : "Collapse poll"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Question */}
          <div className="mb-4">
            <h3 className="font-semibold text-base leading-tight">{question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {options.map((option, index) => (
              <button
                key={index}
                className="w-full px-4 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors text-sm font-medium text-center"
              >
                {option}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-sm muted">
              <span>{voteCount} votes</span>
              <span>•</span>
              <span>{timeRemaining} left</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Share Button */}
              <button
                className="h-8 w-8 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors flex items-center justify-center"
                aria-label="Share poll"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
              {/* Comments Button */}
              <button
                className="px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{commentCount} Comments</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Poll
