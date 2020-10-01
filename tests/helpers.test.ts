import * as helpers from '../src/helpers'

test('wrap', () => {
  const subject = 'expo'

  const result = helpers.wrap(subject, '`')

  expect(result).toEqual('`' + subject + '`')
})
