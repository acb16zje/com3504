// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const comment = new Schema({
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
})

const Comment = mongoose.model('Comment', comment)

module.exports = Comment
