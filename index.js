require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())

const cors = require('cors')

app.use(cors())

morgan.token('content-body', function (req, res) {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
    return })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content-body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people=> {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    const name = body.name
    const number = body.number
  
    if (!name || !number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }
  
    const person = new Person({
      name: name,
      number: number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      var date = new Date()
      response.send(`Phonebook has info for ${count} people <br><br> ${date}`)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 
