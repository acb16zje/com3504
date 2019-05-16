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
  isPastEvent,
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
import { getGenres } from './databases/genre.mjs'

export const currentUser = $(document.getElementById('my-account')).data('user')

/************************ Navbar search ************************/
/**
 * Add events data to search
 * Add events to select options in
 *
 * @param {Array} events An array of events object
 */
function addEvents (events) {
  const eventSelect = document.getElementById('story-event')

  for (let i = events.length; i--;) {
    // Create story - append events to select options
    if (eventSelect) {
      appendOptionToSelect(eventSelect, events[i].name, events[i]._id)
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
 * @param {Object} users An array of users object
 */
function addUsers (users) {
  for (let i = users.length; i--;) {
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

    loadExplorePageLocal().
      then(events => addEvents(JSON.parse(JSON.stringify(events)))).
      catch(err => {
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
  }).then(users => storeUserProfile(users).finally()).
    catch(() => {
      loadAllUserProfilesLocal().
        then(users => addUsers(users)).
        catch((err) => console.log('Failed to load user data for search function'))
    })
})()

/************************ Explore page search ************************/
const exploreSearchForm = document.getElementById('explore-search-form')
const mapButton = document.getElementById('map-button')

if (exploreSearchForm) {
  // Init genres select
  const genreSelect = document.getElementById('search-genre')
  getGenres().then(genres => {
    for (let i = 0, n = genres.length; i < n; i++) {
      appendOptionToSelect(genreSelect, genres[i].name, genres[i]._id)
    }
  })

  // Location search input
  initLocationInput(true)

  // Date search input
  const dateInput = document.getElementById('searchDate')
  if (dateInput) {
    const fp = flatpickr(dateInput, {
      altInput: true,
      altFormat: 'j F Y',
    })

    document.getElementById('date-clear').onclick = () => fp.clear()

    $(exploreSearchForm).submit(function (e) {
      e.preventDefault()

      const formJson = convertToJSON($(this).serializeArray())

      searchEvent(formJson).then(events => {
        storeExplorePage(events).
          then(() => console.log('Stored searched events')).
          catch(() => console.log('Failed to store searched events'))

        refreshExplorePage(events)
      }).catch(() => {
        searchEventLocal(formJson).
          then(events => refreshExplorePage(events)).
          catch(() => showSnackbar('Failed to search events from server'))
      })
    })
  }
}

/**
 * Search for events from MongoDB
 *
 * @param {Object} formJson The form data submitted in JSON format
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
 * @param {Object} formJson The form data submitted in JSON format
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

          return (startDate >= date && startDate < dateTomorrow &&
            event.endDate === undefined) ||
            (startDate >= date && startDate < dateTomorrow && endDate >=
              date) ||
            (startDate <= date && endDate >= date)
        })
      }

      return events
    }).catch(err => console.log(err))
  }
}

if (mapButton) {
  mapButton.onclick = function () {
    // Show modal
    const mapModal = document.getElementById(this.dataset.target)
    mapModal.insertAdjacentHTML(
      'beforeend',
      '<div id="map" class="modal-content"></div>'
    )
    mapModal.classList.add('is-active')

    // Initialise map
    const map = L.map('map').setView([53.381197, -1.472573], 15)

    // Prevent panning outside of world map
    const southWest = L.latLng(-89.98155760646617, -180)
    const northEast = L.latLng(89.99346179538875, 180)
    const bounds = L.latLngBounds(southWest, northEast)

    map.setMaxBounds(bounds)
    map.on('drag', function () {
      map.panInsideBounds(bounds, { animate: false })
    })

    new L.Control.Geocoder({
      defaultMarkGeocode: false,
    }).on('markgeocode', function (e) {
      const bbox = e.geocode.bbox
      const poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest(),
      ]).addTo(map)
      map.fitBounds(poly.getBounds())
    }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 2,
    }).addTo(map)

    // Load events to show on map
    loadExplorePage().then(events => {
      console.log('Loaded events from server [map]')

      storeExplorePage(events).
        then(() => console.log('Stored events [map]')).
        catch(() => console.log('Failed to store events [map]'))

      addEventsToMap(map, events)
    }).catch(() => {
      console.log('Failed to load events from server, loading from local [map]')

      loadExplorePageLocal().then(events => {
        console.log('Loaded events from local [map]')
        addEventsToMap(map, events)
      }).catch(() => console.log('Failed to plot events'))
    })
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

/**
 * Plot events on map
 *
 * @param {Object} map A map object
 * @param {Array} events An array of events object
 */
function addEventsToMap (map, events) {
  for (let i = events.length; i--;) {
    const latitude = events[i].location.latitude
    const longitude = events[i].location.longitude

    // Excluding past events and events that do not have correct location
    if (!isPastEvent(events[i]) && latitude && longitude) {
      const marker = L.marker([latitude, longitude])

      const popupHTML = `
        <div class="columns">
          <div class="column">
            <figure class="image">
              <img src="${events[i].image}"  alt="Event image">
            </figure>
          </div>
          <div class="column">
            <a href="/event/${events[i]._id}">${events[i].name}</a>
          </div>
        </div>
      `

      marker.bindPopup(popupHTML)
      marker.addTo(map)
    }
  }
}

/************************ Helper functions below ************************/
/**
 * Initialise Google location autocomplete search
 *
 * @param isExploreSearch True if for initialising location input in explore search
 */
export function initLocationInput (isExploreSearch = false) {
  try {
    (function () {
      const input = isExploreSearch
        ? document.getElementById('autocomplete-explore')
        : document.getElementById('autocomplete')

      const autocomplete = new google.maps.places.Autocomplete(input)

      autocomplete.addListener('place_changed', function () {
        const place = autocomplete.getPlace()

        if (place && !isExploreSearch) {
          document.getElementsByName('latitude')[0].
            setAttribute('value', place.geometry.location.lat())
          document.getElementsByName('longitude')[0].
            setAttribute('value', place.geometry.location.lng())
        }
      })
    })()
  } catch (e) {}
}
