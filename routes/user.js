/**
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()
const auth = require('./auth')

const user_controller = require('../controllers/user')

/* GET user (stories) profile. */
router.get('/:username/?:type(|events|going|interested|went)', (req, res) => {
  res.render('user', {
    title: 'Musicbee',
    path: `user_${req.params.type}`,
    username_path: req.path,
  })
})

/* AJAX GET user (stories) profile */
router.get('/api/user/:username/?:type(|events|going|interested|went)',
  user_controller.get_user_data)

/* AJAX POST for editing user profile */
router.post('/api/user/edit', auth.checkAuth, user_controller.edit_user_profile)

module.exports = router
