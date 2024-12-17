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

app.get("/api/persons", (req, res) => {
  Person.find({}).then((personsAPI) => {
    res.json(personsAPI);
  });
});

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>\
    <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => res.json(person))
    .catch((error) => res.status(404).end());
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
