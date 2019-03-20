/**
 * Main application settings
 *
 * @author Zer Jun Eng
 */

'use strict'
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const logger = require('morgan')
const mime = require('mime-types')
const path = require('path')

const createRouter = require('./routes/create')
const exploreRouter = require('./routes/explore')
const imageRouter = require('./routes/image')
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
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(createRouter)
app.use(exploreRouter)
app.use(imageRouter)
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
