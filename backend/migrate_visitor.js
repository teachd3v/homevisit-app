require('dotenv/config');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  try {
    await client.query('ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "regionId" TEXT DEFAULT \'ab428686-99dd-4d4e-a68e-f288a423a750\'');
    await client.query('UPDATE "Visitor" SET "regionId" = \'ab428686-99dd-4d4e-a68e-f288a423a750\' WHERE "regionId" IS NULL');
    await client.query('ALTER TABLE "Visitor" ALTER COLUMN "regionId" SET NOT NULL');
    await client.query('ALTER TABLE "Visitor" DROP COLUMN IF EXISTS "name"');
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
