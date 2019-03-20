/**
 * Event model
 *
 * @author Zer Jun Eng
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Models required for population
require('../models/genre')
require('../models/image')
require('../models/user')

const Event = mongoose.model('Event', new Schema({
  event_name: {
    type: String,
    required: [true, 'Event name is required'],
    maxlength: [64, 'Event name must be shorter than 64 characters'],
  },
  description: {
    type: String,
  },
  organiser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event must have an organiser'],
  },
  datetime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    default: 'No location',
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
  },
  genre: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
    }],
  interested: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  going: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
}))

module.exports = Event
