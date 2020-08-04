/**
 * Controller for user profile page
 *
 * @author Zer Jun Eng
 */

'use strict'
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
  userQuery.populate('genres', 'id name')
  userQuery.populate({
    path: 'events going interested',
    populate: [
      { path: 'organiser', select: '-_id username' },
      { path: 'genres', select: '-_id name' },
      { path: 'interested', select: '-_id username' },
      { path: 'going', select: '-_id username' },
    ],
  })
  userQuery.populate('stories followers following').lean()

  userQuery.then(user => {
    // 404 error if the username if not found
    if (user) {
      res.json(user)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
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
      user.genres = formGenres && formGenres.length ? formGenres : []

      // Save the user document, then response
      user.save().
        then(() => res.sendStatus(200)).
        catch(err => res.status(400).send(err))

    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
