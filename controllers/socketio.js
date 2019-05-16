/**
 * Controller for Socket.io
 *
 * @author Zer Jun Eng
 */

'use strict'
const Comment = require('../models/comment')
const Event = require('../models/event')
const User = require('../models/user')

/**
 * Socket.io server side initialisation
 *
 * @param io The io instance from bin/www
 */
exports.init = function (io) {
  io.on('connection', (socket) => {
    /* Story-related */
    socket.on('join story room', storyID => socket.join(storyID))

    socket.on('leave story room', storyID => socket.leave(storyID))

    socket.on('new comment', (storyID, username, comment) => {
      io.in(storyID).emit('new comment', username, comment)
    })

    /* Event-related */
    socket.on('join event room', eventID => {
      console.log('joined event room')
      socket.join(eventID)
    })

    socket.on('new event story', (eventID, story) => {
      io.in(eventID).emit('new event story', story)
    })

    socket.on('new event comment', (eventID, comment) => {
      io.in(eventID).emit('new event comment', comment)
    })
  });
}
