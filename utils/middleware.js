const logger = require('./logger')

const requestLogger = (request, response, next) => {
  if ( request.method === 'POST' && request.path === '/api/fbhl/login' ) {  
    const body = request.body.password ? { ...request.body, password: '*'.repeat(request.body.password.length) } : request.body
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', body)
    console.log('---')
  } else {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
  }
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  logger.error(error.message)

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}