// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user schema
const user = new Schema({
  user_id: { type: Number, required: true, unique: true },
  full_name: { type: String, required: true },
  user_name: { type: String, required: true, maxlength: 30 },
  email: { type: String, required: true },
  description: { type: String },
  fav_city: { type: [mongoose.Schema.Types.ObjectId] , ref: 'City' , default : [] },
  fav_genre: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Genre' , default : [] },
  stories: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Story' , default : [] },
  events: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Event' }, 
  interested_events: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Event' }, 
  going_events: { type: [mongoose.Schema.Types.ObjectId] , ref: 'Event' }, 
  followers: { type: [mongoose.Schema.Types.ObjectId] , ref: 'User' , default : [] },
  following: { type: [mongoose.Schema.Types.ObjectId] , ref: 'User' , default : [] }
});


const User = mongoose.model('User', user);

// make user available in Node applications
module.exports = User;