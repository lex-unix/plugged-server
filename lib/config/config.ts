import type { FastifyListenOptions, FastifyServerOptions } from 'fastify'
import type { PoolConfig } from 'pg'

export function getConfig() {
  const server: FastifyServerOptions = {
    logger: {
      level: 'debug',
      serializers: {
        req: request => ({
          method: request.raw.method,
          url: request.raw.url,
          hostname: request.hostname
        }),
        res: response => ({
          statusCode: response.statusCode
        })
      }
    }
  }

  const db: PoolConfig = {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  }

  const listen: FastifyListenOptions = {
    host: process.env.HOST,
    port: parseInt(process.env.PORT)
  }

  const storage = {
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET
  }

  return {
    server,
    db,
    storage,
    listen,
    prefix: '/api',
    cookieName: process.env.COOKIE_NAME,
    cookieSecret: process.env.COOKIE_SECRET,
    redisUrl: process.env.REDIS_URL,
    corsOrigin: process.env.CORS_ORIGIN
  }
}

export type Config = ReturnType<typeof getConfig>
