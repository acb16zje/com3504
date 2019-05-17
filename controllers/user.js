/**
 * Controller for user profile page
 *
 * @author Zer Jun Eng
 */

'use strict'
const User = require('../models/user')

/**
 * GET the data of all user profiles
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getUsers = (req, res) => {
  const userQuery = User.find({}, '-__v')
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
  userQuery.populate({
    path: 'stories',
    populate: [
      { path: 'user', select: '-_id username' },
      { path: 'event', select: '_id name' },
      { path: 'likes', select: '-_id username' },
      {
        path: 'comments',
        populate: [
          { path: 'user', select: '-_id username' },
        ],
        select: '-_id -story',
        options: { sort: { date: 1 } },
      },
    ],
    options: { sort: { date: -1 } },
  })
  userQuery.populate('followers following', '-_id').lean()

  userQuery.then(users => {
    if (users && users.length) {
      res.json(users)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * GET all the data of the user
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getUserData = (req, res) => {
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
  userQuery.populate({
    path: 'stories',
    populate: [
      { path: 'user', select: '-_id username' },
      { path: 'event', select: '_id name' },
      { path: 'likes', select: '-_id username' },
      {
        path: 'comments',
        populate: [
          { path: 'user', select: '-_id username' },
        ],
        select: '-_id -story',
        options: { sort: { date: 1 } },
      },
    ],
    options: { sort: { date: -1 } },
  })
  userQuery.populate('followers following', '-_id').lean()

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
 * POSt Edit the profile of current logged in user
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.editUserProfile = (req, res) => {
  const formJson = req.body
  const userQuery = User.findById(req.user.id)

  userQuery.then(async user => {
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

/**
 * POST follows the given username
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.followUser = (req, res) => {
  // userQueryA: The logged in user
  // userQueryB: The user to be followed

  const json = req.body
  const userQueryA = User.findById(req.user.id, 'following')
  const userQueryB = User.findOne({ username: json.username }, 'followers')

  userQueryA.then(userA => {
    if (userA) {
      userQueryB.then(async userB => {
        if (userB) {
          // Unfollow if already followed, otherwise follow
          if (userA.following.indexOf(userB.id) > -1 &&
            userB.followers.indexOf(userA.id) > -1) {

            userA.following.pull({ _id: userB.id })
            userB.followers.pull({ _id: userA.id })
          } else {
            userA.following.push(userB.id)
            userB.followers.push(userA.id)
          }

          await userA.save()
          await userB.save()
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
      }).catch(err => {
        res.sendStatus(500)
      })
    } else {
      res.sendStatus(401)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
