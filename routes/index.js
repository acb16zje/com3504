'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Musicbee - enjoy the sweetest moment of music',
    originalUrl: req.originalUrl
  });
});

router.get('/notifications', function(req, res, next) {
  res.render('notifications', {
    title: 'Musicbee - notifications',
    originalUrl: req.originalUrl
  });
});

module.exports = router;
