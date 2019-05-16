/**
 * Controller for stories
 *
 * @author Zer Jun Eng
 */

'use strict'
const Comment = require('../models/comment')
const Event = require('../models/event')
const User = require('../models/user')
const Story = require('../models/story')
const imageController = require('../controllers/image')

/**
 * GET all the data of a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getStoryData = (req, res) => {
  const storyQuery = Story.findById(req.params.id, '-__v')
  storyQuery.populate('user', '-_id username')
  storyQuery.populate('event', '_id name')
  storyQuery.populate('likes', '-_id username')
  storyQuery.populate({
    path: 'comments',
    populate: [
      { path: 'user', select: '-_id username' },
    ],
    select: '-_id -story',
    options: { sort: { date: 1 } },
  }).lean()

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

/**
 * GET all stories related to the user (follow, created)
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.getStoryFeed = (req, res) => {
  const userQuery = User.findById(req.user.id)

  userQuery.then(user => {
    if (user) {
      const storyQuery = Story.find()
      storyQuery.populate('event', '_id name')
      storyQuery.populate('likes', '-_id username')
      storyQuery.populate({
        path: 'comments',
        populate: [
          { path: 'user', select: '-_id username' },
        ],
        select: '-_id -story',
        options: { sort: { date: 1 } },
      })
      storyQuery.populate({
        path: 'user',
        match: { $or: [{ followers: req.user.id }, { _id: req.user.id }] },
        select: '_id username image',
      }).sort({ date: -1 }).lean()

      storyQuery.
        then(stories => res.json(stories.filter(story => story.user))).
        catch(err => {
          console.log(err)
          res.sendStatus(500)
        })
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })

}

/**
 * POST create a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.createStory = async (req, res) => {
  const json = req.body
  const userQuery = User.findById(req.user.id)
  const eventQuery = Event.findById(json.event)
  const storyImage = await imageController.createImage(json.image)

  userQuery.then(user => {
    if (user) {
      eventQuery.then(async event => {
        if (event) {
          const story = await new Story({
            user: user.id,
            event: json.event,
            image: storyImage ? `/image/${storyImage.id}` : undefined,
            caption: json.caption,
          }).save().catch(err => {
            console.log(err)
            res.status(400).send(err)
          })

          if (story) {
            // Add the created story to user and event
            await user.stories.push(story.id)
            await event.stories.push(story.id)
            await user.save()
            await event.save()
            res.sendStatus(200)
          } else {
            res.sendStatus(500)
          }
        } else {
          // Bad request
          res.sendStatus(400)
        }
      }).catch(err => {
        console.log(err)
        res.sendStatus(500)
      })
    } else {
      res.sendStatus(401)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST update a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.updateStory = (req, res) => {
  const json = req.body
  const storyQuery = Story.findById(json.id)

  storyQuery.then(async story => {
    if (story) {
      story.caption = json.caption
      await story.save()
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    // Bad request
    console.log(err)
    res.status(400).send(err)
  })
}

/**
 * POST delete a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.deleteStory = (req, res) => {
  const storyQuery = Story.deleteOne({ _id: req.body.id })

  storyQuery.
    then(() => res.sendStatus(200)).
    catch(err => {
      console.log(err)
      res.sendStatus(500)
    })
}

/**
 * POST like a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.likeStory = (req, res) => {
  const userQuery = User.findById(req.user.id)

  userQuery.then(user => {
    if (user) {
      const storyQuery = Story.findById(req.body.id)

      storyQuery.then(async story => {
        if (story) {
          if (user.likes.indexOf(story.id) > -1 &&
            story.likes.indexOf(user.id) > -1) {

            user.likes.pull({ _id: story.id })
            story.likes.pull({ _id: user.id })
          } else {
            user.likes.push(story.id)
            story.likes.push(user.id)
          }

          await user.save()
          await story.save()
          res.sendStatus(200)
        } else {
          res.sendStatus(404)
        }
      }).catch(err => {
        console.log(err)
        res.sendStatus(500)
      })
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}

/**
 * POST comment a story
 *
 * @param {Object} req The request header
 * @param {Object} res The response header
 */
exports.commentStory = (req, res) => {
  const storyQuery = Story.findById(req.body.id)

  storyQuery.then(async story => {
    if (story) {
      const comment = await new Comment({
        user: req.user.id,
        story: story.id,
        content: req.body.content,
      }).save().catch(err => {
        // Bad request
        console.log(err)
        res.status(400).send(err)
      })

      if (comment) {
        // Add the created comment to story
        await story.comments.push(comment.id)
        await story.save()
        res.sendStatus(200)
      } else {
        res.sendStatus(500)
      }
    } else {
      res.sendStatus(404)
    }
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
}
