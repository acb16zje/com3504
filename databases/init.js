const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')

// Use connect method to connect to the server
MongoClient.connect('mongodb://localhost:27017/', {useNewUrlParser: true}).then(function (client) {
  console.log("Connected successfully to server");
  const allPromises = []
  const db = client.db('musicbee')

  db.dropDatabase().then(function() {}).catch(function() {});

  allPromises.push(db.collection('cities').insertMany([
    { city_name: 'Manchester' },
    { city_name: 'London' },
    { city_name: 'Cardiff' },
    { city_name: 'Bath' },
    { city_name: 'Nottingham' },
    { city_name: 'Sheffield' },
  ]))

  allPromises.push(db.collection('genres').insertMany([
    { genre_name: 'Jazz' },
    { genre_name: 'Pop' },
    { genre_name: 'K-pop' },
    { genre_name: 'Rock' },
    { genre_name: 'Contry' },
    { genre_name: 'Metal' },
    { genre_name: 'EDM' },
  ]))

  let userId1;

  allPromises.push(db.collection('users').insertMany([
    { username: 'jamesS', full_name: 'James Smith', email: "jamessmith@gmail.com" },
    { username: 'janeS', full_name: 'Jane Smith', email: "janesmith@gmail.com" }
  ]).then(function(result) {
    userId1 = result.ops[0]

    var newImg = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'gakki.jpg'));
    var encImg = newImg.toString('base64');
  
    allPromises.push(db.collection('events').insertOne({
      event_name: 'New Year Rave Party',
      organizer: userId1,
      photo: Buffer.from(encImg)
    }))
  }))

  Promise.all(allPromises).then(function() {
    client.close()
  })
});
