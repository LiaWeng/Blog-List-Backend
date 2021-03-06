const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user_model')
const config = require('../utils/config')

loginRouter.post('/', async(request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  if (user === null) {
    return response.status(401).json({
      error: 'invalid username'
    })
  }

  const passwordCorrect = await bcrypt.compare(body.password, user.passwordHash)

  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'incorrect password'
    })
  }

  const forToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(forToken, config.SECRET)

  response
    .status(200)
    .json({
      token,
      username: user.username,
      name: user.name,
      id: user._id
    })
})

module.exports = loginRouter