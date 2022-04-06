const mongoose = require('mongoose')

const teamRankingSchema = new mongoose.Schema({
  rank: Number,
  teamId: String,
  conference: String,
  division: String,
  abbreviation: String,
  teamName: String,
  gamesPlayed: String,
  wins: String,
  losses: String,
  overtimeLosses: String,
  goalsScored: String,
  goalsAllowed: String,
  passPct: String,
  shotsPg: String,
  hitsPg: String,
  pimPg: String,
  currentStreak: String
},{ collection: 'teamRankings' })

teamRankingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})

const TeamRanking = mongoose.model('TeamRanking', teamRankingSchema)

module.exports = TeamRanking