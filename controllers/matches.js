const matchesRouter = require('express').Router()
const Match = require('../models/match')

matchesRouter.get('/', async (request, response) => {
  const matches = await Match.find({})
  response.json(matches)
})

module.exports = matchesRouter