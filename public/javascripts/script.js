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
        console.log('SW registration successful')
      }, function (err) {
        console.log('SW registration failed: ', err)
      })
  })
}

// Localise number format
function intlFormat (num) {
  return new Intl.NumberFormat().format(Math.round(num * 10) / 10)
}

function makeFriendly (num) {
  if (num >= 1000000)
    return intlFormat(num / 1000000) + 'M'
  if (num >= 1000)
    return intlFormat(num / 1000) + 'k'
  return intlFormat(num)
}

// Dislpay placeholder image if original image failed to load
$(function () {
  $('img').each(
    function () {
      try {
        if (!this.complete || this.naturalWidth === 0) {
          this.src = '/images/placeholder.webp'
        }
      } catch (e) {}
    },
  )
})

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

$(document).on('keypress', 'form', function (event) {
  return event.key !== 'Enter'
})

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

    $(input).change(function() {
      const place = autocomplete.getPlace()
      const latitude = place.geometry.location.lat()
      const longitude  = place.geometry.location.lng()
      console.log(latitude)
      console.log(longitude)
    })

  })()
} catch (e) {}



/************************ WebRTC below ************************/
// WebRTC
// Checks for browser support
function hasGetUserMedia(){
  return !!(navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
}

$("form").submit(function(e){
  return false;
});

// Takes snapshots
const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;
const button = document.getElementById('camera-button');
const snapshot = document.getElementById('snapshot');

function takePhoto(){
  video.classList.remove('is-hidden')
  snapshot.classList.add('is-hidden')
  navigator.mediaDevices.getUserMedia({audio: false, video: true})
  .then(function(stream) {
    window.stream = stream;
    video.srcObject = stream;
    button.removeEventListener('click', takePhoto);
    button.addEventListener('click', capture);
  })
  .catch(function(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  });
}

function capture(){
  video.classList.add('is-hidden')
  snapshot.classList.remove('is-hidden')
  button.addEventListener('click', takePhoto);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  snapshot.src = canvas.toDataURL('image/png');
}

// Launch selfie camera modal
const picButtons = $(document.getElementsByClassName('pic-button'))

// Open the modal
if (picButtons.length) {
  if (hasGetUserMedia()) {
    picButtons.click(function () {
      const targetID = $(this).data('target')
      const target = $(document.getElementById(`${targetID}`))
      target.addClass('is-active')
    })
  } else {
    alert('Camera media (getUserMedia()) not supported in your browser...');
  }
}