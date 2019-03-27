/**
 * Main application settings
 *
 * @author Zer Jun Eng
 */

'use strict'
const bodyParser = require('body-parser')
const compression = require('compression')
const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const expressLayouts = require('express-ejs-layouts')
const logger = require('morgan')
const mime = require('mime-types')
const passport = require('passport')
const path = require('path')

const authRouter = require('./routes/auth')
const createRouter = require('./routes/create')
const exploreRouter = require('./routes/explore')
const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.set('layout', 'partials/layout')
app.use(expressLayouts)

app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: 'musicbee pwa',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())

// Default locals to prevent undefined error
app.locals.title = 'Musicbee'
app.locals.path = ''

// Locals variable for checking login
app.use(function(req, res, next) {
  res.locals.authenticated = req.isAuthenticated()
  res.locals.username = req.isAuthenticated() ? req.user.username : ''
  res.locals.userImgSrc = req.isAuthenticated() ? req.user.image : ''
  next()
})

app.use(authRouter.router)
app.use(createRouter)
app.use(exploreRouter)
app.use(indexRouter)
app.use(userRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.title = 'Error'
  res.locals.path = '404'
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
