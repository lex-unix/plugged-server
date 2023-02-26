import type { FastifyPluginCallback } from 'fastify'
import { type Config } from 'lib/config/config'
import fp from 'fastify-plugin'

const hello: FastifyPluginCallback<Config> = (server, options, done) => {
  server.route({
    method: 'GET',
    url: options.prefix + 'hello',
    handler: () => {
      return 'hello world'
    }
  })

  done()
}

export default fp(hello)
