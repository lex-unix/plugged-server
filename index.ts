import * as dotenv from 'dotenv'
import fastify from 'fastify'
import { getConfig } from './lib/config/config'
import startServer from './lib/server'

dotenv.config()

const main = async () => {
  process.on('unhandledRejection', err => {
    console.error(err)

    process.exit(1)
  })

  const config = getConfig()

  const server = fastify(config.server)
  server.register(startServer, config)

  const address = await server.listen(config.listen)
  server.log.info(`Server running at: ${address}`)
}

main()
