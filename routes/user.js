'use strict'
/**
 * Routes handler for user page
 *
 * @author Zer Jun Eng
 */
const express = require('express')
const router = express.Router()

/* GET user (stories) profile. */
router.get('/user', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path,
  })
})

/* GET user (events) profile. */
router.get('/user/events', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path,
  })
})

/* GET user (going) profile. */
router.get('/user/going', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path,
  })
})

/* GET user (interested) profile. */
router.get('/user/interested', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path,
  })
})

/* GET user (attended) profile. */
router.get('/user/attended', function (req, res, next) {
  res.render('user', {
    title: 'Musicbee - gakki profile',
    path: req.path,
  })
})

module.exports = router
