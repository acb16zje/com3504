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

/* AJAX GET story data */
router.get('/api/story/:id', storyController.getStoryData)

/* AJAX GET all stories related to the username */
router.get('/api/story_feed', auth.checkAuthAPI, storyController.getStoryFeed)

/* AJAX POST create a story */
router.post('/api/story/create', auth.checkAuthAPI, storyController.createStory)

/* AJAX POST update a story */
router.post('/api/story/update', auth.checkAuthAPI, storyController.updateStory)

/* AJAX POST delete a story */
router.post('/api/story/delete', auth.checkAuthAPI, storyController.deleteStory)

/* AJAX POST like a story */
router.post('/api/story/like', auth.checkAuthAPI, storyController.likeStory)

/* AJAX POST reply a comment to story */
router.post('/api/story/comment', auth.checkAuthAPI, storyController.commentStory)

module.exports = router
