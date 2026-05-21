interface Props { head: string; plyo?: boolean }

export default function SectionHead({ head, plyo }: Props) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{head}</span>
      {plyo && (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1a1000] text-violet-400 border border-violet-900">
          plyometrics
        </span>
      )}
    </div>
  )
}
