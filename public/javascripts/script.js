'use strict'
// Iconify performance improvement
Iconify.preloadImages([
  'ant-design:home',
  'ant-design:home-outline',
  'fa-solid:search',
  'ion:ios-search',
  'entypo:squared-plus',
  'fa-regular:plus-square',
  'zmdi:notifications',
  'zmdi:notifications-none',
  'fa-solid:user',
  'fa-regular:user',
])
Iconify.setConfig('localStorage', true)

// JavaScript-based media queries-like, native code is faster
const userPage = document.getElementById('user')
const explorePage = document.getElementById('explore')

$(window).on('load resize', () => {
  if (explorePage) {
    changeEventsColumnsCSS()
  }

  if (userPage) {
    changeUserProfileCSS()
    changeUserStoryModalCSS()
  }
})

/**
 * Change the CSS class of events columns based on viewport width
 */
function changeEventsColumnsCSS () {
  const DESKTOP_WIDTH = 1024
  const TABLET_WIDTH = 768

  const children = $(document.getElementsByClassName('event-columns')).children()

  if (window.matchMedia(`(min-width: ${DESKTOP_WIDTH}px`).matches) {
    if (!children.hasClass('column is-3')) {
      children.removeClass().addClass('column is-3')
    }
  } else if (window.matchMedia(`(min-width: ${TABLET_WIDTH}px`).matches) {
    if (!children.hasClass('column is-4')) {
      children.removeClass().addClass('column is-4')
    }
  } else {
    if (children.hasClass('column is-3') || children.hasClass('column is-4')) {
      children.removeClass().addClass('column')
    }
  }
}

/**
 * Change the CSS class of user profile page based on viewport width
 */
function changeUserProfileCSS () {
  // The width just enough for user stats to fit above follow button
  const STATS_WIDTH = 650

  // The width just enough for user descriptions to fit below follow button
  const DESC_WIDTH = 500

  const userNameFollow = $(document.getElementById('user-name-follow'))
  const userName = $(document.getElementById('user-name'))
  const userFollow = $(document.getElementById('user-follow'))
  const userDescription = $(document.getElementById('user-description'))
  const userStats = $(document.getElementById('user-stats'))
  const children = userStats.children()
  const userStories = $(document.getElementById('user-stories'))
  const userFollowers = $(document.getElementById('user-followers'))
  const userFollowing = $(document.getElementById('user-following'))

  // User stats DOM manipulation
  if (window.matchMedia(`(min-width: ${STATS_WIDTH}px`).matches) {
    // User stats CSS change and DOM manipulation
    if (!userStats.hasClass('level is-mobile')) {
      userStats.removeClass().addClass('level is-mobile')
      userStats.insertAfter('#user-name')

      if (!children.hasClass('level-item is-block')) {
        children.removeClass().addClass('level-item is-block')

        if (!userStories.hasClass('subtitle')) {
          userStories.removeClass('title').addClass('subtitle')
          userStories.siblings().remove()
          userStories.html(`<strong>${userStories.text()}</strong> stories`)
        }

        if (!userFollowers.hasClass('subtitle')) {
          userFollowers.removeClass('title').addClass('subtitle')
          userFollowers.siblings().remove()
          userFollowers.html(
            `<strong>${userFollowers.text()}</strong> followers`)
        }

        if (!userFollowing.hasClass('subtitle')) {
          userFollowing.removeClass('title').addClass('subtitle')
          userFollowing.siblings().remove()
          userFollowing.html(
            `<strong>${userFollowing.text()}</strong> following`)
        }
      }

      // Follow button / edit profile button manipulation
      userNameFollow.prepend(
        '<div class="columns is-vcentered is-mobile">' +
        '<div class="column is-narrow"></div>' +
        '<div class="column is-narrow"></div>' +
        '</div>',
      )

      // .columns.is-vcentered.is-mobile has two .column children
      const userNameColumn = userNameFollow.
        children('.columns.is-vcentered.is-mobile').children(':first')

      const userFollowColumn = userNameColumn.next()

      userNameColumn.append(userName)
      userFollowColumn.append(userFollow)

      if (userFollow.hasClass('is-fullwidth')) {
        userFollow.removeClass('is-fullwidth')
      }
    }
  } else {
    // Follow button / edit profile button manipulation
    if (!userName.parent().is(userNameFollow) &&
      !userFollow.parent().is(userNameFollow)) {
      userNameFollow.prepend(userFollow).prepend(userName)
      userNameFollow.children('.columns.is-vcentered.is-mobile').remove()
    }

    if (!userFollow.hasClass('is-fullwidth')) {
      userFollow.addClass('is-fullwidth')
    }

    // User stats CSS change and DOM manipulation
    if (!userStats.hasClass('card-footer')) {
      userStats.removeClass().addClass('card-footer')
      userStats.insertAfter('#user-profile-content')

      if (!children.hasClass('card-footer-item has-text-centered')) {
        children.removeClass().addClass('card-footer-item has-text-centered')

        if (!userStories.hasClass('title')) {
          userStories.removeClass('subtitle').addClass('title')
          $('<p class="subtitle is-6">stories</p>').insertAfter(userStories)
          userStories.html(userStories.children('strong').text())
        }

        if (!userFollowers.hasClass('title')) {
          userFollowers.removeClass('subtitle').addClass('title')
          $('<p class="subtitle is-6">followers</p>').
            insertAfter(userFollowers)
          userFollowers.html(userFollowers.children('strong').text())
        }

        if (!userFollowing.hasClass('title')) {
          userFollowing.removeClass('subtitle').addClass('title')
          $('<p class="subtitle is-6">following</p>').
            insertAfter(userFollowing)
          userFollowing.html(userFollowing.children('strong').text())
        }
      }
    }
  }

  // User description DOM manipulation
  if (window.matchMedia(`(min-width: ${DESC_WIDTH}px`).matches) {
    if (!userDescription.parent().is(userNameFollow)) {
      userNameFollow.append(userDescription)
    }

    // Remove padding if the stats is displayed above description
    if (window.matchMedia(`(min-width: ${STATS_WIDTH}px)`).matches &&
      !userDescription.hasClass('is-paddingless')) {
      userDescription.addClass('is-paddingless')
    } else if (window.matchMedia(
      `(min-width: ${DESC_WIDTH}px) and (max-width: ${STATS_WIDTH}px)`).matches) {
      userDescription.removeClass('is-paddingless')
    }
  } else {
    if (userDescription.parent().is(userNameFollow)) {
      userDescription.insertAfter('#user-profile-content')
    }

    if (userDescription.hasClass('is-paddingless')) {
      userDescription.removeClass('is-paddingless')
    }
  }
}

