const playersRouter = require('express').Router()
const Player = require('../models/player')

playersRouter.get('/', async (request, response) => {
  const players = await Player.find({})
  response.json(players)
})

module.exports = playersRouter