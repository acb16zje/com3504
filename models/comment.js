// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create Comment model
const Comment = mongoose.model('Comment', new Schema({
    comment_id: {
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
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
  }),
)

// make comment available in Node applications
module.exports = Comment