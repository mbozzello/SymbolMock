import { useState } from 'react'

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

export default function CommunityPredictions() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const question = "How will the S&P 500 perform in 2026?"
  const options = [
    "Up 10% or more",
    "0% to up 9%",
    "Down 1% to 9%",
    "Down 10% or more"
  ]

  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>✨</span>
          <h3 className="font-bold text-base">Community predictions</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm font-medium text-primary hover:underline rounded transition-colors py-1"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {"View all >"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-4">
          {/* Question */}
          <p className="text-sm text-text mb-4">{question}</p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {options.map((option, i) => (
              <div
                key={i}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-full border border-border bg-surface-muted/50"
              >
                <span className="text-sm font-medium text-text">{option}</span>
                <span className="muted">
                  <LockIcon />
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-sm muted">
              <span>21.7k votes</span>
              <span>•</span>
              <span>Ended 1d ago</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors flex items-center justify-center"
                aria-label="Share"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
              <button className="px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-sm font-bold text-text">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                19 Comments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
