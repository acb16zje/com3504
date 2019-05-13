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
  'fa-solid:search',
  'fa-solid:user',
  'fa-solid:camera',
  'fa-solid:file',
  'fa-regular:user',
  'fa-regular:plus-square',
  'ic:sharp-star',
  'ic:sharp-star-border',
  'ic:round-check',
  'ic:round-access-time',
  'ic:round-location-on',
  'ic:baseline-event',
  'ic:baseline-edit',
  'dashicons:tag',
  'flat-color-icons:google',
  'bytesize:heart',
  'maki:heart-15',
  'emojione-v1:cross-mark'
])
Iconify.setConfig('localStorage', true)

// Service worker configuration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').
      then(() => {
        console.log('SW registration successful')
      }, err => {
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

// File upload
/**
 * Initialise file input button
 */
function initFileInput () {
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
}

initFileInput()

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

const eventSelect = document.getElementById('story-event')

/**
 * Create story - append events to select options
 *
 * @param {string} text The option text
 * @param {string} value The option value
 */
function appendEventToSelect (text, value) {
  const option = document.createElement('option')
  option.text = text
  option.value = value
  eventSelect.appendChild(option)
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
    dropDownsArray[i].addEventListener('click', e => {
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
const modalButtons = document.getElementsByClassName('modal-button')

// Open the modal
if (modalButtons.length) {
  for (let i = 0, n = modalButtons.length; i < n; i++) {
    modalButtons[i].onclick = function () {
      const targetID = this.dataset.target
      document.getElementById(`${targetID}`).classList.add('is-active')

      if (targetID === 'camera') {
        startWebRTC()
      }
    }
  }
}

/**
 * Close modal when click outside of story or Esc pressed
 */
function closeModalListener () {
  const modalCloses = document.querySelectorAll(
    '.modal-close, .modal-background, .button-close')

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
   * Close the modal
   */
  const closeModal = () => {
    const modals = document.getElementsByClassName('modal')

    // Specific case: closing edit story modal does not close story modal
    const editStoryDiv = document.getElementById('edit-story')

    // Specific case for edit event modal
    const editEventDiv = document.getElementById('edit-event')

    if (editStoryDiv) {
      editStoryDiv.remove()
    } else if (editEventDiv) {
      editEventDiv.remove()
    } else {
      for (let i = 0, n = modals.length; i < n; i++) {
        modals[i].classList.remove('is-active')
      }
    }
  }
}

closeModalListener()

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
function initDatepicker () {
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

    const fp = flatpickr(startDate, options)
    const fpEnd = flatpickr(endDate, options)
    fpEnd.clear()

    document.getElementById('add-end-time').onclick = function () {
      const endTimeField = document.getElementById('end-time-field')

      if (endTimeField.classList.contains('is-hidden')) {
        this.textContent = '– End Date'
        fpEnd.setDate(today.setHours(today.getHours() + 3))
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
}

initDatepicker()

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
      'data:location:address',
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
    e.preventDefault()
    if (e.target.tagName === 'SPAN') {
      e.target.parentNode.click()
    } else if (e.target.tagName === 'svg') {
      e.target.parentNode.parentNode.click()
    } else if (e.target.tagName === 'path') {
      e.target.parentNode.parentNode.parentNode.click()
    } else {
      e.target.click()
    }
  }

  // Show or hide the dropdown
  searchInput.onfocus = () => suggestions.classList.remove('is-hidden')
  searchInput.onblur = () => suggestions.classList.add('is-hidden')
}

/************************ WebRTC below ************************/
/**
 *
 */
function startWebRTC () {
  const constraints = {
    audio: false,
    video: { width: 480, height: 240 },
  }

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    const video = document.getElementById('video')
    const capture = document.getElementById('capture')
    const imageInput = document.getElementsByName('image')[0]
    const filters = document.getElementsByClassName('camera-filter')
    let filterValue = 'none'

    // Apply filter effect on click
    for (let i = 0, n = filters.length; i < n; i++) {
      filters[i].onclick = function (e) {
        for (let i = 0, n = filters.length; i < n; i++) {
          filters[i].classList.remove('is-active')
        }

        const clickedTarget = e.currentTarget
        clickedTarget.classList.add('is-active')

        if (video.classList.contains('is-hidden')) {
          video.className = `is-hidden ${this.dataset.value}`
        } else {
          video.className = this.dataset.value
        }

        filterValue = this.dataset.value
      }
    }

    video.srcObject = stream

    capture.onclick = () => {
      const canvas = document.getElementById('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      applyFilterEffect(ctx, filterValue)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Switch video to canvas when captured
      video.classList.toggle('is-hidden')
      canvas.classList.toggle('is-hidden')
      document.getElementById('filter-tabs').classList.toggle('is-hidden')

      if (capture.textContent === 'Capture') {
        capture.textContent = 'Capture again'

        // Save the image data
        const data = canvas.toDataURL('image/webp')
        imageInput.setAttribute('value', data)
      } else {
        capture.textContent = 'Capture'

        // Clear the image data
        imageInput.setAttribute('value', '')
      }
    }
  }).catch(err => {
    showSnackbar('Camera error, try again.')
  })
}

/**
 * Apply filter effect to the canvas
 *
 * @param {object} ctx Canvas context object
 * @param {string} filterValue Filter effect
 */
function applyFilterEffect (ctx, filterValue) {
  switch (filterValue) {
    case 'blur':
      ctx.filter = 'blur(3px)'
      break
    case 'brightness':
      ctx.filter = 'brightness(2)'
      break
    case 'contrast':
      ctx.filter = 'contrast(2)'
      break
    case 'grayscale':
      ctx.filter = 'grayscale(1)'
      break
    case 'huerotate':
      ctx.filter = 'hue-rotate(90deg)'
      break
    case 'invert':
      ctx.filter = 'invert(1)'
      break
    case 'saturate':
      ctx.filter = 'saturate(5)'
      break
    case 'sepia':
      ctx.filter = 'sepia(1)'
      break
    default:
      break
  }
}
