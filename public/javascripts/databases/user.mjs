/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise } from './database.mjs'
import { renderEventCard, storeExplorePage } from './event.mjs'
import { getGenres } from './genre.mjs'

const USER_STORE = 'user_store'
const userSection = document.getElementById('user')
const editProfileForm = document.getElementById('edit-profile-form')

// Loading, storing, and displaying user profile (Promise based)
if (userSection) {
  $(userSection).ready(() => {
    // Path will always be /:username/
    const path = window.location.pathname.split('/')
    const username = path[1]
    const tab = path[2] // undefined for /:username (stories)

    loadUserProfile(username).then(doc => {
      console.log(`Loaded ${username} from server`)

      storeUserProfile(doc).then(() => {
        console.log(`Stored ${username}`)

        Promise.resolve(displayUserProfile(tab, doc)).then(() => {
          storeExplorePage(doc.events.concat(doc.interested, doc.going)).
            then(() => console.log(`Pre-stored ${username}'s events`)).
            catch(() => console.log('Failed to pre-store events'))
        })
      }).catch(() => console.log(`Failed to store ${username}`))
    }).catch(() => {
      console.log(`Failed to load ${username} from server, loading from local`)

      loadUserProfileLocal(tab, username).
        then(() => console.log(`Loaded ${username} from local`)).
        catch(() => console.log(`Failed to load ${username} from local`))
    })
  })
}

/************************ Functions below ************************/
/**
 * Initialise the user IndexedDB
 *
 * @param {object} db The DB object
 * @returns {Promise<void>} The Promise
 */
export function initUserDatabase (db) {
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

/**
 * Load the user profile data from MongoDB
 *
 * @param {string} username The username in the URL
 * @returns {Promise<any>} The Promise
 */
function loadUserProfile (username) {
  return Promise.resolve($.ajax({
    method: 'GET',
    dataType: 'json',
    url: `/api/user/${username}`,
  }))
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
        return Promise.resolve(displayUserProfile(tab, doc))
      } else {
        userSection.innerHTML = '<p class=\'title has-text-centered\'>' +
          'Unable to load page</p>'
        userSection.classList.remove('is-hidden')
      }
    }).catch(err => console.log(err))
  }
}

/**
 * Store the user profile data into IndexedDB
 *
 * @param {object} doc The user document retrieved
 * @return {Promise<void>} The Promise
 */
async function storeUserProfile (doc) {
  if (dbPromise) {
    dbPromise.then(async db => {
      const tx = db.transaction(USER_STORE, 'readwrite')
      doc.genres = doc.genres.map(genre => {return genre.name})
      doc.followers = doc.followers.map(follower => {return follower.username})
      doc.following = doc.following.map(
        following => {return following.username})
      await tx.store.put(doc)
      await tx.done
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
    for (let i = 0, n = doc.genres.length; i < n; i++) {
      genre.append(`<span class="tag">${doc.genres[i]}</span>`)
    }
  } else {
    genre.addClass('is-hidden')
  }

  // Edit profile modal
  if (editProfileForm) {
    renderEditProfileModal(doc)
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
      renderEventColumns(doc.events)
      break
    case 'interested':
      renderEventColumns(doc.interested)
      break
    case 'going':
      renderEventColumns(doc.going)
      break
    case 'went':
      renderEventColumns(doc.going)
      break
    default:
      // Stories tab, tab is undefined
      break
  }

  // Only show the content when the user details are loaded
  userSection.classList.remove('is-hidden')
}

/**
 * Render the edit profile modal, with the user's values set
 *
 * @param {object} doc The user document retrieved
 */
function renderEditProfileModal (doc) {
  const usernameInput = document.getElementsByName('username')[0]
  const fullnameInput = document.getElementsByName('fullname')[0]
  const descriptionInput = document.getElementsByName('description')[0]
  const genresInput = document.getElementsByName('genres')[0]

  usernameInput.setAttribute('value', doc.username)
  fullnameInput.setAttribute('value', doc.fullname)
  descriptionInput.innerText = doc.description

  getGenres().then(genres => {
    new Choices(genresInput, {
      duplicateItemsAllowed: false,
      maxItemCount: 5,
      removeItemButton: true,
      choices: genres.map(genre => ({
        value: genre.name,
        option: genre.name,
        selected : doc.genres.includes(genre.name),
      })),
    })
  })

  // Edit profile form submitted
  $(editProfileForm).submit(function (e) {
    e.preventDefault()
    const formJson = convertToJSON($(this).serializeArray())

    Promise.resolve($.ajax({
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(formJson),
      url: '/api/user/edit',
    })).then(() => {
      // Update the user profile page without refresh
      document.getElementById('edit-profile').classList.remove('is-active')
      document.getElementById('user-name').textContent = formJson.username
      document.getElementById('fullname').textContent = formJson.fullname
      document.getElementById('description').textContent = formJson.description

      const genre = $(document.getElementById('genre')).empty()

      for (let i = 0, n = genresInput.options.length; i < n; i++) {
        genre.append(`<span class="tag">${genresInput.options[i].text}</span>`)
      }

      showSnackbar('Changes saved')
    }).catch(err => {
      err = err.responseJSON

      // Username unique error
      const text = err.name === 'MongoError' && err.code === 11000 ?
        'Username already exist' : 'Error occurred, failed to save changes'

      showSnackbar(text)
    })
  })
}

/**
 * Render and append the event card to the event columns
 *
 * @param {object} events An array of event documents
 */
function renderEventColumns (events) {
  const eventColumns = document.getElementsByClassName('event-columns')[0]

  for (let i = 0, n = events.length; i < n; i++) {
    eventColumns.innerHTML += renderEventCard(events[i])
  }
}
