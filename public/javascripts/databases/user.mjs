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

import { DB_NAME } from './database.mjs'

const STORE_NAME = 'user_store'
const VERSION = 1
let dbPromise

/**
 * Initialise the user IndexedDB
 *
 * @returns {Promise<void>}
 */
async function initUserDatabase () {
  dbPromise = await openDB(DB_NAME, VERSION, {
    upgrade (db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export { initUserDatabase }
