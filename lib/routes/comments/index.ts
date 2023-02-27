import type { FastifyPluginCallback } from 'fastify'
import type { Config } from '../../config/config'
import fp from 'fastify-plugin'
import commentsModel from '../../models/comments'
import { schema } from './schema'

interface Params {
  slug: string
}
interface ParamsWithId extends Params {
  id: string
}

interface GetCommentsRoute {
  Params: Params
}

interface CreateCommentRoute {
  Params: Params
  Body: {
    comment: {
      body: string
    }
  }
}

interface DeleteCommentRoute {
  Params: ParamsWithId
}

const comments: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = commentsModel(server.db)

  server.route<GetCommentsRoute>({
    method: 'GET',
    url: options.prefix + 'posts/:slug/comments',
    schema: schema.get,
    handler: async req => {
      const comments = await model.getComments((req.params as any).slug)
      return { comments }
    }
  })

  server.route<CreateCommentRoute>({
    method: 'POST',
    url: options.prefix + 'posts/:slug/comments',
    schema: schema.insert,
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
    handler: async (req, reply) => {
      await model.deleteComment(req.session.userId, req.params.id)
      reply.code(204)
    }
  })
  done()
}

export default fp(comments)
