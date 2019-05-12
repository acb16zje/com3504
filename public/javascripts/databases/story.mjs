/**
 * Story IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'

import { dbPromise } from './database.mjs'
import { currentUser } from '../script.mjs'

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

/**
 * Edit a story
 *
 * @param {object} formJson The form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function editStory (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    url: '/api/story/update',
  }))
}

/**
 * Delete a story
 *
 * @param {string} storyID The ID of the story to delete
 * @returns {Promise<any>} The Promise
 */
function deleteStory (storyID) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({ id: storyID }),
    url: '/api/story/delete',
  }))
}

function deleteStoryLocal (storyID) {
  if (dbPromise) {
    dbPromise.then(async db => {
      await db.delete(STORY_STORE, storyID, '_id')
    }).catch(err => console.log(err))
  }
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
  return `<div id="${story._id}" class="column is-4">
    <figure class="image is-flex story-modal" data-id=${story._id}>
      <img src=${story.image} alt="Story image">
    </figure>
  </div>`
}

/**
 * Return the HTML fragment for edit story modal
 *
 * @param {string} id The ID of the story
 * @param {string} caption The caption of the story
 * @returns {string} The HTML fragment
 */
function renderEditStoryModal (id, caption) {
  return `
  <div id="edit-story" class="modal is-active">
    <div class="modal-background"></div>

    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Story</p>
      </header>
      <section class="modal-card-body">
        <form id="edit-story-form"> 
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Caption</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input name="id" type="hidden" value="${id}">
                  <textarea name="caption" class="textarea has-fixed-size autosize" rows="3">${caption}</textarea>
                </div>
              </div>
            </div>
          </div>
        
          <div class="field is-horizontal">
            <div class="field-label">
              <!-- Left empty for spacing -->
            </div>
            <div class="field-body">
              <div id="edit-story-buttons" class="field is-grouped">
                <div class="field is-grouped">           
                  <div class="control">
                    <button type="submit" class="button is-primary">Save</button>
                  </div>
                  <div class="control">
                    <button type="button" class="button is-light button-close">Cancel</button>
                  </div>
                </div>
                <div class="control">
                  <button id="delete-button" type="button" class="button is-danger">Delete</button>
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
export function addStoryModalListener () {
  const storyModals = document.getElementsByClassName('story-modal')

  if (storyModals.length) {
    for (let i = 0, n = storyModals.length; i < n; i++) {
      storyModals[i].onclick = function () {
        const storyID = this.dataset.id

        // Edit button
        const editButton = document.getElementById('edit-button')
        if (editButton) {
          editButton.dataset.id = storyID
          addEditStoryListener() // Click listener for edit story button
        }

        // Add the image source
        const profileImgModal = document.getElementById('user-image-modal')
        profileImgModal.src = document.querySelector('#user-image img').src

        const imgChild = document.getElementById('story-image')
        imgChild.src = this.children[0].src

        // Reset comments scroll to top
        // document.querySelector('#story div.card-content').scrollTop = 0

        // AJAX load caption, comments, and like count
        loadStoryData(storyID).then(story => {
          document.getElementById('event-link').href = `/event/${story.event._id}`
          document.getElementById('event-name').textContent = story.event.name

          const caption = document.getElementById('caption')
          if (story.caption) {
            caption.textContent = story.caption
          } else {
            caption.parentElement.classList.add('is-hidden')
          }

          // Like count
          const likeCount = document.getElementById('like-count')
          likeCount.textContent = story.likes.length

          // Like button
          const likeButton = document.getElementById('like-button')
          const borderHeart = document.getElementById('border-heart')
          const redHeart = document.getElementById('red-heart')

          const isUserLiked = story.likes.some(
            user => user.username === currentUser)
          if (isUserLiked) {
            borderHeart.classList.add('is-hidden')
            redHeart.classList.remove('is-hidden')
          }

          likeButton.onclick = function () {
            likeStory(storyID).then(() => {
              borderHeart.classList.toggle('is-hidden')
              redHeart.classList.toggle('is-hidden')

              if (redHeart.classList.contains('is-hidden')) {
                likeCount.textContent = parseInt(likeCount.textContent) - 1
              } else {
                likeCount.textContent = parseInt(likeCount.textContent) + 1
              }
            }).catch(err => {
              if (err.status === 401) {
                showSnackbar('Please sign in to continue')
              } else {
                showSnackbar('Failed to like story')
              }
            })
          }

          // Story date
          const storyDate = new Date(story.date)
          const month = storyDate.toLocaleString(undefined, { month: 'short' })
          document.getElementById('story-date').textContent =
            `${storyDate.getDate()} ${month} ${storyDate.getFullYear()}`

          document.getElementById('story').classList.add('is-active')
        }).catch((err) => showSnackbar('Failed to load story'))
      }
    }
  }
}

/**
 * Add click listener to edit story button
 */
function addEditStoryListener () {
  // Edit story
  const editButton = document.getElementById('edit-button')

  editButton.onclick = async function () {
    // Do not render the modal more than once
    if (!document.getElementById('edit-story')) {
      const caption = document.getElementById('caption')
      const storyID = this.dataset.id
      this.parentElement.insertAdjacentHTML(
        'beforeend',
        renderEditStoryModal(storyID, caption.textContent)
      )

      closeModalListener()

      // Edit story form submit
      const editStoryForm = document.getElementById('edit-story-form')
      $(editStoryForm).submit(function (e) {
        e.preventDefault()

        const formJson = convertToJSON($(this).serializeArray())

        editStory(formJson).then(() => {
          showSnackbar('Story updated')
          caption.textContent = formJson.caption
          document.getElementById('edit-story').remove()
        }).catch(() => showSnackbar('Failed to edit story'))
      })

      // Delete story
      const deleteButton = document.getElementById('delete-button')

      deleteButton.onclick = function () {
        if (confirm('Delete confirmation')) {
          deleteStory(storyID).then(() => {
            deleteStoryLocal(storyID)
            showSnackbar('Story deleted')
            document.getElementById('edit-story').remove()
            document.getElementById(storyID).remove()
            document.getElementById('story').classList.remove('is-active')

            const storyCount = document.getElementById('story-count')
            storyCount.textContent = parseInt(storyCount.textContent) - 1

          }).catch(() => showSnackbar('Failed to delete story'))
        }
      }
    }
  }
}
