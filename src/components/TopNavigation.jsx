import React, { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function TopNavigation({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const navItems = ['Trending', 'News', 'Earnings']

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-1.5">
        <div className="flex items-center gap-4">
          {/* Search Bar - Centered */}
          <div className="flex-1 flex justify-center">
            <form 
              onSubmit={handleSearch}
              className="w-full max-w-md"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, symbols, or topics..."
                  className="w-full px-3 py-1.5 pl-9 pr-4 rounded-lg border border-border bg-surface-muted text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-4 h-4 muted" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="9" r="6" />
                    <path d="m17 17-4-4" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface transition-colors"
                    aria-label="Clear search"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-4 muted" 
                      viewBox="0 0 20 20" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <line x1="15" y1="5" x2="5" y2="15" />
                      <line x1="5" y1="5" x2="15" y2="15" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={clsx(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                  activeTab === item
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
