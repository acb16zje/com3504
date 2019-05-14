/**
 * Genre IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'

const GENRE_STORE = 'genre_store'

/**
 * Initialise the genre IndexedDB
 *
 * @param {Object} db The DB object
 */
export function initGenreDatabase (db) {
  if (!db.objectStoreNames.contains(GENRE_STORE)) {
    const store = db.createObjectStore(GENRE_STORE, {
      keyPath: '_id',
    })
    store.createIndex('_id', '_id', { unique: true })
    store.createIndex('name', 'name', { unique: true })
  }

  // Reload the genre database for every version changes
  loadGenres().then(genres => {
    console.log('Loaded genres from server')

    storeGenres(genres).
      then(() => console.log('Stored genres')).
      catch(() => console.log('Failed to store genres'))
  }).catch(() => {
    console.log('Failed to load genres from server')
  })
}

/**
 * Load the genres from MongoDB
 *
 * @returns {Promise<any>} The AJAX Promise
 */
export function loadGenres () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/api/genre',
  }))
}

/**
 * Get the genres from IndexedDB
 *
 * @return {Promise<void>} The Promise
 */
export async function loadGenresLocal () {
  if (dbPromise) {
    return await dbPromise.then(async db => {
      return await db.getAll(GENRE_STORE)
    }).catch(err => console.log(err))
  }
}

/**
 * Store the genres into IndexedDB
 *
 * @param {Object} genres The genres documents retrieved
 * @return {Promise<void>} The Promise
 */
async function storeGenres (genres) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(GENRE_STORE, 'readwrite')

      for (let i = 0, n = genres.length; i < n; i++) {
        (async () => {
          tx.store.put(genres[i])
          await tx.done
        })()
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Get the list of genres
 *
 * @return {Promise<any>} The Promise
 */
export async function getGenres () {
  return await loadGenres().then(genres => {
    return genres
  }).catch(async () => {
    return await loadGenresLocal().then(genres => {
      return genres
    })
  })
}

/**
 * Initialise the <select> element with genres options
 *
 * @param {Element} input The <select> element to load
 */
export async function initGenresInput (input) {
  await getGenres().then(genres => {
    return new Tagify(input, {
      delimiters: ',| ',
      maxTags: 5,
      enforceWhitelist: true,
      whitelist: genres.map(genre => ({
        value: genre.name,
        id: genre._id
      })),
      dropdown: {
        enabled: 1
      }
    })
  })
}
