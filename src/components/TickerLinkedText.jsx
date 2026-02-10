import { Link } from 'react-router-dom'

/**
 * Matches $TICKER in text (e.g. $TSLA, $NVDA, $BRK.A). Ticker: $ + letter then letters/numbers/dots.
 */
const TICKER_REGEX = /(\$[A-Za-z][A-Za-z0-9.]*)/g

/**
 * Renders message body text with $TICKER segments as blue links to /symbol.
 * Use anywhere stream/message body is displayed.
 */
export default function TickerLinkedText({ text, className = '' }) {
  if (!text || typeof text !== 'string') return null
  const parts = text.split(TICKER_REGEX)
  return (
    <span className={className}>
      {parts.map((segment, i) => {
        const match = segment.match(/^\$([A-Za-z][A-Za-z0-9.]*)$/)
        if (match) {
          const ticker = match[1].toUpperCase()
          return (
            <Link
              key={`${ticker}-${i}`}
              to="/symbol"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {segment}
            </Link>
          )
        }
        return <span key={i}>{segment}</span>
      })}
    </span>
  )
}
