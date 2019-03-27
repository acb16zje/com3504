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
exports.index = function (req, res, next) {
  Event.
    find({}).
    populate('organiser', '-_id').
    populate('genres', '-_id genre_name').
    populate('interested going', '-_id username image').
    lean().exec(function (err, docs) {
      if (err) throw err

      if (docs.length) {
        res.json(docs)
      } else {
        next(createError(404))
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
