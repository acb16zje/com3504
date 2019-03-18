//Import the mongoose module
const mongoose = require('mongoose');


const folder = './models/';
const fs = require('fs');

fs.readdirSync(folder).forEach(file => {
  const file_name = file.split('.')[0];
  //Set up default mongoose connection
  const mongoDB = 'mongodb://localhost:27017/' + file_name;
  console.log(mongoDB);
  mongoose.connect(mongoDB, { useNewUrlParser: true });
  // Get Mongoose to use the global promise library
  mongoose.Promise = global.Promise;
  //Get the default connection
  const db = mongoose.connection;

  //Bind connection to error event (to get notification of connection errors)
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
});