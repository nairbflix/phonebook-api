const cors = require('cors');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Person = require('./models/person');

app.use(express.static('dist'));

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body', req.body);
  console.log('---');
  next();
};

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (req, res) => {
  res.status(404).send({ errror: 'unknown endpoint' });
};

app.get('/info', (req, res) => {
  const date = new Date().toUTCString();
  const maxPersons = Person.length;
  const info = `Phonebook has info for ${maxPersons} people <br/> ${date}`;
  res.send(info);
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((person) => {
    res.status(201).json(person);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((deletedPerson) => {
      res.status(200).json(deletedPerson);
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    res.status(400).json({ error: 'missing name or number' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  if (body.name && body.number) {
    person
      .save()
      .then((addedPerson) => {
        res.status(201).json(addedPerson);
      })
      .catch((error) => next(error));
  } else {
    res.status(400).json({ error: 'name and number are required' });
  }
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      res.status(201).json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server runs on port ${PORT}`);
});
