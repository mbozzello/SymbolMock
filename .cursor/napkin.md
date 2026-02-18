# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-17 | user | Placed toggle buttons in wrong location (above sparkline at very top) | Keep UI controls adjacent to the content they affect — toggle for prediction/sentiment belongs inside the sentiment row, right-aligned above its content |
| 2026-02-17 | user | Used underline tab style for Prediction/Sentiment toggle | Use pill/toggle switch style — black background container, active state = white pill black text, inactive = white/40 dimmed text |
| 2026-02-17 | user | Too much padding below toggle buttons (pt-1, pb-1) | Use pt-1 pb-0 -mb-1 on toggle wrapper, pt-2 pb-3 on content below |
| 2026-02-17 | user | Removed "Schedule" word but also removed the calendar icon | Only remove the text label, keep the icon |
| 2026-02-17 | user | When adding the DebateBox to multiple identical JSX patterns in a file, StrReplace failed with "multiple matches" | Provide more surrounding context lines to make each StrReplace target unique |
| 2026-02-17 | user | Replaced the entire Schedule button with X icon | Keep both as separate buttons; only remove label text, never remove functional elements |
| 2026-02-17 | user | Earnings Call + Trending pills were placed outside SymbolHeaderAbovePostBox in Home.jsx | These pills belong inside the header component between timestamp and watchers row |
| 2026-02-03 | user | Used `variant !== 'predict'` to hide pills — removed them from /symbolpredict2 unintentionally | Use dedicated props (`hidePills`, `hideNo`) per-page rather than keying off `variant`; variant is shared between both predict pages |
| 2026-02-03 | user | Removed pills from /symbolpredict2 when user only asked for /symbolpredict | Always confirm which page(s) a change applies to — /symbolpredict2 is a separate checkpoint, not the same as /symbolpredict |

## User Preferences
- `/symbol` is the production page — never break it when experimenting
- `/symbolpredict` is the active playground — all new work goes here unless told otherwise
- `/symbolpredict2` is a checkpoint snapshot — only update when user explicitly says "copy to symbolpredict2"; treat it as frozen otherwise
- Per-page feature flags: use dedicated boolean props (e.g. `hidePills`, `hideNo`) passed from the page file — never key off `variant` for page-specific differences since both predict pages share `variant="predict"`
- Spacing: prefer tighter/compact layouts; user frequently asks to remove extra padding
- Component variants: use a `variant` prop to conditionally render alternate UI rather than creating separate components
- Pill toggles: black bg, white active pill, white/40 inactive text — not underline tabs
- Mock data: always add fake engagement counts (no zeros visible in feed)
- Logo sizing: TSLA logo on /symbol is 84px rounded-2xl with shadow
- Action bar icon hover: icons expand to show text label on hover using max-w-0 → max-w-[80px] transition
- Post button width: 70px (min-w-[70px])
- Dev server: runs on localhost:3000 via `npm run dev` in /Users/mikebozzello/Desktop/SymbolMock

## Patterns That Work
- For "keep focus inside post box": use `document.addEventListener('mousedown')` + `postBoxRef` + `e.preventDefault()` on inner interactive elements
- Floating watcher count: `animate-watchers-float-wiggle` class, triggered via `setFloatingWatchers({value, key: Date.now()})` on interval
- Chart expand/collapse: `-mt-[14px] z-10 relative` on the chart section div to float the Chart button over the border above it
- `variant` prop pattern: pass `variant="predict"` to `SymbolHeaderAbovePostBox` to activate alternate UI without touching /symbol
- Per-page feature flags: dedicated boolean props (`hidePills`, `hideNo`) passed from the page component — cleaner than variant checks when two pages share the same variant
- Debate voting: manage `localVote` state inside `DebateBox` for immediate UI feedback; don't depend on parent state updates for mock data
- Copying pages as playground: `cp Home.jsx SymbolPredict.jsx` + rename export + add route in App.jsx
- Prediction market math: YES return = `1/P`, NO return = `1/(1-P)`; clamp P to [0.01, 0.99] to avoid divide-by-zero; display as `x.xxX` inside the button
- Uniform button sizing: use fixed `w-[Npx] justify-center` instead of padding-only when button content varies per row (e.g. different return multiplier lengths)
- X logo active state: swap SVG for actual `<img src="/icons/x-logo.png">` when toggled on; gives pixel-perfect brand logo rather than approximated SVG path

## Patterns That Don't Work
- Putting toggle controls far from the content they control — user always moves them closer
- Using `border-b-2` underline tabs for binary on/off toggles — use pill switch instead
- Adding `py-3` uniformly to toggled content rows when a toggle sits directly above — top padding creates unwanted gap

## Domain Notes
- Stack: React + Vite + Tailwind CSS, runs on port 3000
- Routes defined in `src/App.jsx` — add new pages there with import + `<Route>`
- `/home` → Homepage3.jsx (main home feed with multiple tickers)
- `/symbol` → Home.jsx (TSLA symbol page, production)
- `/symbolpredict` → SymbolPredict.jsx (playground clone of /symbol)
- Shared header component: `src/components/SymbolHeaderAbovePostBox.jsx` — used by both /symbol and /symbolpredict
- `clsx` is defined locally in most files as a simple filter+join utility, not imported from npm
- Logo images live in `public/images/logos/` and `public/avatars/`
- Dark mode: toggled via `data-theme="light"` attribute on `document.documentElement`; stored in localStorage
- WatchlistContext, BookmarkContext, LiveQuotesContext are the main shared contexts
- Watcher animation class `animate-watchers-float-wiggle` is defined in Tailwind config or index.css
- `/leaderboard` → Leaderboard.jsx (full-width, no right rail — two leaderboards side by side)
- Nav items in TopNavigation: `['Earnings', 'News', 'Leaderboards', 'Social Tools']` — each linked via `isXxxPage` pattern + `<Link>` block
