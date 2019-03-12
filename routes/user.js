'use strict'
/**
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */
const express = require('express')
const router = express.Router()

/* GET user (stories) profile. */
router.get('/', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    originalUrl: req.originalUrl,
  })
})

/* GET user (events) profile. */
router.get('/events', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    originalUrl: req.originalUrl,
  })
})

/* GET user (going) profile. */
router.get('/going', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    originalUrl: req.originalUrl,
  })
})

/* GET user (interested) profile. */
router.get('/interested', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    originalUrl: req.originalUrl,
  })
})

/* GET user (attended) profile. */
router.get('/attended', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    originalUrl: req.originalUrl,
  })
})

module.exports = router
