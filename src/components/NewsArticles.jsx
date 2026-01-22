import React from 'react'

export default function NewsArticles({ articles = [] }) {
  return (
    <div className="pt-2 px-4 pb-4">
      <div className="space-y-2">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url || '#'}
            className="flex items-start gap-3 py-2 border-b border-border last:border-b-0 hover:opacity-80 transition-opacity group"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.headline}
              </h3>
            </div>
            {article.thumbnail && (
              <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-surface-muted border border-border">
                <img
                  src={article.thumbnail}
                  alt={article.headline}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
