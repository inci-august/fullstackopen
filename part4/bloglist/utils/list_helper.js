const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.length === 0 ? 0 : blogs.reduce((sum, blog) => sum + blog.likes, 0)

  return likes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }

  const favorite = blogs.reduce((fav, blog) => (fav.likes > blog.likes ? fav : blog))

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
