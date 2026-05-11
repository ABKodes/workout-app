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

// ── Rest timer ────────────────────────────────────────────────────────
let restEndTimeout = null

async function cancelRest() {
  if (restEndTimeout) { clearTimeout(restEndTimeout); restEndTimeout = null }
  // Close both the visible "rest until X" banner and any pending OS-scheduled "rest over"
  const [timerNs, endNs] = await Promise.all([
    self.registration.getNotifications({ tag: 'rest-timer' }),
    self.registration.getNotifications({ tag: 'rest-end' }),
  ])
  timerNs.forEach(n => n.close())
  endNs.forEach(n => n.close())
}

async function startRest(endsAt) {
  await cancelRest()

  // 1. Show an immediate silent banner: "Rest until 2:36 PM"
  const label = new Date(endsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  await self.registration.showNotification(`⏱ Rest until ${label}`, {
    body: 'Tap to return to your workout',
    icon: '/icon-192.png',
    tag: 'rest-timer',
    renotify: false,
    silent: true,
  })

  const endPayload = {
    body: 'Get back to it!',
    icon: '/icon-192.png',
    tag: 'rest-end',
    renotify: true,
    vibrate: [200, 100, 200],
  }

  // 2a. Preferred: OS-level scheduled notification — fires even if the SW is killed
  if ('TimestampTrigger' in self) {
    await self.registration.showNotification('💪 Rest over — next set!', {
      ...endPayload,
      showTrigger: new TimestampTrigger(endsAt),
    })
  } else {
    // 2b. Fallback: in-process setTimeout (works while SW stays alive)
    const delay = Math.max(0, endsAt - Date.now())
    restEndTimeout = setTimeout(async () => {
      restEndTimeout = null
      await self.registration.showNotification('💪 Rest over — next set!', endPayload)
    }, delay)
  }
}

// ── Message handler ───────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE') scheduleNext(event.data.time)
  if (event.data?.type === 'CANCEL') {
    if (notifTimeout) clearTimeout(notifTimeout)
    notifTimeout = null
  }
  if (event.data?.type === 'REST_START') event.waitUntil(startRest(event.data.endsAt))
  if (event.data?.type === 'REST_CANCEL') event.waitUntil(cancelRest())
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
