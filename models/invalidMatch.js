const mongoose = require('mongoose')

const invalidMatchSchema = new mongoose.Schema({
  matchId: String,
  newRecord: Boolean
},{ collection: 'invalidMatches' })

const InvalidMatch = mongoose.model('InvalidMatch', invalidMatchSchema)

module.exports = InvalidMatch