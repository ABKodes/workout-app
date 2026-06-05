# RPG Gamification System — Design Spec
**Date:** 2026-06-05  
**Status:** Approved

---

## Overview

Fully gamify the workout app with an RPG / Character Build aesthetic. Dark fantasy tone. Every workout action earns XP, your body becomes a character sheet with 4 composite stats, daily quests drive daily motivation, and session completion becomes a cinematic Victory Screen. Builds on the existing ranks, badges, streak, and confetti system — all new mechanics layer on top without replacing core functionality.

---

## 1. XP System

XP is **computed** from existing `allLogs` data — no new backend storage. Same pattern as current `computeUnlocked` achievements.

### Earning XP

| Action | XP |
|---|---|
| Complete a set (tick ✓) | +10 XP |
| Complete all sets of one exercise | +25 XP bonus |
| Hit a personal record | +100 XP bonus |
| Complete a daily quest | +150 XP bonus |
| Finish an entire session | +200 XP bonus |
| Perfect session (every exercise done) | +100 XP bonus |

### Power Level & Level

- **Power Level** = total XP ÷ 100 (produces a satisfying 3–5 digit number, e.g. `4,820`)
- **Level** = `Math.floor(totalXP / 500)` — one level per 500 XP, shown as a number badge on the character avatar
- XP bar shows progress within the current level: `xp % 500 / 500`

### New file: `lib/useXP.ts`

Quest XP (150 XP per completed quest) is stored in localStorage under keys `quests_YYYY-MM-DD`. `useXP` reads all past dates' completion arrays from localStorage to include quest XP in the running total — no external parameter needed.

Exports:
```ts
useXP(allLogs: SessionLog[]): {
  totalXP: number
  powerLevel: number
  level: number
  xpIntoLevel: number
  xpToNextLevel: number   // always 500
  sessionXP: (log: SessionLog) => number  // XP for a single session (excludes quest XP)
}
```

---

## 2. Composite Stats

Four stat bars on the character sheet, all computed from log data, capped at 100.

| Stat | Source | Scale |
|---|---|---|
| ⚡ **Strength** | Total gym volume lifted (kg) | log scale: 100k kg = 100 |
| 🫁 **Endurance** | Football sessions logged | linear: 50 sessions = 100 |
| 🔥 **Consistency** | Avg sessions/week over last 12 weeks | linear: 3/week = 100 |
| 💥 **Power** | Weighted avg: STR×0.4 + END×0.2 + CON×0.4 | — |

Logarithmic scaling for Strength: `Math.min(100, Math.log10(totalGymVolume + 1) / Math.log10(100001) * 100)`

### Class Title (derived from dominant stat)

The class title appears beneath the rank name on the character header.

| Condition | Class |
|---|---|
| Strength is highest by 10+ pts | Iron Warrior |
| Endurance is highest by 10+ pts | Field Commander |
| Consistency is highest by 10+ pts | Iron Will Guardian |
| No stat leads by 10+ pts (balanced) | All-Rounder |

### New file: `lib/useStats.ts`

Exports:
```ts
useStats(allLogs: SessionLog[]): {
  strength: number   // 0–100
  endurance: number  // 0–100
  consistency: number // 0–100
  power: number      // 0–100
  classTitle: string
}
```

---

## 3. Daily Quest System

### Quest Generation

- 3 quests per day, deterministically selected from a pool using `date string` as seed
- Context-aware: gym-day quests on Mon/Tue/Fri, football-day quests on Thu/Sat, rest-day quests on Wed/Sun
- Quest state stored in `localStorage` keyed by date: `quests_YYYY-MM-DD`

### Quest Pool

