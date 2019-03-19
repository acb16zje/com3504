// Import the mongoose module
const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectID

//Set up default mongoose connection
const mongoDB = 'mongodb://localhost:27017/musicbee'

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise

mongoose.connect(mongoDB, { useNewUrlParser: true })

//Get the default connection
const db = mongoose.connection


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))