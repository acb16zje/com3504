/**
 * User IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { dbPromise, unableToLoadPage } from './database.mjs'
import { renderEventCard, storeExplorePage, addClickListener } from './event.mjs'
import { getGenres } from './genre.mjs'

const USER_STORE = 'user_store'
const userSection = document.getElementById('user')
const editProfileForm = document.getElementById('edit-profile-form')

// Path will always be /:username/
const path = window.location.pathname.split('/')
const username = path[1]
const tab = path[2] // The user tab to display (events, going, interested, went)

// Loading, storing, and displaying user profile (Promise based)
if (userSection) {
  $(userSection).ready(() => {
    loadUserProfile(username).then(doc => {
      console.log(`Loaded ${username} from server`)

      storeUserProfile(doc).then(() => {
        console.log(`Stored ${username}`)

        Promise.resolve(displayUserProfile(doc)).then(() => {
          storeExplorePage(doc.events.concat(doc.interested, doc.going)).
            then(() => console.log(`Pre-stored ${username}'s events`)).
            catch(() => console.log('Failed to pre-store events'))
        })
      }).catch(() => console.log(`Failed to store ${username}`))
    }).catch(() => {
      console.log(`Failed to load ${username} from server, loading from local`)

      loadUserProfileLocal(username).
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
      keyPath: 'email',
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
 * @param {string} username The username in the URL
 * @return {Promise<void>} The Promise
 */
async function loadUserProfileLocal (username) {
  if (dbPromise) {
    dbPromise.then(async db => {
      return await db.getFromIndex(USER_STORE, 'username', username)
    }).then(doc => {
      if (doc) {
        return Promise.resolve(displayUserProfile(doc))
      } else {
        unableToLoadPage(userSection)
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
 * @param {object} doc The user document retrieved
 */
function displayUserProfile (doc) {
  console.log(doc)
  document.title = `${doc.fullname} (${username}) - Musicbee`

  // User data
  document.getElementById('user-name').textContent = username
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
    $(editProfileForm).submit(function (e) {
      e.preventDefault()

      const formJson = convertToJSON($(this).serializeArray())
      editProfileSubmit(formJson).then(() => {
        updateUserProfile(doc.username, formJson)

      }).catch(err => {
        if (err.responseJSON) {
          // Model unique validation error
          err = err.responseJSON

          const text =
            err.name === 'MongoError' && err.code === 11000
              ? 'Username already exist'
              : 'Error occurred, failed to save changes'

          showSnackbar(text)
        } else {
          showSnackbar('Error occurred, failed to save changes')
        }
      })
    })
  }

  // User links
  document.getElementById('stories-link').href = `/${username}`
  document.getElementById('events-link').href = `/${username}/events`
  document.getElementById('going-link').href = `/${username}/going`
  document.getElementById(
    'interested-link').href = `/${username}/interested`
  document.getElementById('went-link').href = `/${username}/went`

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
      break // undefined for /:username/stories
  }

  // Only show the content when the user details are loaded
  userSection.classList.remove('is-hidden')
}

/**
 * Submit edit profile
 *
 * @param {object} formJson THe form data submitted in JSON format
 * @returns {Promise<any>} The Promise
 */
function editProfileSubmit (formJson) {
  return Promise.resolve($.ajax({
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(formJson),
    url: '/api/user/edit',
  }))
}

/**
 * Update the IndexedDB and HTML content immediately after submit
 *
 * @param {string} username The username to update
 * @param {string} formJson formJson THe form data submitted in JSON format
 */
function updateUserProfile (username, formJson) {
  // Update IndexedDB
  if (dbPromise) {
    dbPromise.then(async db => {
      const user = await db.getFromIndex(USER_STORE, 'username', username)

      const tx = db.transaction(USER_STORE, 'readwrite')
      user.username = formJson.username
      user.fullname = formJson.fullname
      user.description = formJson.description
      user.genres = formJson.genres

      await tx.store.put(user)
      await tx.done
    }).then(() => {
      console.log(`Updated ${username} IndexedDB`)
    }).catch(err => console.log(err))
  }

  document.getElementById('user-name').textContent = formJson.username
  document.getElementById('fullname').textContent = formJson.fullname
  document.getElementById('description').textContent = formJson.description

  const genre = $(document.getElementById('genre'))

  if (formJson.genres) {
    genre.find('span').remove()

    for (let i = 0, n = formJson.genres.length; i < n; i++) {
      genre.append(`<span class="tag">${formJson.genres[i]}</span>`)
    }
    genre.removeClass('is-hidden')
  } else {
    genre.addClass('is-hidden')
  }

  // Update the input value
  const usernameInput = document.getElementsByName('username')[0]
  const fullnameInput = document.getElementsByName('fullname')[0]
  const descriptionInput = document.getElementsByName('description')[0]
  usernameInput.setAttribute('value', formJson.username)
  fullnameInput.setAttribute('value', formJson.fullname)
  descriptionInput.innerText = formJson.description

  // Change My Account href
  document.getElementById('my-account').href = `/${formJson.username}`
  document.getElementById('navbar-user').href = `/${formJson.username}`

  // Show a notification and close the modal
  showSnackbar('Changes saved')
  document.getElementById('edit-profile').classList.remove('is-active')
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

  // Set default values of input
  usernameInput.setAttribute('value', doc.username)
  fullnameInput.setAttribute('value', doc.fullname)
  descriptionInput.innerText = doc.description

  getGenres().then(genres => {
    return new Choices(genresInput, {
      duplicateItemsAllowed: false,
      maxItemCount: 5,
      removeItemButton: true,
      choices: genres.map(genre => ({
        value: genre.name,
        option: genre.name,
        selected: doc.genres.includes(genre.name),
      })),
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
    // renderEventCard from event.mjs
    eventColumns.innerHTML += renderEventCard(events[i])
  }

  // Click listener for interested buttons
  addClickListener()
}
