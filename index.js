const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");

morgan.token("req-body", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());
app.use(morgan(":method :url :status :response-time ms - :req-body"));

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  const date = new Date().toUTCString();
  const maxPersons = persons.length;
  const info = `Phonebook has info for ${maxPersons} people <br/> ${date}`;
  res.send(info);
});

app.get("/api/persons", (req, res) => {
  res.status(201).json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    res.status(200).json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons.filter((p) => p.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  const generateId = persons.length + 1;

  const personObj = {
    name: body.name,
    number: body.number,
    id: generateId,
  };

  const checkedPerson = persons.some((p) => p.name === body.name);

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "content missing" });
  } else if (checkedPerson) {
    return res.status(400).json({ error: "name must be unique" });
  }

  persons.concat(personObj);
  res.status(201).json(personObj);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`server runs on port ${PORT}`);
