/**
 * Event model
 *
 * @author Zer Jun Eng
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Models required for population
require('../models/genre')
require('../models/user')
require('../models/story')

const Event = mongoose.model('Event', new Schema({
  name: {
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
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: Date,
  location: {
    latitude: Number,
    longitude: Number,
    address: {
      type: String,
      default: 'No location',
    },
  },
  image: {
    type: String,
    default: '/images/placeholder.webp',
  },
  genres: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre',
        default: [],
      }],
    validate: [val => val.length <= 5, 'Maximum 5 genres only'],
  },
  interested: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
  going: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
  stories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      default: [],
    }],
}))

module.exports = Event
