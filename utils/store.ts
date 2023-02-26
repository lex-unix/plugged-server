import { Redis } from 'ioredis'
import type { Session } from 'fastify'

interface RedisStoreOptions {
  prefix?: string
  client: Redis
}

// eslint-disable-next-line  @typescript-eslint/no-empty-function
const noop = () => {}

export class RedisStore {
  prefix: string
  client: Redis
  ttl: number

  constructor(options: RedisStoreOptions) {
    this.prefix = options.prefix || 'sess:'
    this.client = options.client
    this.ttl = 86400
  }

  get(sessionId: string, cb: any = noop) {
    const key = this.prefix + sessionId

    this.client.get(key, (err, data) => {
      if (err) return cb(err)
      if (!data) return cb()

      let result
      try {
        result = JSON.parse(data)
      } catch (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  }

  set(sessionId: string, session: Session, cb: any = noop) {
    const key = this.prefix + sessionId

    let value
    try {
      value = JSON.stringify(session)
    } catch (err) {
      return cb(err)
    }

    const ttl = this._getTTL(session)
    if (ttl > 0) {
      this.client.set(key, value, 'EX', ttl, cb)
    } else {
      this.destroy(sessionId, cb)
    }
  }

  destroy(sessionId: string, cb: any = noop) {
    const key = this.prefix + sessionId
    this.client.del(key, cb)
  }

  _getTTL(session: Session) {
    let ttl
    if (session && session.cookie && session.cookie.expires) {
      const ms = Number(new Date(session.cookie.expires)) - Date.now()
      ttl = Math.ceil(ms / 1000)
    } else {
      ttl = this.ttl
    }
    return ttl
  }
}
