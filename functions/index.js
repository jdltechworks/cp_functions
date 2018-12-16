const functions = require('firebase-functions');
const express = require('express');
const middlewares = require('./middlewares');
const routes = require('./routes');
const app = express();
const tasks = require('./tasks');

middlewares(app);

routes(app);

exports.api = functions.https.onRequest(app);

exports.minute_job = functions.pubsub
  .topic('project_item_update')
  .onPublish((message) => tasks(message));