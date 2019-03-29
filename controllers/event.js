/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const createError = require('http-errors')
const Event = require('../models/event')

/**
 * Explore page (/explore) with featured and suggested events
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.index = (req, res, next) => {
  const eventQuery = Event.find({})
  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image').lean()

  eventQuery.then(events => {
    if (events && events.length) {
      res.json(events)
    } else {
      next(createError(404))
    }
  }).catch(err => console.log(err))
}

/**
 * GET the event data of a given event ID
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.get_event_data = (req, res, next) => {
  const eventQuery = Event.findById(req.params.id)
  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image').lean()

  eventQuery.then(event => {
    // 404 error if event not found
    if (event) {
      res.json(event)
    } else {
      next(createError(404))
    }
  }).catch(err => console.log(err))
}
