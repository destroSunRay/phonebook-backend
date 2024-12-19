const Person = require('../models/person')
const personsRouter = require('express').Router()


personsRouter.get('/', (req, res, next) => {
  Person.find({})
    .then((personsAPI) => res.json(personsAPI))
    .catch((error) => next(error))
})

personsRouter.get('/info', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(`<p>Phonebook has info for ${persons.length} people</p>\
      <p>${new Date()}</p>`)
    })
    .catch((error) => next(error))
})

personsRouter.get('/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => (person ? res.json(person) : res.status(404).end()))
    .catch((error) => next(error))
})

personsRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})

personsRouter.post('/', (req, res, next) => {
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

personsRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

module.exports = personsRouter
