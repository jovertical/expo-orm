import QueryBuilder from '../src/QueryBuilder'

it('can build a select query', () => {
  const query = new QueryBuilder('posts')
  const result = query.get()

  expect(result.trim()).toEqual('select * from `posts`')
})

it('can build a select query to find a specific record', () => {
  const query = new QueryBuilder('posts')
  const result = query.find()

  expect(result).toEqual('select * from `posts` where id = ? limit 1;')
})

it('can build an insert query', () => {
  const query = new QueryBuilder('posts')

  const result = query.insert({
    title: 'Why not YOLO ?',
    body: `
      It sounds too careless because You Only Die once, 
      live everyday like it was your last
    `,
  })

  expect(result.trim()).toEqual('insert into posts (title, body) values (?, ?)')
})

it('can build an update query', () => {
  const query = new QueryBuilder('posts')

  const result = query.where('id', '=', 1).update({
    body: `You are wrong and here's why...`,
  })

  expect(result).toEqual('update posts set `body` = ?  where `id` = 1')
})

it('can build a delete query', () => {
  const query = new QueryBuilder('posts')

  const result = query.where('id', '=', 2).delete()

  expect(result).toEqual('delete from `posts`  where `id` = 2')
})
