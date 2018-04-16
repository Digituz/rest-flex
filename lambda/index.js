'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const express = require('express');
const app = express();

app.use(awsServerlessExpressMiddleware.eventContext());

app.get('/', (req, res) => {
  res.json(req.apiGateway.event);
});

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);