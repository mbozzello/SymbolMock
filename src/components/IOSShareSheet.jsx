import { useState } from 'react'

/**
 * iOS-styled share sheet modal (matching Reddit-style layout).
 * Tapping the X icon opens a compose-to-X overlay.
 *
 * Props:
 *   open     – boolean, whether the sheet is visible
 *   onClose  – callback to close the sheet
 */
export default function IOSShareSheet({ open, onClose }) {
  const [xComposeOpen, setXComposeOpen] = useState(false)

  if (!open) return null

  const handleClose = () => {
    setXComposeOpen(false)
    onClose()
  }

  /* ═══════════  X Compose Overlay  ═══════════ */
  if (xComposeOpen) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
        {/* Top bar: Cancel / Post */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button type="button" onClick={handleClose} className="text-sm text-white/70">Cancel</button>
          <button type="button" onClick={handleClose} className="px-4 py-1.5 rounded-full bg-[#1d9bf0] text-white text-sm font-bold">Post</button>
        </div>

        {/* Compose area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <div className="flex gap-3">
            <img src="/avatars/user-avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] text-[#1d9bf0] leading-relaxed break-all">
                https://stocktwits.com/howardlindzon/message/12345
              </div>

              {/* Post Preview Card */}
              <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden bg-[#16181c]">
                <div className="flex items-center gap-2 p-3 pb-2">
                  <img src="/avatars/howard-lindzon.png" alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-white">@howardlindzon</span>
                  <svg className="w-3.5 h-3.5 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>

                <div className="relative mx-3 rounded-xl overflow-hidden bg-black border border-white/5">
                  <div className="absolute top-2 right-2 z-10">
                    <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-5 opacity-60" />
                  </div>
                  <div className="w-full h-44 bg-[#0d1117] flex items-center justify-center relative">
                    <svg className="w-full h-full p-4" viewBox="0 0 400 140" preserveAspectRatio="none">
                      {[0, 35, 70, 105, 140].map(y => (
                        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                      ))}
                      <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="0,120 20,118 40,115 60,110 80,105 100,95 120,88 140,80 160,70 180,62 200,55 220,48 240,42 260,38 280,35 300,30 310,28 320,25 330,22 340,20 350,18 360,32 370,55 380,70 390,85 400,95" strokeLinejoin="round" strokeLinecap="round" />
                      <polygon fill="url(#redGrad)" opacity="0.15" points="0,120 20,118 40,115 60,110 80,105 100,95 120,88 140,80 160,70 180,62 200,55 220,48 240,42 260,38 280,35 300,30 310,28 320,25 330,22 340,20 350,18 360,32 370,55 380,70 390,85 400,95 400,140 0,140" />
                      <defs><linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></linearGradient></defs>
                    </svg>
                    <div className="absolute top-3 left-3">
                      <div className="text-white/40 text-[10px]">$HOOD</div>
                      <div className="text-white text-sm font-bold tabular-nums">$46.64</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border-t border-white/5">
                    <span className="text-xs text-white/50">Since post</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10">
                      <img src="/images/logos/hood.png" alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-white">$HOOD</span>
                      <span className="text-xs font-semibold text-green-400">+2.35%</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-2">
                  <p className="text-[13px] text-white/60 leading-snug line-clamp-2">$HOOD updated robinhood cheat sheet — The SuperApp Nobody's Pricing In...</p>
                  <p className="text-[11px] text-white/30 mt-1">From stocktwits.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-24" />
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 border-t border-white/10">
          <div className="px-4 py-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#1d9bf0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 6a1 1 0 00-1 1v4H7a1 1 0 000 2h4v4a1 1 0 002 0v-4h4a1 1 0 000-2h-4V7a1 1 0 00-1-1z"/></svg>
            <span className="text-[13px] text-[#1d9bf0]">Everyone can reply</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10">
            <button type="button" className="text-[#1d9bf0]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg></button>
            <button type="button" className="text-[#1d9bf0]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg></button>
            <button type="button" className="text-[#1d9bf0]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg></button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════  Main Share Sheet (Reddit-style layout)  ═══════════ */
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-h-[80%] bg-[#1c1c1e] rounded-t-2xl overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header: Share to... + X button */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-base font-semibold text-white">Share to...</span>
          <button type="button" onClick={handleClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Post preview card ── */}
          <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              {/* Left: avatar + text */}
              <img src="/avatars/howard-lindzon.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white">@howardlindzon</span>
                  <svg className="w-3 h-3 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>
                <p className="text-[13px] text-white/70 mt-1 leading-snug">$HOOD updated robinhood cheat sheet</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
                  <span>▲ 7</span>
                  <span>💬 1 comment</span>
                </div>
              </div>
              {/* Right: chart thumbnail */}
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-black border border-white/10">
                <svg className="w-full h-full p-1" viewBox="0 0 100 60" preserveAspectRatio="none">
                  {[0,15,30,45,60].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                  ))}
                  {[0,8,16,24,32,40,48,56,64,72,80,88,96].map((x, i) => {
                    const vals = [50,48,44,40,35,30,26,22,20,18,30,40,48]
                    const y = vals[i]
                    const h = 4 + Math.random() * 6
                    const up = i < 9
                    return (
                      <g key={i}>
                        <line x1={x+3} y1={y-2} x2={x+3} y2={y+h+2} stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="0.5" />
                        <rect x={x+1.5} y={y} width="3" height={h} fill={up ? '#22c55e' : '#ef4444'} rx="0.3" />
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
            <div className="px-3 pb-2 text-[10px] text-white/30">From stocktwits.com</div>
          </div>

          {/* ── Privacy note ── */}
          <p className="text-[11px] text-white/30 px-4 mb-3">Your username stays hidden when you share outside of Stocktwits.</p>

          {/* ── Social share icons row ── */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {/* X (Twitter) */}
              <button type="button" onClick={() => setXComposeOpen(true)} className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[10px] text-white/50">X</span>
              </button>
              {/* WhatsApp */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </div>
                <span className="text-[10px] text-white/50">Whatsapp</span>
              </button>
              {/* Messages */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-[#34C759] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                </div>
                <span className="text-[10px] text-white/50">Messages</span>
              </button>
              {/* Instagram Stories */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[10px] text-white/50 text-center leading-tight">Instagram<br/>Stories</span>
              </button>
              {/* Telegram */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                </div>
                <span className="text-[10px] text-white/50">Telegram</span>
              </button>
              {/* Instagram */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
                <span className="text-[10px] text-white/50">Instagram</span>
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mx-4 border-t border-white/10" />

          {/* ── Action icons row (bottom) ── */}
          <div className="flex items-start justify-around px-4 py-4">
            {[
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>, label: 'Community' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, label: 'Profile' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>, label: 'Save' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>, label: 'Copy Link' },
              { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/></svg>, label: 'More' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={handleClose}
                className="flex flex-col items-center gap-1.5 w-14"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                  {action.icon}
                </div>
                <span className="text-[10px] text-white/50 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
