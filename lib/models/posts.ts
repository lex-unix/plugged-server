import { Pool } from 'pg'

export interface PostBase {
  title: string
  body: string
}

export interface Post extends PostBase {
  id: number
  likes: string
  userId: string
  username: string
}

const mapPost = (post: Post) => {
  const author = {
    id: post.userId,
    username: post.username
  }

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    likes: post.likes,
    author
  }
}

export default function postsModel(db: Pool) {
  return {
    getPosts: async () => {
      const sql =
        'SELECT p.id, p.title, p.body, u.id as "userId", u.username, COUNT(l.postId) as likes FROM Post p LEFT JOIN UserAccount u ON p.userId = u.id LEFT JOIN PostLike l ON p.id = l.postId GROUP BY p.id, u.id, u.username'
      const result = await db.query(sql)
      const posts = result.rows as Post[]

      return posts.map(mapPost)
    },
    getPost: async (id: string) => {
      const sql =
        'SELECT p.id, p.title, p.body, u.id as "userId", u.username, COUNT(l.postId) as likes FROM Post p LEFT JOIN UserAccount u ON p.userId = u.id LEFT JOIN PostLike l ON p.id = l.postId  WHERE p.id = $1 GROUP BY p.id, u.id, u.username'
      const result = await db.query(sql, [id])
      const post = result.rows.map(mapPost)
      return post[0]
    },
    createPost: async (userId: number, post: PostBase) => {
      const sql =
        'INSERT INTO Post (title, body, userId) VALUES ($1, $2, $3) RETURNING *'
      const result = await db.query(sql, [post.title, post.body, userId])
      const createdPost = result.rows[0] as Post
      return createdPost
    },
    likePost: async (postId: string, userId: number) => {
      let sql = 'SELECT userId from PostLike WHERE postId = $1 AND userId = $2'
      const liked = await db.query(sql, [postId, userId])
      if (!liked.rows.length) {
        sql = 'INSERT INTO PostLike (postId, userId) VALUES ($1, $2)'
        await db.query(sql, [postId, userId])
      }
    },
    dislikePost: async (postId: string, userId: number) => {
      let sql = 'SELECT userId from PostLike WHERE postId = $1 AND userId = $2'
      const liked = await db.query(sql, [postId, userId])
      if (liked.rows.length) {
        sql = 'DELETE FROM PostLike WHERE postId = $1 AND userId = $2'
        await db.query(sql, [postId, userId])
      }
    }
  }
}
