/**
 * Controller for stories
 *
 * @author Zer Jun Eng
 */

'use strict'
const Story = require('../models/story')

/**
 * GET all the data of the user
 *
 * @param {object} req The request header
 * @param {object} res The response header
 */
exports.getStoryData = function (req, res) {
  const storyQuery = Story.findById(req.params.id, '-__v')
  storyQuery.populate('user', '-_id username')
  storyQuery.populate('event', '_id name').lean()

  storyQuery.then(story => {
    // 404 error if story is not found
    if (story) {
      res.json(story)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
