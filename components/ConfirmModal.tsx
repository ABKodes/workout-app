'use client'

interface Props {
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmModal({ title, body, confirmLabel = 'Confirm', onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-3xl mb-4 text-center">⚠️</div>
        <h2 className="text-white font-black text-[17px] text-center mb-2">{title}</h2>
        <p className="text-[12px] text-gray-500 text-center leading-relaxed mb-6">{body}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-colors"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 bg-transparent text-gray-500 hover:text-white font-bold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}