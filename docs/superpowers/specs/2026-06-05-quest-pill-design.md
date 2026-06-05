# Quest Card → Pill Strip

**Date:** 2026-06-05

## Problem

The QuestCard occupies ~180px of vertical space on the workout day screen — header row + 3 full quest rows + progress bar. This pushes the workout content down and feels heavy relative to how quickly the user absorbs the information.

## Decision

Replace QuestCard with a single-line pill strip (Option A).

## Design

Single horizontal pill, ~32px tall:

```
⚔️  Quests   ●  ●  ○   1/3
```

- **Container:** `bg-[#0f0d1a]`, `border border-[#4c1d9550]`, `rounded-full`, `px-3 py-1.5`, `mb-3`
- **Icon:** ⚔️ at 12px
- **Label:** "Quests" in `text-[9px] font-bold uppercase tracking-[2px] text-[#a78bfa]`
- **Dots:** 3 dots — `#a78bfa` filled when done, `#2a2a2a` when pending, `w-2 h-2 rounded-full`
- **Count:** `N/3` in `text-[9px] font-bold text-[#7c3aed]`

No expand interaction. The pill is read-only — just a compact status indicator. Quest labels are visible on the Victory Screen after the session.

## File Changed

- `components/QuestCard.tsx` — full rewrite, same props interface (`{ quests: Quest[] }`)
