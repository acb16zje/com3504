/**
 * Story IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'
import { currentUser } from '../script.mjs'

export const STORY_STORE = 'story_store'
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
 * Return the HTML fragment for a story column (image card only)
 *
 * @param {object} story A story document
 * @returns {string} The HTML fragment
 */
export function renderStoryColumn (story) {
  return `<div id="${story._id}" class="column is-4">
    <figure class="image is-flex story-modal" data-id="${story._id}">
      <img src="${story.image}" alt="Story image">
    </figure>
  </div>`
}

/**
 * Return the HTM fragment for a story modal
 *
 * @param {string} username The username of the story creator
 * @returns {string} The HTML fragment of story modal
 */
export function renderStoryModal (username = undefined) {
  return `
  <div id="story" class="modal">
    <div class="modal-background"></div>
  
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <div class="card-header-title">
            <nav class="level is-mobile is-marginless">
              <div class="level-item">
                <a class="profile-link">
                  <figure class="image is-48x48">
                    <img id="user-image-modal" class="is-rounded" src="/images/default.webp" alt="User profile image">
                  </figure>
                </a>
              </div>
              <div id="profile-event-link" class="level-item">
                <a class="profile-link">
                  <p class="title is-6 story-username"></p>
                </a>
                <a id="event-link">
                  <small id="event-name" class="is-size-7"></small>
                </a>
              </div>
            </nav>
            
            ${currentUser === username ? `
              <button class="button edit-button is-light">Edit</button>
            ` : ''}
          </div>
        </header>
  
        <div class="card-image">
          <figure class="image">
            <img id="story-image" src="/images/placeholder.webp" alt="Story image">
          </figure>
        </div>
  
        <div class="card-content">
          <div class="content">
            <a class="profile-link">
              <p class="title is-6 story-username is-inline"></p>
            </a>
            <p id="caption" class="is-inline"></p>
            <hr>
          </div>
          <div id="comments" class="content">
            <p class="subtitle is-6"><strong>lorem ipsum</strong>Lorem Ipsum1</p>
            <p class="subtitle is-6"><strong>lorem ipsumngel1</strong>Lorem Ipsum2</p>
            <p class="subtitle is-6"><strong>glorem ipsumlove1</strong>Lorem Ipsum3</p>
            <p class="subtitle is-6"><strong>lorem ipsumwaii1</strong>Lorem Ipsum4</p>
            <p class="subtitle is-6"><strong>glorem ipsui</strong>Lorem Ipsum5</p>
            <p class="subtitle is-6"><strong>glorem ipsum1</strong>Lorem Ipsum6</p>
            <p class="subtitle is-6"><strong>galorem ipsumfan1</strong>Lorem Ipsum7</p>
            <p class="subtitle is-6"><strong>gi_fan1</strong>Lorem Ipsum8</p>
            <p class="subtitle is-6"><strong>gklorem ipsuman1</strong>Lorem Ipsum9</p>
            <p class="subtitle is-6"><strong>gakki_fan1</strong>Lorem Ipsum11</p>
            <p class="subtitle is-6"><strong>gakki_fan2</strong>Lorem Ipsum12</p>
            <p class="subtitle is-6"><strong>dogeshiba</strong>Lorem Ipsum13</p>
            <p class="subtitle is-6"><strong>animal</strong>Lorem Ipsum15</p>
            <p class="subtitle is-6"><strong>testueser</strong>Lorem Ipsum17</p>
            <p class="subtitle is-6"><strong>goku</strong>Lorem Ipsum16</p>
            <p class="subtitle is-6"><strong>dragon</strong>Lorem Ipsum18</p>
            <p class="subtitle is-6"><strong>unicorn</strong>Lorem Ipsum19</p>
          </div>
        </div>
  
        <footer class="story-footer card-footer">
          <div class="like-and-time is-flex">
            <div class="like is-flex">
              <a id="like-button" class="has-text-black">
                <span class="icon is-large">
                  <span id="border-heart" class="iconify" data-icon="bytesize:heart"></span>
                  <span id="red-heart" class="iconify has-text-danger is-hidden" data-icon="maki:heart-15"></span>
                </span>
              </a>
              <p class="subtitle is-6 has-text-weight-bold"><span id="like-count"></span> likes</p>
            </div>
            <small id="story-date"></small>
          </div>
          <div id="reply" class="is-flex">
            <textarea name="reply" class="textarea has-fixed-size" placeholder="Add a comment"></textarea>
            <a id="post-reply">Post</a>
          </div>
        </footer>
      </div>
    </div>
  
    <button class="modal-close is-large" aria-label="close"></button>
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
                  <textarea name="caption" class="textarea has-fixed-size" rows="3">${caption}</textarea>
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
  const fromStoryFeed = document.querySelector('#user-image img') === null

  if (storyModals.length) {
    for (let i = 0, n = storyModals.length; i < n; i++) {
      storyModals[i].onclick = function () {
        const storyID = this.dataset.id

        // Edit button
        const editButton = document.getElementsByClassName('edit-button')[0]
        if (editButton) {
          editButton.dataset.id = storyID
          addEditStoryListener() // Click listener for edit story button
        }

        // Add the image source
        const profileImgModal = document.getElementById('user-image-modal')
        profileImgModal.src =
          fromStoryFeed ?
            document.querySelector(`#user-image-${storyID} img`).src
            : document.querySelector('#user-image img').src

        const imgChild = document.getElementById('story-image')
        imgChild.src = fromStoryFeed ?
          document.getElementById(`story-image-${storyID}`).src
          : this.children[0].src

        // Reset comments scroll to top
        // document.querySelector('#story div.card-content').scrollTop = 0

        // AJAX load caption, comments, and like count
        loadStoryData(storyID).then(story => {
          if (fromStoryFeed) {
            const profileUsernames = document.getElementsByClassName('story-username')
            const profileLinks = document.getElementsByClassName('profile-link')
            for (let i = 0, n = profileLinks.length; i < n; i++) {
              profileLinks[i].href = `/${story.user.username}`
            }
            for (let i = 0, n = profileUsernames.length; i < n; i++) {
              profileUsernames[i].textContent = story.user.username
            }
          }

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
          } else {
            borderHeart.classList.remove('is-hidden')
            redHeart.classList.add('is-hidden')
          }

          likeButton.onclick = function () {
            likeStory(storyID).then(() => {
              // Toggle border / red heart
              borderHeart.classList.toggle('is-hidden')
              redHeart.classList.toggle('is-hidden')

              // Increase like count
              if (redHeart.classList.contains('is-hidden')) {
                likeCount.textContent = parseInt(likeCount.textContent) - 1
              } else {
                likeCount.textContent = parseInt(likeCount.textContent) + 1
              }

              // If liked in story feed page, change that as well
              if (document.getElementById(`story-feed-${storyID}`)) {
                const borderHeart = document.getElementById(`border-heart-${storyID}`)
                const redHeart = document.getElementById(`red-heart-${storyID}`)
                const likeCount = document.getElementById(`like-count-${storyID}`)

                borderHeart.classList.toggle('is-hidden')
                redHeart.classList.toggle('is-hidden')

                if (redHeart.classList.contains('is-hidden')) {
                  likeCount.textContent = parseInt(likeCount.textContent) - 1
                } else {
                  likeCount.textContent = parseInt(likeCount.textContent) + 1
                }
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
          document.getElementById('story-date').textContent = formatStoryDate(story.date)

          document.getElementById('story').classList.add('is-active')
        }).catch((err) => console.log(err))
      }
    }
  }
}

