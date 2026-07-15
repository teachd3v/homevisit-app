import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const backendApp = express();
backendApp.use(cors());
backendApp.use(express.json({ limit: '50mb' })); 
backendApp.use(express.urlencoded({ limit: '50mb', extended: true }));

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
backendApp.use((req, res, next) => {
  try {
    (req as any).prisma = getPrisma();
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Database Init Error', message: err.message });
  }
});

// --- REGIONS & CAMPUSES ---
backendApp.get('/regions', async (req, res) => {
  const regions = await (req as any).prisma.region.findMany();
  res.json(regions);
});

backendApp.post('/regions', async (req, res) => {
  const { name } = req.body;
  const region = await (req as any).prisma.region.create({ data: { name } });
  res.json(region);
});

backendApp.delete('/regions/:id', async (req, res) => {
  await (req as any).prisma.region.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

backendApp.put('/regions/:id', async (req, res) => {
  const { name } = req.body;
  const region = await (req as any).prisma.region.update({ where: { id: req.params.id }, data: { name } });
  res.json(region);
});

backendApp.get('/campuses', async (req, res) => {
  const campuses = await (req as any).prisma.campus.findMany();
  res.json(campuses);
});

backendApp.post('/campuses', async (req, res) => {
  const { name, regionId } = req.body;
  const campus = await (req as any).prisma.campus.create({ data: { name, regionId } });
  res.json(campus);
});

backendApp.delete('/campuses/:id', async (req, res) => {
  await (req as any).prisma.campus.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

backendApp.put('/campuses/:id', async (req, res) => {
  const { name, regionId } = req.body;
  const campus = await (req as any).prisma.campus.update({ where: { id: req.params.id }, data: { name, regionId } });
  res.json(campus);
});

// --- CANDIDATES ---
backendApp.get('/candidates', async (req, res) => {
  const candidates = await (req as any).prisma.candidate.findMany();
  res.json(candidates);
});

backendApp.post('/candidates', async (req, res) => {
  const { id, full_name, gender, region, campus, major, ukt } = req.body; 
  const candidate = await (req as any).prisma.candidate.create({ data: { id, full_name, gender, region, campus, major, ukt } });
  res.json(candidate);
});

backendApp.post('/candidates/bulk', async (req, res) => {
  const candidates = req.body.map((c: any) => ({ id: c.id, full_name: c.full_name, gender: c.gender, region: c.region, campus: c.campus, major: c.major, ukt: c.ukt })); 
  const created = await (req as any).prisma.candidate.createMany({ data: candidates, skipDuplicates: true });
  res.json(created);
});

backendApp.put('/candidates/:id', async (req, res) => {
  const { full_name, gender, region, campus, major, ukt, home_visit_status, pantukhir_status } = req.body; 
  const candidate = await (req as any).prisma.candidate.update({ where: { id: req.params.id }, data: { full_name, gender, region, campus, major, ukt, home_visit_status, pantukhir_status } });
  res.json(candidate);
});

backendApp.delete('/candidates/:id', async (req, res) => {
  await (req as any).prisma.candidate.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- VISITORS ---
backendApp.get('/visitors', async (req, res) => {
  const visitors = await (req as any).prisma.visitor.findMany();
  res.json(visitors);
});

backendApp.post('/visitors', async (req, res) => {
  const { id, name, role } = req.body; 
  const visitor = await (req as any).prisma.visitor.create({ data: { id, name, role } });
  res.json(visitor);
});

backendApp.post('/visitors/bulk', async (req, res) => {
  const visitors = req.body.map((v: any) => ({ id: v.id, name: v.name, role: v.role }));
  const created = await (req as any).prisma.visitor.createMany({ data: visitors, skipDuplicates: true });
  res.json(created);
});

backendApp.put('/visitors/:id', async (req, res) => {
  const { name, role } = req.body; 
  const visitor = await (req as any).prisma.visitor.update({ where: { id: req.params.id }, data: { name, role } });
  res.json(visitor);
});

backendApp.delete('/visitors/:id', async (req, res) => {
  await (req as any).prisma.visitor.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- INSTRUMENTS ---
backendApp.get('/instruments', async (req, res) => {
  const instruments = await (req as any).prisma.instrument.findMany({ orderBy: { urutan: 'asc' } });
  res.json(instruments);
});

backendApp.post('/instruments', async (req, res) => {
  const { id, pertanyaan, urutan } = req.body; 
  const instrument = await (req as any).prisma.instrument.create({ data: { id, pertanyaan, urutan: Number(urutan) } });
  res.json(instrument);
});

backendApp.post('/instruments/bulk', async (req, res) => {
  const instruments = req.body.map((i: any) => ({ id: i.id, pertanyaan: i.pertanyaan, urutan: Number(i.urutan) })); 
  const created = await (req as any).prisma.instrument.createMany({ data: instruments, skipDuplicates: true });
  res.json(created);
});

backendApp.delete('/instruments/:id', async (req, res) => {
  await (req as any).prisma.instrument.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- SCHEDULES ---
backendApp.get('/schedules', async (req, res) => {
  const schedules = await (req as any).prisma.schedule.findMany({
    include: { candidate: true, visitor: true }
  });
  res.json(schedules);
});

backendApp.post('/schedules', async (req, res) => {
  const { id, candidateId, visitorId, schedule_date, schedule_time, status, notes } = req.body; 
  const schedule = await (req as any).prisma.schedule.create({ data: { id, candidateId, visitorId, schedule_date, schedule_time, status, notes }, include: { candidate: true, visitor: true } });
  res.json(schedule);
});

backendApp.put('/schedules/:id', async (req, res) => {
  const schedule = await (req as any).prisma.schedule.update({ 
    where: { id: req.params.id }, 
    data: (({ candidateId, visitorId, schedule_date, schedule_time, status, notes }) => ({ candidateId, visitorId, schedule_date, schedule_time, status, notes }))(req.body), include: { candidate: true, visitor: true } });
  res.json(schedule);
});

backendApp.delete('/schedules/:id', async (req, res) => {
  await (req as any).prisma.schedule.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- HOME VISIT RESULTS ---
backendApp.get('/results', async (req, res) => {
  const results = await (req as any).prisma.homeVisitResult.findMany({
    include: { candidate: true, visitor: true }
  });
  res.json(results);
});

backendApp.post('/results', async (req, res) => {
  const result = await (req as any).prisma.homeVisitResult.create({ 
    data: (({ id, candidateId, fasilId, answers, score, status, notes, photos }) => ({ id, candidateId, fasilId, answers, score, status, notes, photos }))(req.body), include: { candidate: true, visitor: true } });
  res.json(result);
});

backendApp.put('/results/:id', async (req, res) => {
  const result = await (req as any).prisma.homeVisitResult.update({
    where: { id: req.params.id },
    data: (({ id, candidateId, fasilId, answers, score, status, notes, photos }) => ({ id, candidateId, fasilId, answers, score, status, notes, photos }))(req.body),
    include: { candidate: true, visitor: true }
  });
  res.json(result);
});

backendApp.delete('/results/:id', async (req, res) => {
  await (req as any).prisma.homeVisitResult.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

// Global error handler
backendApp.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  backendApp.listen(PORT, () => console.log('Listening on ' + PORT));
}

const serverlessApp = express();
serverlessApp.use('/api', backendApp);
export default serverlessApp;


