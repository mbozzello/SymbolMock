import { createContext, useContext, useState } from 'react'

const TickerTapeContext = createContext(null)

export function TickerTapeProvider({ children }) {
  const [customTickers, setCustomTickers] = useState(null)

  const applyCustomTickers = (tickers) => {
    setCustomTickers(tickers)
  }

  const clearCustomTickers = () => {
    setCustomTickers(null)
  }

  return (
    <TickerTapeContext.Provider
      value={{
        customTickers,
        applyCustomTickers,
        clearCustomTickers,
      }}
    >
      {children}
    </TickerTapeContext.Provider>
  )
}

export function useTickerTape() {
  const ctx = useContext(TickerTapeContext)
  if (!ctx) throw new Error('useTickerTape must be used within TickerTapeProvider')
  return ctx
}
