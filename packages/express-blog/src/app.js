const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { accessibleRecordsPlugin } = require('@casl/mongoose');
const errorHandler = require('./error-handler');

const MODULES = ['auth', 'comments', 'posts', 'users'];

module.exports = function createApp() {
  const app = express();

  mongoose.plugin(accessibleRecordsPlugin);
  mongoose.plugin((schema) => {
    schema.methods.toJSON = function toJSON() {
      const { _id, ...object } = this.toObject();
      // have 2 ids in order to keep UI backward compatible with Rails API
      return { _id, id: _id, ...object };
    };
  });
  app.use(bodyParser.json());
  app.use(cors({ origin: true }));
  const router = express.Router();

  MODULES.forEach((moduleName) => {
    const appModule = require(`./modules/${moduleName}`); // eslint-disable-line

    if (typeof appModule.configure === 'function') {
      appModule.configure(app, router);
    }
  });

  app.use('/api', router);
  app.use(errorHandler);

  mongoose.Promise = global.Promise;
  return mongoose.connect('mongodb://localhost:27017/blog')
    .then(() => app);
};
