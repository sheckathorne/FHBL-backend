const schedulesRouter = require('express').Router()
const Schedule = require('../models/schedule')
const jwt = require('jsonwebtoken')
const { json } = require('express')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

schedulesRouter.get('/', async (_req, res) => {
  const schedules = await Schedule.find({})
  res.json(schedules)
})

schedulesRouter.get('/fromRange', async(req, res) => {
  const startDate = ( req.query.startDate.length === 10 ) ? parseInt(req.query.startDate) * 1000 : parseInt(req.query.startDate)
  const endDate = ( req.query.endDate.length === 10 ) ? parseInt(req.query.endDate) * 1000 : parseInt(req.query.endDate)
  console.log('startDate', startDate)
  console.log('endDate', endDate)
  const clubId = req.query.clubId
  
  const schedules = await Schedule.aggregate([
    { $addFields: { timestamp: { '$toLong' : { '$dateFromString': { dateString: '$matchDate', timezone: '-12' } } } } } ,
    { $match: {
        $and: [
          {'timestamp': { $gte: startDate }},
          {'timestamp': { $lte: endDate }}
       ]
      }
    },
    { $match: ( clubId ) ? { 'teams': { '$in': [ clubId ] } } : {} }
  ])

  return res.json(schedules)
})

schedulesRouter.get('/dates/fromRange', async(req, res) => {
  const startDate = ( req.query.startDate.length === 10 ) ? parseInt(req.query.startDate) * 1000 : parseInt(req.query.startDate)
  const endDate = ( req.query.endDate.length === 10 ) ? parseInt(req.query.endDate) * 1000 : parseInt(req.query.endDate)
  console.log('startDate', startDate)
  console.log('endDate', endDate)
  const clubId = req.query.clubId
  
  const schedules = await Schedule.aggregate([
    { $addFields: { timestamp: { '$toLong' : { '$dateFromString': { dateString: '$matchDate', timezone: '-12' } } } } } ,
    { $match: {
        $and: [
          {'timestamp': { $gte: startDate }},
          {'timestamp': { $lte: endDate }}
       ]
      }
    },
    { $match: ( clubId ) ? { 'teams': { '$in': [ clubId ] } } : {} },
    { $group: { _id: '$matchDate' } },
  ])

  const dates = schedules.map(date => date._id)
  return res.json(dates)
})

schedulesRouter.delete('/:id',(request, response, next) => {
  const token = getTokenFrom(request)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  Schedule.findByIdAndRemove(request.params.id)
    .then(_result => {
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