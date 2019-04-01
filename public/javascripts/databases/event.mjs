/**
 * Event IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise, unableToLoadPage } from './database.mjs'
import { initGenresInput } from './genre.mjs'

const EVENT_STORE = 'event_store'
const exploreSection = document.getElementById('explore')
const eventSection = document.getElementById('event')
const currentUser = $(document.getElementById('my-account')).data('user')
const createEventForm = document.getElementById('create-event')

// Loading, storing, and displaying events at /explore
if (exploreSection) {
  loadExplorePage().then(events => {
    console.log('Loaded /explore from server')

    storeExplorePage(events).then(() => {
      console.log('Stored /explore')
      displayExplorePage(events)
    }).catch(() => console.log('Failed to store /explore'))

  }).catch(() => {
    console.log('Failed to load /explore from server, loading from local')

    loadExplorePageLocal().then(events => {
      console.log('Loaded /explore page from local')

      if (events && events.length) {
        displayExplorePage(events)
      } else {
        unableToLoadPage(exploreSection)
      }

    }).catch(() => console.log('Failed to load /explore page from local'))
  })
}

// Loading, storing, and displaying individual event
if (eventSection) {
  const eventID = window.location.pathname.split('/')[2]

  loadEventPage(eventID).then(event => {
    console.log('Loaded event from server')

    storeExplorePage(event).then(() => {
      displayEventPage(event)
    }).catch(() => console.log('Failed to store event'))

  }).catch(() => {
    console.log('Failed to load event from server, loading from local')

    loadEventPageLocal(eventID).then(() => {
      console.log('Loaded event from local')
    }).catch(() => console.log('Failed to load event from local'))
  })
}

// Create event
if (createEventForm) {
  // Google Maps JavaScript API
  try {
    (function () {
      const input = document.getElementById('autocomplete')

      const autocomplete = new google.maps.places.Autocomplete(input)

      $(input).change(function () {
        const place = autocomplete.getPlace()

        if (place) {
          document.getElementsByName('latitude')[0].
            setAttribute('value', place.geometry.location.lat())
          document.getElementsByName('longitude')[0].
            setAttribute('value', place.geometry.location.lng())
        }
      })

    })()
  } catch (e) {}

  const genresInput = document.getElementsByName('genres')[0]
  initGenresInput(genresInput).then().catch()

  $(createEventForm).submit(function (e) {
    e.preventDefault()

    const formJson = convertToJSON($(this).serializeArray())

    createEvent(formJson).then(res => {
      window.location.href = `/event/${res.eventID}`
    }).catch(err => {
      console.log(err)
      showSnackbar('Cannot create event')
    })
  })
}

/************************ Functions below ************************/
/**
 * Initialise the event IndexedDB
 *
 * @param {object} db The DB object
 * @returns {Promise<void>} The Promise
 */
export function initEventDatabase (db) {
  if (!db.objectStoreNames.contains(EVENT_STORE)) {
    const store = db.createObjectStore(EVENT_STORE, {
      keyPath: '_id',
    })
    store.createIndex('_id', '_id', { unique: true })
    store.createIndex('name', 'name')
    store.createIndex('description', 'description')
    store.createIndex('organiser', 'organiser')
    store.createIndex('startDate', 'startDate')
    store.createIndex('endDate', 'endDate')
    store.createIndex('latitude', 'latitude')
    store.createIndex('longitude', 'longitude')
    store.createIndex('address', 'address')
    store.createIndex('image', 'image')
  }
}

/**
 * Load all events data from MongoDB
 *
 * @return {Promise<any>} The Promise
 */
function loadExplorePage () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/api/explore',
  }))
}

/**
 * Load the /explore page from IndexedDB
 *
 * @return {Promise<* | void>} The Promise
 */
export async function loadExplorePageLocal () {
  if (dbPromise) {
    return dbPromise.then(async db => {
      return await db.getAll(EVENT_STORE)
    }).catch(err => console.log(err))
  }
}

/**
 * Load the event data from MongoDB
 *
 * @param {string} eventID The ID of the event
 * @return {Promise<any>} The Promise
 */
