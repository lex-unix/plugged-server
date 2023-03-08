import type { Pool } from 'pg'

interface UserBase {
  username: string
  firstname: string
  lastname: string
  email: string
}

interface User extends UserBase {
  id: number
  password: string
}

export default function usersModel(db: Pool) {
  return {
    registerUser: async function (user: UserBase, hash: string) {
      const sql =
        'INSERT INTO UserAccount (username, password, firstname, lastname, email) VALUES ($1, $2, $3, $4, $5) RETURNING id'
      const values = [
        user.username,
        hash,
        user.firstname,
        user.lastname,
        user.email
      ]
      const result = await db.query(sql, values)
      const { id } = result.rows[0] as { id: number }

      return await this.getUserById(id)
    },

    getUserByUsername: async function (username: string) {
      const sql =
        'SELECT id, username, password, firstname, lastname, email, avatar FROM UserAccount WHERE username = $1'
      const result = await db.query(sql, [username])
      return result.rows[0] as User
    },

    getUserById: async function (id: number) {
      const sql =
        'SELECT id, username, firstname, lastname, email FROM UserAccount WHERE id = $1'
      const result = await db.query(sql, [id])
      return result.rows[0] as User
    },

    getUserByEmail: async function (email: string) {
      const sql = 'SELECT id FROM UserAccount WHERE email = $1'
      const result = await db.query(sql, [email])
      return result.rows[0]
    },

    addUserAvatar: async function (id: string, url: string) {
      const sql = 'UPDATE UserAccount SET avatar = $1 WHERE id = $2'
      await db.query(sql, [url, id])
    }
  }
}
