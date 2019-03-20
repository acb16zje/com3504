/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const Event = require('../models/event')
const Image = require('../models/image')

/**
 * Return the event image if valid, otherwise load a placeholder image
 *
 * @param req The request header
 * @param res The response header callback
 */
exports.get_user_profile = function (req, res) {
  // User.findOne(req.params.username).lean().exec(function (err, doc) {
  //   if (err) {
  //     res.setHeader('content-type', 'image/webp')
  //     res.send('/images/placeholder.webp')
  //   }
  //
  //   if (doc) {
  //     res.setHeader('content-type', doc.contentType)
  //     res.send(doc.content.buffer)
  //   }
  // })
}
