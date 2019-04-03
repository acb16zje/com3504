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
  'ion:ios-search',
  'entypo:squared-plus',
  'zmdi:notifications',
  'zmdi:notifications-none',
  'fa-solid:search',
  'fa-solid:user',
  'fa-regular:user',
  'fa-regular:plus-square',
  'ic:sharp-star',
  'ic:sharp-star-border',
  'ic:round-check',
  'ic:round-access-time',
  'ic:round-location-on',
  'ic:baseline-event',
  'dashicons:tag',
  'flat-color-icons:google',
])
Iconify.setConfig('localStorage', true)

// Service worker configuration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').
      then(() =>  {
        console.log('SW registration successful')
      }, (err) => {
        console.log('SW registration failed: ', err)
      })
  })
}

/************************ Helper functions below ************************/
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
 * Checks if two date are the same (does not include time)
 *
 * @param {Date} date1 The first date
 * @param {Date} date2 The second date
 * @returns {boolean} True if two dates are the same
 */
function isSameDate (date1, date2) {
  const startCompare = new Date(date1).setHours(0, 0, 0, 0)
  const endCompare = new Date(date2).setHours(0, 0, 0, 0)

  return startCompare === endCompare
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
function getBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
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

  document.onclick = () => {
    for (let i = 0, n = dropDownsArray.length; i < n; i++) {
      dropDownsArray[i].classList.remove('is-active')
    }
  }
}

/************************ Modals below ************************/
// Launch and close the user story modal
const modals = document.getElementsByClassName('modal')
const modalButtons = document.getElementsByClassName('modal-button')
const modalCloses = document.querySelectorAll('.modal-close, .modal-background, .button-close')

// Open the modal
if (modalButtons.length) {
  for (let i = 0, n = modalButtons.length; i < n; i++) {
    modalButtons[i].onclick = function () {
      const targetID = this.dataset.target
      document.getElementById(`${targetID}`).classList.add('is-active')

      // Story modal
      if (targetID === 'story') {
        // Add the image source
        const profileImgModal = document.getElementById('user-image-modal')
        profileImgModal.src = document.querySelector('#user-image img').src

        const imgChild = document.getElementById(`${targetID}-image`)
        imgChild.src = this.children[0].src

        // Reset comments scroll to top
        document.querySelector('#story div.card-content').scrollTop = 0
      }
    }
  }
}

// Close modal when click outside of story or Esc pressed
if (modalCloses.length) {
  for (let i = 0, n = modalCloses.length; i < n; i++) {
    modalCloses[i].onclick = () => closeModal()
  }

  document.onkeydown = e => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }
}

/**
 * Close the user story modal
 */
const closeModal = () => {
  for (let i = 0, n = modals.length; i < n; i++) {
    modals[i].classList.remove('is-active')
  }
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
/*------------------ DatePicker -----------------*/
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
  fpEnd.clear()

  document.getElementById('add-end-time').onclick = function () {
    const endTimeField = document.getElementById('end-time-field')

    if (endTimeField.classList.contains('is-hidden')) {
      this.textContent = '– End Date'
      fpEnd.setDate(new Date().setHours(today.getHours() + 3))
    } else {
      this.textContent = '+ End Date'
      fpEnd.setDate(undefined)
    }

    endTimeField.classList.toggle('is-hidden')
  }

  fp.config.onValueUpdate = [
    function (selectedDates) {
      // Start time cannot be in the past
      if (isSameDate(selectedDates[0], today)) {
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
      if (isSameDate(selectedDates[0], fp.selectedDates[0])) {
        fpEnd.set('minTime', new Date(fp.selectedDates[0]))
      } else {
        fpEnd.set('minTime', undefined)
      }
    },
  ]
}

/*------------------ polonel/Snackbar -----------------*/
/**
 * Show a snackbar notification
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

/*------------------ flexsearch -----------------*/
const index = new FlexSearch({
  encode: 'advanced',
  tokenize: 'full',
  suggest: true,
  doc: {
    id: 'data:_id',
    field: [
      // Event field
      'data:name',
      'data:address',
      'data:genres',
      // User field
      'data:username',
      'data:fullname',
    ],
  },
})

const searchInput = document.getElementById('search-input')

if (searchInput) {
  const suggestions = document.getElementById('search-suggestion')

  searchInput.oninput = function () {
    const result = index.search(this.value)

    while (suggestions.firstChild)
      suggestions.removeChild(suggestions.firstChild)

    for (let i = 0, n = result.length; i < n; i++) {
      const link = document.createElement('a')
      link.className = 'panel-block'
      suggestions.appendChild(link)

      // Icon container
      const icon = document.createElement('span')
      icon.className = 'panel-icon'
      link.appendChild(icon)

      // Icon
      const iconify = document.createElement('span')

      // Event icon or User icon
      if ('organiser' in result[i]) {
        iconify.className = 'iconify'
        iconify.dataset.icon = 'ic:baseline-event'
        link.href = `/event/${result[i]._id}`
      } else if ('email' in result[i]) {
        const img = document.createElement('img')
        img.className = 'is-rounded'
        img.src = result[i].image

        const figure = document.createElement('figure')
        figure.className = 'image is-24x24'
        figure.appendChild(img)

        iconify.appendChild(figure)
        link.href = `/${result[i].username}`
      }
      icon.appendChild(iconify)

      const text = document.createElement('span')
      text.textContent = result[i].name || result[i].username
      link.appendChild(text)
    }
  }

  // Clicking the dropdown links
  suggestions.onmousedown = (e) => {
    if (e.target.tagName === 'SPAN') {
      e.target.parentNode.click()
    } else if (e.target.tagName === 'svg' ) {
      e.target.parentNode.parentNode.click()
    } else if (e.target.tagName === 'path' ) {
      e.target.parentNode.parentNode.parentNode.click()
    } else {
      e.target.click()
    }
  }

  // Show or hide the dropdown
  searchInput.onfocus = () => suggestions.classList.remove('is-hidden')
  // searchInput.onblur = () => suggestions.classList.add('is-hidden')
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
