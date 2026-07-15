import express from 'express';

const serverlessApp = express();

serverlessApp.use('/api', async (req, res, next) => {
  try {
    const module = await import('../backend/src/index.js');
    const app = module.default;
    app(req, res, next);
  } catch (err) {
    res.status(500).json({ error: 'Backend Initialization Error', message: err.message, stack: err.stack });
  }
});

export default serverlessApp;
