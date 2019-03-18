// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create City model
const City = mongoose.model('City', new Schema({
  city_name: { type: String, required: true }
}))

// make city available in Node applications
module.exports = City