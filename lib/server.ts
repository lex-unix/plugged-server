import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import path from 'node:path'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import type { Config } from './config/config'

const plugin: FastifyPluginCallback<Config> = async (server, config, done) => {
  server.register(cookie)
  server.register(cors, {
    origin: config.corsOrigin,
    credentials: true
  })
  server.register(multipart, {
    limits: { fileSize: 4000000 }
  })

  server.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    options: config
  })

  server.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
    options: config
  })

  done()
}

export default fp(plugin)
