## Installation

WIP

## Usage

### # Create your models

```js
import { Model } from 'expo-orm'

export default class Post extends Model {
  static table = 'posts'
}
```

💡 You need to specify the `table` property as it will be used to query against the database

### # Interacting with your model

Fetch a list of your models

```js
const posts = await Post.get()
```

Get only the first item from the results

```js
const post = await Post.first()

const archivedPost = await Post.where('archived_at', '!=', null).first()
```

Find a specific model

```js
const post = await Post.find(1)
```

Filtering using `where`

```js
const draftedPosts = await Post.where('published_at', null).get()

const publishedPosts = await post.where('published_at', '!=', null).get()
```

### # Using the Query Builder

In most cases it's recommended to use a **Model** but when you're not, you can:

```js
import { Database } from 'expo-orm'

...

const posts = await Database.table('posts').get()
```

## Testing

```bash
yarn test
```
