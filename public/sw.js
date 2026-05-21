const CACHE = 'workout-v1'

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/manifest.json']))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => clients.claim())
))

// Cache-first for static assets; network-first for everything else
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets: cache-first (they're content-hashed, safe to cache forever)
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }))
    )
  } else {
    // HTML/navigation: network-first, fall back to cache so reload never shows an error
    event.respondWith(
      fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }).catch(() => caches.match(request).then(cached => cached ?? caches.match('/')))
    )
  }
})

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
  const [timerNs, endNs] = await Promise.all([
    self.registration.getNotifications({ tag: 'rest-timer' }),
    self.registration.getNotifications({ tag: 'rest-end' }),
  ])
  timerNs.forEach(n => n.close())
  endNs.forEach(n => n.close())
}

async function startRest(endsAt) {
  await cancelRest()

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

  if ('TimestampTrigger' in self) {
    await self.registration.showNotification('💪 Rest over — next set!', {
      ...endPayload,
      showTrigger: new TimestampTrigger(endsAt),
    })
  } else {
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