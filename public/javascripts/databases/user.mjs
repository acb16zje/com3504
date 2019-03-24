/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'
import { renderEventCard } from './event.mjs'

const USER_STORE = 'user_store'
const userSection = document.getElementById('user')

/**
 * Initialise the user IndexedDB
 *
 * @param {object} db The DB object
 * @returns {Promise<void>} The Promise
 */
export async function initUserDatabase (db) {
  if (!db.objectStoreNames.contains(USER_STORE)) {
    const store = db.createObjectStore(USER_STORE, {
      keyPath: 'username',
    })
    store.createIndex('username', 'username', {
      unique: true,
    })
    store.createIndex('email', 'email', {
      unique: true,
    })
    store.createIndex('fullname', 'fullname')
    store.createIndex('description', 'description')
    store.createIndex('image', 'image')
    store.createIndex('genres', 'genres', {
      multiEntry: true,
    })
    store.createIndex('followers', 'followers', {
      multiEntry: true,
    })
    store.createIndex('following', 'following', {
      multiEntry: true,
    })
  }
}

if (userSection) {
  $(userSection).ready(async function () {
    // Path will always be /:username/
    const path = window.location.pathname.split('/')
    const username = path[1]
    const tab = path[2] // undefined for /:username (stories)

    loadUserProfile(username).then(doc => {
      console.log(`Loaded ${username} from server`)

      Promise.resolve(storeUserProfile(doc)).then(() => {
        console.log(`Stored ${username}`)
        displayUserProfile(tab, doc)
      }).catch(() => console.log(`Failed to store ${username}`))
    }).catch(() => {
      console.log(`Failed to load ${username} from server, loading from local`)

      loadUserProfileLocal(tab, username).then(() => {
        console.log(`Loaded ${username} from local`)
      }).catch(() => console.log(`Failed to load ${username} from local`))
    })

  })
}

/**
 * Load the user profile data from MongoDB
 *
 * @param {string} username The username in the URL
 * @returns {Promise<any>} The Promise
 */
async function loadUserProfile (username) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/user/${username}`,
  }))
}

/**
 * Store the user profile data into IndexedDB
 *
 * @param {object} doc The user document retrieved
 */
function storeUserProfile (doc) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(USER_STORE, 'readwrite')
      doc.genres = doc.genres.map(genre => {return genre.genre_name})
      doc.followers = doc.followers.map(follower => {return follower.username})
      doc.following = doc.following.map(
        following => {return following.username})
      await tx.store.put(doc)
      await tx.done
    }).catch(err => console.log(err))
  }
}

/**
 * Get the user profile data from IndexedDB
 *
 * @param tab The user tab to display (stories, events, going, interested, went)
 * @param {string} username The username in the URL
 * @return {Promise<void>} The Promise
 */
async function loadUserProfileLocal (tab, username) {
  if (dbPromise) {
    dbPromise.then(async db => {
      return await db.getFromIndex(USER_STORE, 'username', username)
    }).then(doc => {
      if (doc) {
        resolve(doc)
      } else {
        userSection.innerHTML = '<p class=\'title has-text-centered\'>' +
          'Unable to load page</p>'
        userSection.classList.remove('is-hidden')
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Display the user data on the page
 *
 * @param tab The user tab to display (stories, events, going, interested, went)
 * @param {object} doc The user document retrieved
 */
function displayUserProfile (tab, doc) {
  document.title = `${doc.fullname} (${doc.username}) - Musicbee`

  // User data
  document.getElementById('user-name').textContent = doc.username
  document.getElementById('profile-img').src = `${doc.image}`
  document.getElementById('fullname').textContent = doc.fullname
  document.getElementById('description').textContent = doc.description
  document.getElementById('story-count').textContent = makeFriendly(
    doc.stories.length)

  document.getElementById('follower-count').textContent = makeFriendly(
    doc.followers.length)

  document.getElementById('following-count').textContent = makeFriendly(
    doc.following.length)

  const genre = $(document.getElementById('genre'))

  if (doc.genres.length) {
    doc.genres.forEach(tag => {
      genre.append(`<span class="tag">${tag}</span>`)
    })
  } else {
    genre.addClass('is-hidden')
  }

  // User links
  document.getElementById('stories-link').href = `/${doc.username}`
  document.getElementById('events-link').href = `/${doc.username}/events`
  document.getElementById('going-link').href = `/${doc.username}/going`
  document.getElementById(
    'interested-link').href = `/${doc.username}/interested`
  document.getElementById('went-link').href = `/${doc.username}/went`

  // Stories, Events, Going, Interested, or Went
  switch (tab) {
    case 'events':
      const eventColumns = document.getElementsByClassName('event-columns')[0]
      doc.events.forEach((event) => {
        eventColumns.innerHTML += renderEventCard(event)
      })
      break
    case 'going':
      break
    case 'interested':
      break
    case 'went':
      break
    default:
      // Stories tab, tab is undefined
      break
  }

  // Only show the content when the user details are loaded
  userSection.classList.remove('is-hidden')
}
