/**
 * Home story / event feed
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'
import { currentUser } from '../script.mjs'
import { USER_STORE } from './user.mjs'
import {
  addEditStoryListener,
  addStoryModalListener,
  formatStoryDate,
  likeStory,
  renderStoryModal,
  storeStories,
  STORY_STORE,
} from './story.mjs'
import {
  addEditEventListener,
  addInterestedGoingListener,
  EVENT_STORE,
  isPastEvent,
  renderEventCard,
  storeExplorePage,
} from './event.mjs'

const storyFeedDiv = document.getElementById('story-feed')
export const eventFeedDiv = document.getElementById('event-feed')

if (storyFeedDiv) {
  (async function () {
    await loadStoryFeed().then(feed => {
      if (feed && feed.length) {
        console.log('Loaded story feed from server ')

        storeStories(feed).
          then(() => console.log('Stored story feed')).
          catch(() => console.log('Failed to store story feed'))

        for (let i = 0, n = feed.length; i < n; i++) {
          storyFeedDiv.insertAdjacentHTML('beforeend', renderStoryFeed(feed[i]))
          addStoryFeedLikeListener(
            document.getElementById(`like-button-${feed[i]._id}`))
        }
      } else {
        noStoryFeed(storyFeedDiv)
      }
    }).catch(async () => {
      console.log('Failed to load story feed from server, loading from local')

      await loadStoryFeedLocal().then(feed => {
        console.log('Loaded story feed from local')

        if (feed && feed.length) {
          const stories = feed.sort(function (a, b) {
            // Newest date first
            return new Date(b.date) - new Date(a.date)
          })

          for (let i = 0, n = stories.length; i < n; i++) {
            storyFeedDiv.insertAdjacentHTML('beforeend',
              renderStoryFeed(stories[i]))
          }
        } else {
          noStoryFeed(storyFeedDiv)
        }
      }).catch(() => {
        console.log('Failed to load story feed from local')
        storyFeedDiv.insertAdjacentHTML('beforeend', `
        <p class="title has-text-centered">Failed to load story feed</p>
        `)
      })
    })

    storyFeedDiv.insertAdjacentHTML('beforeend', renderStoryModal())
    addStoryModalListener()
    addEditStoryListener()
    closeModalListener()
  })()
}

if (eventFeedDiv) {
  (async function () {
    await loadEventFeed().then(feed => {
      console.log('Loaded event feed from server ')

      storeExplorePage(feed).
        then(() => console.log('Stored event feed')).
        catch(() => console.log('Failed to store event feed'))

      displayEventFeed(feed)
    }).catch(() => {
      console.log('Failed to load event feed from server, loading from local')

      loadEventFeedLocal().then(feed => {
        console.log('Loaded event feed from local')
        displayEventFeed(feed)
      }).catch(() => {
        console.log('Failed to load event feed from local')
        eventFeedDiv.insertAdjacentHTML('beforeend', `
        <p class="title has-text-centered">Failed to load event feed</p>
        `)
      })
    })
  })()
}

/************************ IndexedDB / AJAX related ************************/
/**
   * Load all story feed related to the logged in user from MongoDB
 *
 * @returns {Promise<any>} The Promise
 */
function loadStoryFeed () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/api/story_feed',
  }))
}

/**
 * Load all story feed related to the logged in user from IndexedDB
 *
 * @returns {Promise<void>} The Promise
 */
