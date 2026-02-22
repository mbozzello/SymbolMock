import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const navEntry = performance.getEntriesByType?.('navigation')?.[0]
if (navEntry?.type === 'reload') {
  Object.keys(localStorage).filter(k => k.startsWith('stpred-')).forEach(k => localStorage.removeItem(k))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
