import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL_POOLER;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const res = await prisma.visitor.updateMany({
    where: { role: 'pusat' },
    data: { role: 'etoser' }
  });
  console.log('Updated:', res.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
