import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let prisma: PrismaClient;

const getPrisma = () => {
  if (!prisma) {
    if (!process.env.DATABASE_URL_POOLER) {
      console.error('DATABASE_URL_POOLER IS MISSING');
    }
    const connectionString = `${process.env.DATABASE_URL_POOLER}`;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
};

// Middleware to inject prisma
app.use((req, res, next) => {
  try {
    (req as any).prisma = getPrisma();
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Database Init Error', message: err.message });
  }
});

// --- REGIONS & CAMPUSES ---
app.get('/regions', async (req, res) => {
  const regions = await (req as any).prisma.region.findMany();
  res.json(regions);
});

app.post('/regions', async (req, res) => {
  const { name } = req.body;
  const region = await (req as any).prisma.region.create({ data: { name } });
  res.json(region);
});

app.delete('/regions/:id', async (req, res) => {
  await (req as any).prisma.region.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.put('/regions/:id', async (req, res) => {
  const { name } = req.body;
  const region = await (req as any).prisma.region.update({ where: { id: req.params.id }, data: { name } });
  res.json(region);
});

app.get('/campuses', async (req, res) => {
  const campuses = await (req as any).prisma.campus.findMany();
  res.json(campuses);
});

app.post('/campuses', async (req, res) => {
  const { name, regionId } = req.body;
  const campus = await (req as any).prisma.campus.create({ data: { name, regionId } });
  res.json(campus);
});

app.delete('/campuses/:id', async (req, res) => {
  await (req as any).prisma.campus.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.put('/campuses/:id', async (req, res) => {
  const { name, regionId } = req.body;
  const campus = await (req as any).prisma.campus.update({ where: { id: req.params.id }, data: { name, regionId } });
  res.json(campus);
});

// --- CANDIDATES ---
app.get('/candidates', async (req, res) => {
  const candidates = await (req as any).prisma.candidate.findMany();
  res.json(candidates);
});

app.post('/candidates', async (req, res) => {
  const { id, full_name, gender, region, campus, major, ukt, home_visit_status, pantukhir_status } = req.body; 
  const candidate = await (req as any).prisma.candidate.create({ data: { id, full_name, gender, region, campus, major, ukt } });
  res.json(candidate);
});

app.post('/candidates/bulk', async (req, res) => {
  const candidates = req.body.map((c: any) => ({ id: c.id, full_name: c.full_name, gender: c.gender, region: c.region, campus: c.campus, major: c.major, ukt: c.ukt })); 
  const created = await (req as any).prisma.candidate.createMany({ data: candidates, skipDuplicates: true });
  res.json(created);
});

app.put('/candidates/:id', async (req, res) => {
  const { id, full_name, gender, region, campus, major, ukt, home_visit_status, pantukhir_status } = req.body; 
  const candidate = await (req as any).prisma.candidate.update({ where: { id: req.params.id }, data: { full_name, gender, region, campus, major, ukt, home_visit_status, pantukhir_status } });
  res.json(candidate);
});

app.delete('/candidates/:id', async (req, res) => {
  await (req as any).prisma.candidate.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- VISITORS ---
app.get('/visitors', async (req, res) => {
  const visitors = await (req as any).prisma.visitor.findMany();
  res.json(visitors);
});

app.post('/visitors', async (req, res) => {
  const { id, name, role } = req.body; 
  const visitor = await (req as any).prisma.visitor.create({ data: { id, name, role } });
  res.json(visitor);
});

app.post('/visitors/bulk', async (req, res) => {
  const visitors = req.body.map((v: any) => ({ id: v.id, name: v.name, role: v.role }));
  const created = await (req as any).prisma.visitor.createMany({ data: visitors, skipDuplicates: true });
  res.json(created);
});

app.put('/visitors/:id', async (req, res) => {
  const { id, name, role } = req.body; 
  const visitor = await (req as any).prisma.visitor.update({ where: { id: req.params.id }, data: { name, role } });
  res.json(visitor);
});

app.delete('/visitors/:id', async (req, res) => {
  await (req as any).prisma.visitor.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- INSTRUMENTS ---
app.get('/instruments', async (req, res) => {
  const instruments = await (req as any).prisma.instrument.findMany({ orderBy: { urutan: 'asc' } });
  res.json(instruments);
});

app.post('/instruments', async (req, res) => {
  const { id, pertanyaan, urutan } = req.body; 
  const instrument = await (req as any).prisma.instrument.create({ data: { id, pertanyaan, urutan: Number(urutan) } });
  res.json(instrument);
});

app.post('/instruments/bulk', async (req, res) => {
  const instruments = req.body.map((i: any) => ({ id: i.id, pertanyaan: i.pertanyaan, urutan: Number(i.urutan) })); 
  const created = await (req as any).prisma.instrument.createMany({ data: instruments, skipDuplicates: true });
  res.json(created);
});

app.delete('/instruments/:id', async (req, res) => {
  await (req as any).prisma.instrument.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- SCHEDULES ---
app.get('/schedules', async (req, res) => {
  const schedules = await (req as any).prisma.schedule.findMany({
    include: { candidate: true, visitor: true }
  });
  res.json(schedules);
});

app.post('/schedules', async (req, res) => {
  const { id, candidateId, visitorId, schedule_date, schedule_time, status, notes } = req.body; 
  const schedule = await (req as any).prisma.schedule.create({ data: { id, candidateId, visitorId, schedule_date, schedule_time, status, notes }, include: { candidate: true, visitor: true } });
  res.json(schedule);
});

app.put('/schedules/:id', async (req, res) => {
  const schedule = await (req as any).prisma.schedule.update({ 
    where: { id: req.params.id }, 
    data: (({ candidateId, visitorId, schedule_date, schedule_time, status, notes }) => ({ candidateId, visitorId, schedule_date, schedule_time, status, notes }))(req.body), include: { candidate: true, visitor: true } });
  res.json(schedule);
});

app.delete('/schedules/:id', async (req, res) => {
  await (req as any).prisma.schedule.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- HOME VISIT RESULTS ---
app.get('/results', async (req, res) => {
  const results = await (req as any).prisma.homeVisitResult.findMany({
    include: { candidate: true, visitor: true }
  });
  res.json(results);
});

app.post('/results', async (req, res) => {
  const result = await (req as any).prisma.homeVisitResult.create({ 
    data: (({ id, candidateId, fasilId, answers, score, status, notes, photos }) => ({ id, candidateId, fasilId, answers, score, status, notes, photos }))(req.body), include: { candidate: true, visitor: true } });
  res.json(result);
});

app.put('/results/:id', async (req, res) => {
  const result = await (req as any).prisma.homeVisitResult.update({
    where: { id: req.params.id },
    data: (({ id, candidateId, fasilId, answers, score, status, notes, photos }) => ({ id, candidateId, fasilId, answers, score, status, notes, photos }))(req.body),
    include: { candidate: true, visitor: true }
  });
  res.json(result);
});

app.delete('/results/:id', async (req, res) => {
  await (req as any).prisma.homeVisitResult.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log('Listening on ' + PORT));
}

export default app;
