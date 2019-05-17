/**
 * Controller for genre
 *
 * @author Zer Jun Eng
 */

'use strict'
const Genre = require('../models/genre')

/**
 * GET the list of genres
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.index = (req, res) => {
  const genreQuery = Genre.find({}, '-__v').lean()

  genreQuery.then(genres => {
    // 404 error if no genres if found (extreme case)
    if (genres && genres.length) {
      res.json(genres)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
