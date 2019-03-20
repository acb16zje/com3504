/**
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

const user_controller = require('../controllers/user')

/* GET user (stories) profile. */
router.get('/:username', user_controller.get_user_stories)

/* GET user (events) profile. */
router.get('/:username/events', user_controller.get_user_events)

/* GET user (going) profile. */
router.get('/:username/going', user_controller.get_user_going)

/* GET user (interested) profile. */
router.get('/:username/interested', user_controller.get_user_interested)

/* GET user (went) profile. */
router.get('/:username/went', user_controller.get_user_went)

module.exports = router
