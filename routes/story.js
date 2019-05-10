/**
 * Routes handler for story
 *
 * @author Zer Jun Eng
 */

'use strict'
const auth = require('./auth')
const express = require('express')
const router = express.Router()

const storyController = require('../controllers/story')

/* AJAX GET all stories of the username */
// router.get('/api/story/:username', storyController)

/* AJAX GET story data */
router.get('/api/story/:id', storyController.getStoryData)

/* AJAX POST create an event */
router.post('/api/story/create', auth.checkAuth, storyController.createStory)

module.exports = router
