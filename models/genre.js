/**
 * Genre model
 *
 * @author Team Gakki
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Genre = mongoose.model('Genre', new Schema({
  genre_name: {
    type: String,
    required: [true, 'Genre must have a name']
  },
}))

module.exports = Genre
