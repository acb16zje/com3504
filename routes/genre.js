/**
 * Routes handler for Genre
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

const genreController = require('../controllers/genre')

/* AJAX GET genres list */
router.get('/api/genre', genreController.index)

module.exports = router
