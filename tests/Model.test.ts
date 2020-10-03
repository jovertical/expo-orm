import Model from '../src/Model'

test('attributes can be filled', () => {
  class Post extends Model {
    table = 'posts'
  }

  const post = new Post({
    title: 'What is SOLID?',
    body:
      'A software design principle created to avoid common pitfalls when developing a software',
  })

  expect(post).toHaveProperty('title')
  expect(post).toHaveProperty('body')
})
