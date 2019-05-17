/**
 * Event IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise, unableToLoadPage } from './database.mjs'
import { initGenresInput } from './genre.mjs'
import { currentUser, initLocationInput } from '../script.mjs'
import {
  addStoryFeedLikeListener,
  eventFeedDiv,
  renderStoryFeed,
} from './feed.mjs'
import {
  addEditStoryListener,
  addStoryModalListener,
  formatStoryDate,
  renderStoryModal,
  storeStories,
} from './story.mjs'

export const EVENT_STORE = 'event_store'
export const exploreEvents = document.getElementById('explore-events')
const eventSection = document.getElementById('event')
const discussionSection = document.getElementById('discussion-section')
const createEventForm = document.getElementById('create-event')
const commentEventForm = document.getElementById('event-comment')

// Path will be /event/:id or /event/:id/discussion
const eventID = window.location.pathname.split('/')[2]

// Loading, storing, and displaying events at /explore
if (exploreEvents) {
  loadExploreEvents().then(events => {
    console.log('Loaded /explore from server')

    storeExplorePage(events).then(() => {
      console.log('Stored /explore')
      displayExplorePage(events)
    }).catch(() => console.log('Failed to store /explore'))

  }).catch(() => {
    console.log('Failed to load /explore from server, loading from local')

    loadExploreEventsLocal().then(events => {
      console.log('Loaded /explore page from local')

      if (events && events.length) {
        displayExplorePage(events)
      } else {
        unableToLoadPage(exploreEvents)
      }
    }).catch(() => {
      console.log('Failed to load /explore page from local')
      unableToLoadPage(exploreEvents)
    })
  })
}

// Loading, storing, and displaying individual event
if (eventSection) {
  loadEventPage(eventID).then(event => {
    console.log('Loaded event from server')

    storeExplorePage([event]).
      then(() => console.log('Stored event')).
      catch(() => console.log('Failed to store event'))

    storeStories(event.stories).
      then(() => console.log('Stored event\'s stories')).
      catch(err => console.log('Failed to store event\'s stories'))

    displayEventPage(event)
    if (discussionSection) renderDiscussion(event)

  }).catch(() => {
    console.log('Failed to load event from server, loading from local')

    loadEventPageLocal(eventID).then(event => {
      console.log('Loaded event from local')

      if (event) {
        displayEventPage(event)

        if (discussionSection) renderDiscussion(event)
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
      if (err.status === 413) {
        showSnackbar('Image size too large')
      } else {
        showSnackbar('Failed to create event')
      }
    })
  })
}

// Comment event
if (commentEventForm) {
  const postButton = document.getElementById('post-event-comment')

  postButton.onclick = () => {
    submitComment(eventID, document.getElementById('reply').value).then(res => {
      // Send message to everyone including sender
      if (socket) socket.emit('new event comment', eventID, res)

      commentEventForm.reset()
    }).catch(err => {
      if (err.status === 401) {
        showSnackbar('Please sign in to continue')
      } else {
        showSnackbar('Failed to process the request')
      }
    })
  }
}

/************************ Socket.io event listener ************************/
if (socket && discussionSection) {
  socket.emit('join event room', eventID)

  socket.on('new event story', story => {
    // Prepend the story
    discussionSection.insertAdjacentHTML('afterbegin', renderStoryFeed(story))

    // If this is the first story added, then add modal as well
    if (!document.getElementById('story')) {
      eventSection.insertAdjacentHTML('beforeend', renderStoryModal())
    }

    // Add required listeners for the newly created story
    addStoryModalListener()
    addEditStoryListener()
    closeModalListener()
  })

  socket.on('new event comment', comment => {
    // Prepend the comment
    discussionSection.insertAdjacentHTML('afterbegin',
      renderEventComment(comment))
  })
}

/************************ IndexedDB / AJAX related ************************/
/**
 * Initialise the event IndexedDB
 *
 * @param {Object} db The DB object
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
export function loadExploreEvents () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/api/explore',
  }))
}

/**
 * Load all events data from IndexedDB
 *
 * @return {Promise<* | void>} The Promise
 */
export async function loadExploreEventsLocal () {
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
 * @param {Object} formJson The form data submitted in JSON format
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
 * @param {Object} formJson The form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function editEvent (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    dataType: 'json',
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

/**
 * Comment an event
 *
 * @param {string} eventID The ID of the event to comment
 * @param {string} content The content of the comment
 * @returns {Promise<any>} The Promise
 */
function submitComment (eventID, content) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    data: JSON.stringify({ id: eventID, content: content }),
    url: '/api/event/comment',
  }))
}

