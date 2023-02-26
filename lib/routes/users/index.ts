import type { FastifyPluginCallback } from 'fastify'
import type { Config } from '../../config/config'
import { schema } from './schema'
import fp from 'fastify-plugin'
import * as argon2 from 'argon2'
import usersModel from '../../models/users'

interface RegisterRoute {
  Body: {
    username: string
    password: string
  }
}

const users: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = usersModel(server.db)

  server.route<RegisterRoute>({
    method: 'POST',
    url: options.prefix + 'users/register',
    schema: schema.register,
    handler: async (req, reply) => {
      const { user: existingUser } = await model.getUserByUsername(
        req.body.username
      )

      if (existingUser) {
        return reply.code(409).send({ message: 'Username already taken' })
      }

      let password: string
      try {
        password = await argon2.hash(req.body.password)
        const { user } = await model.registerUser(req.body.username, password)

        return {
          user
        }
      } catch (err) {
        server.log.error(err)
      }
    }
  })

  done()
}

export default fp(users)
