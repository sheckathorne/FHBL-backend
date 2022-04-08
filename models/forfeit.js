const mongoose = require('mongoose')

const forfeitSchema = new mongoose.Schema({
  matchId: String,
  timestamp: Number,
  matchDate: String,
  winningClub: String,
  losingClub: String,
  overtimeLoss: Boolean
},{ collection: 'forfeits' })

const Forfeit = mongoose.model('Forfeit', forfeitSchema)

module.exports = Forfeit