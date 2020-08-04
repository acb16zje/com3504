'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Musicbee - enjoy the sweetest moment of music',
    path: req.path
  });
});

module.exports = router;
