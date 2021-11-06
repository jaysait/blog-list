const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'root', passwordHash });

  const savedUser = await user.save();

  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => {
    return new Blog({ ...blog, user: savedUser.id });
  });
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('the first blog is about react patterns', async () => {
  const response = await api.get('/api/blogs');

  const titles = response.body.map((r) => r.title);

  expect(titles).toContain('React patterns');
});

test('verify uid is labeled id not _id', async () => {
  const response = await api.get('/api/blogs');
  const blog = response.body[0];

  expect(blog).toHaveProperty('id');
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.testurl.ca',
    likes: 0,
  };
  const login = {
    username: 'root',
    password: 'sekret',
  };
  const token = await api.post('/api/login').send(login);
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .set('Authorization', 'bearer ' + token.body.token)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAtEnd.map((r) => r.title);

  expect(titles).toContain(newBlog.title);
});

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'www.testurl.ca',
    likes: 0,
  };
  const login = {
    username: 'root',
    password: 'sekret',
  };
  const token = await api.post('/api/login').send(login);
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .set('Authorization', 'bearer ' + token.body.token)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    likes: 0,
  };
  const login = {
    username: 'root',
    password: 'sekret',
  };
  const token = await api.post('/api/login').send(login);
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .set('Authorization', 'bearer ' + token.body.token)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('blog without likes defaults to 0', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.testurl.ca',
  };
  const login = {
    username: 'root',
    password: 'sekret',
  };
  const token = await api.post('/api/login').send(login);
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .set('Authorization', 'bearer ' + token.body.token)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const blog = blogsAtEnd[6];

  expect(blog.likes).toBe(0);
});

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb();

  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

  expect(resultBlog.body).toEqual(processedBlogToView);
});

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  const login = {
    username: 'root',
    password: 'sekret',
  };
  const token = await api.post('/api/login').send(login);

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', 'bearer ' + token.body.token)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

  const titles = blogsAtEnd.map((r) => r.title);

  expect(titles).not.toContain(blogToDelete.content);
});

test('a blog can be updated, specifically likes', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];

  const newBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 };

  const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`, newBlog).expect(200);
});

afterAll(() => {
  mongoose.connection.close();
});
