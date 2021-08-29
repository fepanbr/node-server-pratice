// @ts-check

/**
 * @typedef Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 */

/**
 * @typedef CreatePostBody
 * @property {string} title
 * @property {string} content
 */

const fs = require('fs')

const DB_JSON_FILENAME = 'database.json'

/** @returns {Promise<Post[]>} */
async function getPosts() {
  const json = await fs.promises.readFile(DB_JSON_FILENAME, 'utf-8')
  return JSON.parse(json).posts
}

/** @param {Post[]} posts */
async function savePosts(posts) {
  const content = {
    posts,
  }
  return fs.promises.writeFile(
    DB_JSON_FILENAME,
    JSON.stringify(content),
    'utf-8'
  )
}

/** @type {Post[]} */
const posts = [
  {
    id: 'my_first_post',
    title: 'My first post',
    content: 'Hello!',
  },
  {
    id: 'my_second_post',
    title: '나의 두번째 포스트',
    content: 'Second Content',
  },
]

/**
 * @typedef APIResponse
 * @property {number} statusCode
 * @property {string | Object} body
 */

/**
 * @typedef Route
 * @property {RegExp} url
 * @property {'GET' | 'POST'} method
 * @property {(matches: string[], body: {title: string, content: string} | undefined) => Promise<APIResponse>} callback
 */

/** @type {Route[]} */
const routes = [
  {
    url: /^\/posts$/,
    method: 'GET',
    callback: async () => ({
      statusCode: 200,
      body: await getPosts(),
    }),
  },
  {
    url: /^\/posts\/([a-zA-Z0-9-_]+)$/, // TODO: RegExp 로 고쳐야함
    method: 'GET',
    callback: async (matches) => {
      // TODO: implement
      const postId = matches[1]
      if (!postId) {
        return {
          statusCode: 404,
          body: 'not found',
        }
      }

      // eslint-disable-next-line no-shadow
      const posts = await getPosts()

      const post = posts.find((_post) => _post.id === postId)
      if (!post) {
        return {
          statusCode: 404,
          body: 'not found',
        }
      }

      return {
        statusCode: 200,
        body: post,
      }
    },
  },
  {
    url: /^\/posts$/,
    method: 'POST',
    callback: async (_, body) => {
      if (!body) {
        return {
          statusCode: 404,
          body: 'Ill-formed reqruest',
        }
      }

      // /** @type {string}  */
      /* eslint-disable-next-line prefer-destructuring */
      const title = body.title
      const newPost = {
        id: title.replace(/\s/g, '_'),
        title,
        content: body.content,
      }

      // eslint-disable-next-line no-shadow
      const posts = await getPosts()
      posts.push(newPost)
      savePosts(posts)

      return {
        statusCode: 200,
        body,
      }
    },
  },
]

module.exports = {
  routes,
}
