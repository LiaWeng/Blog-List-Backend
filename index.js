const app = require('./app')
const logger = require('./utils/logger')
const config = require('./utils/config')

const http = require('http')
const server = http.createServer(app)

const PORT = process.env.PORT || config.PORT

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})