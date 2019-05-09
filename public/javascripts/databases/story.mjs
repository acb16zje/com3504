/**
 * Story IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'

import { dbPromise } from './database.mjs'

const STORY_STORE = 'story_store'
const createStoryForm = document.getElementById('create-story')

if (createStoryForm) {
  $(createStoryForm).submit(function (e) {
    e.preventDefault()
    const imageInput = document.getElementsByName('image')[0]

    if (imageInput.getAttribute('value')) {

    } else {
      showSnackbar('A photo is required')
    }
  })
}

/************************ Functions below ************************/
/**
 * Initialise the story database
 *
 * @param {object} db The DB object
 */
export function initStoryDatabase (db) {
  if (!db.objectStoreNames.contains(STORY_STORE)) {
    const store = db.createObjectStore(STORY_STORE, {
      keyPath: '_id',
    })
    store.createIndex('_id', '_id', { unique: true })
    store.createIndex('user', 'user')
    store.createIndex('event', 'event')
    store.createIndex('image', 'image')
    store.createIndex('caption', 'caption')
    store.createIndex('date', 'date')
    store.createIndex('likes', 'likes', {
      multiEntry: true,
    })
    store.createIndex('comments', 'comments', {
      multiEntry: true,
    })
  }
}

/**
 * Load the stories of a user
 *
 * @param {string} username The username of the user
 * @returns {Promise<any>} The Promise
 */
function loadStories (username) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/story/${username}`,
  }))
}

// export function loadStoriesLocal (username) {
//   if (dbPromise) {
//     return dbPromise.then(async db => {
//       return await db.getFromIndex(STORY_STORE, 'user')
//     }).catch(err => console.log(err))
//   }
// }

/**
 * Load the stories of all followed users
 *
 * @param {string} username The username of logged in user
 * @returns {Promise<any>} The Promise
 */
function loadFollowingStories (username) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/following_story/${username}`,
  }))
}

/**
 * Store stories into the IndexedDB
 *
 * @param {Array} stories An array of story documents retrieved
 * @returns {Promise<void>} The Promise
 */
export async function storeStories (stories) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(STORY_STORE, 'readwrite')

      for (let i = 0, n = stories.length; i < n; i++) {
        (async () => {
          const story = Object.assign({}, stories[i])
          story.user = story.user.username
          story.event = story.event.name
          tx.store.put(story)
          await tx.done
        })()
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Return the HTML fragment for a story document
 *
 * @param {object} story A story document
 * @returns {string} The HTML fragment
 */
export function renderStoryColumn (story) {
  return `<div class="column is-4">
    <figure class="image is-flex modal-button" data-target="story">
      <img src=${story.image} alt="Story image">
    </figure>
  </div>`
}
