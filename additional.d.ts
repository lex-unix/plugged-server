import { Pool } from 'pg'

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
  }

  interface Session {
    userId: number
  }
}
