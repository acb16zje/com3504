/**
 * Main JavaScript file
 *
 * @author Zer Jun Eng
 */

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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').
      then(function (registration) {
        console.log('SW registration successful with scope: ', registration.scope)
      }, function (err) {
        console.log('SW registration failed: ', err)
      })
  })
}

$(function() {
  $('img').each(
    function() {
      try {
        if (!this.complete || this.naturalWidth == 0) {
          this.src = '/images/placeholder.png';
        }
      } catch(e) {}
    }
  );
});

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

    // Reset comments scroll to top
    $('#story div.card-content')[0].scrollTop = 0
  })
}

// Close modal when click outside of story
if (modalCloses.length) {
  modalCloses.click(() => closeModal())

  // Close modal when Esc is pressed or click outside of story
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal()
    }
  })
}

/**
 * Close the user story modal
 */
const closeModal = () => modals.removeClass('is-active')

// Offline notification
const offlineNotification = document.getElementById('offline')

if (!navigator.onLine) {
  offlineNotification.style.display = 'block'
}

window.addEventListener('online', () => {
  offlineNotification.style.display = 'none'
})

window.addEventListener('offline', () => {
  offlineNotification.style.display = 'block'
})

$(document).on("keypress", "form", function(event) { 
  return event.keyCode != 13;
});

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
    minTime: Date.now(),
  })
}

// Google Maps JavaScript API
try {
  (function () {
    const input = document.getElementById('autocomplete')

    const autocomplete = new google.maps.places.Autocomplete(input)

    autocomplete.on('place_changed', function() {
      const place = autocomplete.getPlace()
    });
  }) ()
} catch (e) {}




