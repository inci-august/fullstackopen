const _ = require("lodash")

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.length === 0 ? 0 : blogs.reduce((sum, blog) => sum + blog.likes, 0)

  return likes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return "Blog list is empty"
  }

  const favorite = blogs.reduce((fav, blog) => (fav.likes > blog.likes ? fav : blog))

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return "Blog list is empty"
  }

  const topAuthor = _.chain(blogs)
    .groupBy("author")
    .map((group, author) => {
      return { author: author, blogs: group.length }
    })
    .maxBy((object) => object.blogs)
    .value()

  return topAuthor
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return "Blog list is empty"
  }

  const topAuthor = _.chain(blogs)
    .groupBy("author")
    .map((group, author) => {
      return {
        author: author,
        likes: group.reduce((acc, next) => {
          return (acc += next.likes)
        }, 0),
      }
    })
    .maxBy((object) => object.likes)
    .value()

  return topAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
