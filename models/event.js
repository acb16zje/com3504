/**
 * Event model
 *
 * @author Zer Jun Eng
 */
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Schema = mongoose.Schema

// Models required for population
require('../models/genre')
require('../models/user')

const defaultEventImg = `data:image/webp;base64, ${fs.readFileSync(
  path.join(__dirname, '../public/images/default.webp'),
  { encoding: 'base64' })}`

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
  start_datetime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  end_datetime: Date,
  location: {
    latitude: Number,
    longitude: Number,
    address: {
      type: String,
      default: 'No location',
    }
  },
  image: {
    type: String,
    default: defaultEventImg
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
      default: []
    }],
  going: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
}))

module.exports = Event
