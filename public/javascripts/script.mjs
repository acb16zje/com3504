/**
 * Populate the search with data from MongoDB or IndexedDB,
 * populate the event select options in create_story page
 *
 * @author Zer Jun Eng
 */

'use strict'
import {
  loadExplorePage,
  loadExplorePageLocal,
  storeExplorePage,
} from './databases/event.mjs'
import {
  loadAllUserProfiles,
  loadAllUserProfilesLocal,
  storeUserProfile,
} from './databases/user.mjs'

export const currentUser = $(document.getElementById('my-account')).data('user')

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
