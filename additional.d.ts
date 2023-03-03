import { StorageClient } from '@supabase/storage-js'
import { Pool } from 'pg'

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
    storage: StorageClient
  }

  interface Session {
    userId: number
  }
}
