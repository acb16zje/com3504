/**
 * Story model
 *
 * @author Team Gakki
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Story = mongoose.model('Story', new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
  },
  location: {
    type: String,
    default: 'No location',
  },
  caption: String,
  datetime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }],
}))

module.exports = Story
