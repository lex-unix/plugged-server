import type { Pool } from 'pg'

interface User {
  id: number
  username: string
  password: string
}

export default function usersModel(db: Pool) {
  return {
    registerUser: async (username: string, password: string) => {
      const sql =
        'INSERT INTO UserAccount (username, password) VALUES ($1, $2) RETURNING *'
      const result = await db.query(sql, [username, password])
      const user = result.rows[0] as User

      return {
        user
      }
    },
    getUserByUsername: async (username: string) => {
      const sql =
        'SELECT id, username, password FROM UserAccount WHERE username = $1'
      const result = await db.query(sql, [username])
      const user = result.rows[0] as User
      return {
        user
      }
    },

    getUserById: async (id: number) => {
      const sql = 'SELECT id, username FROM UserAccount WHERE id = $1'
      const result = await db.query(sql, [id])
      return result.rows[0] as User
    }
  }
}
