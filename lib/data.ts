import { Day } from '@/types'

export const days: Day[] = [
  {
    label: 'Mon', emoji: '🔴', type: 'Push\nChest·Delts·Tris', badge: 'gym',
    title: 'Monday — Push Day',
    sub: 'Chest · Shoulders · Triceps · Abs · ~65 min',
    sections: [
      {
        head: 'Gym work',
        rows: [
          { name: 'DB Lateral Raise', note: 'Sweep up in a Y motion — connect with mid delts. Full ROM. Sub: Cuffed Behind-The-Back Lateral Raise', sets: '3', reps: '10–12', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
          { name: 'Low Incline DB Press', note: '15° incline. 1 sec pause on chest each rep. Constant pec tension. Sub: Low Incline Smith Press', sets: '4', reps: '8–10', rpe: '~8–9', rest: '2–3 min', restSeconds: 150 },
          { name: 'DB Flye w/ Integrated Partials', note: 'Alternate full-ROM and half-ROM every rep. Deep pec stretch builds chest width. Sub: Pec Deck', sets: '3', reps: '12–15', rpe: '~8–9', rest: '1–2 min', restSeconds: 90 },
          { name: 'DB Skull Crusher', note: 'Feel nasty tricep stretch on negative. 1 sec pause in stretched position. Sub: Overhead Cable Tricep Extension', sets: '3', reps: '8–10', rpe: '~9–10', rest: '2–3 min', restSeconds: 150 },
          { name: 'Close-Grip Assisted Dip', note: 'Slow negative, deep stretch at bottom before exploding up. Sub: Triceps Pressdown (Rope)', sets: '2', reps: '8–10', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
          { name: 'Plate-Weighted Crunch', note: 'Round lower back as you crunch. Mind-muscle with 6-pack. Sub: Machine Crunch', sets: '3', reps: '10–12', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
        ],
      },
    ],
    tip: '🔑 Push day is the safest day — zero leg involvement. Push intensity hard here without any impact on Thursday\'s game. Chase the pump on chest and shoulders.',
  },
  {
    label: 'Tue', emoji: '🔵', type: 'Pull\nLat Focused', badge: 'gym',
    title: 'Tuesday — Pull Day',
    sub: 'Lats · Mid-Back · Biceps · Rear Delts · ~65 min',
    sections: [
      {
        head: 'Gym work',
        rows: [
          { name: 'Overhand Lat Pulldown', note: 'Lean back ~15°, drive elbows down, squeeze lats hard at bottom. Sub: Dual-Handle Lat Pulldown', sets: '3', reps: '10–12', rpe: '~9', rest: '2–3 min', restSeconds: 150 },
          { name: 'DB RDL', note: '⚠️ RPE intentionally LOW — huge muscle damage. 1 sec pause at bottom. Stay in bottom ¾ ROM. Sub: Snatch-Grip RDL', sets: '2', reps: '8', rpe: '~6', rest: '3–4 min', restSeconds: 210 },
          { name: 'Helms Row', note: 'Flare elbows ~45°, hard shoulder blade squeeze at top. Last set: long-length partials. Sub: Chest-Supported Row', sets: '3', reps: '8–10', rpe: '~9', rest: '2–3 min', restSeconds: 150 },
          { name: 'DB Lat Pullover', note: 'Lean forward for big lat stretch at top, stand upright as you squeeze lats. Sub: Machine Lat Pullover', sets: '3', reps: '12–15', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
          { name: 'Hammer Curl', note: 'Curl only ¾ of way up — stay in bottom ¾ ROM. Hits brachialis hard. Sub: Hammer Preacher Curl', sets: '3', reps: '10–12', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
          { name: 'Bent-Over Reverse DB Flye', note: 'Pause 1–2 sec in the squeeze. Rear delts contract hard. Sub: Rope Face Pull', sets: '3', reps: '10–12', rpe: '~9–10', rest: '1–2 min', restSeconds: 90 },
        ],
      },
    ],
    tip: '🔑 Legs fully rested — Push and Pull touch zero leg muscle. RDL RPE is intentionally low because it causes massive hamstring damage and you need those hamstrings for Thursday\'s game.',
  },
  {
    label: 'Wed', emoji: '🏃', type: 'Sprints +\nPlyometrics', badge: 'cardio',
    title: 'Wednesday — Sprint Drills + Plyometrics',
    sub: 'Explosive speed · Fat burn · Athletic power · 55–65 min',
    sections: [
      {
        head: 'Sprint drills — do first while fully fresh',
        rows: [
          { name: 'Easy jog warm-up', note: 'Loose, relaxed pace. Loosen hips, ankles, calves.', sets: '—', reps: '8–10 min', rpe: 'Easy', rest: '—', restSeconds: 0 },
          { name: 'Acceleration sprints (20–30m)', note: 'Explosive first 5–10m from standing start. Lean forward, pump arms, drive knees. Full recovery between reps.', sets: '6–8×', reps: 'Max effort', rpe: '100%', rest: '75–90s', restSeconds: 0 },
          { name: 'Zigzag change-of-direction sprints', note: '5m markers, sharp cuts left and right. Mimics dribbling past defenders — the most football-specific drill.', sets: '4–5×', reps: '—', rpe: '95%+', rest: '60s', restSeconds: 0 },
          { name: 'Flying sprints (jog 10m → blast 20m)', note: 'Builds top-end breakaway speed. Already moving when you enter max-effort zone.', sets: '5–6×', reps: '—', rpe: 'Max', rest: '90s', restSeconds: 0 },
        ],
      },
      {
        head: 'Plyometrics — do after sprints',
        plyo: true,
        rows: [
          { name: 'Box Jumps', note: 'Jump onto a box. Soft landing — absorb through the knees. Step down, never jump down. Builds explosive quad and glute power.', sets: '3', reps: '8–10', rpe: 'Max', rest: '60–90s', restSeconds: 0 },
          { name: 'Single-Leg Lateral Hops', note: 'Hop side to side on one leg. Builds ankle stability and lateral quickness for direction changes.', sets: '3', reps: '8/leg', rpe: 'Max', rest: '60s', restSeconds: 0 },
          { name: 'Broad Jumps', note: 'Two-foot horizontal jump for max distance. Builds horizontal force — directly translates to sprint acceleration.', sets: '3', reps: '6–8', rpe: 'Max', rest: '75s', restSeconds: 0 },
          { name: 'Cool-down walk + stretch', note: 'Hamstrings, quads, hip flexors, calves — 20–30s each. Non-negotiable.', sets: '—', reps: '10 min', rpe: '—', rest: '—', restSeconds: 0 },
        ],
      },
    ],
    tip: '🔑 Sprints first, plyometrics second — always. The combo of sprint drills + plyometrics is what makes you explosively fast as a striker, not just fit.',
  },
  {
    label: 'Thu', emoji: '⚽', type: 'Football\n2 hrs', badge: 'football',
    title: 'Thursday — League Football (2 Hours)',
    sub: 'Peak performance day · No gym · No extra drills',
    sections: [
      {
        head: 'Session',
        rows: [
          { name: 'Dynamic warm-up', note: 'High knees, butt kicks, lateral shuffles, hip circles.', sets: '—', reps: '10 min', rpe: 'Easy', rest: '—', restSeconds: 0 },
          { name: 'Match play', note: 'Explosive runs in behind, box-to-box pressing, sharp first touch. Your Wednesday sprint work directly shows up here.', sets: '—', reps: '90–120 min', rpe: 'Max', rest: '—', restSeconds: 0 },
          { name: 'Cool-down stretch', note: 'Full lower body — quads, hamstrings, calves, hip flexors. Hold 20–30s each.', sets: '—', reps: '10 min', rpe: '—', rest: '—', restSeconds: 0 },
        ],
      },
    ],
    tip: '🔑 Eat injera + tibs or rice + lentils 2–3 hrs before. Take creatine as normal. Legs are fully rested — Mon was Push, Tue was Pull. You should feel fast and sharp.',
  },
  {
    label: 'Fri', emoji: '🟢', type: 'Legs +\nPlyometrics', badge: 'gym',
    title: 'Friday — Legs + Plyometrics (Moderate)',
    sub: 'Quads · Hamstrings · Adductors · Calves + Plyo · ~65 min',
    sections: [
      {
        head: 'Nippard legs — RPE 7–8 max, never to failure',
        rows: [
          { name: 'Nordic Ham Curl', note: 'Lean forward over machine for max hamstring stretch. Control the negative. ⚠️ Stop at RPE 8. Sub: Lying Leg Curl', sets: '3', reps: '8–10', rpe: '~7–8', rest: '2–3 min', restSeconds: 150 },
          { name: 'Copenhagen Hip Adduction', note: 'Mind-muscle on inner thighs. Great for thigh mass and groin stability for football. Sub: Cable Hip Adduction', sets: '3', reps: '10–12', rpe: '~7–8', rest: '1–2 min', restSeconds: 90 },
          { name: 'Hack Squat / Goblet Squat', note: '⚠️ RPE 7–8 HARD LIMIT. Leave 3–4 reps in tank every set. Sub: Front Squat', sets: '3', reps: '6, 8, 10', rpe: '~7', rest: '3–4 min', restSeconds: 210 },
          { name: 'Reverse Nordic', note: 'Long-length partials on last set. Knee extension strength — protects against sprinting injuries. Sub: Leg Extension', sets: '3', reps: '10–12', rpe: '~7–8', rest: '1–2 min', restSeconds: 90 },
          { name: 'Standing Calf Raise', note: '1–2 sec pause at bottom. Roll ankle on balls of feet. Don\'t bounce. Sub: Seated Calf Raise', sets: '3', reps: '12–15', rpe: '~8', rest: '1–2 min', restSeconds: 90 },
        ],
      },
      {
        head: 'Plyometrics — after legs, keep volume low',
        plyo: true,
        rows: [
          { name: 'Depth Jumps', note: 'Step off a low box, land softly, immediately explode upward. Trains reactive strength — absorb and redirect force instantly.', sets: '2', reps: '6–8', rpe: 'Max', rest: '90s', restSeconds: 0 },
          { name: 'Split Squat Jumps', note: 'From lunge, jump and switch legs in air. Builds single-leg explosiveness and hip flexor power for accelerating out of turns.', sets: '2', reps: '6/leg', rpe: 'Max', rest: '75s', restSeconds: 0 },
          { name: 'Cool-down + full stretch', note: 'Full lower body — quads, hamstrings, hip flexors, calves, adductors. 20–30s each. Critical — you play Saturday.', sets: '—', reps: '15 min', rpe: '—', rest: '—', restSeconds: 0 },
        ],
      },
    ],
    tip: '🔑 The RPE cap on Legs is not optional. If you walk out with sore legs, you\'ve ruined Saturday\'s 4-hour game. Plyometrics volume is intentionally low here — just enough to maintain adaptation.',
  },
  {
    label: 'Sat', emoji: '⚽', type: 'Football\n4 hrs', badge: 'football',
    title: 'Saturday — Football (4 Hours)',
    sub: 'Biggest calorie burn day · ~1,500–2,000+ kcal',
    sections: [
      {
        head: 'Session',
        rows: [
          { name: 'Dynamic warm-up', note: 'High knees, butt kicks, lunges, hip circles, lateral shuffles.', sets: '—', reps: '10–15 min', rpe: 'Easy', rest: '—', restSeconds: 0 },
          { name: 'Match play / training', note: '4 hours of football — your primary fat loss engine. More calories burned here than any gym session.', sets: '—', reps: '~4 hrs', rpe: 'Varied', rest: '—', restSeconds: 0 },
          { name: 'Post-session stretch + foam roll', note: 'Full lower body. Hold 30s each. Foam roll quads, hamstrings, calves. Non-negotiable after 4 hours.', sets: '—', reps: '15 min', rpe: '—', rest: '—', restSeconds: 0 },
        ],
      },
    ],
    tip: '🔑 Eat a big carb+protein meal 2–3 hrs before: injera + shiro or rice + beef stew. Take protein + carbs within 30 min after. This is your most important day for fat loss.',
  },
  {
    label: 'Sun', emoji: '😴', type: 'Full Rest', badge: 'rest',
    title: 'Sunday — Full Rest Day',
    sub: 'No training of any kind — mandatory recovery',
    sections: [
      {
        head: 'Recovery',
        rows: [
          { name: 'Sleep 8–9 hours', note: 'Muscle is built during sleep. Fat-burning hormones (GH, testosterone) reset overnight.', sets: '—', reps: '—', rpe: '—', rest: '—', restSeconds: 0 },
          { name: 'Light stretching (optional)', note: '10 min gentle hip and leg mobility only if you feel tight. Nothing intense.', sets: '—', reps: '—', rpe: '—', rest: '—', restSeconds: 0 },
          { name: 'Meal prep', note: 'Batch cook proteins for the week — eggs, tibs, lentils. Saves time and keeps nutrition consistent.', sets: '—', reps: '—', rpe: '—', rest: '—', restSeconds: 0 },
          { name: 'Creatine 5g', note: 'Take even on rest days — creatine works by maintaining full muscle saturation, not just on training days.', sets: '—', reps: '—', rpe: '—', rest: '—', restSeconds: 0 },
        ],
      },
    ],
    tip: '🔑 After Fri Legs + Sat 4-hour game, your legs have had a serious week. Full rest here is not laziness — it\'s how adaptation actually happens.',
  },
]

export const nutrition = {
  calories: '~2,150',
  protein: '~175g',
  carbs: '~210g',
  fat: '~60g',
  tip: 'Lose 0.5–0.7kg/week. Carb-load Thu & Sat game days — injera + tibs/shiro pre-game. Protein every meal: eggs, lentils, tibs, ayib. Whey shake fills gaps. Creatine 5g every day including rest days. Carb-load Friday evening for Saturday.',
  supplements: [
    { icon: '🔵', name: 'Creatine Monohydrate', dose: '5g/day every day. Available at pharmacies in Bole/CMC, Addis.' },
    { icon: '🥤', name: 'Whey Protein', dose: '25–30g post-workout or anytime. Hit 175g protein daily.' },
    { icon: '☕', name: 'Caffeine', dose: 'Ethiopian black coffee 30 min pre-gym. No other pre-workout needed.' },
    { icon: '💊', name: 'Multivitamin (optional)', dose: '1/day with food. Good insurance given your high training volume.' },
  ],
}
