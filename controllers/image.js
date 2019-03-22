/**
 * Controller for images
 *
 * @author Zer Jun Eng
 */

'use strict'
const Image = require('../models/image')

/**
 * Return the image if valid, otherwise load a placeholder image
 *
 * @param {object} req The request header
 * @param {object} res The response header
 */
exports.get_image = function (req, res) {
  Image.findById(req.params.id).lean().exec(function (err, doc) {
    if (err) {
      res.setHeader('content-type', 'image/webp')
      res.send('/images/placeholder.webp')
    }

    if (doc) {
      res.setHeader('content-type', doc.contentType)
      res.send(doc.content.buffer)
    }
  })
}