/************************ Rendering related ************************/
/**
 * Display all events data on /explore page
 *
 * @param {Object} events The events documents retrieved
 */
export function displayExplorePage (events) {
  const upcomingColumns = document.getElementById('upcoming')
  const pastColumns = document.getElementById('past')

  for (let i = 0, n = events.length; i < n; i++) {
    if (isPastEvent(events[i])) {
      // Past events
      pastColumns.insertAdjacentHTML('afterbegin', renderEventCard(events[i]))
    } else {
      // Upcoming events
      upcomingColumns.insertAdjacentHTML('beforeend',
        renderEventCard(events[i]))
    }
  }

  // Do not show Past Events text when there are none
  if (pastColumns.children.length < 1) {
    document.getElementById('past-text').classList.add('is-hidden')
  } else {
    document.getElementById('past-text').classList.remove('is-hidden')
  }

  addInterestedGoingListener() // click listener for interested and going
  addEditEventListener() // Click listener for edit event buttons
  exploreEvents.classList.remove('is-hidden')
}

/**
 * Display the page of an event
 *
 * @param {Object} event The event document to display
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

    if (isUserGoing) going.classList.add('is-light')
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

    if (document.getElementsByClassName('tags')[0]) {
      document.getElementsByClassName('tags')[0].remove()
    }

    const tags = document.createElement('div')
    tags.classList.add('tags')
    genre.appendChild(tags)

    for (let i = 0, n = event.genres.length; i < n; i++) {
      const node = document.createElement('span')
      node.classList.add('tag')
      node.textContent = event.genres[i].name
      tags.appendChild(node)
    }
  } else {
    genre.classList.add('is-hidden')
  }

  // About and discussion link
  document.getElementById(
    'about').firstElementChild.href = `/event/${event._id}`
  document.getElementById(
    'discussion').firstElementChild.href = `/event/${event._id}/discussion`

  // Description
  const description = document.getElementById('description')
  if (description) description.textContent = event.description

  eventSection.classList.remove('is-hidden')
  addInterestedGoingListener() // click listener for interested and going
  addEditEventListener() // Click listener for edit event buttons
}

/**
 * Render the discussion section of the event page
 *
 * @param {Object} event The event document to display
 */
function renderDiscussion (event) {
  const commentsAndStories = [...event.comments, ...event.stories].sort(
    (a, b) => {
      // Newest date first
      return new Date(a.date) - new Date(b.date)
    })

  for (let i = commentsAndStories.length; i--;) {
    const item = commentsAndStories[i]

    if (item.image) {
      // It is a story
      discussionSection.insertAdjacentHTML('beforeend', renderStoryFeed(item))
      addStoryFeedLikeListener(
        document.getElementById(`like-button-${item._id}`))
    } else {
      // It is a comment only
      discussionSection.insertAdjacentHTML('beforeend',
        renderEventComment(item))
    }
  }

  // Add event listeners for story like, story modal
  if (event.stories && event.stories.length) {
    eventSection.insertAdjacentHTML('beforeend', renderStoryModal())
    addStoryModalListener()
    addEditStoryListener()
    closeModalListener()
  }
}

/***
 *
 * @param {object} comment The comment object of the event
 * @returns {string} The HTML fragment for the comment card
 */
function renderEventComment (comment) {
  const username = comment.user.username

  return `
  <div id="comment-card" class="card">
    <header class="card-header">
      <div class="card-header-title">
        <nav class="level is-mobile is-marginless">
          <div class="level-item">
            <a href="/${username}">
              <figure class="image is-48x48">
                <img class="is-rounded" src="${comment.user.image}"  alt="User profile image">
              </figure>
            </a>
          </div>
          <div class="level-item profile-event-link">
            <a href="/${username}">
              <p class="title is-6 story-username">${username}</p>
            </a>
            <a class="has-text-black">
              <small class="is-size-7">${formatStoryDate(comment.date)}</small>
            </a>
          </div>
        </nav>
      </div>
    </header>

    <div class="card-content">
     <p class="subtitle is-5">${comment.content}</p>
    </div>
  </div>`
}

/**
 * Return the HTML fragments for an event document
 *
 * @param {Object} event An event document
 * @return {string} The HTML fragment
 */
