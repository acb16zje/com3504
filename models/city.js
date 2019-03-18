// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create city schema
const city = new Schema({
  name: { type: String, required: true }
});

const City = mongoose.model('City', city);

// make city available in Node applications
module.exports = City;