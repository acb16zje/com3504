/**
 * Genre model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Genre = mongoose.model('Genre', new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
}))

module.exports = Genre
