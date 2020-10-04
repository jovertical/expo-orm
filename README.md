## Installation

```bash
# Using yarn
yarn add expo-orm

# Using npm
npm install expo-orm
```

## Usage

### # Create your models

```js
import { Model } from 'expo-orm'

export default class Post extends Model {
  table = 'posts'

  fillable = ['title', 'body']
}
```

You need to specify the `table` property as it will be used to query the <br />
database. The `fillable` property should also be defined because it <br />
will be used in insert and update operations.

### # Interacting with your model

Fetch a list of your models

```js
const posts = await Post.get()
```

Get only the first item from the results

```js
const post = await Post.first()

const archivedPost = await Post
  .where('archived_at', '!=', null)
  .first()
```

Find a specific model

```js
const post = await Post.find(1)
```

Filtering the model

```js
const draftedPosts = await Post
  .where('published_at', '=', null)
  .get()

const publishedPosts = await post
  .where('published_at', '!=', null)
  .get()
```

Updating models

```js
await Post.where('id', '=', 1).update({ published_at: new Date() })
```

Deleting models

```js
await Post.where('published_at', '=', null).delete()
```

### # Using the Query Builder

In most cases it's recommended to use a **Model** but when you're not, you can:

```js
import { Database } from 'expo-orm'

...

const db = Database.connect()
const posts = await db.table('posts').get()
```

## Examples

- https://github.com/jovertical/expo-orm-example

## Testing

```bash
yarn test
```

## License

The MIT License (MIT). Please see [License File](https://github.com/jovertical/expo-orm/blob/master/LICENSE.md) for more information.