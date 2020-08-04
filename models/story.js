/**
 * Story model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  caption: String,
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
