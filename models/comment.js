// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create comment schema
const comment = new Schema({
  comment_id: { type: Number, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId , ref: 'User' },
  story: { type: mongoose.Schema.Types.ObjectId , ref: 'Story' },
  content: { type: String }
});

const Comment = mongoose.model('Comment', comment);

// make comment available in Node applications
module.exports = Comment;