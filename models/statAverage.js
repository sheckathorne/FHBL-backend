const mongoose = require('mongoose')

const statAverageSchema = new mongoose.Schema({
  skpointspg: Number,
  skgoalspg: Number,
  skassistspg: Number,
  skshotspg: Number,
  skpasspct: Number,
  skhitspg: Number,
  skinterceptionspg: Number,
  sktakeawayspg: Number,
  skblockedshotspg: Number
},{ collection: 'statAverages' })

const StatAverage = mongoose.model('StatAverage', statAverageSchema)

module.exports = StatAverage