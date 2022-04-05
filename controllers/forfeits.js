const forfeitsRouter = require('express').Router()
const Forfeit = require('../models/forfeit')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

forfeitsRouter.get('/', async (_request, response) => {
  const forfeits = await Forfeit.find({})
  response.json(forfeits)
})

forfeitsRouter.post('/',(request, response, _next) => {
  const { matchId, timestamp, matchDate, winningClub, losingClub } = request.body

  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const forfeitedMatch = new Forfeit({
    matchId,
    timestamp,
    matchDate,
    winningClub,
    losingClub
  })

  forfeitedMatch
    .save()
    .then(savedForfeitedMatch => {
      response.json(savedForfeitedMatch)
    })
})

module.exports = forfeitsRouter