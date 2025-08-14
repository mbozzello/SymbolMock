import { useState, useEffect } from 'react'

function DynamicThemes({ onThemeSelect, selectedTheme }) {
  // Mock themes data - in real implementation this would come from AI analysis
  const [themes, setThemes] = useState([
    { id: 'china-tariffs', label: 'China Tariffs', count: 23, active: true },
    { id: 'fed-decision', label: 'Fed Decision', count: 18, active: true },
    { id: 'product-launch', label: 'Product Launch', count: 15, active: true },
    { id: 'earnings-call', label: 'Earnings Call', count: 12, active: true },
    { id: 'space-contracts', label: 'Space Contracts', count: 9, active: true },
    { id: 'market-sentiment', label: 'Market Sentiment', count: 7, active: true },
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

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Dynamic Themes</span>
          <span className="badge badge-sm">AI Generated</span>
        </div>
        <div className="text-xs muted">Updates hourly</div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200 border
              ${selectedTheme === theme.id 
                ? 'bg-primary text-white border-primary shadow-lg' 
                : 'bg-surface border-white/10 text-text hover:bg-white/5 hover:border-white/20'
              }
            `}
          >
            <span>{theme.label}</span>
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs
              ${selectedTheme === theme.id 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-muted'
              }
            `}>
              {theme.count}
            </span>
          </button>
        ))}
      </div>
      
      {selectedTheme && (
        <div className="mt-3 p-2 bg-primary/10 border border-primary/20 rounded-md">
          <div className="text-xs text-primary font-medium">
            Filtering by: {themes.find(t => t.id === selectedTheme)?.label}
          </div>
        </div>
      )}
    </div>
  )
}

export default DynamicThemes
