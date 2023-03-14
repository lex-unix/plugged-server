import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import postsModel from '../../models/posts'
import { type Config } from '../../config/config'
import { schema } from './schema'
import type {
  GetPostRoute,
  CreatePostRoute,
  DeletePostRoute,
  LikePostRoute,
  SavePostRoute
} from './types'

const posts: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = postsModel(server.db)

  server.route({
    method: 'GET',
    url: options.prefix + 'posts',
    schema: schema.getPosts,
    handler: async req => {
      const posts = await model.getPosts(req.session.userId)
      return { posts }
    }
  })

  server.route<GetPostRoute>({
    method: 'GET',
    url: options.prefix + 'posts/:id',
    schema: schema.getPost,
    handler: async (req, reply) => {
      const post = await model.getPost(req.params.id, req.session.userId)

      if (post) {
        return { post }
      }

      reply.code(404).send({ message: 'Post not found' })
    }
  })

  server.route<CreatePostRoute>({
    method: 'POST',
    url: options.prefix + 'posts',
    schema: schema.insert,
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async (req, reply) => {
      const post = await model.createPost(req.session.userId, req.body.post)
      reply.code(201)
      return { post }
    }
  })

  server.route<DeletePostRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:id',
    handler: async (req, reply) => {
      const id = req.params.id
      const post = await model.getPost(id, req.session.userId)
      if (!post) {
        return reply.code(404).send({ message: 'Post not found' })
      }
      await model.deletePost(id)
    }
  })

  server.route<LikePostRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:id/like',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        return reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async req => {
      await model.likePost(req.params.id, req.session.userId)
    }
  })

  server.route<LikePostRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:id/like',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        return reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async req => {
      await model.dislikePost(req.params.id, req.session.userId)
    }
  })

  server.route<SavePostRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:id/save',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        return reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async (req, reply) => {
      await model.savePost(req.params.id, req.session.userId)
      reply.code(204)
    }
  })

  server.route<SavePostRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:id/save',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        return reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async (req, reply) => {
      await model.unsavePost(req.params.id, req.session.userId)
      reply.code(204)
    }
  })

  server.route({
    method: 'GET',
    url: options.prefix + 'posts/:username/all',
    handler: async (req, reply) => {
      const username: string = (req.params as any).username
      const posts = await model.getUserPosts(req.session.userId, username)
      return { posts }
    }
  })

  done()
}

export default fp(posts)
