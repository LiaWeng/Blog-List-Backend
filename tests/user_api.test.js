const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user_model')

beforeEach(async() => {
  await User.deleteMany({ 'username': { $ne: 'initialUser' } })
})

test('valid user is added', async () => {
  const usersStart = await User.find({})

  const newUser = {
    username: 'testUser',
    name: 'testName',
    password: '12345'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)

  const usersEnd = await User.find({})
  expect(usersEnd).toHaveLength(usersStart.length + 1)

  const usernames = usersEnd.map(user => user.username)
  expect(usernames).toContain(newUser.username)
}, 10000)

test('invalid user is not added and fails with status 400', async() => {
  const usersStart = await User.find({})

  const newUser = {
    username: 'testUser',
    name: 'testName',
    password: '1'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const usersEnd = await User.find({})
  expect(usersEnd).toHaveLength(usersStart.length)

  const usernames = usersEnd.map(user => user.username)
  expect(usernames).not.toContain(newUser.username)
}, 10000)

test('login succeeds with right username and password', async() => {
  const user = {
    username: 'initialUser',
    password: '12345'
  }

  await api
    .post('/api/login')
    .send(user)
    .expect(200)
})

afterAll(() => {
  mongoose.connection.close()
})