interface Props { tip: string }

export default function TipBlock({ tip }: Props) {
  return (
    <div className="border-l-[3px] border-orange-500 bg-[#111] rounded-r-xl px-4 py-3 text-sm text-gray-400 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }}
    />
  )
}
