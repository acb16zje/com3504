// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create event schema
const event = new Schema({
  event_id: { type: Number, required: true, unique: true },
  event_name: { type: String, required: true, maxlength: 64 },
  organiser: { type: String, required: true },
  location: {
    longitude: String,
    latitude: String
  },
  data: { type: Date },
  time: { type: Date },
  genre: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Genre' },
  description: { type: String, required: true }, 
  photo: { data: Buffer, contentType: String },
  interested: { type: [mongoose.Schema.Types.ObjectId] , ref: 'User' },
  going: { type: [mongoose.Schema.Types.ObjectId] , ref: 'User' }
});

const Event = mongoose.model('Event', event);

// make event available in Node applications
module.exports = Event;