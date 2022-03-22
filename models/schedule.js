const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
  matchDate: String,
  timeString: String,
  teams: Array,
},{ collection: 'schedule' })

scheduleSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})

const Schedule = mongoose.model('Schedule', scheduleSchema)

module.exports = Schedule