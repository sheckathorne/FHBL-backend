const calendarRouter = require('express').Router()

const Match = require('../models/match')
const InvalidMatch = require('../models/invalidMatch')
const Forfeit = require('../models/forfeit')
const Schedule = require('../models/schedule')
const dayjs = require('dayjs')

function freqMapOf(dates) {
  const dateMap = new Object()
  for ( const date of dates ) {
    dateMap[date] = (dateMap[date] || 0) + 1
  }
  return dateMap
}

async function getSchedule(startDate, endDate, clubId) {
  const startDte = startDate.toString().length === 13 ? startDate / 1000 : startDate
  const endDte = endDate.toString().length === 13 ? endDate / 1000 : endDate

  const schedules = Schedule.aggregate([
    { $addFields: { timestamp: { '$divide': [{ '$toLong' : { '$dateFromString': { dateString: '$matchDate', timezone: '-12' } } }, 1000] } } },
    { $match: {
        $and: [
          {'timestamp': { $gte: startDte }},
          {'timestamp': { $lte: endDte }}
       ]
      }
    },
    { $match: ( clubId ) ? { 'teams': { '$in': [ clubId ] } } : {} }
  ])

  return schedules
}

async function getBareSchedule(startDate, endDate, clubId) {
  const startDte = startDate.toString().length === 13 ? startDate / 1000 : startDate
  const endDte = endDate.toString().length === 13 ? endDate / 1000 : endDate

  const schedules = Schedule.aggregate([
    { $addFields: { timestamp: { '$divide': [{ '$toLong' : { '$dateFromString': { dateString: '$matchDate', timezone: '-12' } } }, 1000] } } },
    { $match: {
        $and: [
          {'timestamp': { $gte: startDte }},
          {'timestamp': { $lte: endDte }}
       ]
      }
    },
    { $match: ( clubId ) ? { 'teams': { '$in': [ clubId ] } } : {} },
    { $project: { "teams": 1, "matchDate": 1 }}
  ])

  return schedules
}

async function getForfeits(startDate, endDate, clubId){
  const forfeits = Forfeit.aggregate([
    { $match: {
        $and: [
          {'timestamp': { $gte: startDate }},
          {'timestamp': { $lte: endDate }}
       ]
      }
    },
    { $match: ( clubId ) ? 
      { $or: [
        { 'winningClub': clubId },
        { 'losingClub': clubId }
        ] 
      } : {} },
    { $project: {
      'matchDate': 1,
      'matchId': 1,
      '_id': 1,
      'timestamp': 1,
      'forfeit': {$toBool: true},
      'clubs': [{
        'clubId': '$winningClub',
        'data': { 'goals': '1' }
      },{
        'clubId': '$losingClub',
        'data': { 'goals': '0' }
      }]
    } }
  ])
  
  return forfeits
}

async function getBareForfeits(startDate, endDate, clubId){
  const forfeits = Forfeit.aggregate([
    { $match: {
        $and: [
          {'timestamp': { $gte: startDate }},
          {'timestamp': { $lte: endDate }}
       ]
      }
    },
    { $match: ( clubId ) ? 
      { $or: [
        { 'winningClub': clubId },
        { 'losingClub': clubId }
        ] 
      } : {} },
    { $project: {
      'timestamp': 1,
      'forfeit': {$toBool: true},
      'clubs': ['$winningClub','$losingClub']
      } 
    }
  ])
  
  return forfeits
}

async function getMatchSekeltons(startDate, endDate, clubId) {
  const matchSkeletons = Match.aggregate([
    { $match: {
      $and: [
        {'timestamp': { $gte: startDate }},
        {'timestamp': { $lte: endDate }}
      ]
      }
    },
    { $match: (clubId) ? { 
      'clubs.clubId': { $eq: clubId } 
      } : {} 
    },
    { $project: 
      { 'matchId': 1, 'timestamp': 1, 'matchDate': 1, 'matchDateString': 1, 'clubs.clubId': 1, 'clubs.data.goals': 1 }
    }
  ])

  return matchSkeletons
}

