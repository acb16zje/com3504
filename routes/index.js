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
    title: 'Musicbee - enjoy the sweetest moment of music',
    path: req.path.toLowerCase(),
  })
})

/* GET home (events) page */
router.get('/events', function (req, res, next) {
  res.render('index', {
    title: 'Musicbee - enjoy the sweetest moment of music',
    path: req.path.toLowerCase(),
  })
})

router.get('/notifications', function (req, res, next) {
  res.render('notifications', {
    title: 'Musicbee - notifications',
    path: req.path.toLowerCase(),
  })
})

module.exports = router
