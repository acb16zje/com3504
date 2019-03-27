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
 * @param {object} next The next middleware function
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

/**
 * Edit the profile of current logged in user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.edit_user_profile = function (req, res, next) {
  const formJson = req.body

  User.findOne({email: req.user.email}).populate('genres', '-_id').
    exec(function (err, user) {
      if (err) throw err

      if (user) {
        user.username = formJson.username
        user.fullname = formJson.fullname
        user.description = formJson.description
        // user.genres = formJson.genres

        user.save().
          then(() => res.sendStatus(200)).
          catch(err => {
            console.log(err)
            res.sendStatus(400)
          })
      } else {
        res.sendStatus(404)
      }
  })
}
