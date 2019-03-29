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
const Event = require('../models/event')
const Genre = require('../models/genre')
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

    const classical = await new Genre({ name: 'Classical' }).save()
    const country = await new Genre({ name: 'Country' }).save()
    const electronic = await new Genre({ name: 'Electronic' }).save()
    const funk = await new Genre({ name: 'Funk' }).save()
    const jazz = await new Genre({ name: 'Jazz' }).save()
    const metal = await new Genre({ name: 'Metal' }).save()
    const pop = await new Genre({ name: 'Pop' }).save()
    const rock = await new Genre({ name: 'Rock' }).save()

    // Image data
    const gakkiImg = `data:image/webp;base64, ${fs.readFileSync(
      path.join(__dirname, '../public/images/gakki.webp'),
      { encoding: 'base64' })}`

    const marioImg = `data:image/webp;base64, ${fs.readFileSync(
      path.join(__dirname, '../public/images/mario.webp'),
      { encoding: 'base64' })}`

    const luigiImg = `data:image/webp;base64, ${fs.readFileSync(
      path.join(__dirname, '../public/images/luigi.webp'),
      { encoding: 'base64' })}`

    // User data, NOTE: username has to follow the RegEx format in model
    const gakki = await new User({
      username: 'gakki',
      fullname: 'Aragaki Yui',
      email: 'yui-aragaki@lespros.co.jp',
      description: 'I am Gakki',
      image: gakkiImg,
      genres: [pop.id],
    }).save()
    const mario = await new User({
      username: 'super_mario',
      fullname: 'Mario Mario',
      email: 'mario@nintendo.com',
      description: 'I am Mario',
      image: marioImg,
      genres: [classical.id, electronic.id],
      following: [gakki.id],
    }).save()
    const luigi = await new User({
      username: 'luigi',
      fullname: 'Luigi Mario',
      email: 'luigi@nintendo.com',
      description: 'I am Luigi',
      image: luigiImg,
      genres: [classical.id, electronic.id, pop.id],
      following: [gakki.id],
    }).save()

    // Events data
    const gakkiEvent = await new Event({
      event_name: 'Gakki Festival',
      description: 'Your daily heavenly days by gakki cute cute cute cute cute cutee',
      organiser: gakki.id,
      image: gakkiImg,
      genres: pop.id,
      going: [mario.id, luigi.id]
    }).save()
    const marioEvent = await new Event({
      event_name: 'Mario Festival',
      description: 'Super Mario Bros. theme song everyday',
      organiser: mario.id,
      start_datetime: new Date().setHours(new Date().getHours() + 3),
      end_datetime: new Date().setHours(new Date().getHours() + 7),
      image: marioImg,
      genres: [classical.id, electronic.id],
      interested: [gakki.id]
    }).save()
    const luigiEvent = await new Event({
      event_name: 'Luigi Festival',
      description: 'Super Luigi Bros. theme song everyday',
      organiser: luigi.id,
      end_datetime: new Date().setHours(new Date().getHours() + 25),
      image: luigiImg,
      genres: [classical.id, electronic.id, pop.id],
      interested: [gakki.id]
    }).save()

    // Update the users followers and events details
    gakki.followers = [mario.id, luigi.id]
    gakki.events = gakkiEvent.id
    gakki.interested = [marioEvent.id, luigiEvent.id]
    await gakki.save()

    mario.events = marioEvent.id
    mario.going = [gakkiEvent.id]
    await mario.save()

    luigi.events = luigiEvent.id
    luigi.going = [gakkiEvent.id]
    await luigi.save()

    console.log('Finished successfully, closing the connection')
    db.close()
  })
})
