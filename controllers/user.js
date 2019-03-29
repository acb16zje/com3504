/**
 * Controller for user profile page
 *
 * @author Zer Jun Eng
 */

'use strict'
const createError = require('http-errors')
const Event = require('../models/event')
const Genre = require('../models/genre')
const User = require('../models/user')

/**
 * Get all the data of the user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.getUserData = function (req, res, next) {
  const userQuery = User.findOne({ 'username': req.params.username }, '-_id')
  userQuery.populate('genres', '-_id name')
  userQuery.populate({
    path: 'events going interested',
    populate: [
      { path: 'organiser', select: '-_id username' },
      { path: 'genres', select: '-_id name' },
    ],
  })
  userQuery.populate('stories followers following').lean()

  userQuery.then(user => {
    // 404 error if the username if not found
    if (user) {
      res.json(user)
    } else {
      next(createError(404))
    }
  }).catch(err => console.log(err))
}

/**
 * Edit the profile of current logged in user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 * @param {object} next The next middleware function
 */
exports.editUserProfile = async function (req, res, next) {
  const formJson = req.body
  const userQuery = User.findOne({ email: req.user.email })

  userQuery.then(user => {
    if (user) {
      user.username = formJson.username
      user.fullname = formJson.fullname
      user.description = formJson.description

      // Genre query and validation
      const formGenres = formJson.genres
      const genreQuery = Genre.find({ name: { $in: formGenres } })

      genreQuery.then(docs => {
        user.genres = docs && docs.length ? docs.map(doc => doc.id) : []

        // Save the user document, then response
        user.save().
          then(() => res.sendStatus(200)).
          catch(err => res.status(400).send(err))
      }).catch(err => console.log(err))

    } else {
      res.sendStatus(400)
    }
  }).catch(err => console.log(err))
}
