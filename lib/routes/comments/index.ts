import type { FastifyPluginCallback } from 'fastify'
import type { Config } from '../../config/config'
import fp from 'fastify-plugin'
import commentsModel from '../../models/comments'
import { schema } from './schema'
import type {
  GetCommentsRoute,
  CreateCommentRoute,
  DeleteCommentRoute,
  LikeCommentRoute,
  SaveCommentRoute
} from './types'

const comments: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = commentsModel(server.db)

  server.route<GetCommentsRoute>({
    method: 'GET',
    url: options.prefix + 'posts/:slug/comments',
    schema: schema.get,
    handler: async req => {
      const comments = await model.getComments(
        req.params.slug,
        req.session.userId
      )
      return { comments }
    }
  })

  server.route<CreateCommentRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:slug/comments',
    schema: schema.insert,
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      const comment = await model.createComment(
        req.session.userId,
        req.params.slug,
        req.body.comment
      )
      reply.code(201)

      return { comment }
    }
  })

  server.route<DeleteCommentRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:slug/comments/:id',
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      await model.deleteComment(req.session.userId, req.params.id)
      reply.code(204)
    }
  })

  server.route<LikeCommentRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:slug/comments/:id/like',
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      await model.likeComment(req.session.userId, req.params.id)
      reply.code(201)
    }
  })

  server.route<LikeCommentRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:slug/comments/:id/like',
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      await model.dislikeComment(req.session.userId, req.params.id)
      reply.code(204)
    }
  })

  server.route<SaveCommentRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:slug/comments/:id/save',
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      await model.saveComment(req.session.userId, req.params.id)
      reply.code(201)
    }
  })

  server.route<SaveCommentRoute>({
    method: 'DELETE',
    url: options.prefix + 'posts/:slug/comments/:id/save',
    onRequest: [server.authorize],
    handler: async (req, reply) => {
      await model.unsaveComment(req.session.userId, req.params.id)
      reply.code(204)
    }
  })

  done()
}

export default fp(comments)
