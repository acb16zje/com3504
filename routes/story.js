/**
 * Routes handler for story
 *
 * @author Zer Jun Eng
 */

'use strict'
const auth = require('./auth')
const express = require('express')
const router = express.Router()

const storyController = require('../controllers/user')

/* AJAX GET all stories of the username */
// router.get('/api/story/:username', storyController)

module.exports = router
