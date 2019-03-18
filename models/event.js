// grab the things we need
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create Event model
const Event = mongoose.model('Event', new Schema({
  event_id: {
    type: Number,
    required: true,
    unique: true,
  },
  event_name: {
    type: String,
    required: true,
    maxlength: 64,
  },
  organiser: {
    type: String,
    required: true,
  },
  location: {
    longitude: Number,
    latitude: Number,
  },
  datetime: {
    type: Date,
    required: true,
    default: Date.now
  },
  genre: {
    type: [Schema.Types.ObjectId],
    ref: 'Genre',
  },
  description: {
    type: String,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  interested: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  going: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
}))

// make event available in Node applications
module.exports = Event