**Gym day:**
- Complete all sets of [random exercise from today's day]
- Hit a personal record today
- Log 3+ sets of [random exercise]
- Finish your session (complete it)
- Perfect session — don't skip any exercise

**Football / any day:**
- Log a football session this week
- Log your body weight today
- Log your nutrition today
- Maintain your current streak (have 2+ sessions this week)
- Complete any workout today

### Quest Completion Detection

Quests are evaluated reactively from `todayLog` and `allLogs` in `useQuests`. Completion is detected automatically — no manual "claim" step.

### XP Award

When a quest transitions from incomplete → complete, +150 XP is added. Because XP is computed (not stored), the XP for completed quests is included in the total by reading localStorage completion flags.

### New file: `lib/useQuests.ts`

Exports:
```ts
useQuests(dayIndex: number, todayLog: SessionLog | null, allLogs: SessionLog[]): {
  quests: Quest[]         // today's 3 quests
  completedIds: string[]  // which are done
  questXP: number         // XP from completed quests today
}

interface Quest {
  id: string
  label: string
  xp: 150
  complete: boolean
}
```

---

## 4. Character Screen

Replaces the current "Badges" tab in `StatsScreen`. The tab label changes from "Badges 🏆" to "Character ⚔️".

### Layout (top to bottom)

1. **Character Hero Card** — rank emoji avatar with level badge, rank name, class title, level + Power Level number, XP bar to next level, 4 stat bars (Strength / Endurance / Consistency / Power)
2. **Stats Row** — 3 pills: Sessions count, PRs hit, Streak weeks
3. **Rank Ladder** — existing RANKS array, current rank highlighted with purple left-border accent
4. **Badges** — existing achievements grid, unchanged

### New file: `components/CharacterScreen.tsx`

Replaces `components/AchievementsScreen.tsx` (which is deleted or merged into CharacterScreen). CharacterScreen accepts `allLogs: SessionLog[]` and internally calls `useXP`, `useStats`, `computeUnlocked`.

---

## 5. In-Workout Experience

### Quest Card on DayScreen

A `QuestCard` component renders between `StreakBar` and the first exercise section in `DayScreen`. Shows today's 3 quests with real-time completion state. Collapsed to a single line on rest days (no active quests).

### XP Float Animation

A `XPFloat` component renders a positioned overlay on `SetRow`. When a set is ticked done:
- Regular set: purple `+10 XP` floats up and fades over 800ms
- Personal record: gold `+100 XP` with glow, 1s animation
- Quest completion (detected in `DayScreen`): green `+150 XP ⚔️` toast-style pulse

Implementation: `useState` tracks a list of active floats, each with an ID and XP value. A `useEffect` removes floats after their animation duration.

### New files

- `components/QuestCard.tsx` — quest card for DayScreen
- `components/XPFloat.tsx` — floating XP number animation

### Modified files

- `components/SetRow.tsx` — accepts `isPR: boolean` prop (computed by DayScreen comparing current weight vs `prevLog` max) and `onSetDone?: () => void` callback triggered when a set is ticked done
- `components/DayScreen.tsx` — computes `isPR` per set from `prevLog`, renders `QuestCard`, handles `onSetDone` to trigger `XPFloat` with correct XP value (+10 regular, +100 PR), detects quest completion transitions for +150 XP floats, replaces current finish/confetti UI with `VictoryScreen`. Also adds `const [sessionStart] = useState(() => Date.now())` on mount so duration is available at finish.

---

## 6. Victory Screen

Replaces the current session-complete summary in `DayScreen` (the `finished` state UI + confetti). Confetti still fires behind the Victory Screen.

### Layout

1. ⚔️ icon + `SESSION COMPLETE` + `Victory.` heading
2. Purple gradient XP card: total XP earned this session, Power Level before → after
3. Stat gains panel: each stat that changed shows its bar + `▲ +N` delta
4. Quests panel: 3 quests ticked/crossed
5. Session stats row: volume, PRs, duration
6. `BACK TO HOME` button (resets `finished` state)

### New file: `components/VictoryScreen.tsx`

Props:
```ts
interface VictoryScreenProps {
  sessionXP: number
  powerBefore: number   // captured before finishSession() saves the log
  powerAfter: number    // computed after save from updated allLogs
  statsBefore: Stats    // captured before finishSession()
  statsAfter: Stats     // computed after save
  quests: Quest[]
  volume: number
  prs: number
  durationMins: number  // Math.round((Date.now() - sessionStart) / 60000)
  onClose: () => void
}
```

`statsBefore` and `powerBefore` must be captured in `DayScreen` state *before* calling `finishSession()`, since `allLogs` updates asynchronously after the save. `statsAfter` and `powerAfter` are derived from the updated `allLogs` once the Victory Screen mounts.

---

## 7. File Plan

### New files

| File | Purpose |
|---|---|
| `lib/useXP.ts` | XP computation hook |
| `lib/useStats.ts` | Composite stats hook |
| `lib/useQuests.ts` | Daily quest generation + tracking |
| `components/CharacterScreen.tsx` | Full character profile screen |
| `components/QuestCard.tsx` | Quest card for DayScreen header |
| `components/XPFloat.tsx` | Floating XP animation |
| `components/VictoryScreen.tsx` | Cinematic session complete screen |

### Modified files

| File | Change |
|---|---|
| `components/StatsScreen.tsx` | Rename "Badges" tab to "Character", swap `AchievementsScreen` for `CharacterScreen` |
| `components/DayScreen.tsx` | Add `QuestCard`, wire `XPFloat`, replace finish summary with `VictoryScreen` |
| `components/SetRow.tsx` | Add `onXPEarned` callback prop |
| `components/AchievementsScreen.tsx` | Delete — logic merged into `CharacterScreen` |

### No backend changes

All new state is either computed from existing `allLogs` or stored in `localStorage`. Supabase schema is untouched.

---

## Visual Design

- **Palette:** Existing dark base (`#0d0d0d`, `#111`, `#1e1e1e`) preserved
- **RPG accents:** Purple (`#7c3aed`, `#a78bfa`), gold (`#facc15`), orange (`#f97316`), green (`#22c55e`)
- **Character card:** `linear-gradient(135deg, #0f0d1a, #1a1428)` with `#7c3aed40` border and radial glow
- **XP bar:** `linear-gradient(90deg, #4c1d95, #a78bfa)` with glowing right tip
- **Typography:** Existing font stack — all-caps `letter-spacing` for stat labels, `font-black` for numbers
- **Animations:** CSS-only — `@keyframes floatUp` for XP floats, `transition-all` on stat bars, no JS animation libraries

---

## Out of Scope

- Social features / leaderboards
- Per-exercise skill levels (considered, not chosen)
- RPG-flavored exercise renaming
- Backend XP storage
- Push notification changes
