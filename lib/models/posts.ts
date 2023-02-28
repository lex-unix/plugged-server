import { Pool } from 'pg'

export interface PostBase {
  title: string
  body: string
}

export interface Post extends PostBase {
  id: number
  likes: string
  liked: boolean
  createdAt: string
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
    liked: post.liked,
    createdAt: post.createdAt,
    author
  }
}

export default function postsModel(db: Pool) {
  return {
    getPosts: async function (userId: number) {
      // temp solution; need revisit
      const sql =
        'WITH cte_likes AS ( SELECT postid, COUNT(*) AS total_likes FROM postlike GROUP BY postid) SELECT p.id, p.title, p.body, p.createdAt AS "createdAt", u.id AS "userId", u.username, coalesce(l.total_likes, 0) AS likes, EXISTS(SELECT * FROM postlike pl JOIN useraccount u ON u.id = pl.userid AND pl.postid = p.id WHERE u.id = $1) AS liked, u.username FROM post p LEFT JOIN cte_likes l ON p.id = l.postid LEFT JOIN useraccount u ON u.id = p.userid ORDER BY p.createdAt DESC'
      const result = await db.query(sql, [userId])
      const posts = result.rows as Post[]
      return posts.map(mapPost)
    },

    getPost: async function (id: string, userId: number) {
      // temp solution; need revisit
      const sql =
        'WITH cte_likes AS ( SELECT postid, COUNT(*) AS total_likes FROM postlike GROUP BY postid) SELECT p.id, p.title, p.body, p.createdAt AS "createdAt", u.id AS "userId", u.username, coalesce(l.total_likes, 0) AS likes, EXISTS(SELECT * FROM postlike pl JOIN useraccount u ON u.id = pl.userid AND pl.postid = p.id WHERE u.id = $1) AS liked, u.username FROM post p LEFT JOIN cte_likes l ON p.id = l.postid LEFT JOIN useraccount u ON u.id = p.userid WHERE p.id = $2'
      const result = await db.query(sql, [userId, id])
      return result.rows.map(mapPost)[0]
    },

    createPost: async function (userId: number, post: PostBase) {
      const sql =
        'INSERT INTO Post (title, body, userId) VALUES ($1, $2, $3) RETURNING id'
      const result = await db.query(sql, [post.title, post.body, userId])
      return await this.getPost(result.rows[0].id, userId)
    },

    likePost: async function (postId: string, userId: number) {
      let sql = 'SELECT userId from PostLike WHERE postId = $1 AND userId = $2'
      const liked = await db.query(sql, [postId, userId])
      if (!liked.rows.length) {
        sql = 'INSERT INTO PostLike (postId, userId) VALUES ($1, $2)'
        await db.query(sql, [postId, userId])
      }
    },

    dislikePost: async function (postId: string, userId: number) {
      let sql = 'SELECT userId from PostLike WHERE postId = $1 AND userId = $2'
      const liked = await db.query(sql, [postId, userId])
      if (liked.rows.length) {
        sql = 'DELETE FROM PostLike WHERE postId = $1 AND userId = $2'
        await db.query(sql, [postId, userId])
      }
    }
  }
}