/**
 * Add click listener to edit story button
 */
export function addEditStoryListener () {
  // Edit story
  const editButton = document.getElementsByClassName('edit-button')

  for (let i = editButton.length; i--;) {
    editButton[i].onclick = async function () {
      // Do not render the modal more than once
      if (!document.getElementById('edit-story')) {
        const storyID = this.dataset.id
        const captionModal = document.getElementById('caption')
        const captionFeed = document.getElementById(`story-caption-${storyID}`)

        if (captionFeed) {
          this.parentElement.insertAdjacentHTML(
            'beforeend',
            renderEditStoryModal(storyID, captionFeed.textContent)
          )
        } else {
          this.parentElement.insertAdjacentHTML(
            'beforeend',
            renderEditStoryModal(storyID, captionModal.textContent)
          )
        }

        closeModalListener()

        // Edit story form submit
        const editStoryForm = document.getElementById('edit-story-form')
        $(editStoryForm).submit(function (e) {
          e.preventDefault()

          const formJson = convertToJSON($(this).serializeArray())

          editStory(formJson).then(() => {
            showSnackbar('Story updated')

            if (captionFeed) {
              captionFeed.textContent = formJson.caption
            } else {
              captionModal.textContent = formJson.caption
            }

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

              /**
               * If delete action is in story feed, then remove from story feed
               * Else remove from user profile
               */
              if (captionFeed) {
                document.getElementById(`story-feed-${storyID}`).remove()
              } else {
                document.getElementById(storyID).remove()
              }

              document.getElementById('story').classList.remove('is-active')

              const storyCount = document.getElementById('story-count')
              if (storyCount) {
                storyCount.textContent = parseInt(storyCount.textContent) - 1
              }
            }).catch(() => showSnackbar('Failed to delete story'))
          }
        }
      }
    }
  }
}

/************************ Helper functions below ************************/
/**
 * Format the story date to DD MMM YYYY
 *
 * @param {string} date The story date in string format
 * @returns {string} The story date in format DD MMM YYYY
 */
export function formatStoryDate (date) {
  const storyDate = new Date(date)
  const month = storyDate.toLocaleString(undefined, { month: 'short' })

  return `${storyDate.getDate()} ${month} ${storyDate.getFullYear()}`
}
