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

    User.findOne({ email: profile.email }, async function (err, user) {
      if (err) {
        return callback(null, profile)
      }

      // Check if user is already registered or not
      if (user) {
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
    })
  },
))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

/* Passport will redirect to Google login */
router.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

/* Clears the user session to logout */
router.get('/logout', function (req, res) {
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
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next middleware function
 */
function checkAuth (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.render('login')
  }
}

module.exports = {
  router: router,
  checkAuth: checkAuth,
}
