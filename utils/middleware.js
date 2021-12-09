const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user_model')

const userExtractor = async(request, response, next) => {
  const authorization = request.get('authorization')
  const authScheme = authorization.toLowerCase().substring(0, 6)

  if (authorization && authScheme === 'bearer') {
    var token = authorization.substring(7)
  } else {
    token = null
  }

  if (!token) {
    return response.status(401).json({
      error: 'missing token'
    })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  request.user = await User.findById(decodedToken.id)

  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

module.exports = { userExtractor, errorHandler }