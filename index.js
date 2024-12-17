require('dotenv').config()
const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
)

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : null
})

// setup the logger
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      stream: accessLogStream,
    }
  )
)

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((personsAPI) => res.json(personsAPI))
    .catch((error) => next(error))
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(`<p>Phonebook has info for ${persons.length} people</p>\
      <p>${new Date()}</p>`)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => (person ? res.json(person) : res.status(404).end()))
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: 'Bad data. name feild is missing.',
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'Bad data. number feild is missing.',
    })
  }

  const person = new Person({ name: body.name, number: body.number })

  person
    .save()
    .then((savedNote) => res.status(201).json(savedNote))
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

// Unknown Endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// Error Handling Middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

// S
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
