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

module.exports = router
