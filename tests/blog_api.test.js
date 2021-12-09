const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog_model')
const User = require('../models/user_model')

const token = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImluaXRpYWxVc2VyIiwiaWQiOiI2MWIyMWM0MTA4N2QwMWY3ZjA2YzFmNWIiLCJpYXQiOjE2MzkwNjI3MTB9.axpxGBUoBTjxhi1UsLOmi0fx5bY2c7fLys80fEkiYYU'
const userId = '61b21c41087d01f7f06c1f5b'

beforeEach(async () => {
  await Blog.deleteMany({})

  const exampleBlog = new Blog({
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: userId
  })

  const savedBlog = await exampleBlog.save()
  const user = await User.findById(userId)
  user.blog = user.blog.concat(savedBlog._id)
  await User.findByIdAndUpdate(userId, user, { new: true })
})

test('all notes are returned', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  expect(blogs).toHaveLength(1)
})

test('unique identifier property is id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  expect(blogs[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('authorization', token)
    .send(newBlog)
    .expect(201)

  const newBlogs = await Blog.find({})
  expect(newBlogs).toHaveLength(2)

  const newTitles = newBlogs.map(blog => blog.title)
  expect(newTitles).toContain(newBlog.title)
})

test('default likes to 0 if not provided', async () => {
  const newBlog = {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  }

  await api
    .post('/api/blogs')
    .set('authorization', token)
    .send(newBlog)
    .expect(201)

  const newBlogs = await Blog.find({})
  expect(newBlogs[newBlogs.length - 1].likes).toEqual(0)
})

test('blogs without title and url cannot be added', async () => {
  const newBlog = {
    author: 'Edsger W. Dijkstra',
    likes: 9
  }

  await api
    .post('/api/blogs')
    .set('authorization', token)
    .send(newBlog)
    .expect(400)

}, 100000)

test('a blog can be deleted', async () => {
  const blogs = await Blog.find({})
  const blogToRemove = blogs[0]

  await api
    .delete(`/api/blogs/${blogToRemove._id}`)
    .set('authorization', token)
    .expect(204)

  const newBlogs = await Blog.find({})
  const newTitles = newBlogs.map(r => r.title)

  expect(newBlogs).toHaveLength(blogs.length - 1)
  expect(newTitles).not.toContain(blogToRemove.title)
})

test('the number of likes of a blog can be updated', async () => {
  const blogs = await Blog.find({})
  const blogToUpdate = blogs[0]
  const idToUpdate = String(blogToUpdate._id)
  const updatedBlog = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: blogToUpdate.likes + 1
  }

  await api
    .put(`/api/blogs/${idToUpdate}`)
    .send(updatedBlog)

  const newUpdatedBlog = await Blog.findById(blogToUpdate._id)

  expect(newUpdatedBlog.likes).toEqual(blogToUpdate.likes + 1)
})

afterAll(() => {
  mongoose.connection.close()
})