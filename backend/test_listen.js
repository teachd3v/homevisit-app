const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK'));
const server = app.listen(3000, () => console.log('Listening on 3000'));
server.on('error', (err) => console.error('Error:', err.message));
