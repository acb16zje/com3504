/**
 * Connect to MongoDB and initialise the database with default data
 *
 * @author Zer Jun Eng
 */

'use strict'
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const DB_NAME = 'musicbee'
const URL = `mongodb://localhost:27017/${DB_NAME}`

// Models
const Comment = require('../models/comment')
const Event = require('../models/event')
const Genre = require('../models/genre')
const Image = require('../models/image')
const Story = require('../models/story')
const User = require('../models/user')

// Connect to MongoDB
mongoose.connect(URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to', URL)

  const db = mongoose.connection
  console.log(`Dropping database '${DB_NAME}'`)

  db.dropDatabase().then(async () => {
    console.log('Inserting default data...')

    const blues = await new Genre({ name: 'Blues' }).save()
    const classical = await new Genre({ name: 'Classical' }).save()
    const comedy = await new Genre({ name: 'Comedy' }).save()
    const country = await new Genre({ name: 'Country' }).save()
    const electronic = await new Genre({ name: 'Electronic' }).save()
    const folk = await new Genre({ name: 'Folk' }).save()
    const funk = await new Genre({ name: 'Funk' }).save()
    const hiphop = await new Genre({ name: 'Hiphop' }).save()
    const jazz = await new Genre({ name: 'Jazz' }).save()
    const latin = await new Genre({ name: 'Latin' }).save()
    const metal = await new Genre({ name: 'Metal' }).save()
    const pop = await new Genre({ name: 'Pop' }).save()
    const rock = await new Genre({ name: 'Rock' }).save()

    // Image data
    const gakkiImg = await new Image({
      content: Buffer.from(fs.readFileSync(
        path.join(__dirname, '../public/images/gakki.webp'),
        { encoding: 'base64' }), 'base64'),
      contentType: 'image/webp',
    }).save()

    const marioImg = await new Image({
      content: Buffer.from(fs.readFileSync(
        path.join(__dirname, '../public/images/mario.webp'),
        { encoding: 'base64' }), 'base64'),
      contentType: 'image/webp',
    }).save()

    const luigiImg = await new Image({
      content: Buffer.from(fs.readFileSync(
        path.join(__dirname, '../public/images/luigi.webp'),
        { encoding: 'base64' }), 'base64'),
      contentType: 'image/webp',
    }).save()

    // User data, NOTE: username has to follow the RegEx format in model
    const gakki = await new User({
      username: 'gakki',
      fullname: 'Aragaki Yui',
      email: 'yui-aragaki@lespros.co.jp',
      description: 'I am Gakki',
      image: `/image/${gakkiImg.id}`,
      genres: [pop.id],
    }).save()
    const mario = await new User({
      username: 'super_mario',
      fullname: 'Mario Mario',
      email: 'mario@nintendo.com',
      description: 'I am Mario',
      image: `/image/${marioImg.id}`,
      genres: [classical.id, electronic.id],
      following: [gakki.id],
    }).save()
    const luigi = await new User({
      username: 'luigi',
      fullname: 'Luigi Mario',
      email: 'luigi@nintendo.com',
      description: 'I am Luigi',
      image: `/image/${luigiImg.id}`,
      genres: [classical.id, electronic.id, pop.id],
      following: [gakki.id],
    }).save()

    // Events data
    const gakkiEvent = await new Event({
      name: 'Gakki Festival',
      description: 'Your daily heavenly days by gakki cute cute cute cute cute cute',
      organiser: gakki.id,
      image: `/image/${gakkiImg.id}`,
      location: {
        address: 'Regent Court, Sheffield, UK',
        latitude: 53.3808188,
        longitude: -1.4803254999999353,
      },
      genres: pop.id,
      going: [mario.id, luigi.id],
    }).save()
    const marioEvent = await new Event({
      name: 'Mario Festival',
      description: 'Super Mario Bros. theme song everyday',
      organiser: mario.id,
      startDate: new Date().setHours(new Date().getHours() + 3),
      endDate: new Date().setHours(new Date().getHours() + 7),
      image: `/image/${marioImg.id}`,
      location: {
        address: 'Sheffield Students\' Union, Western Bank, Sheffield, UK',
        latitude: 53.38072,
        longitude: -1.4871329999999716,
      },
      genres: [classical.id, electronic.id],
      interested: [gakki.id],
    }).save()
    const luigiEvent = await new Event({
      name: 'Luigi Festival',
      description: 'Super Luigi Bros. theme song everyday',
      organiser: luigi.id,
      endDate: new Date().setHours(new Date().getHours() + 25),
      image: `/image/${luigiImg.id}`,
      location: {
        address: 'Kroto Research Institute, Red Hill, Sheffield, UK',
        latitude: 53.3835591,
        longitude: -1.4789316999999755,
      },
      genres: [classical.id, electronic.id, pop.id],
      interested: [gakki.id],
    }).save()

    // Story data
    const gakkiStoryImage = await new Image({
      content: Buffer.from(fs.readFileSync(
        path.join(__dirname, '../public/images/gakki2.webp'),
        { encoding: 'base64' }), 'base64'),
      contentType: 'image/webp',
    }).save()

    const gakkiStory = await new Story({
      user: gakki.id,
      event: gakkiEvent.id,
      image: `/image/${gakkiStoryImage.id}`,
      caption: 'Join me at Gakki Event',
      likes: [mario.id, luigi.id],
    }).save()

    const marioStory = await new Story({
      user: mario.id,
      event: marioEvent.id,
      image: `/image/${marioImg.id}`,
      caption: 'Join me at Mario Event',
    }).save()

    const luigiStory = await new Story({
      user: luigi.id,
      event: luigiEvent.id,
      image: `/image/${luigiImg.id}`,
      caption: 'Join me at Luigi Event',
    }).save()

    // Comment data
    const gakkiCommentMario = await new Comment({
      user: gakki.id,
      story: marioStory.id,
      content: 'Mario, thank you for coming to my event!',
    }).save()

    const gakkiCommentLuigi = await new Comment({
      user: gakki.id,
      story: luigiStory.id,
      content: 'Luigi, thank you for coming to my event!',
    }).save()

    const marioCommentGakki = await new Comment({
      user: mario.id,
      story: gakkiStory.id,
      content: 'Hi Gakki, I am Mario!',
    }).save()

    const luigiCommentGakki = await new Comment({
      user: luigi.id,
      story: gakkiStory.id,
      content: 'Hi Gakki, I am Luigi!',
    }).save()

    // User: Update the events, followers, and stories details
    gakki.stories = [gakkiStory.id]
    gakki.followers = [mario.id, luigi.id]
    gakki.events = gakkiEvent.id
    gakki.interested = [marioEvent.id, luigiEvent.id]
    await gakki.save()

    mario.stories = [marioStory.id]
    mario.likes = [gakkiStory.id]
    mario.events = marioEvent.id
    mario.going = [gakkiEvent.id]
    await mario.save()

    luigi.stories = [luigiStory.id]
    luigi.likes = [gakkiStory.id]
    luigi.events = luigiEvent.id
    luigi.going = [gakkiEvent.id]
    await luigi.save()

    // Event: update the stories
    gakkiEvent.stories = [gakkiStory.id]
    await gakkiEvent.save()

    marioEvent.stories = [marioStory.id]
    await marioEvent.save()

    luigiEvent.stories = [luigiEvent.id]
    await luigiEvent.save()

    // Stories: update the comments
    gakkiStory.comments = [marioCommentGakki.id, luigiCommentGakki.id]
    await gakkiStory.save()

    marioStory.comments = [gakkiCommentMario.id]
    await marioStory.save()

    luigiStory.comments = [gakkiCommentLuigi.id]
    await luigiStory.save()

    console.log('Finished successfully, closing the connection')
    db.close()
  })
})
