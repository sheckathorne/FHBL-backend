const playersRouter = require('express').Router()
const Player = require('../models/player')

playersRouter.get('/pagination', async (req, res) => {
  const pageNum = parseInt(req.query.pageNum) - 1
  const playerCount = parseInt(req.query.playerCount)
  const skip = pageNum * playerCount
  const statName = req.query.statName
  const sort = req.query.sort === 'desc' ? -1 : 1
  const skater = req.query.skater === 'true' ? true : false
  const gamesPlayed = skater ? 'skGamesPlayed' : 'gkGamesPlayed'
  const name = req.query.name
  const clubId = req.query.clubId

  const players = await Player
    .aggregate([
      { $addFields: { clubId: { $first: '$teams' } } },
      { $match: { 'skater': skater } },
      { $match: ( clubId ) ? { 'clubId': clubId } : {} },
      { $match: ( name ) ? { 'playerName': { '$regex': name, '$options': 'i' } } : {}},
      { $sort: { 'playerIsRanked': -1, [statName]: sort, [gamesPlayed]: -1 } },
      { $skip: skip },
      { $limit: playerCount }
    ])
  res.json(players)
})

playersRouter.get('/pagination/count', async (req, res) => {
  const clubId = req.query.clubId
  const skater = req.query.skater === 'true' ? true : false
  const name = req.query.name  
  const count = await Player.aggregate([
    { $addFields: { clubId: { $first: '$teams' } } },
    { $match: { 'skater': skater } },
    { $match: ( clubId ) ? { 'clubId': clubId } : {} },
    { $match: ( name ) ? { 'playerName': { '$regex': name, '$options': 'i' } } : {}},    
    { $count: 'players' }
  ])

  res.json({ 'count': count[0].players })
})

playersRouter.get('/pagination/indexNum', async(req, res) => {
  const playerId = req.query.playerId
  const statName = req.query.statName
  const skater = req.query.skater === 'true' ? true : false
  const gamesPlayed = skater ? 'skGamesPlayed' : 'gkGamesPlayed'
  const sort = req.query.sort === 'desc' ? -1 : 1

  const players =
    await Player
      .aggregate([
        { $match: { 'skater': skater } },
        { $sort: { 'playerIsRanked': -1, [statName]: sort, [gamesPlayed]: -1 } },
      ])

  index = players.findIndex(player => player.playerId === playerId)

  res.json(index)
})

playersRouter.get('/top', async (req, res) => {
  const num = parseInt(req.query.num)
  const statName = req.query.statName
  const sort = req.query.sort
  const fieldName = `${statName}_rank`
  const players = await Player.find({ [fieldName]: { $lte: num } }).sort({ [statName]: sort })
  res.json(players)
})

playersRouter.get('/topByStat', async (req, res) => {
  const statName = req.query.statName
  const statFieldName = `${statName}_rank`
  const sort = req.query.sort === 'desc' ? -1 : 1
  const topCount = parseInt(req.query.topCount)
  const skater = req.query.skater === 'true' ? true : false
  const gamesPlayed = skater ? 'skGamesPlayed' : 'gkGamesPlayed'
  
  const players = await Player
    .aggregate([
      { $match: { 'skater': skater, [statFieldName]: { $lte: topCount }, [statFieldName]: { $gt: 0 } } },
      { $sort: { [statName]: sort, [gamesPlayed]: -1 } },
      { $limit: topCount },
      { $project: {'playerName': 1, 'value': `$${statName}`, 'rank': `$${statFieldName}`, 'playerId': 1 } }
    ])

  return res.json(players)
})


module.exports = playersRouter