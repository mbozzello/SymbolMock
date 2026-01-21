import { useState, useEffect } from 'react'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function DynamicThemes({ onThemeSelect, selectedTheme, layout = 'horizontal', className }) {
  // Mock themes data - in real implementation this would come from AI analysis
  const [themes, setThemes] = useState([
    { 
      id: 'china-tariffs', 
      label: 'China Tariffs', 
      emoji: '📦',
      count: 23, 
      active: true,
      summary: 'Analysis of trade policies and their impact on global supply chains. Key developments in US-China trade relations affecting manufacturing costs and market access.'
    },
    { 
      id: 'fed-decision', 
      label: 'Fed Decision', 
      emoji: '🏦',
      count: 18, 
      active: true,
      summary: 'Monetary policy updates and interest rate forecasts. Impact analysis on market liquidity, borrowing costs, and economic growth indicators.'
    },
    { 
      id: 'product-launch', 
      label: 'Product Launch', 
      emoji: '🚀',
      count: 15, 
      active: true,
      summary: 'New product announcements and market entry strategies. Competitive landscape analysis and consumer adoption trends.'
    },
    { 
      id: 'earnings-call', 
      label: 'Earnings Call', 
      emoji: '💰',
      count: 12, 
      active: true,
      summary: 'Quarterly financial results and corporate performance metrics. Management outlook and strategic initiatives discussion.'
    },
    { 
      id: 'space-contracts', 
      label: 'Space Contracts', 
      emoji: '🛰️',
      count: 9, 
      active: true,
      summary: 'Government and commercial space industry agreements. Analysis of contract values, technological developments, and market opportunities.'
    },
    { 
      id: 'market-sentiment', 
      label: 'Market Sentiment', 
      emoji: '📊',
      count: 7, 
      active: true,
      summary: 'Investor confidence indicators and market psychology trends. Analysis of news sentiment and its correlation with price movements.'
    },
  ])

  // Simulate dynamic updates every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setThemes(prevThemes => 
        prevThemes.map(theme => ({
          ...theme,
          count: Math.max(1, theme.count + Math.floor(Math.random() * 5) - 2) // Random count change
        }))
      )
    }, 3600000) // 1 hour

    return () => clearInterval(interval)
  }, [])

  const handleThemeClick = (themeId) => {
    onThemeSelect(themeId === selectedTheme ? null : themeId)
  }

  const isVertical = layout === 'vertical'

  // For horizontal layout above feed, use simplified styling without card wrapper
  if (!isVertical) {
    return (
      <div className={clsx('pt-2 pb-1 -mb-2', className)}>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="text-sm font-semibold text-muted whitespace-nowrap">Themes:</div>
          <div className="flex gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeClick(theme.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-200 border
                  ${selectedTheme === theme.id 
                    ? 'bg-text text-surface border-text shadow-sm' 
                    : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-border-strong'
                  }
                `}
              >
                <span>{theme.emoji}</span>
                <span>{theme.label}</span>
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs
                  ${selectedTheme === theme.id 
                    ? 'bg-surface/20 text-surface' 
                    : 'bg-surface-muted text-muted'
                  }
                `}>
                  {theme.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vertical layout (kept for backward compatibility if needed)
  return (
    <div className={clsx('card-surface p-4', className)}>
      <div className="mb-3 text-sm font-semibold">Dynamic Themes</div>
      
      <div className="flex flex-col gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200 border
              ${selectedTheme === theme.id 
                ? 'bg-text text-surface border-text shadow-sm' 
                : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-border-strong'
              }
            `}
          >
            <span>{theme.emoji}</span>
            <span>{theme.label}</span>
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs
              ${selectedTheme === theme.id 
                ? 'bg-surface/20 text-surface' 
                : 'bg-surface-muted text-muted'
              }
            `}>
              {theme.count}
            </span>
          </button>
        ))}
      </div>
      
      {selectedTheme && (
        <div className="mt-3 p-3 bg-surface-muted border border-border rounded-md">
          <div className="text-xs text-text font-semibold mb-1">
            Filtering by: {themes.find(t => t.id === selectedTheme)?.label}
          </div>
          <div className="text-xs text-muted">
            {themes.find(t => t.id === selectedTheme)?.summary}
          </div>
        </div>
      )}
    </div>
  )
}

export default DynamicThemes