function loadEventPage (eventID) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/event/${eventID}`,
  }))
}

/**
 * Load the event data from IndexedDB
 *
 * @param {string} eventID The ID of the event
 * @return {Promise<void>} The Promise
 */
async function loadEventPageLocal (eventID) {
  if (dbPromise) {
    dbPromise.then(async db => {
      return await db.getFromIndex(EVENT_STORE, '_id', eventID)
    }).then(event => {
      console.log(event)
      if (event) {
        displayEventPage(event)
      } else {
        unableToLoadPage(eventSection)
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Store the events data into IndexedDB
 *
 * @param {object} events The events documents retrieved
 * @return {Promise<void>} The Promise
 */
export async function storeExplorePage (events) {
  if (dbPromise) {
    dbPromise.then(db => {
      const tx = db.transaction(EVENT_STORE, 'readwrite')

      // Put all events on explore page to IndexedDB
      for (let i = 0, n = events.length; i < n; i++) {
        (async () => {
          events[i].organiser = events[i].organiser.username
          events[i].address = events[i].location.address
          await tx.store.put(events[i])
          await tx.done
        })()
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Create an event
 *
 * @param {object} formJson THe form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function createEvent (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    dataType: 'json',
    url: '/api/event/create',
  }))
}

/**
 * Record the event as interested for the user
 *
 * @param {string} eventID The ID of the event the user is interested
 * @returns {Promise<any>} The Promise
 */
function submitInterested (eventID) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({ id: eventID }),
    url: '/api/interested',
  }))
}

/**
 * Record the event as going for the user
 *
 * @param {string} eventID The ID of the event the user is going
 * @returns {Promise<any>} The promise
 */
function submitGoing (eventID) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({ id: eventID }),
    url: '/api/going',
  }))
}

/**
 * Add click listener to interested and going buttons after page load
 */
export function addClickListener () {
  const interestedButtons = $('.interested-button')
  const goingButtons = $('.going-button')

  if (interestedButtons.length) {
    interestedButtons.click(function () {
      if (!currentUser) {
        showSnackbar('Please sign in to continue')
        return
      }

      // Set the event as interested, will replace going status
      submitInterested(this.dataset.id).then(() => {
        $(this).toggleClass('is-light')
        $(this).find('svg.border').toggleClass('is-hidden')
        $(this).find('svg.solid').toggleClass('is-hidden')

        // If the event is set as going
        const going = document.getElementById('going')
        if (going) {
          going.classList.remove('is-light')
        }

        showSnackbar('Request successful')
      }).catch(() => {
        showSnackbar('Failed to process the request')
      })
    })
  }

  if (goingButtons.length) {
    goingButtons.click(function () {
      if (!currentUser) {
        showSnackbar('Please sign in to continue')
        return
      }

      // Set the event as going, will replace interested status
      submitGoing(this.dataset.id).then(() => {
        $(this).toggleClass('is-light')

        // If the event is set as interested
        const interested = document.getElementById('interested')
        if (interested) {
          interested.classList.remove('is-light')
        }

        showSnackbar('Request successful')
      }).catch(() => {
        showSnackbar('Failed to process the request')
      })
    })
  }
}

/**
 * Display all events data on /explore page
 *
 * @param {object} events The events documents retrieved
 */
function displayExplorePage (events) {
  const exploreColumns = exploreSection.children[0].children[0]

  for (let i = 0, n = events.length; i < n; i++) {
    exploreColumns.innerHTML += renderEventCard(events[i])
  }

  addClickListener() // click listener for interested and going
}

/**
 * Return the HTML fragments for an event document
 *
 * @param {object} event An event document
 * @return {string} The HTML fragment
 */
export function renderEventCard (event) {
  const organiser = event.organiser.username || event.organiser
  const address = event.location.address
  const people = event.interested.length + event.going.length

  const startDate = new Date(event.startDate)
  const startDay = startDate.getDate()
  const startMonth = getStartMonth(startDate)

  const isUserInterested =
    event.interested.some(user => user.username === currentUser)

  return `<div class="column">
    <div class="card">

      <div class="card-image"><a href="/event/${event._id}">
        <figure class="image is-2by1">
        <img src="${event.image}" alt="Event image">
        </figure>
      </a></div>

      <div class="card-content">
        <div class="media month-date">
          <div class="media-left">
            <p class="subtitle is-6 has-text-danger">${startMonth}</p>
            <p class="title is-4 has-text-centered">${startDay}</p>
          </div>
          <div class="media-content">
            <p class="title is-4"><a href="/event/${event._id}">${event.name}</a></p>
            <p class="host subtitle is-6"><a href="/${organiser}">@${organiser}</a></p>
            <p class="location subtitle is-6">${address}</p>
            <p class="subtitle is-6">
                ${prettifyTime(event.startDate, event.endDate)}
            </p>
          </div>
        </div>

        <nav class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <p>${makeFriendly(people)} people</p>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class=
              "button interested-button ${isUserInterested ? 'is-light' : ''}" 
              data-id="${event._id}">
              
                <span class=
                "border icon iconify ${isUserInterested ? 'is-hidden' : ''}" 
                data-icon="ic:sharp-star-border"></span>
                
                <span class=
                "solid icon iconify ${isUserInterested ? '' : 'is-hidden'}" 
                data-icon="ic:sharp-star"></span>
                
                <span>Interested</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>`
}

/**
 * Display the page of an event
 *
 * @param {object} event The event document to display
 */
function displayEventPage (event) {
  const host = document.getElementById('host')
  const genre = $(document.getElementById('genre'))
  const startDate = new Date(event.startDate)

  // Event basic details
  document.getElementById('event-image').src = event.image
  document.getElementById('start-month').textContent = getStartMonth(startDate)
  document.getElementById('start-date').textContent = startDate.getDate()
  document.getElementById('event-name').textContent = event.name
  host.textContent = `@${event.organiser.username}`
  host.href = `/${event.organiser.username}`

  // Interested and Going buttons
  const interested = document.getElementById('interested')
  const going = document.getElementById('going')

  interested.dataset.id = event._id
  going.dataset.id = event._id

  const isUserInterested =
    event.interested.some(user => user.username === currentUser)
  const isUserGoing =
    event.going.some(user => user.username === currentUser)

  /* Assume that the server does not go wrong, a user can only be
  * interested or going to an event */
  if (isUserInterested) {
    interested.classList.add('is-light')
    interested.children[0].classList.add('is-hidden')
    interested.children[1].classList.remove('is-hidden')
  }

  if (isUserGoing) {
    going.classList.add('is-light')
  }

  // Time
  document.getElementById('time').textContent =
    prettifyTime(event.startDate, event.endDate)

  // Location
  document.getElementById('location').textContent = event.location.address

  // Number of people going and interested
  document.getElementById('people').textContent =
    `${makeFriendly(event.going.length)} 
    ${new Date(event.startDate) < new Date() ? 'went' : 'going'} ·
    ${makeFriendly(event.interested.length)} interested`

  // Genre tags
  if (event.genres.length) {
    genre.removeClass('is-hidden')
    genre.append('<div id="tags" class="tags"></div>')
    const tags = $(document.getElementById('tags'))

    for (let i = 0, n = event.genres.length; i < n; i++) {
      tags.append(`<span class="tag">${event.genres[i].name}</span>`)
    }
  }

  // Description
  document.getElementById('description').textContent = event.description

  eventSection.classList.remove('is-hidden')
  // click listener for interested and going
  addClickListener()
}

/**
 * Get the month of the start date
 *
 * @param {Date} startDate A date
 * @returns {string} The month in upper case
 */
function getStartMonth (startDate) {
  return startDate.toLocaleString(undefined, { month: 'short' }).toUpperCase()
}

/**
 * Prettify print the start date to end date
 *
 * @param {string} startDate
 * @param {string} endDate
 * @returns {string} The start date to end date prettified
 */
function prettifyTime (startDate, endDate) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : undefined

  const localeOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }

  if (end) {
    if (start.getDate() === end.getDate() &&
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()) {

      // Format: 27 Mar 2019 10:30 - 13:30 GMT
      return `${start.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })} – ${end.toLocaleString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })}`
    } else {
      // Format: 27 Mar 2019 10:30 - 28 Mar 2019 13:30 GMT
      return `
        ${start.toLocaleString(undefined, localeOptions)} –
        ${end.toLocaleString(undefined, localeOptions)}`
    }
  } else {
    return start.toLocaleString(undefined, localeOptions)
  }
}
