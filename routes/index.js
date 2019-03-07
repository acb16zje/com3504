'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Musicbee - enjoy the sweetest moment of music',
    baseUrl: req.baseUrl
  });
});

router.get('/events', function(req, res, next) {
  res.render('events', {
    title: 'Musicbee - event',
    baseUrl: req.baseUrl
  });
});

router.get('/notifications', function(req, res, next) {
  res.render('notifications', {
    title: 'Musicbee - notifications',
    baseUrl: req.baseUrl
  });
});

module.exports = router;
