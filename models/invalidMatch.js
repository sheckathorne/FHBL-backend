const mongoose = require('mongoose')

const invalidMatchSchema = new mongoose.Schema({
  matchId: String
},{ collection: 'invalidMatches' })

const InvalidMatch = mongoose.model('InvalidMatch', invalidMatchSchema)

module.exports = InvalidMatch