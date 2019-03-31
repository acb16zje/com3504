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
 * @param req The request header
 * @param res The response header callback
 */
exports.getImage = function (req, res) {
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

/**
 * Saves the image binary data into MongoDB
 *
 * @param {string} data The data URI of the image in base64
 * @returns {Promise<*>} An Image object if promise resolves
 */
exports.createImage = async function (data) {
  try {
    // These will be empty if no image is submitted, hence error
    const content = data.replace(/^data:image\/.*;base64,/, '')
    const contentType = data.match(/image\/.*;/)[0].slice(0, -1)

    return await new Image({
      content: Buffer.from(content, 'base64'),
      contentType: contentType
    }).save()
  } catch (e) {}
}
