import React, { useState } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function TopNavigation({ onSearch, darkMode, toggleDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(null)
  const [logoOpen, setLogoOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const navItems = ['Trending', 'News', 'Earnings']

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="flex items-center gap-4 px-4 py-2.5">
        {/* Left: stocktwits logo + dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setLogoOpen((o) => !o)}
            className="flex items-center gap-1 rounded-md hover:bg-surface-muted transition-colors py-1 pr-1"
            aria-expanded={logoOpen}
          >
            <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-[28px] w-auto object-contain" />
            <svg className="w-4 h-4 text-text" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks, crypto, and people"
                className="w-full px-3 py-2 pl-9 pr-4 rounded-lg border border-border bg-surface-muted text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="15" y1="5" x2="5" y2="15" />
                    <line x1="5" y1="5" x2="15" y2="15" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Nav links + moon */}
        <div className="flex items-center gap-2 shrink-0">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === item ? 'bg-primary text-white' : 'text-text-muted hover:text-text hover:bg-surface-muted'
              )}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-muted transition-colors text-text"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
