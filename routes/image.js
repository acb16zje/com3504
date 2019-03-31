/**
 * Routes handler for getting images
 *
 * @author Zer Jun Eng
 */

'use strict'
const express = require('express')
const router = express.Router()

const imageController = require('../controllers/image')

/* GET image  */
router.get('/image/:id', imageController.getImage)

module.exports = router
