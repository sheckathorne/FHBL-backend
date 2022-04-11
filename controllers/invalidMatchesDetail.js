const invalidMatchesDetailRouter = require('express').Router()
const Match = require('../models/match')

invalidMatchesDetailRouter.get('/', async (request, response) => {
  const matchIds = request.query.matchIds
  const matches = await Match.find({}).where('matchId').in(matchIds)
  response.json(matches)
})

module.exports = invalidMatchesDetailRouter