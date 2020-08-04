/**
 * User model
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Schema = mongoose.Schema

// Models required for population
require('../models/event')
require('../models/genre')
require('../models/story')

const defaultProfileImg = `data:image/webp;base64, ${fs.readFileSync(
  path.join(__dirname, '../public/images/default.webp'),
  { encoding: 'base64' })}`

const user = new Schema({
  username: {
    type: String,
    maxlength: [30, 'Username must be shorter than 30 characters'],
    match: [
      /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i,
      'Username can only use letters, numbers, underscores and periods,' +
      'and must start with a letter or number'],
    required: [true, 'Username is required'],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    maxlength: [150, 'Description must be under 150 characters'],
    default: '',
  },
  image: {
    type: String,
    default: defaultProfileImg,
  },
  genres: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre',
        default: [],
      }],
    validate: [val => val.length <= 5, 'Only 5 maximum favourite genres allowed'],
  },
  stories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      default: [],
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
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: [],
    }],
  interested: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: [],
    }],
  going: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: [],
    }],
})

user.index({ username: 1, email: 1 }, { unique: true })

const User = mongoose.model('User', user)

module.exports = User
