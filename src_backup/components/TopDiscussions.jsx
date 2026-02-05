export default function TopDiscussions() {
  return (
    <div className="card-surface p-4 h-[480px] overflow-y-auto">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Top Discussions</h3>
          <button className="text-muted hover:text-text transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-text text-background">
            Top
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-full border border-border hover:bg-surface-muted transition-colors">
            Active
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-full border border-border hover:bg-surface-muted transition-colors">
            Trending
          </button>
        </div>
        
        {/* Discussion Items */}
        <div className="flex flex-col gap-4">
          {/* Discussion 1 */}
          <div className="group cursor-pointer">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-sm font-semibold">$IBRX</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              Will Trump's Mortgage Bond Plan Actually Lower Rates in 2026?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  83
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  12
                </span>
              </div>
              <span className="font-medium">18K votes</span>
            </div>
          </div>
          
          {/* Discussion 2 */}
          <div className="group cursor-pointer border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-xs font-semibold">StocktwitsPolls</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              How Will the Powell Investigation Impact Markets in 2026?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  86
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  5
                </span>
              </div>
              <span className="font-medium">22.4K votes</span>
            </div>
          </div>
          
          {/* Discussion 3 */}
          <div className="group cursor-pointer border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-sm font-semibold">$VIX</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              Which Theme Will Matter Most for Portfolios in 2026?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  119
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  13
                </span>
              </div>
              <span className="font-medium">16.5K votes</span>
            </div>
          </div>
          
          {/* Discussion 4 */}
          <div className="group cursor-pointer border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-sm font-semibold">$NVDA</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              Will AI Chip Demand Continue to Outpace Supply Through 2026?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  142
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  28
                </span>
              </div>
              <span className="font-medium">24.8K votes</span>
            </div>
          </div>
          
          {/* Discussion 5 */}
          <div className="group cursor-pointer border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-sm font-semibold">$TSLA</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              Can Tesla Maintain Market Share as EV Competition Intensifies?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  98
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  19
                </span>
              </div>
              <span className="font-medium">15.2K votes</span>
            </div>
          </div>
          
          {/* Discussion 6 */}
          <div className="group cursor-pointer border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-xs font-semibold">StocktwitsPolls</span>
            </div>
            <p className="text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              Will Bitcoin Reach $100K Before the Next Halving?
            </p>
            <div className="flex items-center justify-between text-xs muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  156
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  34
                </span>
              </div>
              <span className="font-medium">31.7K votes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
