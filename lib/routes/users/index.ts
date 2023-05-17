import * as fs from 'node:fs'
import { pipeline } from 'node:stream'
import type { FastifyPluginCallback } from 'fastify'
import type { Config } from '../../config/config'
import { schema } from './schema'
import fp from 'fastify-plugin'
import * as argon2 from 'argon2'
import usersModel from '../../models/users'
import type {
  RegisterRoute,
  LoginRoute,
  UploadRoute,
  UpdateRoute
} from './types'

const users: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = usersModel(server.db)

  server.route<RegisterRoute>({
    method: 'POST',
    url: options.prefix + 'users/register',
    schema: schema.register,
    handler: async (req, reply) => {
      const usernameExists = await model.getUserByUsername(
        req.body.user.username
      )

      if (usernameExists) {
        return reply
          .code(409)
          .send({ message: 'Username already taken', field: 'username' })
      }

      const emailExists = await model.getUserByEmail(req.body.user.email)

      if (emailExists) {
        return reply
          .code(409)
          .send({ message: 'Email already taken', field: 'email' })
      }

      let hash: string
      try {
        const { password } = req.body.user
        hash = await argon2.hash(password)
        const user = await model.registerUser(req.body.user, hash)
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
      const user = await model.getUserByUsername(req.body.username)
      if (!user) {
        return reply
          .code(404)
          .send({ message: 'Username not found', field: 'username' })
      }

      if (!(await argon2.verify(user.password, req.body.password))) {
        return reply
          .code(401)
          .send({ message: "Passwords don't match", field: 'password' })
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

  server.route<UpdateRoute>({
    method: 'PUT',
    url: options.prefix + 'user',
    schema: schema.update,
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      const user = req.body.user
      const oldUser = await model.getUserById(req.session.userId)
      if (!oldUser) {
        return reply.code(404).send({ message: 'User not found' })
      }

      const promises = [
        model.getUserByUsername(user.username),
        model.getUserByEmail(user.email)
      ]
      const [isExistingUsername, isExistingEmail] = await Promise.allSettled(
        promises
      )
      if (
        isExistingUsername.status === 'fulfilled' &&
        isExistingUsername.value
      ) {
        const isSameUser = isExistingUsername.value.id === req.session.userId
        if (!isSameUser) {
          return reply
            .code(409)
            .send({ message: 'Username already taken', field: 'username' })
        }
      }
      if (isExistingEmail.status === 'fulfilled' && isExistingEmail.value) {
        const isSameUser = isExistingEmail.value.id === req.session.userId
        if (!isSameUser) {
          return reply.code(409).send({
            message: 'This email is associated with another account',
            field: 'email'
          })
        }
      }

      const newUser = await model.updateUser(user, req.session.userId)
      return { user: newUser }
    }
  })

  server.route<UploadRoute>({
    method: 'POST',
    url: options.prefix + 'users/upload/:id',
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

      const { data: imageData, error } = await server.storage
        .from('avatar')
        .upload(`${req.params.id}/avatar.${subtype}`, data.file, {
          contentType: data.mimetype,
          upsert: true
        })

      if (!imageData || error) {
        throw error
      }

      const { data: imageUrl } = server.storage
        .from('avatar')
        .getPublicUrl(imageData.path)

      await model.addUserAvatar(req.params.id, imageUrl.publicUrl)

      reply.code(201).send({ message: imageUrl.publicUrl })
    }
  })

  done()
}

export default fp(users)
