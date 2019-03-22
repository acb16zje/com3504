/**
 * Event IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'

const EVENT_STORE = 'event_store'
const exploreSection = document.getElementById('explore')

/**
 * Initialise the event IndexedDB
 *
 * @param {object} db The DB object
 * @returns {Promise<void>} The Promise
 */
export async function initEventDatabase (db) {
  if (!db.objectStoreNames.contains(EVENT_STORE)) {
    const store = db.createObjectStore(EVENT_STORE, {
      keyPath: 'id',
      autoIncrement: true
    })
    store.createIndex('name', 'name')
    store.createIndex('latitude', 'latitude')
    store.createIndex('longitude', 'longitude')
    store.createIndex('address', 'address')
    store.createIndex('start_datetime', 'start_datetime')
    store.createIndex('end_datetime', 'end_datetime')
  }
}

if (exploreSection) {
  $(exploreSection).ready(async function() {
    loadExplorePage().then((docs) => {
      Promise.resolve(storeExplorePage(docs)).then(() => {
        
      })
    })
  })
}

async function loadExplorePage() {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api${window.location.pathname}`,
  }))
}

async function storeExplorePage(docs) {

}

function displayExplorePage(docs) {

}
