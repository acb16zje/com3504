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
  loadExplorePage().
    then(events => {
      console.log('Loaded /explore from server')

      return storeExplorePage(events).then(() => {
        console.log('Stored /explore')
        return events
      }).catch(() => console.log('Failed to store /explore'))
    }).
    then(events => displayExplorePage(events)).
    catch(() => {
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

    storeExplorePage([event]).
      then(() => displayEventPage(event)).
      catch(err => console.log(err))

  }).catch(() => {
    console.log('Failed to load event from server, loading from local')

    loadEventPageLocal(eventID).then(event => {
      console.log('Loaded event from local')

      if (event) {
        displayEventPage(event)
      } else {
        unableToLoadPage(eventSection)
      }
    }).catch(() => console.log('Failed to load event from local'))
  })
}

// Create event
if (createEventForm) {
  initEventForm()

  $(createEventForm).submit(function (e) {
    e.preventDefault()

    const formJson = convertToJSON($(this).serializeArray())

    if (formJson.genres) {
      formJson.genres = JSON.parse(formJson.genres).map(genre => genre.id)
    }

    createEvent(formJson).then(res => {
      window.location.href = `/event/${res.eventID}`
    }).catch(err => {
      console.log(err)
      showSnackbar('Failed to create event')
    })
  })
}

/************************ IndexedDB / AJAX related ************************/
/**
 * Initialise the event IndexedDB
 *
 * @param {object} db The DB object
 */
export function initEventDatabase (db) {
  if (!db.objectStoreNames.contains(EVENT_STORE)) {
    const store = db.createObjectStore(EVENT_STORE, {
      keyPath: '_id',
    })
    store.createIndex('_id', '_id', { unique: true })
    store.createIndex('name', 'name')
  }
}

/**
 * Load all events data from MongoDB
 *
 * @return {Promise<any>} The Promise
 */
export function loadExplorePage () {
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
    return dbPromise.then(async db => {
      return await db.getFromIndex(EVENT_STORE, '_id', eventID)
    }).catch(err => console.log(err))
  }
}

/**
 * Store the events data into IndexedDB
 *
 * @param {Array} events An array of events documents retrieved
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
          tx.store.put(events[i])
          await tx.done
        })()
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Create an event
 *
 * @param {object} formJson The form data submitted in JSON format
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
 * Edit an event
 *
 * @param {object} formJson The form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function editEvent (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    url: '/api/event/update',
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

/************************ Rendering related ************************/
/**
 * Display all events data on /explore page
 *
 * @param {object} events The events documents retrieved
 */
function displayExplorePage (events) {
  const exploreColumns = exploreSection.children[0].children[0]

  for (let i = 0, n = events.length; i < n; i++) {
    exploreColumns.insertAdjacentHTML('beforeend', renderEventCard(events[i]))
  }

  addInterestedGoingListener() // click listener for interested and going
  addEditListener() // Click listener for edit event buttons
}

/**
 * Display the page of an event
 *
 * @param {object} event The event document to display
 */
