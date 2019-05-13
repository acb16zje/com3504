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
  '/event',
  '/explore',
  '/create',
  '/create/event',
  '/favicon/favicon-32x32.png',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-256x256.png',
  '/favicon/site.webmanifest',
  '/images/logo_text.webp',
  '/images/default.webp',
  '/images/placeholder.webp',
  '/stylesheets/style.css',
  '/javascripts/databases/database.mjs',
  '/javascripts/databases/event.mjs',
  '/javascripts/databases/genre.mjs',
  '/javascripts/databases/user.mjs',
  '/javascripts/databases/story.mjs',
  '/javascripts/databases/feed.mjs',
  '/javascripts/script.js',
  '/javascripts/script.mjs',
  '/offline.html',
]

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHENAME).then(cache => {
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
  const dataUrl = '/api/'

  // Do not cache AJAX API calls
  if (!event.request.url.includes(dataUrl)) {
    // Cache-then-Network from offline-cookbook
    event.respondWith(
      caches.open(CACHENAME).then(function (cache) {
        return fetch(event.request).then(function (response) {
          if (!response.type.includes('opaque')) {
            cache.put(event.request, response.clone())
          }
          return response
        }).catch(async () => {
          const cachedResponse = await cache.match(event.request)

          // Return cache page if we have one, otherwise return offline page
          if (cachedResponse) {
            return cachedResponse
          } else if (event.request.method === 'GET' && event.request.mode ===
            'navigate' &&
            event.request.headers.get('accept').includes('text/html')) {

            if (isEventURL(event.request.url)) {
              return caches.match('/event')
            } else {
              return caches.match('offline.html')
            }
          } else if (event.request.method === 'GET' &&
            event.request.destination === 'image' &&
            isImageURL(event.request.url)) {
              return caches.match('/images/placeholder.webp')
          }
        })
      }),
    )
  }
})

/**
 * Check if the request URL is an event page
 *
 * @param {string} url
 * @returns {boolean} True if the request URL is an event page
 */
function isEventURL (url) {
  return url.includes('/event/')
}

/**
 * Check if the request URL is an image link
 *
 * @param {string} url
 * @returns {boolean} True if the request URL is an image link
 */
function isImageURL (url) {
  return url.includes('/image/')
}
