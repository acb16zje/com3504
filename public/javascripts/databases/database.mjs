/**
 * JavaScript to handle with IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb/build/esm/index.js'
import { initUserDatabase } from './user.mjs'
import { initEventDatabase } from './event.mjs'

const DB_NAME = 'musicbee'
const VERSION = 1

export let dbPromise

// IndexedDB configuration
if (window.indexedDB) {
  dbPromise = openDB(DB_NAME, VERSION, {
    upgrade (db, oldVersion, newVersion, transaction) {
      initUserDatabase(db)
      initEventDatabase(db)
    },
  })
}
