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
  'ic:sharp-star',
  'ic:sharp-star-border',
  'ic:round-check',
  'ic:round-access-time',
  'ic:round-location-on',
  'dashicons:tag',
  'flat-color-icons:google',
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

/**
 * Convert the number to Intl number format
 *
 * @param {number} num The number
 * @return {*} The Intl number format
 */
function intlFormat (num) {
  return new Intl.NumberFormat().format(Math.round(num * 10) / 10)
}

/**
 * Convert large number to human-friendly format (1,000,000 to 1M etc.)
 *
 * @param {number} num The number
 * @return {*} The friendly format of the number
 */
function makeFriendly (num) {
  if (num >= 1000000)
    return intlFormat(num / 1000000) + 'M'
  if (num >= 1000)
    return intlFormat(num / 1000) + 'k'
  return intlFormat(num)
}

/**
 * Dislpay placeholder image if original image failed to load
 */
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

/************************ Form below ************************/
$(document).on('keypress', 'form', function (event) {
  if (document.activeElement.tagName !== 'TEXTAREA') {
    return event.key !== 'Enter'
  }
})

// Text area auto expane
autosize(document.getElementsByClassName('autosize'))

// File upload
const fileInput = document.getElementById('file-input')
if (fileInput) {
  fileInput.onchange = function () {
    if (this.files.length > 0) {
      const file = this.files[0]
      document.getElementById('file-name').textContent = file.name

      getBase64(file).then(data => {
        document.getElementsByName('image')[0].
          setAttribute('value', data)
      })
    }
  }
}


/**
 * Convert the image file to base64 format
 *
 * @param {object} file The image file
 * @returns {Promise<any>} Base64 of the image if resolved
 */
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Convert serialized array to JSON
 *
 * @param {array} formArray
 * @return {string} The stringified JSON
 */
function convertToJSON (formArray) {
  const formJson = {}

  for (let i = 0, n = formArray.length; i < n; i++) {
    const key = formArray[i].name
    const value = formArray[i].value

    // Combine same name into array
    if (formJson.hasOwnProperty(key)) {
      if (!Array.isArray(formJson[key])) {
        formJson[key] = [formJson[key]]
      }

      formJson[key].push(value)
    } else {
      formJson[key] = value
    }
  }

  return formJson
}

/************************ Dropdowns below ************************/
const dropdowns = document.getElementsByClassName('dropdown')

if (dropdowns.length > 0) {
  const dropDownsArray = Array.from(dropdowns)

  for (let i = 0, n = dropDownsArray.length; i < n; i++) {
    dropDownsArray[i].addEventListener('click', (e) => {
      e.stopPropagation()
      dropDownsArray[i].classList.toggle('is-active')
    })
  }

  document.addEventListener('click', () => {
    for (let i = 0, n = dropDownsArray.length; i < n; i++) {
      dropDownsArray[i].classList.remove('is-active')
    }
  })
}

/************************ Modals below ************************/
// Launch and close the user story modal
const modals = $(document.getElementsByClassName('modal'))
const modalButtons = $(document.getElementsByClassName('modal-button'))
const modalCloses = $('.modal-close, .modal-background, .button-close')

