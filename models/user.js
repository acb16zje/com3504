// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create User model
const User = mongoose.model('User', new Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    maxlength: 30,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  fav_city: {
    type: [Schema.Types.ObjectId],
    ref: 'City',
    default: [],
  },
  fav_genre: {
    type: [Schema.Types.ObjectId],
    ref: 'Genre',
    default: [],
  },
  stories: {
    type: [Schema.Types.ObjectId],
    ref: 'Story',
    default: [],
  },
  events: {
    type: [Schema.Types.ObjectId],
    ref: 'Event',
    default: [],
  },
  interested_events: {
    type: [Schema.Types.ObjectId],
    ref: 'Event',
    default: [],
  },
  going_events: {
    type: [Schema.Types.ObjectId],
    ref: 'Event',
    default: [],
  },
  followers: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  following: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
}))

// make user available in Node applications
module.exports = User