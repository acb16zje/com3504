/**
 * Routes handler for explore (events) page
 *
 * @author Zer Jun Eng
 */

'use strict'
const auth = require('./auth')
const express = require('express')
const router = express.Router()

const eventController = require('../controllers/event')

/* GET explore page */
router.get('/explore', (req, res) => {
  res.render('explore', {
    title: 'Explore - Musicbee',
    path: 'explore',
  })
})

/* AJAX GET explore page */
router.get('/api/explore', eventController.index)

/* GET the page of specific event */
router.get('/event/:id?', (req, res) => {
  res.render('event', {
    title: 'Musicbee',
    path: 'explore',
  })
})

/* AJAX GET the details of a specific event */
router.get('/api/event/:id', eventController.getEventData)

/* AJAX POST set the event as interested for the user */
router.post('/api/interested', auth.checkAuth, eventController.setEventInterested)

/* AJAX POST set the event as going for the user */
router.post('/api/going', auth.checkAuth, eventController.setEventGoing)

module.exports = router