function loadStoryFeedLocal () {
  if (dbPromise) {
    return dbPromise.then(async db => {
      const loggedInUser = await db.getFromIndex(USER_STORE, 'username',
        currentUser)
      const stories = await db.getAll(STORY_STORE)

      if (stories && stories.length) {
        for (let i = stories.length; i--;) {
          const user = await db.getFromIndex(USER_STORE, 'username',
            stories[i].user.username)

          stories[i].userImage = user.image
        }

        // Only return the stories that the user followed
        return stories.filter(story =>
          story.user.username === currentUser ||
          loggedInUser.following.includes(story.user.username))
      } else {
        return []
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Load all event feed related to the logged in user
 *
 * @returns {Promise<any>} The Promise
 */
function loadEventFeed () {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/api/event_feed',
  }))
}

/**
 * Load all event feed related to the logged in user from IndexedDB
 *
 * @returns {Promise<void>} The Promise
 */
function loadEventFeedLocal () {
  if (dbPromise) {
    return dbPromise.then(async db => {
      const loggedInUser = await db.getFromIndex(USER_STORE, 'username',
        currentUser)
      const events = await db.getAll(EVENT_STORE)

      if (events && events.length) {
        return events.filter(event => event.organiser === currentUser ||
          loggedInUser.following.includes(event.organiser))
      } else {
        return []
      }
    }).catch(err => console.log(err))
  }
}

/************************ Rendering related ************************/
/**
 * Given an array of event feed, display them
 *
 * @param {Array} feed An array of event feed
 */
function displayEventFeed (feed) {
  const upcomingDiv = document.getElementById('upcoming')
  const pastDiv = document.getElementById('past')

  if (feed && feed.length) {
    for (let i = 0, n = feed.length; i < n; i++) {
      if (isPastEvent(feed[i])) {
        pastDiv.insertAdjacentHTML('afterbegin',
          renderEventCard(feed[i]))
      } else {
        upcomingDiv.insertAdjacentHTML('beforeend',
          renderEventCard(feed[i]))
      }
    }
  } else {
    noEventFeed(eventFeedDiv)
  }

  addInterestedGoingListener()
  addEditEventListener()

  if (pastDiv.children.length < 1) {
    document.getElementById('past-text').classList.add('is-hidden')
  }

  eventFeedDiv.classList.remove('is-hidden')
}

/**
 * Return the HTML fragment for a story feed card
 *
 * @param {Object} story The story document
 * @returns {string} The HTML for a story feed card
 */
export function renderStoryFeed (story) {
  const storyID = story._id
  const username = story.user.username || story.user
  const userImage = story.user.image || story.userImage
  const isUserLiked = story.likes.some(user => user.username === currentUser)

  return `
  <div id="story-feed-${storyID}" class="column is-half story-feed">
    <div class="card">
      <header class="card-header">
        <div class="card-header-title">
          <nav class="level is-mobile is-marginless">
            <div class="level-item">
              <a href="/${username}"> 
                <figure id="user-image-${storyID}" class="image is-48x48">
                  <img class="is-rounded" src="${userImage}" alt="User profile image">
                </figure>
              </a>
            </div>
            <div class="level-item profile-event-link">
              <a href="/${username}">
                <p class="title is-6 story-username">${username}</p>
              </a>
              <a href="/event/${story.event._id}">
                <small class="is-size-7">${story.event.name}</small>
              </a>
            </div>
          </nav>
          
          ${currentUser === username && username ? `
            <button class="button edit-button is-light" data-id="${storyID}">Edit</button>
          ` : ''}
        </div>
      </header>

      <div class="card-image">
        <figure class="image is-4by3 story-modal" data-id="${storyID}">
          <img id="story-image-${storyID}" src="${story.image}" alt="Story image">
        </figure>
      </div>
      
      ${story.caption ? `
        <div class="card-content">
          <div class="content">
            <a href="/${username}">
              <p class="title is-6 story-username is-inline">${username}</p>
            </a>
            <p ${currentUser ===
  username ? `id="story-caption-${storyID}"` : ''} class="is-inline">${story.caption}</p>
          </div>
        </div>
      ` : ''}
      
      <footer class="story-footer card-footer">
        <div class="like-and-time is-flex">
          <div class="like is-flex">
            <a id="like-button-${storyID}" class="has-text-black" data-id="${storyID}">
              <span class="icon is-large">
                <span id="border-heart-${storyID}" class="iconify ${isUserLiked ? 'is-hidden' : ''}" data-icon="bytesize:heart"></span>
                <span id="red-heart-${storyID}" class="iconify has-text-danger ${isUserLiked ? '' : 'is-hidden'}" data-icon="maki:heart-15"></span>
              </span>
            </a>
            <p class="subtitle is-6 has-text-weight-bold"><span id="like-count-${storyID}">${story.likes.length}</span> likes</p>
          </div>
          <small>${formatStoryDate(story.date)}</small>
        </div>
      </footer>      
    </div>
  </div>`
}

/************************ EventListener below ************************/
/**
 * Add click listener to
 *
 * @param {Element} likeButton The HTML element of like button
 */
export function addStoryFeedLikeListener (likeButton) {
  if (likeButton) {
    likeButton.onclick = function () {
      const storyID = this.dataset.id

      likeStory(storyID).then(() => {
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
      }).catch(err => {
        if (err.status === 401) {
          showSnackbar('Please sign in to continue')
        } else {
          showSnackbar('Failed to like story')
        }
      })
    }
  }
}

/************************ Helper Functions below ************************/
/**
 * Display no story feed
 *
 * @param {Element} section A DOM element object
 */
function noStoryFeed (section) {
  section.insertAdjacentHTML('beforeend', `
    <p class="title has-text-centered">No stories to display</p>
    <p class="subtitle has-text-centered">
        Follow some users, or post some stories
    </p>
  `)
}

/**
 * Display no event feed
 *
 * @param {Element} section A DOM element object
 */
function noEventFeed (section) {
  section.insertAdjacentHTML('beforeend', `
    <p class="title has-text-centered">No events to display</p>
    <p class="subtitle has-text-centered">
        Follow some users, or create some events
    </p>
  `)

  document.getElementById('past-text').classList.add('is-hidden')
}
