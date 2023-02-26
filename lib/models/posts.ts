import { Pool } from 'pg'

export interface Post {
  title: string
  body: string
  likes: string
  username: string
}

export interface PostWithId extends Post {
  id: number
}

export default function postsModel(db: Pool) {
  return {
    getPosts: async () => {
      const sql =
        'SELECT p.id, p.title, p.body, u.username, COUNT(l.postId) as likes FROM Post p LEFT JOIN UserAccount u ON p.userId = u.id LEFT JOIN PostLike l ON p.id = l.postId GROUP BY p.id, u.username'
      const result = await db.query(sql)
      const posts = result.rows as PostWithId[]

      return posts
    },
    getPost: async (id: string) => {
      const sql =
        'SELECT p.id, p.title, p.body, u.username, COUNT(l.postId) as likes FROM Post p LEFT JOIN UserAccount u ON p.userId = u.id LEFT JOIN PostLike l ON p.id = l.postId  WHERE p.id = $1 GROUP BY p.id, u.username'
      const result = await db.query(sql, [id])
      const post = result.rows[0] as PostWithId
      return post
    },
    createPost: async (userId: number, post: Post) => {
      const sql =
        'INSERT INTO Post (title, body, userId) VALUES ($1, $2, $3) RETURNING *'
      const result = await db.query(sql, [post.title, post.body, userId])
      const createdPost = result.rows[0] as PostWithId
      return createdPost
    }
  }
}
