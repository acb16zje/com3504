/**
 * Routes handler for explore events page
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

/* GET explore page */
router.get('/explore', function (req, res, next) {
  res.render('explore', {
    title: 'Musicbee - explore',
    path: req.path.toLowerCase(),
  })
})

module.exports = router
