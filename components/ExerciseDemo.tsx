'use client'
import { useExerciseGif } from '@/lib/useExerciseGif'

interface Props {
  name: string
  cleanNote: string
  onClose: () => void
}

export default function ExerciseDemo({ name, cleanNote, onClose }: Props) {
  const { gifUrl, loading, onError } = useExerciseGif(name)
  const query = encodeURIComponent(name + ' exercise form tutorial')
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

        {/* Image area */}
        <div className="rounded-xl overflow-hidden bg-[#0d0d0d] border border-[#1e1e1e] mb-4" style={{ minHeight: 200 }}>
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
        </div>

        {cleanNote && (
          <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 mb-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">{cleanNote}</p>
          </div>
        )}

        {/* YouTube fallback — always shown */}
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#0d0d0d] border border-[#2a2a2a] text-gray-500 font-bold text-[12px] rounded-xl active:bg-[#1a1a1a] transition-colors"
        >
          <span className="text-sm">▶</span>
          Watch full tutorial on YouTube
        </a>
      </div>
    </div>
  )
}