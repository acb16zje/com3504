/**
 * Connect to MongoDB and initialise the database with default data
 *
 * @author Zer Jun Eng
 */

'use strict'
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const path = require('path')

const URL = 'mongodb://localhost:27017/'
const DB_NAME = 'musicbee'

// Models
const Event = require('../models/event')
const Genre = require('../models/genre')
const Image = require('../models/image')
const User = require('../models/user')

// Connect to the MongoDB server
MongoClient.connect(URL, { useNewUrlParser: true }).then((client) => {
  console.log('Connected successfully to server')
  const allPromises = []
  const db = client.db(DB_NAME)

  db.dropDatabase().
    then(() => {
      console.log(`Dropped database '${DB_NAME}'`)
      console.log('Inserting default data...')
    }).
    catch((err) => console.log(err))

  const eventsCollection = db.collection('events')
  const genresCollection = db.collection('genres')
  const imagesCollection = db.collection('images')
  const usersCollection = db.collection('users')

  // Genre data
  allPromises.push(genresCollection.insertMany([
    new Genre({ genre_name: 'Classical' }),
    new Genre({ genre_name: 'Country' }),
    new Genre({ genre_name: 'Electronic' }),
    new Genre({ genre_name: 'Funk' }),
    new Genre({ genre_name: 'Jazz' }),
    new Genre({ genre_name: 'Metal' }),
    new Genre({ genre_name: 'Pop' }),
    new Genre({ genre_name: 'Rock' }),
  ]).then((genresRes) => {
    // Image data
    const gakki = fs.readFileSync(
      path.join(__dirname, '../public/images/gakki.webp'),
      { encoding: 'base64' })

    const mario = fs.readFileSync(
      path.join(__dirname, '../public/images/mario.webp'),
      { encoding: 'base64' })

    const luigi = fs.readFileSync(
      path.join(__dirname, '../public/images/luigi.webp'),
      { encoding: 'base64' })

    allPromises.push(imagesCollection.insertMany([
      new Image({
        content: Buffer.from(gakki, 'base64'),
        contentType: 'image/webp',
      }),
      new Image({
        content: Buffer.from(mario, 'base64'),
        contentType: 'image/webp',
      }),
      new Image({
        content: Buffer.from(luigi, 'base64'),
        contentType: 'image/webp',
      }),
    ]).then((imagesRes) => {
      const gakki = new User({
        username: 'gakki',
        fullname: 'Aragaki Yui',
        email: 'yui-aragaki@lespros.co.jp',
        description: 'I am Gakki',
        image: imagesRes.ops[0]._id,
        genres: genresRes.ops[6]._id,
      })

      const luigi = new User({
        username: 'luigi',
        fullname: 'Luigi Mario',
        email: 'luigi@nintendo.com',
        description: 'I am Luigi',
        image: imagesRes.ops[2]._id,
        following: [gakki],
      })

      const mario = new User({
        username: 'super_mario',
        fullname: 'Mario Mario',
        email: 'mario@nintendo.com',
        description: 'I am Mario',
        image: imagesRes.ops[1]._id,
        following: [gakki],
      })

      gakki.followers.push(luigi, mario)

      // User data
      allPromises.push(usersCollection.insertMany([gakki, luigi, mario]).
        then((usersRes) => {
          // Event data
          allPromises.push(eventsCollection.insertMany([
            new Event({
              event_name: 'Gakki Festival',
              description: 'Your daily heavenly days by gakki cute cute cute cute cute cutee',
              organiser: usersRes.ops[0]._id,
              genre: genresRes.ops[6]._id,
              image: imagesRes.ops[0]._id,
            }),
            new Event({
              event_name: 'Mario Festival',
              description: 'Super Mario Bros. theme song everyday',
              organiser: usersRes.ops[2]._id,
              genre: [genresRes.ops[0]._id, genresRes.ops[2]._id],
              image: imagesRes.ops[1]._id,
              end_datetime: new Date().setHours(new Date().getHours() + 3),
            }),
          ]).then((eventRes) => {
            // Give the users the event they organised
            usersCollection.updateOne({'username': usersRes.ops[0].username}, {$set: {'events': [eventRes.ops[0]._id]}})
            usersCollection.updateOne({'username': usersRes.ops[2].username}, {$set: {'events': [eventRes.ops[1]._id]}})

            Promise.all(allPromises).
              then(() => {
                console.log('Finished successfully, closing the server')
                client.close()
              }).
              catch((err) => {
                console.log(err)
                client.close()
              })
          }))
        }))
    }))
  }))
})
