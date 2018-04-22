const bodyParser = require('body-parser');
const express = require('express');

const app = express();
app.use(bodyParser.json());

let data = [];

app.get('/', (req, res) => {
  return res.send(data);
});

app.get('/:id', (req, res) => {
  const record = data.filter(record => (record._id === req.params.id));
  return res.send(record);
});

app.put('/:id', (req, res) => {
  data = data.map(record => {
    if (record._id === req.params.id) {
      record = {
        ...req.body,
      };
    }
    return record;
  });
  return res.send({message: "Ok"});
});

app.post('/', (req, res) => {
  data.push(req.body);
  return res.send({message: "Ok"});
});

app.delete('/:id', (req, res) => {
  data = data.filter(record => (record._id !== req.params.id));
  return res.send({message: "Ok"});
});

module.exports = app;
