import { useState } from 'react'

/**
 * iOS-styled share sheet modal (similar to Reddit / native iOS share sheet).
 * Tapping the X (Twitter) icon opens a compose-to-X overlay with a post preview card.
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
          {/* User row + text input */}
          <div className="flex gap-3">
            <img src="/avatars/user-avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              {/* Fake text input showing the URL */}
              <div className="text-[15px] text-[#1d9bf0] leading-relaxed break-all">
                https://stocktwits.com/howardlindzon/message/12345
              </div>

              {/* Post Preview Card */}
              <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden bg-[#16181c]">
                {/* Card header: avatar + user */}
                <div className="flex items-center gap-2 p-3 pb-2">
                  <img src="/avatars/howard-lindzon.png" alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-white">@howardlindzon</span>
                  <svg className="w-3.5 h-3.5 text-[#2196F3] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>

                {/* Chart image area */}
                <div className="relative mx-3 rounded-xl overflow-hidden bg-black border border-white/5">
                  {/* Stocktwits watermark top-right */}
                  <div className="absolute top-2 right-2 z-10">
                    <img src="/images/stocktwits-logo.png" alt="Stocktwits" className="h-5 opacity-60" />
                  </div>

                  {/* Fake chart */}
                  <div className="w-full h-44 bg-[#0d1117] flex items-center justify-center relative">
                    <svg className="w-full h-full p-4" viewBox="0 0 400 140" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0, 35, 70, 105, 140].map(y => (
                        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                      ))}
                      {/* Price line going up then dropping */}
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        points="0,120 20,118 40,115 60,110 80,105 100,95 120,88 140,80 160,70 180,62 200,55 220,48 240,42 260,38 280,35 300,30 310,28 320,25 330,22 340,20 350,18 360,32 370,55 380,70 390,85 400,95"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {/* Area fill */}
                      <polygon
                        fill="url(#redGrad)"
                        opacity="0.15"
                        points="0,120 20,118 40,115 60,110 80,105 100,95 120,88 140,80 160,70 180,62 200,55 220,48 240,42 260,38 280,35 300,30 310,28 320,25 330,22 340,20 350,18 360,32 370,55 380,70 390,85 400,95 400,140 0,140"
                      />
                      <defs>
                        <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Price label */}
                    <div className="absolute top-3 left-3">
                      <div className="text-white/40 text-[10px]">$HOOD</div>
                      <div className="text-white text-sm font-bold tabular-nums">$46.64</div>
                    </div>
                  </div>

                  {/* Bottom overlay bar: "Since post" + ticker pill */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border-t border-white/5">
                    <span className="text-xs text-white/50">Since post</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10">
                      <img src="/images/logos/hood.png" alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-white">$HOOD</span>
                      <span className="text-xs font-semibold text-green-400">+2.35%</span>
                    </div>
                  </div>
                </div>

                {/* Post preview text */}
                <div className="p-3 pt-2">
                  <p className="text-[13px] text-white/60 leading-snug line-clamp-2">
                    $HOOD updated robinhood cheat sheet — The SuperApp Nobody's Pricing In...
                  </p>
                  <p className="text-[11px] text-white/30 mt-1">From stocktwits.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-24" />
        </div>

        {/* Bottom: "Everyone can reply" + toolbar */}
        <div className="shrink-0 border-t border-white/10">
          <div className="px-4 py-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#1d9bf0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 6a1 1 0 00-1 1v4H7a1 1 0 000 2h4v4a1 1 0 002 0v-4h4a1 1 0 000-2h-4V7a1 1 0 00-1-1z"/></svg>
            <span className="text-[13px] text-[#1d9bf0]">Everyone can reply</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10">
            <button type="button" className="text-[#1d9bf0]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
            </button>
            <button type="button" className="text-[#1d9bf0]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
            </button>
            <button type="button" className="text-[#1d9bf0]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════  Main Share Sheet  ═══════════ */
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-h-[75%] bg-[#1c1c1e] rounded-t-2xl overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-base font-semibold text-white">More actions...</span>
          <button type="button" onClick={handleClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Social share icons row */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {/* X (Twitter) – black logo → opens compose overlay */}
              <button type="button" onClick={() => setXComposeOpen(true)} className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[10px] text-white/50">X</span>
              </button>
              {/* WhatsApp */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-[10px] text-white/50">WhatsApp</span>
              </button>
              {/* Messages / iMessage */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-[#34C759] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <span className="text-[10px] text-white/50">Message</span>
              </button>
              {/* Copy link */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-[#FF9500] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <span className="text-[10px] text-white/50">Copy link</span>
              </button>
              {/* Telegram */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <span className="text-[10px] text-white/50">Telegram</span>
              </button>
              {/* More */}
              <button type="button" className="shrink-0 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/></svg>
                </div>
                <span className="text-[10px] text-white/50">More</span>
              </button>
            </div>
            <p className="text-[11px] text-white/30 mt-2.5">Your username stays hidden when you share outside of Stocktwits.</p>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/10" />

          {/* Action list */}
          <div className="py-2">
            {[
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>, label: 'Follow post', color: 'text-white' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>, label: 'Save', color: 'text-white' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.334a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>, label: 'Copy text', color: 'text-white' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>, label: 'Crosspost to a community', color: 'text-white' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>, label: 'Report', color: 'text-red-400' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>, label: 'Block account', color: 'text-red-400' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>, label: 'Hide', color: 'text-white' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={handleClose}
                className="flex items-center gap-4 w-full px-4 py-3 active:bg-white/5 transition-colors"
              >
                <span className={action.color}>{action.icon}</span>
                <span className={`text-sm font-medium ${action.color}`}>{action.label}</span>
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
