'use strict';
const express = require('express');
const router = express.Router();

/* GET create story page. */
router.get('/', function(req, res, next) {
  res.render('create_story', {
    title: 'Musicbee - create story',
    originalUrl: req.originalUrl
  });
});

/* GET create event page. */
router.get('/event', function(req, res, next) {
  res.render('create_event', {
    title: 'Musicbee - create event',
    originalUrl: req.originalUrl
  });
});

module.exports = router;
