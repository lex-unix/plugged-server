import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import postsModel from '../../models/posts'
import { type Config } from '../../config/config'
import { schema } from './schema'

interface PostRoute {
  Params: {
    id: string
  }
}

interface CreatePostRoute {
  Body: {
    post: {
      title: string
      body: string
    }
  }
}

const posts: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = postsModel(server.db)

  server.route({
    method: 'GET',
    url: options.prefix + 'posts',
    schema: schema.getPosts,
    handler: async () => {
      const posts = await model.getPosts()
      return { posts }
    }
  })

  server.route<PostRoute>({
    method: 'GET',
    url: options.prefix + 'posts/:id',
    schema: schema.getPost,
    handler: async (req, reply) => {
      const post = await model.getPost(req.params.id)

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

  server.route<PostRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:id/like',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async req => {
      await model.likePost(req.params.id, req.session.userId)
    }
  })

  server.route<PostRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:id/like',
    onRequest: async (req, reply) => {
      if (!req.session.userId) {
        reply.code(401).send({ message: 'You must be logged in' })
      }
    },
    handler: async req => {
      await model.dislikePost(req.params.id, req.session.userId)
    }
  })

  done()
}

export default fp(posts)
