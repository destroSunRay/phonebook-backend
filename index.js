require("dotenv").config();
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const Person = require("./models/person");
const { error } = require("console");

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

morgan.token("body", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : null;
});

// setup the logger
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
    {
      stream: accessLogStream,
    }
  )
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((personsAPI) => res.json(personsAPI))
    .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(`<p>Phonebook has info for ${persons.length} people</p>\
      <p>${new Date()}</p>`);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => (person ? res.json(person) : res.status(404).end()))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

const generateId = () => {
  const newId = String(Math.floor(Math.random() * 1000000000));
  const idx = persons.findIndex((person) => person.id === newId);
  if (idx >= 0) {
    return generateId();
  }
  return newId;
};

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: "Bad data. Name should be passed.",
    });
  } else if (persons.some((person) => person.name === body.name)) {
    return res.status(400).json({
      error: "Bad data. Name must be unique.",
    });
  }

  if (!body.number) {
    return res.status(400).json({
      error: "Bad data. Number should be passed.",
    });
  }

  const person = new Person({ name: body.name, number: body.number });

  person.save().then((savedNote) => res.status(201).json(savedNote));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

// Unknown Endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// Error Handling Middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

// S
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
