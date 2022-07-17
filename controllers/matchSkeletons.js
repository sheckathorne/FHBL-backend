const matchSkeletonsRouter = require('express').Router()
const { response } = require('express')
const Match = require('../models/match')

matchSkeletonsRouter.get('/', async (_req, res) => {
  const matches = await Match.find({}).select('matchId timestamp matchDate matchDateString clubs.clubId clubs.data.goals')
  res.json(matches)
})

matchSkeletonsRouter.get('/timestamps', async (req, res) => {
  const startTimestamp = parseInt(req.query.startTimestamp)
  const endTimestamp = parseInt(req.query.endTimestamp)
  const matches = await Match
    .find({timestamp: { $gt: startTimestamp, $lt: endTimestamp }})
    .select('matchId timestamp matchDate matchDateString clubs.clubId clubs.data.goals')
  res.json(matches)
})

module.exports = matchSkeletonsRouter