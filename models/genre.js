// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create Genre model
const Genre = mongoose.model('Genre', new Schema({
  genre_name: { type: String, required: true },
}))

// make genre available in Node applications
module.exports = Genre