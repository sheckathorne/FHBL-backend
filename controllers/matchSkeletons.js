const matchSkeletonsRouter = require('express').Router()
const Match = require('../models/match')

matchSkeletonsRouter.get('/', async (_request, response) => {
  const matches = await Match.find({}).select('matchId timestamp matchDate matchDateString clubs.clubId clubs.data.goals')
  response.json(matches)
})

module.exports = matchSkeletonsRouter