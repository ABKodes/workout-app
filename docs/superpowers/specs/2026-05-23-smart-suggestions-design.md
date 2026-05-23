# Smart Weight Suggestions + Bodyweight Tracker — Design Spec
**Date:** 2026-05-23  
**Status:** Approved  
**Goal:** Make the first gym session and every session after it frictionless — the app tells you what weight to use, pre-fills it, and tracks whether you're getting stronger.

---

## Problem

1. **No starting point (A):** A first-time gym goer has no idea what weight to put on the bar. The app currently shows empty drum pickers with no guidance.
2. **Logging friction (D):** Every set requires scrolling two drum pickers before tapping Done. With 4 sets × 6 exercises, that's ~72 manual interactions per session.

## Solution

- Log bodyweight once → app calculates conservative starting weights for every exercise
- Pre-fill drum pickers with those suggestions (or last session's data + overload nudge) so most sets become one tap
- Track bodyweight over time in the Stats screen so progress is visible beyond just strength numbers

---

## Feature 1 — Bodyweight Tracker

### Where it lives
New card at the **top of the Stats screen**, above the existing Strength Progress section.

### UI
- Large current weight display (e.g. **72.5 kg**) with the date it was logged
- Small line chart of the last 8–10 entries (same style as existing exercise charts)
- "Log today's weight" button → opens a simple number input bottom sheet → saves and closes

### Data
- Storage key: `bw_log_v1` in localStorage
- Format: `Array<{ date: string; weight: number }>` — date as `YYYY-MM-DD`
- One entry per day: logging twice on the same day replaces that day's entry
- Synced to Supabase via the same background upsert pattern as session logs
- New hook: `lib/useBodyweight.ts` — exposes `entries`, `latestWeight`, `logWeight(kg)`

### Behaviour
- App works normally if no bodyweight is logged — suggestions just don't appear until the first entry
- No mandatory onboarding gate

---

## Feature 2 — Starting Weight Suggestions

### When it triggers
An exercise has **no logged history** AND a bodyweight entry exists.

### Suggestion logic
`lib/suggestions.ts` exports `getStartingWeight(exerciseName, bodyweightKg)`:
- Looks up the exercise in a ratio table (see below)
- Calculates `Math.round((bodyweightKg * ratio) / 2.5) * 2.5` (rounds to nearest 2.5kg)
- Returns `null` for bodyweight-only exercises (no weight to suggest)

### Ratio table

| Exercise | Ratio |
|---|---|
| DB Lateral Raise | 0.05 |
| Low Incline DB Press | 0.18 |
| DB Flye w/ Integrated Partials | 0.08 |
| DB Skull Crusher | 0.08 |
| Close-Grip Assisted Dip | 0.10 |
| Plate-Weighted Crunch | 0.06 |
| Overhand Lat Pulldown | 0.45 |
| DB RDL | 0.22 |
| Helms Row | 0.18 |
| DB Lat Pullover | 0.12 |
| Hammer Curl | 0.09 |
| Bent-Over Reverse DB Flye | 0.06 |
| Hack Squat / Goblet Squat | 0.30 |
| Standing Calf Raise | 0.55 |
| Plate-Weighted Crunch | 0.06 |

Bodyweight-only (no suggestion): Nordic Ham Curl, Copenhagen Hip Adduction, Reverse Nordic, Depth Jumps, Split Squat Jumps, Box Jumps, Single-Leg Lateral Hops, Broad Jumps.

### UI
- Drum picker in ExerciseCard and GuidedSession pre-fills with the suggested weight
- Small `💡 suggested` badge appears below the weight picker — disappears after the first set is logged on that exercise
- If no bodyweight is logged: drum picker defaults to `20` (current behaviour), no badge

---

## Feature 3 — Progressive Overload Suggestions

### When it triggers
An exercise has **at least one previous session** of logged data.

### Suggestion logic
`lib/suggestions.ts` exports `getProgressionSuggestion(exerciseName, allLogs, targetReps)`:

1. Find the most recent session where this exercise was logged
2. Get the sets that were marked done — extract weight and reps
3. Apply rules:
   - All sets completed **at or above** the top of the target rep range → return `{ weight: lastWeight + 2.5, badge: 'up' }`
   - All sets completed but at or below the bottom of the range → return `{ weight: lastWeight, badge: null }`
   - Any sets not completed (done=false) → return `{ weight: lastWeight, badge: 'same' }`
4. Round weight to nearest 2.5kg

### UI
- Drum picker pre-fills with the suggestion weight
- Badge variants:
  - **Green "↑ +2.5kg"** — user earned an increase
  - **Gray "→ same weight"** — held or missed reps last time
  - **No badge** — completed all reps, same weight (neutral, picker just pre-fills)
- Badge appears in the ExerciseCard header and in GuidedSession's exercise context area
- Badge disappears after the first set of the current session is logged

### Priority
Progression suggestion takes priority over starting weight suggestion. Starting weight only fires when there is zero history.

---

## Architecture

### New files
| File | Purpose |
|---|---|
| `lib/useBodyweight.ts` | Hook — load/save bodyweight log, expose latest weight |
| `lib/suggestions.ts` | Pure functions — `getStartingWeight`, `getProgressionSuggestion` |

### Modified files
| File | Change |
|---|---|
| `components/StatsScreen.tsx` | Add `BodyweightCard` section at top |
| `components/BodyweightSection.tsx` | New component — chart + log button (replaces any existing stub) |
| `components/ExerciseCard.tsx` | Consume suggestion, pre-fill weight, show badge |
| `components/GuidedSession.tsx` | Consume suggestion, pre-fill weight, show badge |
| `components/SetRow.tsx` | Pass suggestion weight as default (instead of hardcoded `'20'`) |

### Data flow
```
useBodyweight() → latestWeight
                        ↓
              getStartingWeight(name, latestWeight)    ← no history
              getProgressionSuggestion(name, allLogs)  ← has history
                        ↓
              suggested weight → drum picker default
                              → badge shown in header
```

---

## Out of scope (this version)
- Editing or deleting bodyweight entries
- Syncing suggestions across devices (suggestions are computed client-side from local data)
- Custom ratio overrides per user
- Deload week detection

---

## Success criteria
- First-session user: drum picker shows a sensible starting weight, not `20` for everything
- Returning user: drum picker pre-fills with last session + nudge, badge tells them why
- Bodyweight chart visible in Stats, loggable in under 5 seconds
- No regression to existing set logging, rest timer, or guided session flows