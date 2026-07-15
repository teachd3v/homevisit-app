import express from 'express';
import app from '../backend/src/index.js';
const serverlessApp = express();
serverlessApp.use('/api', app);
export default serverlessApp;
