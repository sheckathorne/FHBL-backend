const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const schedulesRouter = require('./controllers/schedules')
const { MongoClient } = require('mongodb')

const mongoose = require('mongoose')
const client = new MongoClient(config.MONGO_DB_URI);

mongoose.connect(config.MONGO_DB_URI)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

async function selectAllFromCollection(collectionName) {
  await client.connect();
  console.log('Connected successfully to server');

  const db = client.db(config.DB_NAME);
  const collection = db.collection(collectionName);
  const findResult = await collection.find({}).toArray()
  
  return findResult
}

app.get('/api/fbhl/matchHistory', (req, res) => {
  selectAllFromCollection('matches')
    .then(matches => res.json(matches))
    .catch(console.error)
})

app.get('/api/fbhl/playerData', (req, res) => {
  selectAllFromCollection('players')
  .then(players => res.json(players))
  .catch(console.error)
})

app.use('/api/fbhl/users', usersRouter)
app.use('/api/fbhl/login', loginRouter)
app.use('/api/fbhl/schedule', schedulesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app