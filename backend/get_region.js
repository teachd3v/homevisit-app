require('dotenv/config');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query('SELECT id, name FROM "Region" LIMIT 1');
}).then(res => {
  console.log(JSON.stringify(res.rows));
  process.exit(0);
}).catch(console.error);
