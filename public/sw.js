self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

// ── Daily workout reminder ────────────────────────────────────────────
let notifTimeout = null

function scheduleNext(timeStr) {
  if (notifTimeout) clearTimeout(notifTimeout)
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  notifTimeout = setTimeout(() => {
    self.registration.showNotification("Time to train 💪", {
      body: "Your workout is waiting. Let's get it.",
      icon: '/icon-192.png',
      tag: 'workout-reminder',
      renotify: true,
    })
    scheduleNext(timeStr)
  }, next - now)
}

// ── Rest timer countdown ──────────────────────────────────────────────
let restInterval = null

function cancelRest() {
  if (restInterval) { clearInterval(restInterval); restInterval = null }
  self.registration.getNotifications({ tag: 'rest-timer' })
    .then(ns => ns.forEach(n => n.close()))
}

function startRest(endsAt) {
  cancelRest()

  function tick() {
    const remaining = Math.round((endsAt - Date.now()) / 1000)

    if (remaining <= 0) {
      if (restInterval) { clearInterval(restInterval); restInterval = null }
      self.registration.showNotification('💪 Rest over — next set!', {
        body: "Get back to it!",
        icon: '/icon-192.png',
        tag: 'rest-timer',
        renotify: true,
        vibrate: [200, 100, 200],
      })
      return
    }

    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    self.registration.showNotification(`⏱ ${m}:${String(s).padStart(2, '0')} rest remaining`, {
      body: 'Tap to return to your workout',
      icon: '/icon-192.png',
      tag: 'rest-timer',
      renotify: false,
      silent: true,
    })
  }

  tick() // show immediately
  restInterval = setInterval(tick, 1000)
}

// ── Message handler ───────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE') scheduleNext(event.data.time)
  if (event.data?.type === 'CANCEL') {
    if (notifTimeout) clearTimeout(notifTimeout)
    notifTimeout = null
  }
  if (event.data?.type === 'REST_START') startRest(event.data.endsAt)
  if (event.data?.type === 'REST_CANCEL') cancelRest()
})

// ── Notification click ────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      if (cs.length > 0) return cs[0].focus()
      return clients.openWindow('/')
    })
  )
})
