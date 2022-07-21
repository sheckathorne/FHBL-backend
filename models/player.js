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
  gkwins: Number,
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
  skplusmin: Number,
  player_ranked: Boolean,
  skpoints_rank: Number,
  skgoals_rank: Number,
  skassists_rank: Number,
  skplusmin_rank: Number,
  skGamesPlayed_rank: Number,
  skhits_rank: Number,
  skbs_rank: Number,
  gksvpct_rank: Number,
  gkwins_rank: Number,
  gkwinpct_rank: Number,
  gkso_rank: Number,
  gkgaa_rank: Number,
  gkGamesPlayed_rank: Number,
},{ collection: 'players' })

playerSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player