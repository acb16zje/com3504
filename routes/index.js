/**
 * Routes handler for home page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

/* GET home (stories) page */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Musicbee - Enjoy the Sweetest Moment of Music',
    path: 'home_stories',
  })
})

/* GET home (events) page */
router.get('/events', function (req, res, next) {
  res.render('index', {
    title: 'Musicbee - Enjoy the Sweetest Moment of Music',
    path: 'home_events'
  })
})

router.get('/notifications', function (req, res, next) {
  res.render('notifications', {
    title: 'Musicbee - notifications',
    path: 'notifications'
  })
})

module.exports = router
