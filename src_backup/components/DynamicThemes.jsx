import { useCallback } from 'react'
import { TOPICS } from '../constants/topics.jsx'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

function DynamicThemes({ onThemeSelect, selectedTheme, layout = 'horizontal', className }) {
  const handleTopicClick = useCallback(
    (topicId) => {
      onThemeSelect?.(topicId === selectedTheme ? null : topicId)
    },
    [onThemeSelect, selectedTheme]
  )

  const isVertical = layout === 'vertical'

  // For horizontal layout above feed, use simplified styling without card wrapper
  if (!isVertical) {
    return (
      <div className={clsx('pt-2 pb-1 -mb-2', className)}>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="text-sm font-semibold text-muted whitespace-nowrap">Topics:</div>
          <div className="flex gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap
                  transition-all duration-200
                  ${selectedTheme === topic.id 
                    ? 'bg-text text-surface border-text shadow-sm' 
                    : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-border-strong'
                  }
                `}
              >
                {topic.icon}
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vertical layout (kept for backward compatibility if needed)
  const selected = TOPICS.find((t) => t.id === selectedTheme)
  return (
    <div className={clsx('p-4 border-b border-border', className)}>
      <div className="mb-3 text-sm font-semibold">Topics</div>
      
      <div className="flex flex-col gap-2">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic.id)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap
              transition-all duration-200
              ${selectedTheme === topic.id 
                ? 'bg-text text-surface border-text shadow-sm' 
                : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-border-strong'
              }
            `}
          >
            {topic.icon}
            {topic.label}
          </button>
        ))}
      </div>
      
      {selected && (
        <div className="mt-3 p-3 bg-surface-muted border border-border rounded-md">
          <div className="text-xs text-text font-semibold mb-1">
            Filtering by: {selected.label}
          </div>
          <div className="text-xs text-muted">
            {selected.summary}
          </div>
        </div>
      )}
    </div>
  )
}

export default DynamicThemes
