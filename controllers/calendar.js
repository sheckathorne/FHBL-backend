const calendarRouter = require('express').Router()

const Match = require('../models/match')
const InvalidMatch = require('../models/invalidMatch')
const Forfeit = require('../models/forfeit')
const Schedule = require('../models/schedule')
const dayjs = require('dayjs')

async function getSchedule(startDate, endDate, clubId) {
  const schedules = Schedule.aggregate([
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

  return schedules
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
      } 
    }
  ])
  
  return forfeits
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
        'timestamp': 1,
      }
    }
  ])

  return matchSkeletons
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

calendarRouter.get('/', async (req, res) => {
  const startDate = parseInt(req.query.startDate)
  const endDate = parseInt(req.query.endDate)
  const clubId = req.query.clubId
  const matchFilter = req.query.matchFilter
  const userRole = req.query.role

  const invalidMatches = userRole === 'admin' ? await InvalidMatch.find({}).select('matchId') : []
  const schedules = matchFilter === 'played' ? await getSchedule(startDate, endDate, clubId) : []
  const matchSkeletons = await getMatchBareSekeltons(startDate, endDate, clubId)
  const forfeits = await getBareForfeits(startDate, endDate, clubId)


  const matchesWithForfeits = [...matchSkeletons, ...forfeits]

  const scheduleWithoutPlayedMatches = schedules.filter(match => {
    const scheduledMatchWasPlayed = matchesWithForfeits.find(m => m.clubs.map(club => club.clubId).includes(match.teams[0]) && m.clubs.map(club => club.clubId).includes(match.teams[1]) && m.matchDate === match.matchDate )
    return !scheduledMatchWasPlayed
  })

  const filteredMatchCards =
  matchFilter === 'all' ?
    matchesWithForfeits.map(match => ({ ...match, matchWasPlayed: true })).concat(scheduleWithoutPlayedMatches.map(match => ({ ...match, matchWasPlayed: false, matchDateString: match.matchDate }))) :
    matchFilter === 'played' ?
    matchesWithForfeits.map(match => ({ ...match, matchWasPlayed: true })) :
      scheduleWithoutPlayedMatches.map(match => ({ ...match, matchDateString: match.matchDate, matchWasPlayed: false }))

  res.json(matchSkeletons)
})

module.exports = calendarRouter