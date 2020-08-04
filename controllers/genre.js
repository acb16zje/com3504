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
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.index = function (req, res, next) {
  const genreQuery = Genre.find({}, '-_id').lean()

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
