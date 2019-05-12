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

/* AJAX POST create a story */
router.post('/api/story/create', auth.checkAuthAPI, storyController.createStory)

/* AJAX POST update a story */
router.post('/api/story/update', auth.checkAuthAPI, storyController.updateStory)

/* AJAX POST delete a story */
router.post('/api/story/delete', auth.checkAuthAPI, storyController.deleteStory)

/* AJAX POST like a story */
router.post('/api/story/like', auth.checkAuthAPI, storyController.likeStory)

module.exports = router
