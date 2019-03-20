/**
 * Controller for events (explore page included)
 *
 * @author Zer Jun Eng
 */

'use strict'
const Event = require('../models/event')
const Image = require('../models/image')
const User = require('../models/user')

/**
 * Return the event image if valid, otherwise load a placeholder image
 *
 * @param req The request header
 * @param res The response header callback
 */
exports.get_user_profile = function (req, res) {
  User.
    findOne({ 'username': req.params.username }).
    populate('image').
    exec(function (err, doc) {
      if (err) res.send('error')

      if (doc) {
        console.log(JSON.stringify(doc))
        res.render('user', {
          title: `${doc.fullname} (${doc.username}) - Musicbee`,
          path: req.path.toLowerCase(),
          doc: doc
        })
      } else {
        res.send('not found')
      }
    })
}
