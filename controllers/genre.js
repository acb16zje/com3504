const Genre = require('../models/genre')

exports.insert = function (req, res) {
  const genreData = req.body;
  if (genreData == null) {
    res.status(403).send('No data sent!')
  }
  try {
    const genre = new Genre({
      genre_name: genreData.genreName
    });
    genre.save(function (err, results) {
      console.log(results._id);
      if (err)
        res.status(500).send('Invalid data!');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(genre));
    });
  } catch (e) {
    res.status(500).send('error ' + e);
  }
}