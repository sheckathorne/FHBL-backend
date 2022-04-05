const schedulesRouter = require('express').Router()
const Schedule = require('../models/schedule')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

schedulesRouter.get('/', async (request, response) => {
  const schedules = await Schedule.find({})
  response.json(schedules)
})

schedulesRouter.delete('/:id',(request, response, next) => {
  const token = getTokenFrom(request)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  Schedule.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

schedulesRouter.put('/:id',(request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const scheduledMatch = {
    matchDate: body.matchDate
  }

  Schedule.findByIdAndUpdate(request.params.id, scheduledMatch)
    .then(updatedSchedule => {
      response.json(updatedSchedule)
    })
    .catch(error => next(error))
})

schedulesRouter.post('/',(request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const scheduledMatch = new Schedule({
    matchDate: body.matchDate,
    teams: body.teams,
    timeString: body.timeString
  })

  scheduledMatch
    .save()
    .then(savedScheduleMatch => {
      response.json(savedScheduleMatch)
    })
})

module.exports = schedulesRouter