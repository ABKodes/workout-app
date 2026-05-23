# Engagement + Progress Visibility — Design Spec
**Date:** 2026-05-24
**Status:** Approved
**Goal:** Make every rest period feel purposeful and make progress feel real after the first month of training.

---

## Problem

1. **Rest timer is passive (B):** The between-set experience is a blank countdown. Nothing reinforces form, nothing tells you how close you are to finishing the exercise, nothing marks a well-executed set.
2. **Progress is invisible (C):** The stats screen shows per-exercise strength charts but gives no summary answer to the question "am I actually getting stronger?" That doubt kills motivation around week 3.

---

## Feature 1 — Rest Timer Enrichment

### 1a. Exercise-specific form cues

**Where it lives:** `lib/cues.ts` — a new static file exporting a `Record<string, string>` mapping exercise name to a single short cue (one sentence, ≤10 words). Rendered inside `RestCountdown` during the rest period.

**UI:** Italic gray text (`text-gray-500 italic text-[12px]`) above the timer ring, below the "Rest" label. If no cue exists for the current exercise, the element is not rendered — no empty space.

**Cue table:**

| Exercise | Cue |
|---|---|
| DB Lateral Raise | Lead with your elbows, not your wrists |
| Low Incline DB Press | Drive the dumbbells up and slightly together |
| DB Flye w/ Integrated Partials | Feel the stretch at the bottom — don't rush it |
| DB Skull Crusher | Keep your upper arms vertical throughout |
| Close-Grip Assisted Dip | Lean slightly forward, elbows close to your body |
| Plate-Weighted Crunch | Exhale fully at the top of every rep |
| Overhand Lat Pulldown | Pull your elbows straight down — not back |
| DB RDL | Push your hips back, keep the dumbbells close to your legs |
| Helms Row | Pause at the top and squeeze your shoulder blade |
| DB Lat Pullover | Keep a slight bend in your elbows throughout |
| Hammer Curl | No swinging — initiate from the elbow only |
| Bent-Over Reverse DB Flye | Lead with your pinkies, arms almost straight |
| Hack Squat / Goblet Squat | Knees track over your toes, chest stays up |
| Standing Calf Raise | Pause at the top and control the way down |

### 1b. Sets-left indicator

**What it shows:** A single line below "Next: [label]" inside `RestCountdown`. Content:
- `"Last set — finish strong!"` when `setsLeft === 0` (current set was the last on this exercise)
- `"1 more set on this exercise"` when `setsLeft === 1`
- `"{n} more sets on this exercise"` when `setsLeft > 1`
- Hidden when transitioning to a different exercise (the "Next:" label already covers it)

**Props change:** `RestCountdown` gains `setsLeft: number`. Caller (`GuidedSession`) computes: `numSets - setIdx - 1`.

### 1c. Clean set toast

**Trigger:** In `handleDone`, after logging the set — if `parseInt(localReps) >= upperReps(ex.reps)` (user hit the top of the rep target range).

**UI:** A green pill toast rendered below the action buttons, fades in immediately, auto-dismisses after 2.5 seconds via `useEffect` timeout. Message: `"Clean set — +2.5kg next session 💪"`. Styled: `bg-[#0a2a12] border border-green-900 text-green-400 text-[12px] font-bold rounded-full px-4 py-2`.

**State:** `const [showCleanSet, setShowCleanSet] = useState(false)` in `GuidedSession`. Effect clears it after 2500ms. Does not block rest timer from starting — both happen simultaneously.

**Does not fire:** If the set also triggered a weight PR — the condition in `handleDone` checks for PR first (`newW > histMax`). Clean set only fires when `newW <= histMax` (or no history exists). The two toasts never overlap.

### Architecture

| File | Change |
|---|---|
| `lib/cues.ts` | New — static cue map |
| `components/GuidedSession.tsx` | Pass `cue` and `setsLeft` to `RestCountdown`; add `showCleanSet` state + logic in `handleDone` |

---

## Feature 2 — Strength Gains Card

### What it shows

A card in `ProgressSection.tsx` positioned between `SummaryCard` and the exercise accordion. Displays up to 3 exercises ranked by percentage strength improvement, comparing best weight in the last 28 days against best weight older than 28 days.

Example row:
```
Overhand Lat Pulldown    ↑ 23%    32.5kg → 40kg
```

### Visibility rule

The card is only rendered when **at least one exercise** has logged data on both sides of the 28-day window. Hidden entirely for users with fewer than ~4 weeks of history — no placeholder, no "come back later" message.

### Data computation

Stays inside `ProgressSection`'s existing `useMemo`. For each name in `gymExerciseNames`:
1. Split `allLogs` into `recent` (date within last 28 days) and `older` (date > 28 days ago)
2. `nowBest` = max weight from `recent` sessions for this exercise (done sets only)
3. `thenBest` = max weight from `older` sessions for this exercise (done sets only)
4. If both exist and `thenBest > 0`: `pct = Math.round(((nowBest - thenBest) / thenBest) * 100)`

Sort by `pct` descending, take top 3. Only include entries where `pct > 0` (actual improvement).

### UI

```
STRENGTH GAINS · LAST 4 WEEKS

Overhand Lat Pulldown     ↑ 23%    32.5 → 40kg
DB RDL                    ↑ 17%    30 → 35kg
Hammer Curl               ↑ 12%    10 → 11.25kg
```

- Card background: `bg-[#111] border border-[#1e1e1e] rounded-xl p-4 mb-5`
- Label: `text-[10px] font-bold uppercase tracking-widest text-gray-600`
- Exercise name: `text-[12px] font-bold text-white truncate`
- Percentage badge: `text-[11px] font-black text-green-400`
- Weight range: `text-[10px] text-gray-500`

### Architecture

| File | Change |
|---|---|
| `components/ProgressSection.tsx` | Add `StrengthGainsCard` component + gains computation inside existing `useMemo` |

No new files, no new hooks — all data derives from `allLogs` already in scope.

---

## Out of scope (this version)

- Per-session volume chart (weight × reps × sets)
- Editing or dismissing form cues
- Customising the 28-day comparison window
- Cues in normal (non-guided) ExerciseCard mode

---

## Success criteria

- Rest period shows a relevant cue and set count on every guided session set
- Clean set toast appears and disappears without blocking the rest timer
- Strength Gains card shows for any user with 4+ weeks of data; is absent for new users
- No regression to existing rest timer, PR celebration, or progress chart flows