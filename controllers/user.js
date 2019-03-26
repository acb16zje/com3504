/**
 * Controller for user profile page
 *
 * @author Zer Jun Eng
 */

'use strict'
const createError = require('http-errors')
const Event = require('../models/event')
const User = require('../models/user')

/**
 * Get all the data of the user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The redirect handler
 */
exports.get_user_data = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }, '-_id').
    populate('genres', '-_id genre_name').
    populate({
      path:'events going interested',
      populate: [
        { path: 'organiser', select: '-_id username' },
        { path: 'genres', select: '-_id genre_name'},
      ],
    }).
    populate('stories followers following').
    lean().exec(function (err, doc) {
      if (err) throw err

      if (doc) {
        res.json(doc)
      } else {
        next(createError(404))
      }
    })
}
