// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create genre schema
const genre = new Schema({
  genre_name: { type: String, required: true }
});

const Genre = mongoose.model('Genre', genre);

// make genre available in Node applications
module.exports = Genre;