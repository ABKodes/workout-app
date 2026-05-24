'use client'
import { useExerciseGif } from '@/lib/useExerciseGif'

// Jeff Nippard YouTube video IDs — full tutorials + Shorts from his own channel
// Shorts are vertical (9:16); regular videos are landscape (16:9)
const JEFF_VIDEOS: Record<string, { id: string; short: boolean }> = {
  // Full tutorials (landscape)
  'DB RDL':                        { id: 'Q5vwsJFwhyg', short: false },
  'Helms Row':                     { id: 'djKXLt7kv7Q', short: false },
  'Close-Grip Assisted Dip':       { id: 'TOgUqAurYNk', short: false },
  'Hammer Curl':                   { id: 'GNO4OtYoCYk', short: false },
  'Standing Calf Raise':           { id: '21inrjhoFkQ', short: false },
  'Nordic Ham Curl':               { id: 'jNC3aYBHL1I', short: false },
  'DB Flye w/ Integrated Partials':{ id: 'sNoYUpivUfY', short: false },
  'DB Skull Crusher':              { id: 'popGXI-qs98', short: false },
  // Shorts from Jeff Nippard's channel (@JeffNippard)
  'DB Lateral Raise':              { id: 'OWAfHGmOf0A', short: true },  // Best Side Delt Exercise
  'Low Incline DB Press':          { id: 'xGMqmmn5Z7Q', short: true },  // Best Incline for Upper Chest
  'Bent-Over Reverse DB Flye':     { id: 'zEuseRjS7vg', short: true },  // Best Rear Delt Exercise
}

interface Props {
  name: string
  cleanNote: string
  onClose: () => void
}

export default function ExerciseDemo({ name, cleanNote, onClose }: Props) {
  const video = JEFF_VIDEOS[name]
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

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Exercise demo · Jeff Nippard</p>
        <h3 className="text-white font-black text-[16px] leading-snug mb-3">{name}</h3>

        {/* Video / GIF area */}
        <div className="rounded-xl overflow-hidden bg-[#0d0d0d] border border-[#1e1e1e] mb-4">
          {video ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0&playsinline=1`}
              className="w-full"
              style={{ height: video.short ? 420 : 210 }}
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