async function getMatchBareSekeltons(startDate, endDate, clubId) {
  const matchSkeletons = Match.aggregate([
    { $match: {
      $and: [
        {'timestamp': { $gte: startDate }},
        {'timestamp': { $lte: endDate }}
      ]
      }
    },
    { $match: (clubId) ? { 
      'clubs.clubId': { $eq: clubId } 
      } : {} 
    },
    { $project: 
      { 'matchId': 1,
        'clubs': [
          { $arrayElemAt: [ "$clubs.clubId", 0 ] },
          { $arrayElemAt: [ "$clubs.clubId", 1 ] }
        ],
        'timestamp': 1
      }
    }
  ])

  return matchSkeletons
}

async function getFilteredMatchCards(startDate, endDate, clubId, matchFilter, userRole, bare) {
  const matchDateString = (timestamp) => {
    const ts = timestamp.toString().length === 13 ? timestamp / 1000 : timestamp
    return dayjs(dayjs.unix(ts)).format('M/D/YYYY')
  }

  const invalidMatches = await InvalidMatch.find({}).select('matchId')
  const schedules = matchFilter === 'played' ? [] : bare ? await getBareSchedule(startDate, endDate, clubId) : await getSchedule(startDate, endDate, clubId)
  const matchSkeletons = bare ? await getMatchBareSekeltons(startDate, endDate, clubId) : await getMatchSekeltons(startDate, endDate, clubId)
  const forfeits = bare ? await getBareForfeits(startDate, endDate, clubId) : await getForfeits(startDate, endDate, clubId)
  
  const matchesWithForfeits = [...matchSkeletons, ...forfeits].map(match => ({ matchDate: matchDateString(match.timestamp), ...match }))

  const scheduleWithoutPlayedMatches = schedules.filter(match => {
    const scheduledMatchWasPlayed = matchesWithForfeits.find(m => {
      return m.clubs.includes(match.teams[0]) && m.clubs.includes(match.teams[1]) && match.matchDate === m.matchDate})
    return !scheduledMatchWasPlayed
  })

  const filteredMatchCards =
    matchFilter === 'all' ?
      matchesWithForfeits.map(match => ({ ...match, matchWasPlayed: true })).concat(scheduleWithoutPlayedMatches.map(match => ({ 
        ...match, 
        //matchDateString: match.matchDate
        matchWasPlayed: false }))) :
      matchFilter === 'played' ?
      matchesWithForfeits.map(match => ({ ...match, matchWasPlayed: true })) :
        scheduleWithoutPlayedMatches.map(match => ({ 
          ...match,
          //matchDateString: match.matchDate, 
          matchWasPlayed: false }))

    const matchCards = userRole === 'admin' ? filteredMatchCards : filteredMatchCards.filter(match => !invalidMatches.map(m => m.matchId).includes(match.matchId))

  return matchCards
}

calendarRouter.get('/', async (req, res) => {
  const startDate = parseInt(req.query.startDate)
  const endDate = parseInt(req.query.endDate)
  const clubId = req.query.clubId
  const matchFilter = req.query.matchFilter
  const userRole = req.query.role
  const bare = false

  const filteredMatchCards = await getFilteredMatchCards(startDate, endDate, clubId, matchFilter, userRole, bare)

  res.json(filteredMatchCards)
})


calendarRouter.get('/displayDates', async (req, res) => {
  const startDate = parseInt(req.query.startDate)
  const endDate = parseInt(req.query.endDate)
  const clubId = req.query.clubId
  const matchFilter = req.query.matchFilter
  const userRole = req.query.userRole
  const bare = true

  const filteredMatchCards = await getFilteredMatchCards(startDate, endDate, clubId, matchFilter, userRole, bare)
  const matchDates = filteredMatchCards.map(match => match.matchDate)
  const dateMap = freqMapOf(matchDates)

  res.json(dateMap)
})

calendarRouter.get('/schedule', async (req, res) => {
  const startDate = parseInt(req.query.startDate)
  const endDate = parseInt(req.query.endDate)
  const clubId = req.query.clubId

  const schedule = await getSchedule(startDate, endDate, clubId)
  res.json(schedule)
})

module.exports = calendarRouter