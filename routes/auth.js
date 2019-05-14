/**
 * Routes handler for authentication
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const passport = require('passport')
const Strategy = require('passport-google-oauth20').Strategy
const router = express.Router()

const User = require('../models/user')

passport.use(new Strategy({
    clientID: '815049044628-gvd9328e7jjslg44s904lbgvkq69kb1a.apps.googleusercontent.com',
    clientSecret: 'q5c-VEgrbcjBQYcchNjA6ii3',
    callbackURL: 'https://localhost:3000/auth/google/callback',
  },
  function (accessToken, refreshToken, profile, callback) {
    profile = profile._json

    const userQuery = User.findOne({ email: profile.email })

    userQuery.then(user => {
      // Check if user is already registered or not
      if (user) {
        // Update the profile picture if it isn't the same
        if (user.image !== profile.picture) {
          user.image = profile.picture
          user.save().then(() => {
            return callback(null, user)
          })
        }

        return callback(null, user)
      } else {
        user = new User({
          username: profile.email.match(/^([^@]*)@/)[1],
          email: profile.email,
          fullname: profile.name,
          image: profile.picture,
        })

        user.save().then(() => {
          return callback(null, user)
        })
      }
    }).catch(err => callback(null, user))
  },
))

// Determines which data of the user should be stored in the session
passport.serializeUser((user, cb) => cb(null, user))

// Determines which data to be returned in req.user
passport.deserializeUser((user, cb) => {
  // Reflect the changes immediately after username changes
  User.findOne({ email: user.email }, function (err, user) {
    cb(null, user)
  })
})

/* Passport will redirect to Google login */
router.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

/* Clears the user session to logout */
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

/* Callback from Google login */
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
)

/**
 * If the user is not logged in, redirect him to login page
 *
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {function} next The next middleware function
 */
function checkAuth (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.render('login')
  }
}

/**
 * If the user is not logged in, response 401 Unauthorized
 *
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {function} next The next middleware function
 */
function checkAuthAPI (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.sendStatus(401)
  }
}

module.exports = {
  router: router,
  checkAuth: checkAuth,
  checkAuthAPI: checkAuthAPI,
}
