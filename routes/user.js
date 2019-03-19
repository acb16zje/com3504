/**attended
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

/* GET user (stories) profile. */
router.get('/user', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path.toLowerCase(),
  })
})

/* GET user (events) profile. */
router.get('/user/events', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path.toLowerCase(),
  })
})

/* GET user (going) profile. */
router.get('/user/going', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path.toLowerCase(),
  })
})

/* GET user (interested) profile. */
router.get('/user/interested', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path.toLowerCase(),
  })
})

/* GET user (attended) profile. */
router.get('/user/went', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path.toLowerCase(),
  })
})

module.exports = router
