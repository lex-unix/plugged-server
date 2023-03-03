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

interface LoginRoute {
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
        req.session.userId = user.id

        return { user }
      } catch (err) {
        server.log.error(err)
      }
    }
  })

  server.route<LoginRoute>({
    method: 'POST',
    url: options.prefix + 'users/login',
    schema: schema.login,
    handler: async (req, reply) => {
      const { user } = await model.getUserByUsername(req.body.username)
      if (!user) {
        return reply.code(404).send({ message: 'Username not found' })
      }

      if (!(await argon2.verify(user.password, req.body.password))) {
        return reply.code(401).send({ message: "Passwords don't match" })
      }

      req.session.userId = user.id

      return { user }
    }
  })

  server.route({
    method: 'POST',
    url: options.prefix + 'users/logout',
    handler: async (req, reply) => {
      try {
        await req.session.destroy()
        reply.code(205)
      } catch (err) {
        server.log.error(err)
      }
    }
  })

  server.route({
    method: 'GET',
    url: options.prefix + 'users/me',
    handler: async req => {
      if (!req.session.userId) {
        return { user: null }
      }
      const user = await model.getUserById(req.session.userId)

      return { user }
    }
  })

  server.route({
    method: 'POST',
    url: options.prefix + 'users/upload',
    handler: async (req, reply) => {
      const data = await req.file()

      if (!data) {
        return reply.code(401).send({ message: 'File is not attached' })
      }

      const [type, subtype] = data.mimetype.split('/')
      if (!type.startsWith('image')) {
        return reply
          .code(415)
          .send({ message: `${subtype} files are not supported` })
      }

      const username = (req.query as any).username
      const buffer = await data.toBuffer()
      const { data: imageData, error } = await server.storage
        .from('avatar')
        .upload(`${username}/avatar.${subtype}`, buffer, {
          contentType: data.mimetype,
          upsert: true
        })

      if (!imageData || error) {
        throw error
      }

      const { data: imageUrl } = server.storage
        .from('avatar')
        .getPublicUrl(imageData.path)

      reply.code(201).send({ message: imageUrl.publicUrl })
    }
  })

  done()
}

export default fp(users)
