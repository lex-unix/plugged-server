import { Pool } from 'pg'

interface CommentBase {
  body: string
}

const mapComment = (comment: any) => {
  comment.author = {
    id: comment.userId,
    username: comment.username,
    name: comment.name,
    avatar: comment.avatar
  }

  delete comment.userId
  delete comment.name, delete comment.username
  delete comment.avatar

  comment.likes = parseInt(comment.likes)

  return comment
}

const userFields = `u.id as "userId", u.username, CONCAT(u.firstname, ' ', u.lastname) as name, u.avatar, EXISTS(SELECT userId FROM CommentLike cl JOIN useraccount u ON u.id = cl.userId AND cl.commentId = c.id WHERE u.id = $2) as liked, EXISTS(SELECT userId FROM SavedComment sc JOIN useraccount u ON u.id = sc.userId AND sc.commentId = c.id WHERE u.id = $2) as saved`
const commentFields = `c.id, c.body, c.createdAt as "createdAt"`

export default function commentsModel(db: Pool) {
  return {
    getComments: async function (postId: string, userId: number) {
      const sql = `WITH cte_likes AS (SELECT commentId, COUNT(*) as total_likes FROM CommentLike GROUP BY commentId) SELECT ${commentFields}, coalesce(l.total_likes, 0) AS likes, ${userFields} FROM Comment c INNER JOIN UserAccount u ON c.userId = u.id LEFT JOIN cte_likes l ON c.id = l.commentId WHERE c.postId = $1 ORDER BY c.createdAt DESC`
      const result = await db.query(sql, [postId, userId])
      console.log(result.rows)
      return result.rows.map(mapComment)
    },

    getComment: async function (commentId: number | string) {
      const sql = `SELECT c.id, c.body, c.createdAt as "createdAt", u.id as "userId", u.username, CONCAT(u.firstname, ' ', u.lastname) as name, u.avatar FROM Comment c INNER JOIN UserAccount u ON c.userId = u.id WHERE c.id = $1`
      const result = await db.query(sql, [commentId])
      return result.rows.map(mapComment)[0]
    },

    createComment: async function (
      userId: number,
      postId: string,
      comment: CommentBase
    ) {
      const sql =
        'INSERT INTO Comment (userId, postId, body) VALUES ($1, $2, $3) RETURNING id'
      const result = await db.query(sql, [userId, postId, comment.body])
      return await this.getComment(result.rows[0].id)
    },

    deleteComment: async function (userId: number, commentId: string) {
      const sql = 'DELETE FROM Comment WHERE userId = $1 AND id = $2'
      await db.query(sql, [userId, commentId])
    },

    likeComment: async function (userId: number, commentId: string) {
      const values = [userId, commentId]
      let sql = `SELECT userId FROM CommentLike WHERE userId = $1 AND commentId = $2`
      const result = await db.query(sql, values)
      if (!result.rows.length) {
        sql = `INSERT INTO CommentLike (userId, commentId) VALUES ($1, $2)`
        await db.query(sql, values)
      }
    },

    dislikeComment: async function (userId: number, commentId: string) {
      const values = [userId, commentId]
      let sql = `SELECT userId FROM CommentLike WHERE userId = $1 AND commentId = $2`
      const result = await db.query(sql, values)
      if (result.rows.length) {
        sql = `DELETE FROM CommentLike WHERE userId = $1 AND commentId = $2`
        await db.query(sql, values)
      }
    },

    saveComment: async function (userId: number, commentId: string) {
      const values = [userId, commentId]
      let sql = `SELECT userId FROM SavedComment WHERE userId = $1 AND commentId = $2`
      const result = await db.query(sql, values)
      if (!result.rows.length) {
        sql = `INSERT INTO SavedComment (userId, commentId) VALUES ($1, $2)`
        await db.query(sql, values)
      }
    },

    unsaveComment: async function (userId: number, commentId: string) {
      const values = [userId, commentId]
      let sql = `SELECT userId FROM SavedComment WHERE userId = $1 AND commentId = $2`
      const result = await db.query(sql, values)
      if (result.rows.length) {
        sql = `DELETE FROM SavedComment WHERE userId = $1 AND commentId = $2`
        await db.query(sql, values)
      }
    }
  }
}
