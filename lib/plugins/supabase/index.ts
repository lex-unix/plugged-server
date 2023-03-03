import { type FastifyPluginCallback } from 'fastify'
import { type Config } from '../../config/config'
import fp from 'fastify-plugin'
import { StorageClient } from '@supabase/storage-js'

const fastifyStorage: FastifyPluginCallback<Config> = (
  fastify,
  options,
  done
) => {
  try {
    const { storage } = options
    const client = new StorageClient(storage.url, {
      apikey: storage.secret,
      Authorization: `Bearer ${storage.secret}`
    })
    fastify.decorate('storage', client)
  } catch (err) {
    done(err as Error)
  }

  done()
}

export default fp(fastifyStorage)
