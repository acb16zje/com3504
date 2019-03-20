/**
 * Controller for user profile page
 *
 * @author Zer Jun Eng
 */

'use strict'
const createError = require('http-errors')
const Event = require('../models/event')
const Image = require('../models/image')
const User = require('../models/user')

/**
 * Get all the user stories
 *
 * @param req The request header
 * @param res The response header
 * @param next The redirect handler
 */
exports.get_user_stories = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }).
    exec(function (err, doc) {
      if (!err || !doc) next(createError(404))

      if (err) throw err

      if (doc) {
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: 'user_stories',
          doc: doc
        })
      }
    })
}

/**
 * Get all the events created by the user
 *
 * @param req The request header
 * @param res The response header
 * @param next The redirect handler
 */
exports.get_user_events = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }).
    exec(function (err, doc) {
      if (!err || !doc) next(createError(404))

      if (err) throw err

      if (doc) {
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: 'user_events',
          doc: doc
        })
      }
    })
}

/**
 * Get all the going events of the user
 *
 * @param req The request header
 * @param res The response header
 * @param next The redirect handler
 */
exports.get_user_going = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }).
    exec(function (err, doc) {
      if (!err || !doc) next(createError(404))

      if (err) throw err

      if (doc) {
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: 'user_going',
          doc: doc
        })
      }
    })
}

/**
 * Get all the interested events of the user
 *
 * @param req The request header
 * @param res The response header
 * @param next The redirect handler
 */
exports.get_user_interested = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }).
    exec(function (err, doc) {
      if (!err || !doc) next(createError(404))

      if (err) throw err

      if (doc) {
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: 'user_interested',
          doc: doc
        })
      }
    })
}

/**
 * Get all the went events of the user
 *
 * @param req The request header
 * @param res The response header
 * @param next The redirect handler
 */
exports.get_user_went = function (req, res, next) {
  User.
    findOne({ 'username': req.params.username }).
    exec(function (err, doc) {
      if (!err || !doc) next(createError(404))

      if (err) throw err

      if (doc) {
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: 'user_went',
          doc: doc
        })
      }
    })
}
