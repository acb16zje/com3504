'use strict';
/**
 * Routes handler for explore events page
 *
 * @author Zer Jun Eng
 */
const express = require('express');
const router = express.Router();

/* GET explore page */
router.get('/', function(req, res, next) {
  res.render('explore', {
    title: 'Musicbee - explore',
    originalUrl: req.originalUrl,
  });
});

module.exports = router;
