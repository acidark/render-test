const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
require('express-async-errors')

mongoose.set('strictQuery',false)
// const TEST_MONGODB_URI = 'mongodb+srv://atomikx:d3AFlmFd6SzAcSgf@cluster0.ribgxny.mongodb.net/testNoteApp?retryWrites=true&w=majority'
logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to db')
  }).catch(error => {
    logger.error('error connecting to db : ', error.message)
  })

app.use(cors())
app.use(express.static('build'))

app.use(express.json())

app.use(middleware.requestLogger)

app.use('/api/notes',notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app