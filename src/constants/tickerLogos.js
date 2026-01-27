// Local SVG logos for NVDA, AAPL, TSLA, MSFT (Clearbit API is deprecated/unreliable).
export const TICKER_LOGOS = {
  NVDA: '/images/logos/nvda.png',
  AAPL: '/images/logos/apple.png',
  TSLA: '/images/logos/tesla.png',
  MSFT: '/images/logos/microsoft.svg',
  DFTX: '/images/logos/dftx.png',
  BNAI: '/images/logos/bnai.png',
  SLV: '/images/logos/slv.png',
  QCLS: '/images/logos/qcls.png',
  COPX: '/images/logos/copx.png',
  ARAI: '/images/logos/arai.png',
  GME: '/images/logos/gme.png',
}

export function getTickerLogo(ticker) {
  return (ticker && TICKER_LOGOS[ticker]) || null
}
