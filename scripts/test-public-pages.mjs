import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasError = res.statusCode >= 400 || data.includes('Internal Server Error') || data.includes('Application error') || data.includes('Unhandled Runtime Error');
        resolve({ path, status: res.statusCode, length: data.length, hasError, preview: data.slice(0, 150) });
      });
    });
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });
  });
}

async function main() {
  const routes = [
    '/',
    '/about',
    '/achievements',
    '/announcements',
    '/daily-notes',
    '/gallery',
    '/materials',
    '/resources',
    '/schedule',
    '/students',
    '/subjects',
    '/tasks',
    '/login',
  ];

  try {
    const student = await prisma.student.findFirst({ select: { id: true } });
    if (student) routes.push(`/students/${student.id}`);

    const subject = await prisma.subject.findFirst({ select: { code: true } });
    if (subject) routes.push(`/subjects/${subject.code}`);

    const task = await prisma.task.findFirst({ select: { id: true } });
    if (task) routes.push(`/tasks/${task.id}`);

    const material = await prisma.material.findFirst({ select: { id: true } });
    if (material) routes.push(`/materials/${material.id}`);

    const note = await prisma.dailyNote.findFirst({ select: { id: true } });
    if (note) routes.push(`/daily-notes/${note.id}`);
  } catch (err) {
    console.error('Error fetching sample IDs from db:', err.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Testing ${routes.length} public routes against http://localhost:3000...\n`);
  let errors = 0;
  for (const r of routes) {
    const res = await checkRoute(r);
    const flag = res.hasError || res.status !== 200 ? '❌ FAIL' : '✅ PASS';
    if (res.hasError || res.status !== 200) errors++;
    console.log(`${flag} ${res.path.padEnd(35)} => Status: ${res.status}, Len: ${res.length}`);
  }

  console.log(`\nTotal tested: ${routes.length}, Errors: ${errors}`);
}

main();
