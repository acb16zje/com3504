/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import {
  deleteDB,
  openDB,
} from 'https://cdn.jsdelivr.net/npm/idb/build/esm/index.js'

const DB_NAME = 'user'
const STORE_NAME = 'user_store'
const VERSION = 1

/**
 *
 * @returns {Promise<void>}
 */
async function initUserDatabase () {
  const dbPromise = await openDB(DB_NAME, VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true})
      }
    }
  })
}

export { initUserDatabase }
