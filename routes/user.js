'use strict';
const express = require('express');
const router = express.Router();

/* GET user profile. */
router.get('/', function(req, res, next) {
  res.render('user', {
    title: 'My profile name',
    baseUrl: req.baseUrl,
  });
});
module.exports = router;
