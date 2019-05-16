/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const Comment = require('../models/comment')
const Event = require('../models/event')
const User = require('../models/user')
const imageController = require('../controllers/image')

/**
 * GET Explore page (/explore) with featured and suggested events
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.index = (req, res) => {
  const eventQuery = Event.find()
  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image')
  eventQuery.populate({
    path: 'stories',
    populate: [
      { path: 'event', select: '_id name' },
      { path: 'likes', select: '_id username' },
      {
        path: 'comments',
        populate: [
          { path: 'user', select: '-_id username' },
        ],
        select: '-_id -story',
        options: { sort: { date: 1 } },
      },
      {
        path: 'user',
        select: '_id username image',
        options: { sort: { date: -1 } },
      },
    ],
  })
  eventQuery.populate({
    path: 'comments',
    populate: [
      { path: 'user', select: '-_id username image' },
    ],
    select: '-_id -story -event',
    options: { sort: { date: -1 } },
  }).lean()

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
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getEventData = (req, res) => {
  const eventQuery = Event.findById(req.params.id)
  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image')
  eventQuery.populate({
    path: 'stories',
    populate: [
      { path: 'event', select: '_id name' },
      { path: 'likes', select: '_id username' },
      {
        path: 'comments',
        populate: [
          { path: 'user', select: '-_id username' },
        ],
        select: '-_id -story',
        options: { sort: { date: 1 } },
      },
      {
        path: 'user',
        select: '_id username image',
        options: { sort: { date: -1 } },
      },
    ],
  })
  eventQuery.populate({
    path: 'comments',
    populate: [
      { path: 'user', select: '-_id username image' },
    ],
    select: '-_id -story -event',
    options: { sort: { date: -1 } },
  }).lean()

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      res.json(event)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    // Cast to ObjectId failed
    console.log(err)
    res.sendStatus(400)
  })
}

/**
 * GET all events related to the user (follow, created)
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getEventFeed = (req, res) => {
  const userQuery = User.findById(req.user.id)

  userQuery.then(user => {
    if (user) {
      const eventQuery = Event.find()
      eventQuery.populate({
        path: 'organiser',
        match: { $or: [{ followers: req.user.id }, { _id: req.user.id }] },
        select: '-_id username',
      })
      eventQuery.populate('genres', '-_id name')
      eventQuery.populate('interested going', '-_id username image').lean()

      eventQuery.
        then(events => res.json(events.filter(event => event.organiser))).
        catch(err => {
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
 * GET all events matching the search request
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.searchEvent = (req, res) => {
  const json = req.body

  const eventQuery =
    Event.find({
      name: new RegExp(`^.*${json.event.replace(
        /[-/\\^$*+?.()|[]{}]/g, '\\$&')}.*$`, 'gi'),
    })

  // If genre is provided
  if (json.genre) {
    eventQuery.find({genres: json.genre})
  }

  // If address is provided
  if (json.address) {
    eventQuery.find({
      'location.address': new RegExp(`^.*${json.address.replace(
        /[-/\\^$*+?.()|[]{}]/g, '\\$&')}.*$`, 'gi'),
    })
  }

  // If date is provided
  if (json.date) {
    const date = new Date(json.date)

    // Timezone problem
    date.setHours(date.getHours() + date.getTimezoneOffset() / 60)

    const dateTomorrow = new Date(new Date(date).setDate(date.getDate() + 1))
    const startDateQuery = {
      $gte: date,
      $lt: dateTomorrow,
    }

    eventQuery.find({
      $or: [
        // Only has start date
        { $and: [{ startDate: startDateQuery }, { endDate: undefined }] },

        // Has end date, selected date is start date
        { $and: [{ startDate: startDateQuery }, { endDate: { $gte: date } }] },

        // Has end date, selected date between start and end date
        { $and: [{ startDate: { $lte: date } }, { endDate: { $gte: date } }] },
      ],
    })
  }

  eventQuery.populate('organiser', '-_id')
  eventQuery.populate('genres', '-_id name')
  eventQuery.populate('interested going', '-_id username image').lean()
  eventQuery.lean()

  eventQuery.then(events => {
    res.json(events)
  }).catch((err) => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST create an event
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.createEvent = async (req, res) => {
  const json = req.body
  const genres = json.genres && json.genres.length ? json.genres : []
  const eventImage = await imageController.createImage(json.image)

  const userQuery = User.findById(req.user.id)

  userQuery.then(async user => {
    const event = await new Event({
      name: json.name,
      description: json.description,
      organiser: user.id,
      startDate: json.startDate,
      endDate: json.endDate ? json.endDate : undefined,
      location: {
        latitude: json.latitude ? json.latitude : undefined,
        longitude: json.longitude ? json.longitude : undefined,
        address: json.address ? json.address : 'No location',
      },
      image: eventImage ? `/image/${eventImage._id}` : undefined,
      genres: genres,
      going: [user.id],
    }).save().catch(err => {
      // Bad request
      console.log(err)
      res.status(400).send(err)
    })

    if (event) {
      // Add the created event to user
      await user.events.push(event.id)
      await user.going.push(event.id)
      await user.save()
      res.json({ eventID: event.id })
    } else {
      res.sendStatus(500)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST update an event
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.updateEvent = async (req, res) => {
  const json = req.body
  const genres = json.genres && json.genres.length ? json.genres : []

  const eventQuery = Event.findById(json.id).
    populate('organiser', '-_id username')

  eventQuery.then(async event => {
    if (event) {
      event.name = event.name === json.name ? event.name : json.name
      event.description = event.description === json.description
        ? event.description
        : json.description

      if (json.image) {
        const imageId = event.image.split('/')[2] // /image/:id

        if (imageId === 'placeholder.webp') {
          const eventImage = await imageController.createImage(json.image)
          event.image = eventImage ? `/image/${eventImage._id}` : undefined
        } else {
          await imageController.updateImage(imageId, json.image)
        }
      }

      // Update the event dates
      if (json.startDate) {
        const startDate = new Date(event.startDate)
        const newStartDate = new Date(json.startDate)

        if (startDate !== newStartDate && newStartDate >= startDate) {
          event.startDate = newStartDate
        }

        if (json.endDate) {
          const endDate = new Date(event.endDate)
          const newEndDate = new Date(json.endDate)

          if (newEndDate !== endDate && newEndDate > newStartDate) {
            event.endDate = newEndDate
          }
        } else {
          // User removed the end date
          event.endDate = undefined
        }
      }

      // Update location
      if (event.location.address !== json.address) {
        event.location.latitude = json.latitude ? json.latitude : undefined
        event.location.longitude = json.longitude ? json.longitude : undefined
        event.location.address = json.address ? json.address : 'No location'
      }

      event.genres = genres

      await event.save()
      res.json(event)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    // Bad request
    console.log(err)
    res.status(400).send(err)
  })
}

/**
 * POST set the event as interested for the user
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.setEventInterested = (req, res) => {
  const eventQuery = Event.findById(req.body.id, 'interested going')

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      const userQuery = User.findById(req.user.id, 'interested going')

      userQuery.then(async user => {
        // 404 error if username does not exist
        if (user) {
          // Remove from going
          user.going.pull({ _id: event.id })
          event.going.pull({ _id: user.id })

          // Remove from interested if already in the list, otherwise add
          if (user.interested.indexOf(event.id) > -1 &&
            event.interested.indexOf(user.id) > -1) {

            user.interested.pull({ _id: event.id })
            event.interested.pull({ _id: user.id })
          } else {
            user.interested.push(event.id)
            event.interested.push(user.id)
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
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.setEventGoing = (req, res) => {
  const eventQuery = Event.findById(req.body.id, 'interested going')

  eventQuery.then(event => {
    // 404 error if event is not found
    if (event) {
      const userQuery = User.findById(req.user.id, 'interested going')

      userQuery.then(async user => {
        // 404 error if username does not exist
        if (user) {
          // Remove from interested
          user.interested.pull({ _id: event.id })
          event.interested.pull({ _id: user.id })

          // Remove from going if already in the list, otherwise add
          if (user.going.indexOf(event.id) > -1 &&
            event.going.indexOf(user.id) > -1) {

            user.going.pull({ _id: event.id })
            event.going.pull({ _id: user.id })
          } else {
            user.going.push(event.id)
            event.going.push(user.id)
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
 * POST comment an event
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.commentEvent = (req, res) => {
  const eventQuery = Event.findById(req.body.id)

  eventQuery.then(async event => {
    if (event) {
      const comment = await new Comment({
        user: req.user.id,
        event: event.id,
        content: req.body.content,
      }).save().catch(err => {
        // Bad request
        console.log(err)
        res.sendStatus(400)
      })

      if (comment) {
        await event.comments.push(comment.id)
        await event.save()

        // Send the comment back to socket.io
        Comment.populate(comment, { path: 'user', select: 'username image' },
          function (err, comment) {
            res.json(comment)
          })
      } else {
        res.sendStatus(500)
      }
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
