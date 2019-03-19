// Import the mongoose module
const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectID

// connect to mongoose mongodb
mongoose.connect('mongodb://localhost:27017/musicbee', {useNewUrlParser: true})
mongoose.connection.once('open', function(){
  console.log('Connected to MongoDB')
}).on('error', function(error){
  console.log('Connection error:', error)
})

mongoose.Promise = global.Promise
//Get the default connection
const db = mongoose.connection

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))