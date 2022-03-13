const teamRankingsRouter = require('express').Router()
const TeamRanking = require('../models/teamRanking')

teamRankingsRouter.get('/', async (request, response) => {
  const teamRankings = await TeamRanking.find({})
  response.json(teamRankings)
})

module.exports = teamRankingsRouter