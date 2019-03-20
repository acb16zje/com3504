/**
 * Routes handler for explore events page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

const event_controller = require('../controllers/event')

/* GET explore page */
router.get('/explore', event_controller.index)

/* GET the event image */
router.get('/event/p/:id', event_controller.get_event_image)

module.exports = router
