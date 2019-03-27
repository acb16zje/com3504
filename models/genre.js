/**
 * Genre model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Genre = mongoose.model('Genre', new Schema({
  genre_name: {
    type: String,
    required: true
  },
}).index({ genre_name: 1 }, { unique: true }))

module.exports = Genre
