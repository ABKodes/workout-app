'use client'

interface Props {
  name: string
  cleanNote: string
  onClose: () => void
}

export default function ExerciseDemo({ name, cleanNote, onClose }: Props) {
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
        <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-6" />

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Exercise demo</p>
        <h3 className="text-white font-black text-[16px] leading-snug mb-3">{name}</h3>

        {cleanNote && (
          <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 mb-5">
            <p className="text-[12px] text-gray-400 leading-relaxed">{cleanNote}</p>
          </div>
        )}

        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#12002a] border border-violet-900 text-violet-400 font-black text-sm rounded-xl active:bg-violet-900/40 transition-colors"
        >
          <span className="text-base">▶</span>
          Watch form tutorial on YouTube
        </a>
        <p className="text-center text-[10px] text-gray-700 mt-3">Opens YouTube search · tap back to return</p>
      </div>
    </div>
  )
}