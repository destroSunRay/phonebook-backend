const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

app.use(cors());
const app = express();
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
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>\
    <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => person.id == id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
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

  const person = { id: generateId(), ...body };

  persons = persons.concat(person);

  res.status(201).json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
