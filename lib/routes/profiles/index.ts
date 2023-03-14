import { type FastifyPluginCallback } from 'fastify'
import { type Config } from '../../config/config'
import fp from 'fastify-plugin'
import profilesModel from '../../models/profiles'
import type { GetProfileRoute } from './types'

const profiles: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = profilesModel(server.db)

  server.route<GetProfileRoute>({
    method: 'GET',
    url: options.prefix + 'profiles/:username',
    handler: async (req, reply) => {
      const user = await model.getByUsername(req.params.username)
      if (!user) {
        return reply.code(404).send({ message: 'User not found' })
      }
      return { user }
    }
  })

  done()
}

export default fp(profiles)
