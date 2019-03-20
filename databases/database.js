/**
 * Database file for connecting to MongoDB using Mongoose
 *
 * @author Team Gakki
 */

'use strict'
const mongoose = require('mongoose')

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musicbee', {useNewUrlParser: true})
mongoose.set('useCreateIndex', true);
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
}).on('error', function(error){
  console.log('Connection error:', error)
})

mongoose.Promise = global.Promise

// Get the default connection
const db = mongoose.connection

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
