/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'

const STORE_NAME = 'user_store'

/**
 * Initialise the user IndexedDB
 *
 * @returns {Promise<void>}
 */
export async function initUserDatabase (db) {
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, {
      keyPath: 'username'
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

const userSection = document.getElementById('user')

if (userSection) {
  $(userSection).ready(async function () {
    loadUserProfile().then((doc) => {
      Promise.resolve(displayUserProfile(doc)).then(() => {
        console.log('displayed')

        Promise.resolve(storeUserProfile(doc)).then(() => {
          console.log('data stored')
        }).catch(err => console.log(err))
      })
    })
  })
}

/**
 * Load the user profile data
 */
async function loadUserProfile () {
  return Promise.resolve($.ajax({
    method: 'GET',
    contentType: 'application/json',
    url: `/u${window.location.pathname}`,
  }))
}

/**
 * Display the user data on the page
 *
 * @param doc The user document retrieved
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

  document.getElementById('user').classList.remove('is-hidden')
}

/**
 * Store the user profile data into IndexedDB
 *
 * @param doc The user document retrieved
 */
async function storeUserProfile (doc) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      doc.genres = doc.genres.map(genre => {return genre._id})
      await tx.store.put(doc)
      await tx.done
    }).catch((err) => {
      console.log(err)
    })
  }
}
