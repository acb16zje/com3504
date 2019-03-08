'use strict';
const express = require('express');
const router = express.Router();

/* GET events page. */
router.get('/', function(req, res, next) {
  res.render('events', {
    title: 'Musicbee - event',
    originalUrl: req.originalUrl
  });
});

module.exports = router;
