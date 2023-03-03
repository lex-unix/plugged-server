import { type FastifyPluginCallback } from 'fastify'
import { type Config } from '../../config/config'
import fp from 'fastify-plugin'
import { createClient } from '@supabase/supabase-js'

const fastifyStorage: FastifyPluginCallback<Config> = (
  fastify,
  options,
  done
) => {
  try {
    const { storage } = options
    const client = createClient(storage.url, storage.secret)
    fastify.decorate('storage', client.storage)
  } catch (err) {
    done(err as Error)
  }

  done()
}

export default fp(fastifyStorage)
