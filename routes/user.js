/**
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */

'use strict'
const auth = require('./auth')
const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')

/* GET user profile */
router.get('/:username/?:type(|events|going|interested|went)', (req, res) => {
  res.render('user', {
    title: 'Musicbee',
    path: `user_${req.params.type}`,
    username_path: req.path.split('/')[1], // /:username/events
  })
})

/* AJAX GET all user profile */
router.get('/api/users/', userController.getUsers)

/* AJAX GET user profile */
router.get('/api/user/:username/?:type(|events|going|interested|went)', userController.getUserData)

/* AJAX POST for editing user profile */
router.post('/api/user/edit', auth.checkAuthAPI, userController.editUserProfile)

/* AAJX POST follow the given username */
router.post('/api/follow_user', auth.checkAuthAPI, userController.followUser)

module.exports = router
