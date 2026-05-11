'use client'
import { useEffect, useRef } from 'react'

interface Props {
  values: string[]
  selected: string
  onChange: (value: string) => void
  label?: string
  width?: number
}

const ITEM_H = 40
// Only 3 items visible: 1 above, selected in middle, 1 below
const VISIBLE = 3
const PAD = 1 // items of padding top/bottom

export default function DrumPicker({ values, selected, onChange, label, width = 88 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ignoreScroll = useRef(false)

  const idxOf = (val: string) => {
    const i = values.indexOf(val)
    return i >= 0 ? i : 0
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    ignoreScroll.current = true
    el.scrollTo({ top: idxOf(selected) * ITEM_H, behavior: 'smooth' })
    setTimeout(() => { ignoreScroll.current = false }, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const handleScroll = () => {
    if (ignoreScroll.current) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      const clamped = Math.max(0, Math.min(idx, values.length - 1))
      ignoreScroll.current = true
      el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
      setTimeout(() => { ignoreScroll.current = false }, 400)
      if (values[clamped] !== selected) {
        onChange(values[clamped])
      }
    }, 80)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
      )}
      <div className="relative" style={{ height: ITEM_H * VISIBLE, width }}>
        {/* Fade top */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none rounded-t-xl"
          style={{ height: ITEM_H, background: 'linear-gradient(to bottom, #1a1a1a 30%, transparent)' }}
        />
        {/* Selection band */}
        <div
          className="absolute left-0 right-0 border-t border-b border-orange-500/50 z-10 pointer-events-none"
          style={{ top: ITEM_H * PAD, height: ITEM_H, background: 'rgba(249,115,22,0.06)' }}
        />
        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none rounded-b-xl"
          style={{ height: ITEM_H, background: 'linear-gradient(to top, #1a1a1a 30%, transparent)' }}
        />

        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div style={{ height: ITEM_H * PAD, flexShrink: 0 }} />
          {values.map((v, i) => (
            <div
              key={i}
              style={{ height: ITEM_H, scrollSnapAlign: 'center', flexShrink: 0 }}
              className={`flex items-center justify-center font-bold select-none transition-all ${
                v === selected ? 'text-white text-[15px]' : 'text-gray-700 text-[12px]'
              }`}
            >
              {v}
            </div>
          ))}
          <div style={{ height: ITEM_H * PAD, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  )
}
