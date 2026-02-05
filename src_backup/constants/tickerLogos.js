// Maps ticker symbols to logo paths in public/images/logos/
const LOGO_MAP = {
  AAPL: '/images/logos/apple.png',
  AMZN: '/images/logos/amzn.png',
  DIS: '/images/logos/dis.png',
  GOOGL: '/images/logos/googl.png',
  MSFT: '/images/logos/microsoft.svg',
  NVDA: '/images/logos/nvda.png',
  TSLA: '/images/logos/tesla.png',
  GME: '/images/logos/gme.png',
  ARAI: '/images/logos/arai.png',
  BNAI: '/images/logos/bnai.png',
  COPX: '/images/logos/copx.png',
  DFTX: '/images/logos/dftx.png',
  QCLS: '/images/logos/qcls.png',
  SLV: '/images/logos/slv.png',
}

export function getTickerLogo(ticker) {
  if (!ticker || typeof ticker !== 'string') return null
  const key = ticker.toUpperCase().trim()
  return LOGO_MAP[key] || null
}
