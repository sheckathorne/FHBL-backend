const matchesRouter = require('express').Router()
const Match = require('../models/match')

matchesRouter.get('/', async (_request, response) => {
  const matches = await Match.find({})
  response.json(matches)
})

matchesRouter.get('/:matchId', async (request, response) => {
  const matchId = request.params.matchId.toString()
  const match = await Match.find({ matchId })
  response.json(match)
})


module.exports = matchesRouter