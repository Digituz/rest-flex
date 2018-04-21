'use strict';
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.get('/', (req, res) => {
  MongoClient.connect('mongodb://react-lambda-client:react-lambda-client-pwd@ds147589.mlab.com:47589/react-lambda-client')
    .then((client) => {
      return client
        .db('react-lambda-client')
        .collection('to-do-items').find({})
        .toArray();
    })
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = app;
