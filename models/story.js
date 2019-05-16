/**
 * Story model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Models required for population
require('../models/comment')
require('../models/event')
require('../models/user')

const Story = mongoose.model('Story', new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  image: {
    type: String,
  },
  caption: {
    type: String,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: []
    }],
}))

module.exports = Story
