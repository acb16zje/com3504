'use strict'
const express = require('express')
const router = express.Router()

/* GET create story page. */
router.get('/create', function (req, res, next) {
  res.render('create', {
    title: 'Musicbee - create story',
    path: req.path,
  })
})

/* GET create event page. */
router.get('/create/event', function (req, res, next) {
  res.render('create', {
    title: 'Musicbee - create event',
    path: req.path,
  })
})

module.exports = router
