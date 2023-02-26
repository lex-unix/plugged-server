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

const posts: FastifyPluginCallback<Config> = (server, options, done) => {
  const model = postsModel(server.db)

  server.route({
    method: 'GET',
    url: options.prefix + 'posts',
    schema: schema.getPosts,
    handler: async () => {
      const { posts } = await model.getPosts()
      return {
        posts
      }
    }
  })

  server.route<PostRoute>({
    method: 'GET',
    url: options.prefix + 'posts/:id',
    schema: schema.getPost,
    handler: async (req, reply) => {
      const { post } = await model.getPost(req.params.id)

      if (post) {
        return {
          post
        }
      }

      reply.code(404).send({ message: 'Post not found' })
    }
  })

  done()
}

export default fp(posts)
