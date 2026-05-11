self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

let notifTimeout = null

function scheduleNext(timeStr) {
  if (notifTimeout) clearTimeout(notifTimeout)
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = next - now
  notifTimeout = setTimeout(() => {
    self.registration.showNotification("Time to train 💪", {
      body: "Your workout is waiting. Let's get it.",
      icon: '/icon-192.png',
      tag: 'workout-reminder',
      renotify: true,
    })
    scheduleNext(timeStr)
  }, delay)
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE') scheduleNext(event.data.time)
  if (event.data?.type === 'CANCEL') {
    if (notifTimeout) clearTimeout(notifTimeout)
    notifTimeout = null
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      if (cs.length > 0) return cs[0].focus()
      return clients.openWindow('/')
    })
  )
})
