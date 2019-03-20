/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const Event = require('../models/event')
const Image = require('../models/image')

/**
 * Explore page (/explore) with featured and suggested events
 *
 * @param req The request header
 * @param res The response header callback
 */
exports.index = function (req, res) {
  Event.
    find({}).
    populate('organiser genre').
    exec(function (err, docs) {
      console.log(err)
      res.render('explore', {
        title: 'Musicbee - explore',
        path: req.path.toLowerCase(),
        docs: docs,
      })
    })
}

/**
 * Return the event image if valid, otherwise load a placeholder image
 *
 * @param req The request header
 * @param res The response header callback
 */
exports.get_event_image = function (req, res) {
  Image.findById(req.params.id).lean().exec(function (err, doc) {
    if (err) {
      res.setHeader('content-type', 'image/webp')
      res.send('/images/placeholder.webp')
    }

    if (doc) {
      res.setHeader('content-type', doc.contentType)
      res.send(doc.content.buffer)
    }
  })
}

exports.insert = function (req, res) {
  const genreData = req.body
  if (genreData == null) {
    res.status(403).send('No data sent!')
  }
  try {
    const genre = new Genre({
      genre_name: genreData.genreName,
    })
    genre.save(function (err, results) {
      console.log(results._id)
      if (err)
        res.status(500).send('Invalid data!')
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(genre))
    })
  } catch (e) {
    res.status(500).send('error ' + e)
  }
}
