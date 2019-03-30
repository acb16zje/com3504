/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const Event = require('../models/event')
const User = require('../models/user')

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
    // 404 error if no events found
    if (events && events.length) {
      res.json(events)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * GET the event data of a given event ID
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.getEventData = (req, res, next) => {
  const eventQuery = Event.findById(req.params.id)
  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image').lean()

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      res.json(event)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST set the event as interested for the user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.setEventInterested = (req, res, next) => {
  const json = req.body

  // Trying to set interested while not authenticated / impersonating
  if (req.user.username !== json.username) {
    res.sendStatus(400)
  }

  const eventQuery = Event.findById(json.id, 'interested going')

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      const userQuery = User.findOne({ username: req.user.username },
        'interested going')

      userQuery.then(async user => {
        // 404 error if username does not exist
        if (user) {
          // Remove from going
          user.going.pull({ _id: event.id })
          event.going.pull({ _id: user.id })

          // Remove from interested if already in the list, otherwise add
          if (user.interested.indexOf(event.id) === -1 &&
            event.interested.indexOf(user.id) === -1) {

            user.interested.push(event.id)
            event.interested.push(user.id)
          } else {
            user.interested.pull({ _id: event.id })
            event.interested.pull({ _id: user.id })
          }

          await user.save()
          await event.save()
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
      }).catch(err => {
        console.log(err)
        res.sendStatus(500)
      })
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST set the event as going for the user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.setEventGoing = (req, res, next) => {
  const json = req.body

  // Trying to set going while not authenticated / impersonating
  if (req.user.username !== json.username) {
    res.sendStatus(400)
  }

  const eventQuery = Event.findById(json.id, 'interested going')

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      const userQuery = User.findOne({ username: req.user.username },
        'interested going')

      userQuery.then(async user => {
        // 404 error if username does not exist
        if (user) {
          // Remove from interested
          user.interested.pull({ _id: event.id })
          event.interested.pull({ _id: user.id })

          // Remove from going if already in the list, otherwise add
          if (user.going.indexOf(event.id) === -1 &&
            event.going.indexOf(user.id) === -1) {

            user.going.push(event.id)
            event.going.push(user.id)
          } else {
            user.going.pull({ _id: event.id })
            event.going.pull({ _id: user.id })
          }

          await user.save()
          await event.save()
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
      }).catch(err => {
        console.log(err)
        res.sendStatus(500)
      })
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
