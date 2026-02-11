// Maps ticker symbols to logo paths in public/images/logos/
const LOGO_MAP = {
  SPY: '/images/logos/spdr.png',
  QQQ: '/images/logos/qqq.png',
  GLD: '/images/logos/spdr.png',
  VIX: '/images/logos/vix.png',
  AAPL: '/images/logos/apple.png',
  AMD: '/images/logos/amd.png',
  AMZN: '/images/logos/amzn.png',
  APP: '/images/logos/app.png',
  DIS: '/images/logos/dis.png',
  GOOGL: '/images/logos/googl.png',
  MSFT: '/images/logos/microsoft.svg',
  NVDA: '/images/logos/nvda.png',
  TSLA: '/images/logos/tesla.png',
  GME: '/images/logos/gme.png',
  HOOD: '/images/logos/hood.png',
  ARAI: '/images/logos/arai.png',
  BNAI: '/images/logos/bnai.png',
  COPX: '/images/logos/copx.png',
  DFTX: '/images/logos/dftx.png',
  QCLS: '/images/logos/qcls.png',
  RKLB: '/images/logos/rklb.png',
  SLV: '/images/logos/slv.png',
  PLTR: '/images/logos/palantir.png',
  BTC: '/images/logos/btc.png',
  BITCOIN: '/images/logos/btc.png',
  ETH: '/images/logos/eth.png',
  DOGE: '/images/logos/doge.png',
  XRP: '/images/logos/xrp.png',
  FIG: '/images/logos/fig.png',
  C: '/images/logos/c.png',
  ETOR: '/images/logos/etor.png',
  SNAP: '/images/logos/snap.png',
  PZZA: '/images/logos/pzza.png',
  'BRK.A': '/images/logos/brk.png',
  'BRK.B': '/images/logos/brk.png',
  ABNB: '/images/logos/abnb.png',
  AMC: '/images/logos/amc.png',
  LULU: '/images/logos/lulu.png',
  SPOT: '/images/logos/spot.png',
  META: '/images/logos/meta.png',
}

export function getTickerLogo(ticker) {
  if (!ticker || typeof ticker !== 'string') return null
  const key = ticker.toUpperCase().trim()
  return LOGO_MAP[key] || null
}
