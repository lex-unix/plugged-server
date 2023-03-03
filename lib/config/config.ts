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
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
