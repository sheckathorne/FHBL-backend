require('dotenv').config()

const PORT = process.env.PORT
const DB_NAME = 'fbhl'
const MONGO_DB_URI = `mongodb+srv://fullstack:${process.env.REACT_APP_MONGO_PASSWORD}@cluster0.ltofs.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

module.exports = {
  MONGO_DB_URI,
  PORT,
  DB_NAME
}