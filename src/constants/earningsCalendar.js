/** Shared earnings calendar data for web and iOS */

export const LIVE_EARNINGS = [
  { ticker: 'AAPL', listeners: 240, started: '21m ago' },
  { ticker: 'NVDA', listeners: 192, started: '14m ago' },
  { ticker: 'TSLA', listeners: 156, started: '8m ago' },
  { ticker: 'AMD', listeners: 320, started: '32m ago' },
  { ticker: 'MSFT', listeners: 278, started: '5m ago' },
  { ticker: 'GOOGL', listeners: 234, started: '18m ago' },
  { ticker: 'AMZN', listeners: 412, started: '25m ago' },
  { ticker: 'PLTR', listeners: 189, started: '41m ago' },
]

export const WEEK_DAYS = [
  { label: 'MONDAY', dateStr: '2026-02-09', date: 9, month: 'Feb' },
  { label: 'TUESDAY', dateStr: '2026-02-10', date: 10, month: 'Feb' },
  { label: 'WEDNESDAY', dateStr: '2026-02-11', date: 11, month: 'Feb' },
  { label: 'TODAY', dateStr: '2026-02-12', date: 12, month: 'Feb' },
  { label: 'FRIDAY', dateStr: '2026-02-13', date: 13, month: 'Feb' },
]

export const EARNINGS_BY_DATE = {
  '2026-02-09': [
    { ticker: 'CLF', name: 'Cleveland-Cliffs Inc', price: 18.42, pctChange: -2.1, volume: '12.4M', watchers: 45620, reporting: 'After bell' },
    { ticker: 'AVXL', name: 'Anavex Life Sciences', price: 12.88, pctChange: 5.2, volume: '8.2M', watchers: 32100, reporting: 'Before bell' },
    { ticker: 'CHGG', name: 'Chegg Inc', price: 6.45, pctChange: -1.8, volume: '3.1M', watchers: 28900, reporting: 'After bell' },
    { ticker: 'F', name: 'Ford Motor', price: 11.22, pctChange: -0.5, volume: '45M', watchers: 125000, reporting: 'After bell' },
    { ticker: 'GM', name: 'General Motors', price: 38.90, pctChange: 1.2, volume: '22M', watchers: 98000, reporting: 'Before bell' },
  ],
  '2026-02-10': [
    { ticker: 'GOOGL', name: 'Alphabet Inc', price: 142.30, pctChange: -0.5, volume: '22.1M', watchers: 892000, reporting: 'After bell' },
    { ticker: 'AMZN', name: 'Amazon.com Inc', price: 172.65, pctChange: 1.2, volume: '45.2M', watchers: 756000, reporting: 'After bell' },
    { ticker: 'MELI', name: 'MercadoLibre', price: 198.40, pctChange: 3.1, volume: '4.2M', watchers: 234000, reporting: 'After bell' },
    { ticker: 'ZM', name: 'Zoom Video', price: 62.15, pctChange: -1.8, volume: '8.5M', watchers: 156000, reporting: 'After bell' },
  ],
  '2026-02-11': [
    { ticker: 'DIS', name: 'Walt Disney Co', price: 98.20, pctChange: 0.8, volume: '18.5M', watchers: 445000, reporting: 'After bell' },
    { ticker: 'UBER', name: 'Uber Technologies', price: 72.45, pctChange: 2.1, volume: '28M', watchers: 389000, reporting: 'Before bell' },
    { ticker: 'LYFT', name: 'Lyft Inc', price: 14.22, pctChange: -3.2, volume: '12M', watchers: 89000, reporting: 'After bell' },
  ],
  '2026-02-12': [
    { ticker: 'COIN', name: 'Coinbase Global Inc', price: 144.25, pctChange: -5.67, volume: '19.77M', watchers: 137053, reporting: 'After bell' },
    { ticker: 'ROKU', name: 'Roku Inc', price: 93.29, pctChange: 6.85, volume: '11.27M', watchers: 134736, reporting: 'After bell' },
    { ticker: 'DKNG', name: 'DraftKings Inc', price: 21.41, pctChange: -19.24, volume: '28.11M', watchers: 120762, reporting: 'After bell' },
    { ticker: 'RIVN', name: 'Rivian Automotive Inc', price: 16.10, pctChange: 9.85, volume: '36.98M', watchers: 87607, reporting: 'After bell' },
    { ticker: 'ABNB', name: 'Airbnb Inc', price: 120.11, pctChange: 0.58, volume: '10.01M', watchers: 49103, reporting: 'After bell' },
    { ticker: 'PINS', name: 'Pinterest Inc', price: 15.45, pctChange: -19.55, volume: '28.96M', watchers: 45715, reporting: 'After bell' },
    { ticker: 'TWLO', name: 'Twilio Inc', price: 107.95, pctChange: -2.25, volume: '5M', watchers: 45490, reporting: 'After bell' },
    { ticker: 'NBIS', name: 'Nobius Group N.V.', price: 88.99, pctChange: 0.44, volume: '25.65M', watchers: 34587, reporting: 'Before bell' },
    { ticker: 'HOOD', name: 'Robinhood Markets Inc', price: 46.64, pctChange: 2.35, volume: '14.2M', watchers: 89200, reporting: 'After bell' },
  ],
  '2026-02-13': [
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: 875.32, pctChange: 1.8, volume: '52.1M', watchers: 1120000, reporting: 'After bell' },
    { ticker: 'DE', name: 'Deere & Co', price: 398.20, pctChange: -0.3, volume: '2.1M', watchers: 78000, reporting: 'Before bell' },
    { ticker: 'PEP', name: 'PepsiCo', price: 168.45, pctChange: 0.5, volume: '5.2M', watchers: 125000, reporting: 'Before bell' },
  ],
}

export const DAY_PREVIEW = {
  '2026-02-09': { tickers: ['CLF', 'AVXL', 'CHGG'], total: 62 },
  '2026-02-10': { tickers: ['GOOGL', 'AMZN'], total: 109 },
  '2026-02-11': { tickers: ['DIS'], total: 144 },
  '2026-02-12': { tickers: ['COIN', 'ROKU', 'DKNG'], total: 185 },
  '2026-02-13': { tickers: ['NVDA'], total: 34 },
}
