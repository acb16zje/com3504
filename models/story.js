// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create Story model
const Story = mongoose.model('Story', new Schema({
  story_id: {
    type: Number,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  location: {
    longitude: Number,
    latitude: Number,
  },
  caption: String,
  datetime: {
    type: Date,
    default: Date.now,
    required: true
  },
  likes: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: 'Comment',
  },
}))

// make story available in Node applications
module.exports = Story