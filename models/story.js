// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create story schema
const story = new Schema({
  story_id: { type: Number, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId , ref: 'User' },
  photo: { data: Buffer, contentType: String },
  location: {
    longitude: Number,
    latitude: String
  },
  caption: String, 
  data: Date,
  time: { type : Date },
  likes: { type: [mongoose.Schema.Types.ObjectId] , ref: 'User' },
  comments: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Comment' }
});

const Story = mongoose.model('Story', story);

// make story available in Node applications
module.exports = Story;