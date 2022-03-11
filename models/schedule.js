const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
  matchDate: String,
  teams: Array,
},{ collection: 'schedule' })

scheduleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})

const Schedule = mongoose.model('Schedule', scheduleSchema)

module.exports = Schedule