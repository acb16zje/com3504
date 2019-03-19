const City = require('../models/city')

exports.insert = function (req, res) {
  const cityData = req.body
  if (cityData == null) {
    res.status(403).send('No data sent!')
  }
  try {
    const city = new City({
      city_name: 'Manchester'
    })
    city.save(function (err, results) {
      console.log(results._id)
      if (err)
        res.status(500).send('Invalid data!')
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(city))
    })
  } catch (e) {
    res.status(500).send('error ' + e)
  }
}