const express = require("express")
const morgan = require("morgan")
const app = express()

app.use(express.json())

morgan.token("payload", function (req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :payload"))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "Edward Tivruski",
    number: "021-2142142142",
    id: 5,
  },
]

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/info", (req, res) => {
  const requestTime = new Date(Date.now())

  res.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${requestTime}</p>`)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find((person) => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter((person) => person.id !== id)

  res.status(204).end()
})

app.post("/api/persons", (req, res) => {
  const body = req.body
  const id = Math.floor(Math.random() * 100000)
  const nameExists = persons.some((person) => person.name === body.name)

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number is missing",
    })
  }

  if (nameExists) {
    return res.status(400).json({
      error: "name already exists",
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id,
  }

  persons = persons.concat(newPerson)

  res.json(newPerson)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