export function renderEventCard (event) {
  const eventID = event._id
  const organiser = event.organiser.username || event.organiser
  const address = event.location.address
  const people = event.interested.length + event.going.length

  const startDate = new Date(event.startDate)
  const startDay = startDate.getDate()
  const startMonth = getStartMonth(startDate)

  const isUserInterested =
    event.interested.some(user => user.username === currentUser)

  return `<div id="${eventID}" class="column">
    <div class="card">

      <div class="card-image"><a href="/event/${eventID}">
        <figure class="image is-2by1">
          <img id="event-image-${eventID}" src="${event.image}" alt="Event image">
        </figure>
      </a></div>

      <div class="card-content">
        <div class="media month-date">
          <div class="media-left">
            <p id="event-month-${eventID}" class="subtitle is-6 has-text-danger">${startMonth}</p>
            <p id="event-day-${eventID}" class="title is-4 has-text-centered">${startDay}</p>
          </div>
          <div class="media-content">
            <p class="title is-4"><a id="event-name-${eventID}" href="/event/${eventID}">${event.name}</a></p>
            <p class="host subtitle is-6"><a href="/${organiser}">@${organiser}</a></p>
            <p id="event-location-${eventID}" class="location subtitle is-6">${address}</p>
            <p id="event-time-${eventID}" class="subtitle is-6">${prettifyTime(
    event.startDate, event.endDate)}</p>
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
                `<button class="button edit-button" data-id="${eventID}">
                  <span class="icon iconify"data-icon="ic:baseline-edit"></span>
                  <span>Edit</span>
                </button>`
              :
                `<button class=
                "button interested-button ${isUserInterested ? 'is-light' : ''}"
                data-id="${eventID}">

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
 * Return the HTML fragment for edit event modal
 *
 * @param {Object} event The event document object
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
                    <input name="id" type="hidden" value="${event._id}">
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
                  <textarea name="description" class="textarea has-fixed-size" rows="3">${event.description}</textarea>
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
 * Add click listener to edit event button
 */
export function addEditEventListener () {
  const editButtons = document.getElementsByClassName('edit-button')

  for (let i = 0, n = editButtons.length; i < n; i++) {
    editButtons[i].onclick = async function () {
      // Do not render the modal more than once
      if (!document.getElementById('edit-event')) {
        await loadEventPage(this.dataset.id).then(event => {
          const eventID = event._id

          this.parentElement.insertAdjacentHTML(
            'beforeend',
            renderEditEventModal(event),
          )

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
          const genresInput = document.getElementById(`${eventID}-genre`)
          genresInput.setAttribute(
            'value', event.genres.map(genre => genre.name).join(','))

          // Edit event form submit
          const editEventForm = document.getElementById('edit-event-form')
          $(editEventForm).submit(function (e) {
            e.preventDefault()

            const formJson = convertToJSON($(this).serializeArray())
            const submitForm = Object.assign({}, formJson)
            const displayForm = Object.assign({}, formJson)

            // Genres field is empty is no option is selected
            if (formJson.genres) {
              submitForm.genres = JSON.parse(submitForm.genres).
                map(genre => genre.id)
              displayForm.genres = JSON.parse(displayForm.genres).
                map(genre => {return { name: genre.value }})
            }

            editEvent(submitForm).then(event => {
              showSnackbar('Event updated')
              if (eventSection) {
                event.genres = displayForm.genres
                displayEventPage(event)
              } else if (exploreEvents || eventFeedDiv) {
                const startDate = new Date(event.startDate)
                const startDay = startDate.getDate()
                const startMonth = getStartMonth(startDate)

                document.getElementById(
                  `event-name-${eventID}`).textContent = event.name
                document.getElementById(
                  `event-month-${eventID}`).textContent = startMonth
                document.getElementById(
                  `event-day-${eventID}`).textContent = startDay
                document.getElementById(
                  `event-location-${eventID}`).textContent = event.location.address
                document.getElementById(
                  `event-time-${eventID}`).textContent = prettifyTime(
                  event.startDate, event.endDate)
              }
              document.getElementById('edit-event').remove()
            }).catch(() => showSnackbar('Failed to edit event'))
          })
        }).catch(() => showSnackbar('Failed to load event data'))

        closeModalListener()
      }
    }
  }
}

/************************ Helper Functions below ************************/
/**
 * Get the list of events
 *
 * @return {Promise<any>} The Promise
 */
export async function getEvents () {
  return await loadExploreEvents().then(events => {
    return events
  }).catch(async () => {
    return await loadExploreEventsLocal().then(events => {
      return events
    })
  })
}

/**
 * Initialise create, edit event form
 */
function initEventForm () {
  initFileInput()

  // Google Maps JavaScript API
  initLocationInput()

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

/**
 * Check if the event is already finished
 *
 * @param {Object} event An event document
 * @returns {boolean} True if the event has already finished
 */
export function isPastEvent (event) {
  const today = new Date()

  return new Date(event.startDate) < today &&
    (!event.endDate || new Date(event.endDate) < today)
}
