# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-17 | self | Built the `/symbolpredict` mode toggle with muted text-only inactive styling, which made inactive state look washed out. | For segmented switches, always give inactive track a clear neutral fill (gray) plus active white thumb; validate contrast for both states. |
| 2026-02-17 | self | Changed row container to `justify-start` but user still saw right-aligned control. | For strict left pinning, avoid relying only on parent flex justification; set control container to `w-fit mr-auto` and remove ambiguous wrappers. |
| 2026-02-17 | self | Left pin with utility classes still appeared unchanged in user view. | Use explicit full-width left-justified wrapper plus inline `marginRight: auto` to defeat cascade/order surprises, then verify against live screenshot. |

## User Preferences
- On `/symbolpredict`, the Prediction/Sentiment control should feel like one true on/off switch, not two separate pills.
- Whichever state is not selected should be visibly gray.
- Keep the Prediction/Sentiment switch left-aligned in its row and remove extra top padding above it.
- Add a bit of space below the Prediction/Sentiment switch and keep the switch slightly shorter in height.
- `/symbolpredict` default prediction prompt should be "Will 2 Fed Rate Cust Happen in 2026?" with a 26% chance.
- `/symbolpredict` default prediction prompt should read "Will 2 Fed Rate Cuts Happen in 2026?" with a 26% chance.
- Low prediction probabilities (e.g., 26%) should render as red, not orange.
- Show "10,200 predictors" next to the prediction dropdown chevron in the header row.
- In prediction mode, show a Powell image tile to the left of the percentage gauge.
- Keep a full replica page at `/symbolpredict2` as the sandbox/playground for new ideas.
- In the post composer, show a small top-right Drafts control on focus; tapping it should open fake drafts and selecting one should populate the message box (X-style behavior).
- Keep drafts UI simple: clicking Drafts should open a standard modal (full-screen backdrop + centered panel), not a complex in-card overlay.
- Drafts trigger in composer should be plain blue text ("Drafts") with no icon and no pill/chip styling.

## Patterns That Work
- Use a segmented control pattern: gray track, white sliding thumb, explicit left/right click targets, and short transition.
- If UI changes appear inconsistent, check for multiple Vite processes on different ports; kill all stale instances and run a single server.
- If `npm run dev` fails with `listen EPERM ... ::1:3000` in this environment, rerun dev server start with escalated permissions.
- For a more native segmented feel: use a subtle border on the track, tighter inner padding (`p-0.5`), small pill thumb shadow, and ~300ms thumb slide with slightly faster text-color transition.
- To keep localhost stable in Codex desktop, run `npm run dev` in a persistent TTY session (not short-lived background command segments).

## Patterns That Don't Work
- Relying only on muted text color for inactive state without a neutral background causes the switch to look unclear.

## Domain Notes
- Primary UI target for this interaction is `/Users/mikebozzello/Desktop/SymbolMock/src/components/SymbolHeaderAbovePostBox.jsx`.
