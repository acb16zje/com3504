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
    })
    store.createIndex('id', 'id', { unique: true })
    store.createIndex('event_name', 'event_name')
    store.createIndex('description', 'description')
    store.createIndex('organiser', 'organiser')
    store.createIndex('start_datetime', 'start_datetime')
    store.createIndex('end_datetime', 'end_datetime')
    store.createIndex('latitude', 'latitude')
    store.createIndex('longitude', 'longitude')
    store.createIndex('address', 'address')
    store.createIndex('image', 'image')
  }
}

if (exploreSection) {
  $(exploreSection).ready(async function () {
    loadExplorePage().then(docs => {
      console.log('Loaded /explore from server')

      Promise.resolve(storeExplorePage(docs)).then(() => {
        console.log('Stored /explore')
        displayExplorePage(docs)
      })
    }).catch(() => {
      console.log('Failed to load /explore from server, loading from local')

      loadExplorePageLocal().then(() => {
        console.log('Loaded /explore page from local')
      }).catch(() => console.log('Failed to load /explore page from local'))
    })
  })
}

/**
 * Load all events data from MongoDB
 *
 * @return {Promise<any>} The Promise
 */
async function loadExplorePage () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api${window.location.pathname}`,
  }))
}

/**
 * Store the events data into IndexedDB
 *
 * @param {object} docs The events documents retrieved
 * @return {Promise<void>} The Promise
 */
function storeExplorePage (docs) {
  docs = JSON.parse(JSON.stringify(docs).split('"_id":').join('"id":'))
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(EVENT_STORE, 'readwrite')
      docs.forEach(async doc => {
        doc.organiser = doc.organiser.username
        doc.address = doc.location.address
        await tx.store.put(doc)
        await tx.done
      })
    }).catch(err => console.log(err))
  }
}

/**
 * Load the /explore page from IndexedDB
 *
 * @return {Promise<void>} The Promise
 */
async function loadExplorePageLocal () {
  if (dbPromise) {
    dbPromise.then(async db => {
      return await db.getAll(EVENT_STORE)
    }).then(docs => {
      if (docs.length) {
        displayExplorePage(docs)
      } else {
        exploreSection.innerHTML = '<p class=\'title has-text-centered\'>' +
          'Unable to load page</p>'
        exploreSection.classList.remove('is-hidden')
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Display all events data on /explore page
 *
 * @param {object} docs The events documents retrieved
 */
function displayExplorePage (docs) {
  const exploreColumns = exploreSection.children[0].children[0]

  docs.forEach(doc => {
    exploreColumns.innerHTML += renderEventCard(doc)
  })
}

/**
 * Return the HTML fragments for an event document
 *
 * @param {object} doc An event document
 * @return {string} The HTML fragment
 */
function renderEventCard(doc) {
  const organiser = doc.organiser.username
  const address = doc.location.address
  const people = doc.interested.length + doc.going.length

  const localeOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: "short"
  }

  let start_datetime = new Date(doc.start_datetime)
  let end_datetime

  // Prettify datetime
  if (doc.end_datetime) {
    end_datetime = new Date(doc.end_datetime)

    if (start_datetime.getDay() === end_datetime.getDay() &&
      start_datetime.getMonth() === end_datetime.getMonth() &&
      start_datetime.getFullYear() === end_datetime.getFullYear()) {

      start_datetime = start_datetime.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

      end_datetime = end_datetime.toLocaleString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: "short"
      })
    } else {
      start_datetime = start_datetime.toLocaleString(undefined, localeOptions)
      end_datetime = end_datetime.toLocaleString(undefined, localeOptions)
    }
  } else {
    start_datetime = start_datetime.toLocaleString(undefined, localeOptions)
  }

  return '<div class="column">' +
  '<div class="card">' +

    `<div class="card-image"><a href="/event/${doc._id}">` +
      '<figure class="image is-2by1">' +
      `<img src="${doc.image}" alt="Event image">` +
      '</figure>' +
    '</a></div>' +

    '<div class="card-content">' +
      '<div class="media">' +
        '<div class="media-content">' +
          `<p class="title is-4"><a href="/event/${doc._id}">${doc.event_name}</a></p>` +
          `<p class="host subtitle is-6"><a href="/${organiser}">@${organiser}</a></p>` +
          `<p class="location subtitle is-6">${address}</p>` +
          `<p class="time subtitle is-6">${start_datetime} ${end_datetime ? ` – ${end_datetime}` : ''}</p>` +
        '</div>' +
      '</div>' +

      `<div class="content is-hidden-mobile">${doc.description}</div>` +

      '<nav class="level is-mobile">' +
        '<div class="level-left">' +
          '<div class="level-item">' +
            `<p>${makeFriendly(people)} people</p>` +
          '</div>' +
        '</div>' +
        '<div class="level-right">' +
          '<div class="level-item">' +
            '<button class="button">' +
              '<span class="icon iconify" data-icon="ic:sharp-star-border"></span>' +
              '<span>Interested</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</nav>' +
    '</div>' +
  '</div>' +
'</div>'
}
