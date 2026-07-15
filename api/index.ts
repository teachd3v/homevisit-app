import express from 'express';
import app from '../backend/src/index.js';

const serverlessApp = express();

serverlessApp.use('/api', (req, res, next) => {
  app(req, res, next);
});

export default serverlessApp;
