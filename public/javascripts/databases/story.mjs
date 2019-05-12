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
      const formJson = convertToJSON($(this).serializeArray())

      createStory(formJson).then(res => {
        window.location.href = '/'
      }).catch(err => {
        console.log(err)
        showSnackbar('Failed to create story')
      })
    } else {
      showSnackbar('A photo is required')
    }
  })
}

/************************ IndexedDB / AJAX related ************************/
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
  }
}

/**
 * Load all stories of a user from MongoDB
 *
 * @param {string} username The username of the user
 * @returns {Promise<any>} The Promise
 */
function loadUserStories (username) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/user_story/${username}`,
  }))
}

// export function loadUserStoriesLocal (username) {
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
 * Load a story from MongoDB
 *
 * @param {string} storyID The ID of the story
 * @returns {Promise<any>} The Promise
 */
function loadStory (storyID) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/story/${storyID}`,
  }))
}

/**
 * Load a story locally from IndexedDB
 *
 * @param {string} storyID The ID of the story
 * @returns {Promise<* | void>} The Promise
 */
function loadStoryLocal (storyID) {
  if (dbPromise) {
    return dbPromise.then(async db => {
      return await db.getFromIndex(STORY_STORE, '_id', storyID)
    }).catch(err => console.log(err))
  }
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
 * Create a story
 *
 * @param {object} formJson The form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function createStory (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    url: '/api/story/create',
  }))
}

function editStory (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    url: '/api/story/update',
  }))
}

/**
 * Like a story
 *
 * @param {string} storyID The ID of the story to be liked
 * @returns {Promise<any>} The Promise
 */
export function likeStory (storyID) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({ id: storyID }),
    url: '/api/story/like',
  }))
}

/**
 * Load the story data from Mongo, or IndexedDB
 *
 * @param {story} storyID The ID of the story to load
 * @returns {Promise<any | * | void>} The Promise
 */
export async function loadStoryData (storyID) {
  return loadStory(storyID).then(story => {
    console.log(`Loaded story ${storyID} from server`)
    storeStories([story]).
      then(() => console.log(`Stored story ${storyID}`)).
      catch(() => console.log(`Failed to store story ${storyID}`))

    return story
  }).catch(() => {
    console.log(`Failed to load story ${storyID} from server, loading locally`)

    return loadStoryLocal(storyID).then(story => {
      console.log(`Loaded story ${storyID} from local`)
      return story
    }).catch(() => console.log(`Failed to load story ${storyID} locally`))
  })
}

/************************ Rendering related ************************/
/**
 * Return the HTML fragment for a story document
 *
 * @param {object} story A story document
 * @returns {string} The HTML fragment
 */
export function renderStoryColumn (story) {
  return `<div class="column is-4">
    <figure class="image is-flex story-modal" data-id=${story._id}>
      <img src=${story.image} alt="Story image">
    </figure>
  </div>`
}