function displayEventPage (event) {
  const host = document.getElementById('host')
  const genre = document.getElementById('genre')
  const startDate = new Date(event.startDate)

  // Event basic details
  document.getElementById('event-image').src = event.image
  document.getElementById('start-month').textContent = getStartMonth(startDate)
  document.getElementById('start-date').textContent = startDate.getDate()
  document.getElementById('event-name').textContent = event.name
  const organiser = event.organiser.username || event.organiser
  host.textContent = `@${organiser}`
  host.href = `/${organiser}`

  // Interested and Going buttons
  const interested = document.getElementById('interested')
  const going = document.getElementById('going')

  // Event host can only edit, but not set interested or going
  if (organiser === currentUser) {
    interested.parentElement.classList.add('is-hidden')

    const edit = document.getElementById('edit')
    edit.dataset.id = event._id
    edit.parentElement.classList.remove('is-hidden')
  } else {
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
    genre.classList.remove('is-hidden')

    const tags = document.createElement('div')
    tags.classList.add('tags')
    genre.appendChild(tags)

    for (let i = 0, n = event.genres.length; i < n; i++) {
      const node = document.createElement('span')
      node.classList.add('tag')
      node.textContent = event.genres[i].name
      tags.appendChild(node)
    }
  }

  // Description
  document.getElementById('description').textContent = event.description

  eventSection.classList.remove('is-hidden')
  addInterestedGoingListener() // click listener for interested and going
  addEditListener() // Click listener for edit event buttons
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
              ${organiser === currentUser ?
                `<button class="button edit-button" data-id="${event._id}">
                  <span class="icon iconify"data-icon="ic:baseline-edit"></span>
                  <span>Edit</span>
                </button>`
              :
                `<button class=
                "button interested-button ${isUserInterested ? 'is-light' : ''}"
                data-id="${event._id}">
  
                  <span class=
                  "border icon iconify ${isUserInterested ? 'is-hidden' : ''}"
                  data-icon="ic:sharp-star-border"></span>
  
                  <span class=
                  "solid icon iconify ${isUserInterested ? '' : 'is-hidden'}"
                  data-icon="ic:sharp-star"></span>
  
                  <span>Interested</span>
                </button>`
              }
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>`
}

/**
 * Return the HTML for edit event modal
 *
 * @param event
 * @returns {string} The HTML fragment
 */
function renderEditEventModal (event) {
  return `
  <div id="edit-event" class="modal is-active">
    <div class="modal-background"></div>

    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Event</p>
      </header>
      <section class="modal-card-body">
        <form id="edit-event-form">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Event Photo</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="file has-name">
                  <label class="file-label">
                    <input id="file-input" class="file-input" type="file" accept="image/*">
                    <input name="image" type="hidden">
                    <input name="id" type="hidden" value=${event._id}>
                    <span class="file-cta">
                      <span class="file-icon">
                        <span class="iconify" data-icon="fa-solid:camera"></span>
                      </span>
                      <span class="file-label">
                        Upload photo
                      </span>
                    </span>
                    <span id="file-name" class="file-name">No file chosen</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Event Name</label>
            </div>
            <div class="field-body">
              <div class="field">
                <p class="control is-expanded">
                  <input name="name" class="input" type="text" maxlength="64" value="${event.name}" required>
                </p>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Location</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control ">
                  <input name="address" id="autocomplete" class="input" type="search" value="${event.location.address}">
                  <input name="latitude" type="hidden">
                  <input name="longitude" type="hidden">
                </div>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Description</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <textarea name="description" class="textarea has-fixed-size autosize" rows="3">${event.description}</textarea>
                </div>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Start Date</label>
            </div>
            <div class="field-body is-vcentered">
              <div class="field">
                <p class="control">
                  <input name="startDate" id="startDate" class="input flatpickr flatpickr-input" type="text" required>
                </p>
              </div>
              <div class="field is-narrow is-flex">
                <a id="add-end-time">+ End Date</a>
              </div>
            </div>
          </div>
        
          <div id="end-time-field" class="field is-horizontal is-hidden">
            <div class="field-label is-normal">
              <label class="label">End Date</label>
            </div>
            <div class="field-body is-vcentered">
              <div class="field">
                <p class="control">
                  <input name="endDate" id="endDate" class="input flatpickr flatpickr-input" type="text">
                </p>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Genres</label>
            </div>
            <div class="field-body">
              <div class="field">
                <p class="control">
                  <input id="${event._id}-genre" name="genres" type="text" class="input event-genre" placeholder="Maximum 5 genres">
                </p>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label">
              <!-- Left empty for spacing -->
            </div>
            <div class="field-body">
              <div class="field is-grouped">
                <div class="control">
                  <button type="submit" class="button is-primary">Save</button>
                </div>
                <div class="control">
                  <button type="button" class="button is-light button-close">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>

    <button class="modal-close is-large" aria-label="close"></button>
  </div>`
}

/************************ EventListener below ************************/
/**
 * Add click listener to interested and going buttons after page load
 */
export function addInterestedGoingListener () {
  const interestedButtons = $('.interested-button')
  const goingButtons = $('.going-button')

  if (interestedButtons.length) {
    interestedButtons.click(function () {
      // Set the event as interested, will replace going status
      submitInterested(this.dataset.id).then(() => {
        this.classList.toggle('is-light')
        this.querySelector('svg.border').classList.toggle('is-hidden')
        this.querySelector('svg.solid').classList.toggle('is-hidden')

        // If the event is set as going
        const going = document.getElementById('going')
        if (going) {
          going.classList.remove('is-light')
        }

      }).catch(err => {
        if (err.status === 401) {
          showSnackbar('Please sign in to continue')
        } else {
          showSnackbar('Failed to process the request')
        }
      })
    })
  }

  if (goingButtons.length) {
    goingButtons.click(function () {
      // Set the event as going, will replace interested status
      submitGoing(this.dataset.id).then(() => {
        this.classList.toggle('is-light')

        // If the event is set as interested
        const interested = document.getElementById('interested')
        if (interested) {
          interested.classList.remove('is-light')
          interested.querySelector('svg.solid').classList.add('is-hidden')
          interested.querySelector('svg.border').classList.remove('is-hidden')
        }

      }).catch(err => {
        if (err.status === 401) {
          showSnackbar('Please sign in to continue')
        } else {
          showSnackbar('Failed to process the request')
        }
      })
    })
  }
}

/**
 * Add click listener to edit button
 */
export function addEditListener () {
  const editButtons = document.getElementsByClassName('edit-button')

  for (let i = 0, n = editButtons.length; i < n; i++) {
    editButtons[i].onclick = async function () {
      if (!document.getElementById('edit-event')) {
        await loadEventPage(this.dataset.id).then(event => {
          this.parentElement.insertAdjacentHTML(
            'beforeend', renderEditEventModal(event))

          initEventForm()

          // Set datepicker with event dates
          initDatepicker()

          const fp = document.getElementById('startDate')._flatpickr
          fp.setDate(event.startDate)

          // Show end date if the event has one
          if (event.endDate) {
            document.getElementById('add-end-time').click()
            const fpEnd = document.getElementById('endDate')._flatpickr

            // Do not allow end date to be earlier than start date
            if (new Date(event.startDate) <= new Date()) {
              fpEnd.set('minDate', new Date())
            } else {
              fpEnd.set('minDate', event.startDate)
            }
            fpEnd.setDate(event.endDate)
          }

          // Set genres input with event genres
          const genresInput = document.getElementById(`${event._id}-genre`)
          genresInput.setAttribute(
            'value', event.genres.map(genre => genre.name).join(','))

          // Edit form submit
          const editEventForm = document.getElementById('edit-event-form')
          $(editEventForm).submit(function (e) {
            e.preventDefault()

            const formJson = convertToJSON($(this).serializeArray())

            if (formJson.genres) {
              formJson.genres = JSON.parse(formJson.genres).map(genre => genre.id)
            }

            editEvent(formJson).then(() => {
              showSnackbar('Event updated')
              document.getElementById('edit-event').remove()
            }).catch(err => {
              console.log(err)
              showSnackbar('Failed to edit event')
            })
          })
        }).catch(err => console.log(err))

        closeModalListener()
      }
    }
  }
}

/************************ Helper Functions below ************************/
/**
 * Initialise create, edit event form
 */
function initEventForm () {
  initFileInput()

  // Google Maps JavaScript API
  try {
    (function () {
      const input = document.getElementById('autocomplete')

      const autocomplete = new google.maps.places.Autocomplete(input)

      autocomplete.addListener('place_changed', function () {
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

  const genresInput = document.getElementsByClassName('event-genre')
  for (let i = 0, n = genresInput.length; i < n; i++) {
    initGenresInput(genresInput[i]).finally()
  }
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
    if (isSameDate(start, end)) {
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
