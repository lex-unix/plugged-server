import { createPool } from '../../../db/pool'
import { FastifyPluginCallback } from 'fastify'
import { Config } from '../../config/config'
import fp from 'fastify-plugin'

const fastifyPg: FastifyPluginCallback<Config> = (fastify, options, next) => {
  try {
    const pool = createPool(options.db)
    fastify.decorate('db', pool)
    fastify.addHook('onClose', (instance, done) => {
      if (instance.db === pool) {
        instance.db.end().then(() => instance.log.info('DB connection closed'))
      }

      done()
    })
  } catch (err) {
    next(err as Error)
  }

  next()
}

export default fp(fastifyPg)
