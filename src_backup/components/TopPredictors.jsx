const PREDICTORS = [
  { rank: 1, user: 'howardlindzon', avatar: '/avatars/top-voice-1.png', performance: 452 },
  { rank: 2, user: 'amitDBA', avatar: '/avatars/top-voice-2.png', performance: 318 },
  { rank: 3, user: 'Trading4Living', avatar: '/avatars/top-voice-3.png', performance: 287 },
  { rank: 4, user: 'gpaisa', avatar: '/avatars/top-voice-1.png', performance: 150 },
  { rank: 5, user: 'ivanhoff', avatar: '/avatars/top-voice-2.png', performance: 120 },
]

export default function TopPredictors() {
  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden w-full max-w-[200px] flex flex-col h-full">
      <div className="px-3 pt-2.5 pb-1.5 shrink-0">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">Top predictors</h3>
      </div>
      <div className="flex-1 min-h-0 flex flex-col divide-y divide-border px-2">
        {PREDICTORS.map((p) => (
          <div key={p.rank} className="flex-1 min-h-[2.5rem] flex items-center gap-2 py-2 rounded hover:bg-surface-muted/40 transition-colors">
            <span className="text-xs font-bold text-muted w-4 shrink-0 tabular-nums">{p.rank}</span>
            <img
              src={p.avatar}
              alt=""
              className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
            />
            <span className="text-[11px] font-medium text-text truncate min-w-0 flex-1">{p.user}</span>
            <span className="text-[11px] text-success font-bold shrink-0 tabular-nums">+{p.performance}%</span>
          </div>
        ))}
      </div>
      <a href="#" className="block text-center text-primary text-xs font-semibold hover:underline py-2 shrink-0 border-t border-border transition-colors hover:bg-surface-muted/50">
        View Full Leaderboard
      </a>
    </div>
  )
}
