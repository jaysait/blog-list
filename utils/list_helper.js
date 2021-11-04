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

const mostBlogs = (blogs) => {
  const counts = new Map();
  blogs.forEach((blog) => {
    if (counts.get(blog.author)) {
      const size = counts.get(blog.author) + 1;
      counts.set(blog.author, size);
    } else {
      counts.set(blog.author, 1);
    }
  });

  let max = 0;
  let author = '';
  counts.forEach(function (value, key) {
    if (value > max) {
      max = value;
      author = key;
    }
  });

  return { author: author, blogs: max };
};

const mostLikes = (blogs) => {
  const counts = new Map();
  blogs.forEach((blog) => {
    if (counts.get(blog.author)) {
      const size = counts.get(blog.author);
      counts.set(blog.author, size + blog.likes);
    } else {
      counts.set(blog.author, blog.likes);
    }
  });

  let max = 0;
  let author = '';
  counts.forEach(function (value, key) {
    if (value > max) {
      max = value;
      author = key;
    }
  });

  return { author: author, blogs: max };
};

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
};
