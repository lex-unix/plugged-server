import { Pool } from 'pg'

export interface PostBase {
  title: string
  body: string
}

const mapPost = (post: any) => {
  post.author = {
    id: post.userId,
    username: post.username,
    name: post.name,
    avatar: post.avatar
  }

  delete post.userId
  delete post.username, delete post.name, delete post.avatar

  post.likes = parseInt(post.likes)
  post.comments = parseInt(post.comments)

  return post
}

const userFields = `u.id as "userId", u.username, CONCAT(u.firstname, ' ', u.lastname) as name, u.avatar`
const postFileds = `p.id, p.title, p.body, p.createdAt as "createdAt"`

export default function postsModel(db: Pool) {
  return {
    getPosts: async function (userId: number) {
      // temp solution; need revisit
      const sql = `WITH cte_likes AS ( SELECT postid, COUNT(*) AS total_likes FROM postlike GROUP BY postid), cte_comments AS (SELECT postId, COUNT(*) as total_comments FROM Comment GROUP BY postId) SELECT ${postFileds}, ${userFields}, coalesce(l.total_likes, 0) AS likes, coalesce(c.total_comments, 0) AS comments, EXISTS(SELECT * FROM postlike pl JOIN useraccount u ON u.id = pl.userid AND pl.postid = p.id WHERE u.id = $1) AS liked, EXISTS(SELECT userId FROM SavedPost sp JOIN useraccount u on p.id = sp.postId AND u.id = sp.userId  WHERE u.id = $1) as saved FROM post p LEFT JOIN cte_likes l ON p.id = l.postid LEFT JOIN cte_comments c ON p.id = c.postId LEFT JOIN useraccount u ON u.id = p.userid ORDER BY p.createdAt DESC`
      const result = await db.query(sql, [userId])
      const posts = result.rows
      console.log(posts)
      return posts.map(mapPost)
    },

    getPost: async function (id: string, userId: number) {
      // temp solution; need revisit
      const sql = `WITH cte_likes AS ( SELECT postid, COUNT(*) AS total_likes FROM postlike GROUP BY postid), cte_comments AS (SELECT postId, COUNT(*) as total_comments FROM Comment GROUP BY postId) SELECT ${postFileds}, ${userFields}, coalesce(l.total_likes, 0) AS likes, coalesce(c.total_comments, 0) as comments, EXISTS(SELECT * FROM postlike pl JOIN useraccount u ON u.id = pl.userid AND pl.postid = p.id WHERE u.id = $1) AS liked, EXISTS(SELECT userId FROM SavedPost sp JOIN useraccount u on p.id = sp.postId AND u.id = sp.userId  WHERE u.id = $1) as saved FROM post p LEFT JOIN cte_likes l ON p.id = l.postid LEFT JOIN cte_comments c ON p.id = c.postId LEFT JOIN useraccount u ON u.id = p.userid WHERE p.id = $2`
      const result = await db.query(sql, [userId, id])
      return result.rows.map(mapPost)[0]
    },

    createPost: async function (userId: number, post: PostBase) {
      const sql =
        'INSERT INTO Post (title, body, userId) VALUES ($1, $2, $3) RETURNING id'
      const result = await db.query(sql, [post.title, post.body, userId])
      return await this.getPost(result.rows[0].id, userId)
    },

    deletePost: async function (postId: string) {
      const sql = `DELETE FROM Post WHERE id = $1`
      await db.query(sql, [postId])
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
    },

    savePost: async function (postId: string, userId: number) {
      let sql = 'SELECT userId from SavedPost WHERE postId = $1 AND userId = $2'
      const result = await db.query(sql, [postId, userId])
      if (!result.rows.length) {
        sql = 'INSERT INTO SavedPost (postId, userId) VALUES ($1, $2)'
        await db.query(sql, [postId, userId])
      }
    },

    unsavePost: async function (postId: string, userId: number) {
      let sql = 'SELECT userId from SavedPost WHERE postId = $1 AND userId = $2'
      const result = await db.query(sql, [postId, userId])
      if (result.rows.length) {
        sql = 'DELETE FROM SavedPost WHERE postId = $1 AND userId = $2'
        await db.query(sql, [postId, userId])
      }
    }
  }
}
