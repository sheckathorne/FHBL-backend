const statAveragesRouter = require('express').Router()
const StatAverage = require('../models/statAverage')

statAveragesRouter.get('/', async (_req, res) => {
  const statAverages = await StatAverage.find({})
  res.json(statAverages)
})

module.exports = statAveragesRouter