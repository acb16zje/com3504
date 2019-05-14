/**
 * Comment model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Models required for population
require('../models/user')
require('../models/story')

const Comment = mongoose.model('Comment', new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}))

module.exports = Comment
