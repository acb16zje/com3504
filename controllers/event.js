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
      if (err) throw err

      if (docs) {
        res.render('explore', {
          title: 'Musicbee - explore',
          path: req.path.toLowerCase(),
          docs: docs,
        })
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
