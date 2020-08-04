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

// Service worker configuration
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
//       console.log('ServiceWorker registration successful with scope: ', registration.scope);
//     }, function(err) {
//       console.log('ServiceWorker registration failed: ', err);
//     });
//   });
// }

// JavaScript-based media queries-like, native code is faster
const userPage = document.getElementById('user')

if (userPage) {
  $(window).on('load resize', () => {
      changeUserStoryModalCSS()
  })
}

// Launch and close the user story modal
const modals = $(document.getElementsByClassName('modal'))
const modalButtons = $(document.getElementsByClassName('modal-button'))
const modalCloses = $('.modal-close, .modal-background')

// Open the modal
if (modalButtons.length) {
  modalButtons.click(function () {
    const targetID = $(this).data('target')
    const target = $(document.getElementById(`${targetID}`))
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
    firstCardContent.scrollTop = 0

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
const startDate = document.getElementById('startDate')

if (startDate) {
  $(startDate).flatpickr({
    altInput: true,
    altFormat: 'j F Y, h:i K',
    enableTime: true,
    time_24hr: true,
    defaultDate: Date.now(),
    minDate: 'today',
    minTime: Date.now()
  })
}


// Google Maps JavaScript API
try {
  initAutocomplete()
} catch (e) {}

function initAutocomplete() {
  const input = document.getElementById('autocomplete')

  const autocomplete = new google.maps.places.Autocomplete(input)

  autocomplete.addListener('place_changed', function() {
    const place = autocomplete.getPlace()
  });
}
