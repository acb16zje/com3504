/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'

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
    store.createIndex('stories', 'stories', {
      multiEntry: true,
    })
    store.createIndex('followers', 'followers', {
      multiEntry: true,
    })
    store.createIndex('following', 'following', {
      multiEntry: true,
    })
    store.createIndex('events', 'events', {
      multiEntry: true,
    })
    store.createIndex('interested_events', 'interested_events', {
      multiEntry: true,
    })
    store.createIndex('going_events', 'going_events', {
      multiEntry: true,
    })
  }
}

if (userSection) {
  $(userSection).ready(async function () {
    // Path will always be /:username/
    const path = window.location.pathname.split('/')
    const username = path[1]
    const type = path[2] // undefined for /:username (stories)

    loadUserProfile(username).then((doc) => {
      Promise.resolve(storeUserProfile(doc)).then(() => {
        displayUserProfile(doc)
      }).catch(() => console.log('Failed to store user profile'))
    }).catch(() => {
      console.log('Failed to load user profile from server, loading from local')

      loadUserProfileLocal(username)
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
 * @returns {Promise<void>} The Promise
 */
async function storeUserProfile (doc) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(USER_STORE, 'readwrite')
      doc.genres = doc.genres.map(genre => {return genre._id})
      await tx.store.put(doc)
      await tx.done
    }).catch(err => {
      console.log(err)
    })
  }
}

/**
 * Get the user profile data from IndexedDB
 *
 * @param {string} username The username in the URL
 * @return {Promise<void>} The Promise
 */
function loadUserProfileLocal (username) {
  if (dbPromise) {
    dbPromise.then(async db => {
      return await db.getFromIndex(USER_STORE, 'username', username)
    }).then(doc => {
      if (doc) {
        displayUserProfile(doc)
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
 * @param {object} doc The user document retrieved
 */
function displayUserProfile (doc) {
  document.title = `${doc.fullname} (${doc.username}) - Musicbee`

  // User data
  document.getElementById('user-name').textContent = doc.username
  document.getElementById('profile-img').src = `/image/${doc.image}`
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
    doc.genres.forEach((tag) => {
      genre.append(`<span class="tag">${tag.genre_name}</span>`)
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

  userSection.classList.remove('is-hidden')
}
