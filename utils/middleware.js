const logger = require('./logger')

const requestLogger = (req, _res, next) => {
  if ( req.method === 'POST' && req.path === '/api/fbhl/login' ) {  
    const body = req.body.password ? { ...req.body, password: '*'.repeat(req.body.password.length) } : req.body
    console.log('Method:', req.method)
    console.log('Path:  ', req.path)
    console.log('Body:  ', body)
    console.log('---')
  } else {
    console.log('Method:', req.method)
    console.log('Path:  ', req.path)
    console.log('Body:  ', req.body)
    console.log('Query:  ', req.query)
    console.log('---')
  }
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, _req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token'
    })
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired'
    })
  }

  logger.error(err.message)

  next(err)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}