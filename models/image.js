/**
 * Model for image file
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Image = mongoose.model('Image', new Schema({
  content: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
}))

module.exports = Image
