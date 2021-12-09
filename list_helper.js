const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const reducer = (sum, item) => {
    return sum + item
  }

  return likes === 0
    ? 0
    : likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const maxLike = Math.max(...likes)
  const favBlog = blogs.find(blog => blog.likes === maxLike)

  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}