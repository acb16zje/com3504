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
    socket.on('new comment', (username, comment, storyID) => {
      io.in(storyID).emit('new comment', username, comment)
    })

    socket.on('join story room', storyID => {
      console.log(`joined ${storyID}`)
      socket.join(storyID)
    })

    socket.on('leave story room', storyID => {
      console.log(`leaved ${storyID}`)
      socket.leave(storyID)
    })

    socket.on('new story', story => {

    })
  });
}
