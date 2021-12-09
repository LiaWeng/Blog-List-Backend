const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user_model')

usersRouter.get('/', async(request, response) => {
  const users = await User
    .find({})
    .populate('blog')

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.password.length >= 3) {
    const passwordHash = await bcrypt.hash(body.password, 10)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)
  } else {
    return response.status(400).json({
      error: 'password too short'
    })
  }
})

module.exports = usersRouter