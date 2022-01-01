const commentsRouter = require('express').Router()
const Comment = require('../models/comment_model')
const Blog = require('../models/blog_model')

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment
    .find({})
    .populate('blog', { title: 1 })

  response.json(comments)
})

commentsRouter.post('/', async (request, response) => {
  const body = request.body
  const comment = new Comment({
    content: body.content,
    blog: body.blog
  })

  const savedComment = await comment.save()
  const blog = await Blog.findById(body.blog)
  blog.comments = blog.comments.concat(savedComment._id)
  await blog.save()

  response.status(201).json(savedComment)
})

module.exports = commentsRouter