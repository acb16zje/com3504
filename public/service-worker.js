/**
 * Service worker
 *
 * @author Zer Jun Eng
 */

'use strict'
const CACHENAME = 'MusicbeePWA-v1'
const FILES = [
  '/',
  '/events',
  '/explore',
  '/create',
  '/create/event',
  '/notifications',
  '/user',
  '/user/events',
  '/user/going',
  '/user/interested',
  '/user/went',
  '/favicon/favicon-32x32.png',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-256x256.png',
  '/favicon/site.webmanifest',
  '/images/logo_text.webp',
  '/images/default.webp',
  '/images/gakki.webp',
  '/images/mario.webp',
  '/images/luigi.webp',
  '/images/placeholder.webp',
  '/stylesheets/style.css',
  '/javascripts/databases/database.mjs',
  '/javascripts/databases/user.mjs',
  '/javascripts/script.js',
  '/offline.html',
]

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHENAME).then(function (cache) {
    return cache.addAll(FILES)
  }))
})

/**
 * activation of service worker: it removes all cached files if necessary
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k !== CACHENAME && k.indexOf('MusicbeePWA-') === 0) {
        return caches.delete(k)
      } else {
        return Promise.resolve()
      }
    }))
  }))

  return self.clients.claim()
})

self.addEventListener('fetch', function (event) {
  const dataUrl = ['/some_ajax_url']

  if (dataUrl.some(url => event.request.url.includes(url))) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     */
    return fetch(event.request).then(function (response) {
      // note: it the network is down, response will contain the error
      // that will be passed to Ajax
      return response
    }).catch(async function (e) {
      console.log('service worker error 1: ' + e.message)
    })
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, then if network available, it will refresh the cache
     * see stale-while-revalidate
     */
    event.respondWith(
      caches.open(CACHENAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function (response) {
            if (response.type !== 'opaque') {
              cache.put(event.request, response.clone())
            }
            return response
          })
        }).catch(() => {
          if (event.request.method === 'GET' && event.request.mode === 'navigate' &&
            event.request.headers.get('accept').includes('text/html')) {
            return caches.match('offline.html')
          }
        })
      }),
    )
    // event.respondWith(async function () {
    //   const cache = await caches.open(CACHENAME)
    //   const cachedResponse = await cache.match(event.request)
    //   const networkResponsePromise = fetch(event.request).catch(() => {
    //     /* Display custom offline page if the user is not online and trying
    //      * to browse a page that has never been cached by service worker
    //      */
    //     if (event.request.method === 'GET' && event.request.mode === 'navigate' &&
    //       event.request.headers.get('accept').includes('text/html')) {
    //       if (!cachedResponse || !networkResponsePromise) {
    //         return caches.match('offline.html')
    //       }
    //     }
    //   })
    //
    //   event.waitUntil(async function () {
    //     const networkResponse = await networkResponsePromise
    //     console.log(networkResponse)
    //     try {
    //       if (networkResponse.type !== 'opaque') {
    //         await cache.put(event.request, networkResponse.clone())
    //       }
    //     } catch (e) {}
    //   }())
    //
    //   // Returned the cached response if we have one, otherwise return the network response.
    //   return cachedResponse || networkResponsePromise
    // }())
  }
})
