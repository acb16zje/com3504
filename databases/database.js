/**
 * Database file for connecting to MongoDB using Mongoose
 *
 * @author Team Gakki
 */

'use strict'
const mongoose = require('mongoose')

const DB_NAME = 'musicbee'
const URL = `mongodb://localhost:27017/${DB_NAME}`

// Connect to MongoDB
mongoose.connect(URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to', URL)
}).catch(err => console.log(err))
