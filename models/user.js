/**
 * User model
 *
 * @author Team Gakki
 */

'use strict'
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Schema = mongoose.Schema

// Models required for population
require('../models/event')
require('../models/genre')
const Image = require('../models/image')
require('../models/story')

const defaultProfileImg = new Image({
  content: fs.readFileSync(
    path.join(__dirname, '../public/images/default.webp'),
    { encoding: 'base64' }),
  contentType: 'image/webp',
})

const user = new Schema({
  username: {
    type: String,
    maxlength: [30, 'Username must be shorter than 30 characters'],
    match: [
      /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/ig,
      'Username can only use letters, numbers, underscores and periods,' +
      'and must start with a letter or number'],
    required: [true, 'Username is required'],
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter an email address'],
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    default: defaultProfileImg,
  },
  fav_genre: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
      default: [],
    }],
  stories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      default: [],
    }],
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: [],
    }],
  interested_events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: [],
    }],
  going_events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event', default: [],
    }],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
})

user.index({ username: 1, email: 1 }, { unique: true })

const User = mongoose.model('User', user)

module.exports = User