// Open the modal
if (modalButtons.length) {
  modalButtons.click(function () {
    const targetID = this.dataset.target
    document.getElementById(`${targetID}`).classList.add('is-active')

    // Story modal
    if (targetID === 'story') {
      // Add the image source
      const profileImgSrc = $('#user-image img').attr('src')
      const imgSrc = $(this).children(':first').attr('src')

      const imgChild = $(document.getElementById(`${targetID}-image`))
      imgChild.attr('src', imgSrc)

      const profileImgModal = $(document.getElementById('user-image-modal'))
      profileImgModal.attr('src', profileImgSrc)

      // Reset comments scroll to top
      $('#story div.card-content')[0].scrollTop = 0
    }
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
const closeModal = () => {
  modals.removeClass('is-active')
}

/************************ Offline notification below ************************/
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

/************************ Plugins below ************************/
// Datepicker settings
const startDate = document.getElementById('startDate')
const endDate = document.getElementById('endDate')

if (startDate && endDate) {
  const today = new Date()

  const options = {
    altInput: true,
    altFormat: 'j F Y, h:i K',
    enableTime: true,
    time_24hr: true,
    defaultDate: today,
    minDate: 'today',
    minTime: today,
  }

  const fp = $(startDate).flatpickr(options)
  const fpEnd = $(endDate).flatpickr(options)


  $('#add-end-time a').click(function () {
    const endTimeField = document.getElementById('end-time-field')

    if (endTimeField.classList.contains('is-hidden')) {
      this.textContent = '– End Date'
      fpEnd.setDate(today.setHours(today.getHours() + 3))
    } else {
      this.textContent = '+ End Date'
      fpEnd.setDate(undefined)
    }

    endTimeField.classList.toggle('is-hidden')
  })

  fp.config.onValueUpdate = [
    function (selectedDates) {
      // Start time cannot be in the past
      if (selectedDates[0].getDate() === today.getDate() &&
        selectedDates[0].getMonth() === today.getMonth() &&
        selectedDates[0].getFullYear() === today.getFullYear()) {

        fp.set('minTime', Date.now())
      } else {
        fp.set('minTime', undefined)
      }

      // End date cannot be earlier than start date
      fpEnd.set('minDate', new Date(selectedDates))
      fpEnd.changeMonth(fp.currentMonth - fpEnd.currentMonth)
    }]

  // End time cannot be earlier than start time on the same date
  fpEnd.config.onValueUpdate = [
    function (selectedDates) {
      if (selectedDates[0].getDate() === fp.selectedDates[0].getDate() &&
        selectedDates[0].getMonth() === fp.selectedDates[0].getMonth() &&
        selectedDates[0].getFullYear() === fp.selectedDates[0].getFullYear()) {

        fpEnd.set('minTime', new Date(fp.selectedDates[0]))
      } else {
        fpEnd.set('minTime', undefined)
      }
    }
  ]
}

/**
 * Show a snackbar notification (polonel/Snackbar)
 *
 * @param {string} text The notification text
 */
function showSnackbar (text) {
  Snackbar.show({
    text: text,
    pos: 'top-center',
    textColor: '#000',
    actionTextColor: '#4240d4',
    backgroundColor: '#ffdd57',
    duration: 3000,
  })
}

/************************ WebRTC below ************************/
// Checks for browser support
async function hasGetUserMedia () {
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const getUserMedia = navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia

      // Return rejected promise with an error
      if (!getUserMedia) {
        return Promise.reject(
          new Error('getUserMedia is not implemented in this browser'))
      }

      // Wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }
}

// // Switch on camera to take snapshots
// const video = document.querySelector('video')
// const button = document.getElementById('camera-button')
// const snapshot = document.getElementById('snapshot')

// function onCamera(){
//   // Change button label
//   if (button.innerHTML == "Take Again"){
//     button.innerHTML = "Capture"
//   }

//   // Switch between rear and environment camera
//   var front = false;
//   document.getElementById('switch-button').onclick = function() { front = !front; };

//   video.classList.remove('is-hidden')
//   snapshot.classList.add('is-hidden')
//   navigator.mediaDevices.getUserMedia({audio: false, video: { facingMode: front ? "user" : "environment" }})
//   .then(function(stream) {
//     window.stream = stream;
//     if ("srcObject" in video) {
//       video.srcObject = stream
//     } else {
//       video.src = window.URL.createObjectURL(stream)
//     }
//     button.removeEventListener('click', onCamera)
//     button.addEventListener('click', capture)
//   })
//   .catch(function(error) {
//     console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name)
//   })
// }

// // Takes snapshot
// function capture(){
//   // Change button label
//   if (button.innerHTML == "Capture"){
//     button.innerHTML = "Take Again"
//   }

//   const canvas = window.canvas = document.querySelector('canvas')
//   video.classList.add('is-hidden')
//   snapshot.classList.remove('is-hidden')
//   button.addEventListener('click', onCamera)
//   canvas.width = video.videoWidth
//   canvas.height = video.videoHeight
//   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
//   snapshot.src = canvas.toDataURL('image/png')
// }

// // Launch and close selfie camera modal
// const picButtons = $(document.getElementsByClassName('pic-button'))

// // Check for Canvas support and presence
// function isCanvas(){
//   const elem = document.createElement('canvas')
//   return (elem.getContext && elem.getContext('2d') && document.querySelector('canvas') != null)
// }

// // Open the modal
// if (picButtons.length) {
//   if (isCanvas()){
//     hasGetUserMedia()
//     picButtons.click(function () {
//       button.innerHTML = "Capture"
//       const targetID = $(this).data('target')
//       const target = $(document.getElementById(`${targetID}`))
//       target.addClass('is-active')
//       onCamera()
//     })
//   }
// }