// Launch and close the user story modal
const modals = $(document.getElementsByClassName('modal'))
const modalButtons = $(document.getElementsByClassName('modal-button'))
const modalCloses = $('.modal-close, .modal-background')

// Open the modal
if (modalButtons.length) {
  modalButtons.click(function () {
    const targetID = $(this).data('target')
    const target = $(`#${targetID}`)
    target.addClass('is-active')

    // Add the image source
    const profileImgSrc = $('#user-image img').attr('src')
    const imgSrc = $(this).children(':first').attr('src')

    const imgChild = $(document.getElementById(`${targetID}-image`))
    imgChild.attr('src', imgSrc)

    const profileImgModal = $(document.getElementById('user-image-modal'))
    profileImgModal.attr('src', profileImgSrc)

    changeUserStoryModalCSS()
  })
}

// Close modal when click outside of story
if (modalCloses.length) {
  modalCloses.click(() => closeModal())
}

// Close modal when Esc is pressed or click outside of story
$(document).keydown(e => {
  if (e.key === 'Escape') {
    closeModal()
  }
})

/**
 * Close the user story modal
 */
const closeModal = () => modals.removeClass('is-active')

/**
 * Change the CSS class of user story modal based on viewport width
 */
function changeUserStoryModalCSS () {
  const TABLET_WIDTH = 768
  const storyModal = $(document.getElementById('story'))

  // User story modal DOM manipulation
  if (storyModal.hasClass('is-active')) {
    const firstColumn = storyModal.find('div.column:first')
    const firstCardContent = $(document.getElementById('first-card-content'))

    if (window.matchMedia(`(min-width: ${TABLET_WIDTH}px)`).matches) {
      if (!firstColumn.children(':first').is('div.card-image')) {
        const cardImg = firstCardContent.children().children(':first')

        firstColumn.append(cardImg)
      }

    } else {
      if (firstColumn.children(':first').is('div.card-image')) {
        const cardImg = firstColumn.children(':first')

        firstCardContent.children(':first').prepend(cardImg)
      }
    }
  }
}

/************************ Plugins below ************************/
// Datepicker settings
$('#startDate').flatpickr({
  altInput: true,
  altFormat: 'j F Y, h:i K',
  enableTime: true,
  time_24hr: true,
  defaultDate: Date.now(),
  minDate: 'today',
  minTime: Date.now()
})

// Initialize an empty map without layers (invisible map)
// var map = L.map('map', {
//   center: [40.7259, -73.9805], // Map loads with this location as center
//   zoom: 12,
//   scrollWheelZoom: true,
//   zoomControl: false,
//   attributionControl: false,
// });
//
// //Geocoder options
// var geocoderControlOptions = {
//   bounds: false,          //To not send viewbox
//   markers: false,         //To not add markers when we geocoder
//   attribution: null,      //No need of attribution since we are not using maps
//   expanded: true,         //The geocoder search box will be initialized in expanded mode
//   panToPoint: false       //Since no maps, no need to pan the map to the geocoded-selected location
// }
//
// //Initialize the geocoder
// var geocoderControl = new L.control.geocoder('pk.87f2d9fcb4fdd8da1d647b46a997c727', geocoderControlOptions).addTo(map).on('select', function (e) {
//   displayLatLon(e.feature.feature.display_name, e.latlng.lat, e.latlng.lng);
// });
//
// //Get the "search-box" div
// var searchBoxControl = document.getElementById("search-box");
// //Get the geocoder container from the leaflet map
// var geocoderContainer = geocoderControl.getContainer();
// //Append the geocoder container to the "search-box" div
// searchBoxControl.appendChild(geocoderContainer);
//
// //Displays the geocoding response in the "result" div
// function displayLatLon(display_name, lat, lng) {
//   var resultString = "You have selected " + display_name + "<br/>Lat: " + lat + "<br/>Lon: " + lng;
//   document.getElementById("result").innerHTML = resultString;
// }
