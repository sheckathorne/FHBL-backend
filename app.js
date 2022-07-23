const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const matchesRouter = require('./controllers/matches')
const playersRouter = require('./controllers/players')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const teamRankingsRouter = require('./controllers/teamRankings')
const schedulesRouter = require('./controllers/schedules')
const matchSkeletonsRouter = require('./controllers/matchSkeletons')
const statAveragesRouter = require('./controllers/statAverages')

const mongoose = require('mongoose')
const invalidMatchesRouter = require('./controllers/invalidMatches')
const forfeitsRouter = require('./controllers/forfeits')
const invalidMatchesDetailRouter = require('./controllers/invalidMatchesDetail')

mongoose.connect(config.MONGO_DB_URI)
  .then(_res => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/fbhl/statAverages', statAveragesRouter)
app.use('/api/fbhl/playerData', playersRouter)
app.use('/api/fbhl/matchHistory', matchesRouter)
app.use('/api/fbhl/users', usersRouter)
app.use('/api/fbhl/login', loginRouter)
app.use('/api/fbhl/schedule', schedulesRouter)
app.use('/api/fbhl/teamRankings', teamRankingsRouter)
app.use('/api/fbhl/invalidMatches', invalidMatchesRouter)
app.use('/api/fbhl/matchSkeletons', matchSkeletonsRouter)
app.use('/api/fbhl/forfeits', forfeitsRouter)
app.use('/api/fbhl/invalidMatchesDetail', invalidMatchesDetailRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app