'use client'

interface Props {
  syncing: boolean
  offline: boolean
}

export default function SyncIndicator({ syncing, offline }: Props) {
  if (!syncing && !offline) return null

  return (
    <div className="fixed top-3 right-3 z-50">
      <div
        className={`w-2 h-2 rounded-full ${
          offline
            ? 'bg-gray-500'
            : 'bg-green-400 animate-pulse'
        }`}
      />
    </div>
  )
}
