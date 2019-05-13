/**
 * Populate the search with data from MongoDB or IndexedDB,
 * populate the event select options in create_story page
 *
 * @author Zer Jun Eng
 */

'use strict'
import {
  displayExplorePage,
  EVENT_STORE,
  loadExplorePage,
  loadExplorePageLocal,
  storeExplorePage,
} from './databases/event.mjs'
import {
  loadAllUserProfiles,
  loadAllUserProfilesLocal,
  storeUserProfile,
} from './databases/user.mjs'
import { dbPromise } from './databases/database.mjs'

export const currentUser = $(document.getElementById('my-account')).data('user')

/************************ Navbar search ************************/
/**
 * Add events data to search
 * Add events to select options in
 *
 * @param {Array} events An array of events object
 */
function addEvents (events) {
  for (let i = 0, n = events.length; i < n; i++) {
    if (eventSelect) {
      appendEventToSelect(events[i].name, events[i]._id)
    }

    if (events[i].genres) {
      events[i].genres = events[i].genres.map(genre => genre.name).join(' ')
    }

    index.add(events[i])
  }
}

/**
 * Add users data to search
 *
 * @param {object} users An array of users object
 */
function addUsers (users) {
  for (let i = 0, n = users.length; i < n; i++) {
    // Need to add name because event has name field
    users[i].name = users[i].username
    index.add(users[i])
  }
}

/**
 * Adding events data into the search function,
 * adding events data into select options in create_story page
 */
(async function () {
  await loadExplorePage().then(events => {
    addEvents(JSON.parse(JSON.stringify(events)))
    return events
  }).then(events => storeExplorePage(events).finally()).catch(err => {

    loadExplorePageLocal().then(events => {
      addEvents(JSON.parse(JSON.stringify(events)))
    }).catch(err => {
      console.log(err)
      console.log('Failed to load events data for search functon')
    })
  })
})()

/**
 * Adding user data into the search function
 */
;(async function () {
  await loadAllUserProfiles().then(users => {
    addUsers(users)
    return users
  }).then(users => {
    storeUserProfile(users).finally()

  }).catch(() => {
    loadAllUserProfilesLocal().then(users => {
      addUsers(users)
    }).catch(() => {
      console.log('Failed to load user data for search function')
    })
  })
})()

/************************ Explore page search ************************/
const exploreSearchForm = document.getElementById('explore-search-form')

if (exploreSearchForm) {
  const searchButton = document.getElementById('search-button')

  // Location search input
  initLocationInput()

  // Date search input
  const dateInput = document.getElementById('searchDate')
  if (dateInput) {
    const fp = flatpickr(dateInput, {
      altInput: true,
      altFormat: 'j F Y',
    })

    document.getElementById('date-clear').onclick = () => {
      fp.clear()
    }
  }

  $(exploreSearchForm).submit(function (e) {
    e.preventDefault()

    const formJson = convertToJSON($(this).serializeArray())

    searchEvent(formJson).then(events => {
      storeExplorePage(events).then(() => {
        console.log('Stored searched events')
      }).catch(() => console.log('Failed to store searched events'))

      refreshExplorePage(events)
    }).catch(() => {
      searchEventLocal(formJson).then(events => {
        refreshExplorePage(events)
      }).catch(() => showSnackbar('Failed to search events from server'))
    })
  })
}

/**
 * Search for events from MongoDB
 *
 * @param {object} formJson The form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function searchEvent (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    dataType: 'json',
    url: '/api/event_search',
  }))
}

/**
 * Search for events from IndexedDB
 *
 * @param {object} formJson The form data submitted in JSON format
 * @returns {Promise<* | void>} The Promise
 */
function searchEventLocal (formJson) {
  if (dbPromise) {
    return dbPromise.then(async db => {
      let events = await db.getAll(EVENT_STORE)

      if (formJson.event) {
        events = events.filter(event => {
          return event.name.match(new RegExp(`^.*${formJson.event.replace(
            /[-/\\^$*+?.()|[]{}]/g, '\\$&')}.*$`, 'gi'))
        })
      }

      if (formJson.address) {
        events = events.filter(event => {
          return event.location.address.match(
            new RegExp(`^.*${formJson.address.replace(
              /[-/\\^$*+?.()|[]{}]/g, '\\$&')}.*$`, 'gi'))
        })
      }

      if (formJson.date) {
        const date = new Date(formJson.date)
        const dateTomorrow = new Date(date).setDate(date.getDate() + 1)

        events = events.filter(event => {
          const startDate = new Date(event.startDate)
          const endDate = new Date(event.endDate)

          /**
           * Case 1: Only has start date
           * Case 2: Has end date, selected date is start date
           * Case 3: Has end date, selected date between start and end date
           */

          return (startDate >= date && startDate < dateTomorrow && event.endDate === undefined) ||
            (startDate >= date && startDate < dateTomorrow && endDate >= date) ||
            (startDate <= date && endDate >= date)
        })
      }

      return events
    }).catch(err => console.log(err))
  }
}

/**
 * Re-display the explore page with search resutls
 *
 * @param {Array} events An array of searched events
 */
function refreshExplorePage (events) {
  const upcoming = document.getElementById('upcoming')
  const past = document.getElementById('past')

  while (upcoming.firstChild)
    upcoming.removeChild(upcoming.firstChild)

  while (past.firstChild)
    past.removeChild(past.firstChild)

  displayExplorePage(events)
}

/************************ Helper functions below ************************/
/**
 * Initialise Google location autocomplete search
 */
export function initLocationInput () {
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
}
