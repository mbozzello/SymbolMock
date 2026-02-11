import { useNavigate, useLocation } from 'react-router-dom'

function clsx(...values) {
  return values.filter(Boolean).join(' ')
}

const TABS = [
  { id: 'home', label: 'Home', path: '/homeios', icon: (a) => (
    <svg className="w-6 h-6" fill={a ? '#2196F3' : 'none'} stroke={a ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
  )},
  { id: 'leaderboard', label: 'Leaderboard', path: null, icon: (a) => (
    <svg className="w-6 h-6" fill={a ? '#2196F3' : 'none'} stroke={a ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v4a6 6 0 01-6 6 6 6 0 01-6-6V3zM4 3h1M19 3h1M4 3a2 2 0 00-2 2v1a4 4 0 004 4M20 3a2 2 0 012 2v1a4 4 0 01-4 4M9 17h6M10 21h4M12 13v4"/></svg>
  )},
  { id: 'explore', label: 'Explore', path: '/exploreios', icon: (a) => (
    <svg className="w-6 h-6" fill="none" stroke={a ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
  )},
  { id: 'tools', label: 'Tools', path: '/iostools', icon: (a) => (
    <svg className="w-6 h-6" fill="none" stroke={a ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
  )},
  { id: 'notifications', label: 'Notifications', path: '/iosnotifications', badge: 4, icon: (a) => (
    <svg className="w-6 h-6" fill="none" stroke={a ? '#2196F3' : 'white'} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
  )},
]

export default function IOSBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeId = location.pathname === '/iostools' ? 'tools' : location.pathname === '/iosnotifications' ? 'notifications' : location.pathname === '/exploreios' ? 'explore' : location.pathname === '/homeios' ? 'home' : 'home'

  return (
    <div className="shrink-0 bg-black border-t border-white/10 pb-5 pt-2 px-2">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { if (tab.path) navigate(tab.path) }}
            className="flex flex-col items-center gap-0.5 relative"
          >
            <div className="relative">
              {tab.icon(activeId === tab.id)}
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={clsx('text-[10px]', activeId === tab.id ? 'text-[#2196F3]' : 'text-white/50')}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
