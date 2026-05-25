'use client'
import { useExerciseGif } from '@/lib/useExerciseGif'

// All YouTube Shorts (9:16 vertical) — Jeff Nippard priority, other verified creators as fallback
const SHORTS: Record<string, string> = {
  // Jeff Nippard's own channel
  'DB Lateral Raise':               'OWAfHGmOf0A',
  'Low Incline DB Press':           'xGMqmmn5Z7Q',
  'DB Flye w/ Integrated Partials': 'qg3B1Uu6dto',
  'Helms Row':                      'fgSyNdEsqlM',
  'Bent-Over Reverse DB Flye':      'zEuseRjS7vg',
  'Overhand Lat Pulldown':          'SqQxuEpXnF4',
  'Standing Calf Raise':            'baEXLy09Ncc',
  // Other verified fitness creators
  'DB Skull Crusher':               'n5R_-ubdZ5Y',  // Massive Iron (Steve Shaw)
  'Close-Grip Assisted Dip':        '6D5Md54CtDc',  // JayCutlerTV
  'Plate-Weighted Crunch':          'MCccsKQWGDk',  // Jason Sani
  'DB RDL':                         '5exUDBgk_BU',  // Live Lean TV
  'DB Lat Pullover':                'DWYE0DOEiO4',  // Critical Bench Compound
  'Hammer Curl':                    '0QiUo3RkkJU',  // THE FIT SINGH
  'Hack Squat / Goblet Squat':      'lRYBbchqxtI',  // SquatCouple
  'Nordic Ham Curl':                'gDhepQu0Xuo',  // Marcus Filly
  'Copenhagen Hip Adduction':       'AiYzzRoXOEY',  // [P]rehab
  'Reverse Nordic':                 '_nQkBLoARfU',  // Muscle & Motion
  'Depth Jumps':                    '2cxlpWrKEcE',  // Alpha Project Phyzio
  'Split Squat Jumps':              '4PRGCgO9jCE',  // Joey Thurman
  'Box Jumps':                      'O_Y_3VBICuY',  // Orillia Sports Medicine
  'Single-Leg Lateral Hops':        'u7Cp4Lges4Y',  // Rehab Hero
  'Broad Jumps':                    'SFjFcW3MqCI',  // Newstead Jomes
}

interface Props {
  name: string
  cleanNote: string
  onClose: () => void
}

export default function ExerciseDemo({ name, cleanNote, onClose }: Props) {
  const shortId = SHORTS[name]
  const { gifUrl, loading, onError } = useExerciseGif(name)
  const query = encodeURIComponent('jeff nippard ' + name + ' tutorial')
  const ytUrl = `https://www.youtube.com/results?search_query=${query}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm bg-[#111] rounded-t-3xl border-t border-[#2a2a2a] px-6 pt-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Exercise demo</p>
        <h3 className="text-white font-black text-[16px] leading-snug mb-3">{name}</h3>

        {/* Video / GIF area */}
        <div className="rounded-xl overflow-hidden bg-[#0d0d0d] border border-[#1e1e1e] mb-4">
          {shortId ? (
            <iframe
              src={`https://www.youtube.com/embed/${shortId}?modestbranding=1&rel=0&playsinline=1`}
              className="w-full"
              style={{ height: 420 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {loading && (
                <div className="flex items-center justify-center" style={{ height: 200 }}>
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!loading && gifUrl && (
                <img
                  src={gifUrl}
                  alt={`${name} demonstration`}
                  className="w-full object-contain"
                  style={{ maxHeight: 280 }}
                  onError={onError}
                />
              )}
              {!loading && !gifUrl && (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-600" style={{ height: 200 }}>
                  <span className="text-3xl">🎬</span>
                  <p className="text-[11px]">No preview available</p>
                </div>
              )}
            </>
          )}
        </div>

        {cleanNote && (
          <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 mb-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">{cleanNote}</p>
          </div>
        )}

        {/* Jeff Nippard YouTube search — always shown */}
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#0d0d0d] border border-[#2a2a2a] text-gray-500 font-bold text-[12px] rounded-xl active:bg-[#1a1a1a] transition-colors"
        >
          <span className="text-sm">▶</span>
          Search Jeff Nippard on YouTube
        </a>
      </div>
    </div>
  )
}