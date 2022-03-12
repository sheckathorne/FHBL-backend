const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  teamId: String,
  playerId: String,
  playerName: String,
  gkGamesPlayed: Number,
  gkGoalsAllowed: Number,
  gkShotsFaced: Number,
  gkSavesMade: Number,
  gkgaa: String,
  gksvpct: String,
  gkso: Number,
  posSorted: String,
  skater: Boolean,
  skGamesPlayed: Number,
  skshots: Number,
  skhits: Number,
  skpasses: Number,
  skpassattempts: Number,
  skpasspct: String,
  skfow: Number,
  skfol: Number,
  skpim: Number,
  skgoals: Number,
  skassists: Number,
  skpoints: Number,
  skinterceptions: Number,
  skbs: Number,
  sktakeaways: Number,
  skplusmin: Number
},{ collection: 'players' })

playerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player