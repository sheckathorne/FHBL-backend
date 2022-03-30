const invalidMatchesRouter = require('express').Router()
const InvalidMatch = require('../models/invalidMatch')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

invalidMatchesRouter.get('/', async (_request, response) => {
  const invalidMatches = await InvalidMatch.find({})
  response.json(invalidMatches)
})

invalidMatchesRouter.delete('/:id',(request, response, next) => {
  const token = getTokenFrom(request)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  console.log(request.params.id)
  
  InvalidMatch.deleteMany({ matchId: request.params.id.toString() })
    .then(_result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

invalidMatchesRouter.post('/',(request, response, _next) => {
  const body = request.body

  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const invalidMatch = new InvalidMatch({
    matchId: body.matchId
  })

  invalidMatch
    .save()
    .then(savedInvalidMatch => {
      response.json(savedInvalidMatch)
    })
})

module.exports = invalidMatchesRouter