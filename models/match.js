const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
  matchId: String,
  timestamp: Number,
  matchDate: Date,
  matchDateString: String,
  clubs: [{
    clubId: String,
    data: {
      cNhlOnlineGameType: String,
      goals: String,
      goalsAgainst: String,
      result: String,
      goalsForRaw: String,
      goalsAgainstRaw: String
    }    
  }],
  players: [{
    clubId: String,
    members: [{
      playerId: String,
      data: {
        skshots: String,
        skhits: String,
        skpasses: String,
        skpassattempts: String,
        skfow: String,
        skfol: String,
        skpim: String,
        skgoals: String,
        skassists: String,
        skinterceptions: String,
        skbs: String,
        sktakeaways: String,
        skpasspct: String,
        playername: String,
        position: String,
        posSorted: String,
        skplusmin: String,
        glga: String,
        glsaves: String,
        glshots: String,
        glsoperiods: String,
        toi: String,
      }
    }]
  }],
  aggregate: [{
    clubId: String,
    data: {
      skshots: Number,
      skhits: Number,
      skpasses: Number,
      skpassattempts: Number,
      skfow: Number,
      skfol: Number,
      skpim: Number,
      skplusmin: Number,
    }
  }]
},{ collection: 'matches' })

const Match = mongoose.model('Match', matchSchema)

module.exports = Match