const functions = require('firebase-functions');
const express = require('express');
const routes = require('./routes');
const app = express();

routes(app);

exports.api = functions.https.onRequest(app);

exports.minute_job = functions.pubsub
  .topic('project_item_update')
  .onPublish((message) => {
    console.log("This job is run every minute!");
    if (message.data) {
      const dataString = Buffer.from(message.data, 'base64').toString();
      console.log(`Message Data: ${dataString}`);
    }

    return true;
  });