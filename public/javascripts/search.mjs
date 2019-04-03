/**
 * Populate the search with data from MongoDB or IndexedDB
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

/**
 * Adding events data into the search function
 */
(async function () {
  await loadExplorePage().then(events => {
    for (let i = 0, n = events.length; i < n; i++) {
      events[i].genres = events[i].genres.map(genre => genre.name).join(' ')

      index.add(events[i])
    }
    return events
  }).then(events => storeExplorePage(events).finally()).catch(err => {

    loadExplorePageLocal().then(events => {
      for (let i = 0, n = events.length; i < n; i++) {
        events[i].genres = events[i].genres.map(genre => genre.name).join(' ')

        index.add(events[i])
      }
    }).catch(() => {
      console.log('Failed to load events data for search functon')
    })
  })
})();

(async function () {
  await loadAllUserProfiles().then(users => {
    for (let i = 0, n = users.length; i < n; i++) {
      // Need to add name because event has name field
      users[i].name = users[i].username
      index.add(users[i])
    }
    return users
  }).then(users => {
    storeUserProfile(users).finally()

  }).catch(() => {
    loadAllUserProfilesLocal().then(users => {
      for (let i = 0, n = users.length; i < n; i++) {
        // Need to add name because event has name field
        users[i].name = users[i].username
        index.add(users[i])
      }
    }).catch(() => {
      console.log('Failed to load user data for search function')
    })
  })
})()
