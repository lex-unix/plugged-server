import { Pool } from 'pg'

export default function profilesModel(db: Pool) {
  return {
    getByUsername: async function (username: string) {
      const sql = `SELECT id, username, CONCAT(firstname, ' ', lastname) as name, avatar FROM UserAccount WHERE username = $1`
      const { rows } = await db.query(sql, [username])
      return rows[0]
    }
  }
}
