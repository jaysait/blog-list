const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((prev, curr) => {
    return prev + curr.likes;
  }, 0);
};

const favouriteBlog = (blogs) => {
  return blogs.reduce(
    (fav, blog) => {
      return blog.likes > fav.likes
        ? { title: blog.title, author: blog.author, likes: blog.likes }
        : fav;
    },
    { title: '', author: '', likes: 0 }
  );
};

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
};
