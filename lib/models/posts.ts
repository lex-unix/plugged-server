import { Pool } from 'pg'

export interface Post {
  id: number
  title: string
  body: string
}

export default function postsModel(db: Pool) {
  return {
    getPosts: async () => {
      const sql =
        'SELECT p.id, p.title, p.body, u.username FROM Post p JOIN UserAccount u ON p.userId = u.id '
      const result = await db.query(sql)
      const posts = result.rows as Post[]

      return {
        posts
      }
    },
    getPost: async (id: string) => {
      const sql =
        'SELECT p.id, p.title, p.body, u.username FROM Post p JOIN UserAccount u ON p.userId = u.id WHERE p.id = $1'
      const result = await db.query(sql, [id])
      const post = result.rows[0] as Post
      console.log(post)
      return {
        post
      }
    }
  }
}
