import { Pool } from 'pg'

interface CommentBase {
  body: string
}

interface Comment extends CommentBase {
  id: number
  userId: number
  username: string
  createdAt: string
  avatar: string
  name: string
}

const mapComment = (comment: Comment) => {
  const author = {
    id: comment.userId,
    username: comment.username,
    name: comment.name,
    avatar: comment.avatar
  }

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    author
  }
}

export default function commentsModel(db: Pool) {
  return {
    getComments: async function (postId: string) {
      const sql = `SELECT c.id, c.body, c.createdAt as "createdAt", u.id as "userId", u.username, CONCAT(u.firstname, ' ', u.lastname) as name, u.avatar FROM Comment c INNER JOIN UserAccount u ON c.userId = u.id WHERE c.postId = $1`
      const result = await db.query(sql, [postId])
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
    }
  }
}
