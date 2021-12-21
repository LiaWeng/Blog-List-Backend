const blogsRouter = require('express').Router()
const Blog = require('../models/blog_model')
const User = require('../models/user_model')
const middleware = require('../utils/middleware')
const mongoose = require('mongoose')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blog =  user.blog.concat(savedBlog._id)
  await User.findByIdAndUpdate( user._id,  user, { new: true })

  response.status(201).json(savedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
  console.log(request.params.id)
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === request.user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: mongoose.Types.ObjectId(request.body.user)
  }

  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
  response.json(result)
})

module.exports = blogsRouter